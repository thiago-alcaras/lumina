import express from "express";
import { rateLimit } from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import Stripe from "stripe";
import {
  imageRequest,
  detections,
  normalizeMatches,
  requireEnv,
} from "./contracts.mjs";
const env = process.env;
const db =
  env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;
const app = express();
app.disable("x-powered-by");
if (env.TRUST_PROXY === "1") app.set("trust proxy", 1);
function result(response) {
  if (response.error) throw response.error;
  return response.data;
}
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  const origin = req.headers.origin;
  const allowed = [
    env.APP_URL,
    env.MOBILE_ORIGIN || "https://localhost",
    "capacitor://localhost",
  ].filter(Boolean);
  if (origin) {
    if (!allowed.includes(origin))
      return res.status(403).json({ error: "Origem não permitida." });
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type",
    );
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.get("/api/health", (_req, res) =>
  res.json({
    ok: true,
    auth: !!db,
    vision: !!env.GEMINI_API_KEY,
    billing: !!stripe,
  }),
);
// Raw body is required to verify the Stripe signature.
app.post(
  "/api/webhook",
  express.raw({ type: "application/json", limit: "1mb" }),
  async (req, res) => {
    if (!stripe || !db || !env.STRIPE_WEBHOOK_SECRET)
      return res.status(503).json({ error: "Cobrança não configurada." });
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch {
      return res.status(400).json({ error: "Assinatura de webhook inválida." });
    }
    try {
      if (event.type.startsWith("customer.subscription.")) {
        const incoming = event.data.object;
        // Fetch current state so out-of-order retries do not restore an old entitlement.
        const all = await stripe.subscriptions.list({
          customer: String(incoming.customer),
          status: "all",
          limit: 100,
        });
        const owned = all.data
          .filter((s) => s.metadata.userId === incoming.metadata.userId)
          .sort((a, b) => b.created - a.created);
        const subscription =
          owned.find((s) => ["active", "trialing"].includes(s.status)) ||
          owned[0] ||
          incoming;
        const userId = subscription.metadata.userId;
        if (!userId) throw new Error("Subscription is missing userId");
        result(
          await db.rpc("apply_billing_event", {
            event_id: event.id,
            target: userId,
            customer: String(subscription.customer),
            subscription: subscription.id,
            new_status: subscription.status,
          }),
        );
      }
      res.json({ received: true });
    } catch {
      res.status(500).json({
        error: "Webhook não processado. O provedor deve repetir a entrega.",
      });
    }
  },
);
app.use(express.json({ limit: "12mb" }));
app.use(
  "/api",
  rateLimit({
    windowMs: 60_000,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Muitas solicitações. Aguarde um minuto." },
  }),
);
async function auth(req, res, next) {
  if (!db)
    return res
      .status(503)
      .json({ error: "Configure Supabase no servidor para usar esta função." });
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) return res.status(401).json({ error: "Entre na sua conta." });
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user)
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  req.user = data.user;
  next();
}
app.post(
  "/api/vision",
  auth,
  rateLimit({
    windowMs: 60_000,
    limit: 5,
    keyGenerator: (req) => req.user.id,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
  async (req, res) => {
    if (!env.GEMINI_API_KEY)
      return res.status(503).json({
        error:
          "Reconhecimento indisponível. Configure GEMINI_API_KEY no servidor.",
      });
    const parsed = imageRequest.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Imagem inválida. Use JPG, PNG ou WebP de até 8 MB." });
    try {
      if (!result(await db.rpc("reserve_vision", { target: req.user.id })))
        return res.status(429).json({
          error:
            "Sua cota mensal de reconhecimento terminou (10 grátis ou 100 no Plus).",
        });
      const wardrobe = result(
        await db
          .from("wardrobe")
          .select("id,name,category,color,brand,image_path")
          .eq("owner_id", req.user.id)
          .order("created_at", { ascending: false })
          .limit(30),
      );
      const [, mime, data] = parsed.data.image.match(
        /^data:([^;]+);base64,(.+)$/,
      );
      const parts = [
        {
          text: "Analise a PRIMEIRA imagem, em português. Identifique somente roupas, calçados e acessórios. Não infira gênero, corpo, etnia ou identidade. Não invente marcas; brand vazio se não há logotipo legível. bbox é [ymin,xmin,ymax,xmax] de 0 a 1000 na primeira imagem. As demais imagens são peças privadas conhecidas, rotuladas por ID. Compare detalhes visuais: categoria, corte, textura, padrão, cor. existingId somente para uma provável MESMA peça, nunca apenas uma categoria similar. confidence é confiança da identidade da peça, não da classificação. Se incerto, null. Categorias: Blusa, Tricô, Calça, Saia, Vestido, Casaco, Sapato, Acessório, Outro. Responda JSON: {pieces:[{name,category,color,brand,bbox,existingId,confidence}]}.",
        },
        { inlineData: { mimeType: mime, data } },
      ];
      let imageBytes = Buffer.byteLength(data, "base64");
      const comparedIds = new Set();
      for (const piece of wardrobe) {
        const file = await db.storage
          .from("wardrobe")
          .download(piece.image_path);
        if (file.error || imageBytes + file.data.size > 14 * 1024 * 1024)
          continue;
        imageBytes += file.data.size;
        comparedIds.add(piece.id);
        parts.push(
          {
            text:
              "Peça conhecida " +
              JSON.stringify({
                id: piece.id,
                name: piece.name,
                category: piece.category,
                color: piece.color,
                brand: piece.brand,
              }),
          },
          {
            inlineData: {
              mimeType: file.data.type || "image/jpeg",
              data: Buffer.from(await file.data.arrayBuffer()).toString(
                "base64",
              ),
            },
          },
        );
      }
      const ai = new GoogleGenAI({
        apiKey: env.GEMINI_API_KEY,
        httpOptions: { timeout: 60000 },
      });
      const response = await ai.models.generateContent({
        model: env.GEMINI_MODEL || "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
          responseJsonSchema: {
            type: "object",
            required: ["pieces"],
            properties: {
              pieces: {
                type: "array",
                items: {
                  type: "object",
                  required: [
                    "name",
                    "category",
                    "color",
                    "brand",
                    "bbox",
                    "existingId",
                    "confidence",
                  ],
                  properties: {
                    name: { type: "string" },
                    category: {
                      type: "string",
                      enum: [
                        "Blusa",
                        "Tricô",
                        "Calça",
                        "Saia",
                        "Vestido",
                        "Casaco",
                        "Sapato",
                        "Acessório",
                        "Outro",
                      ],
                    },
                    color: { type: "string" },
                    brand: { type: "string" },
                    bbox: {
                      type: "array",
                      items: { type: "number" },
                    },
                    existingId: { type: ["string", "null"] },
                    confidence: { type: "number" },
                  },
                },
              },
            },
          },
        },
      });
      const validated = detections.parse(JSON.parse(response.text || "{}"));
      res.json(normalizeMatches(validated, comparedIds));
    } catch (error) {
      console.error(
        "Vision failed:",
        error.name,
        error.issues?.map(({ path, code }) => ({ path, code })) || "",
      );
      res.status(502).json({
        error:
          "Não foi possível analisar a imagem. Você pode cadastrar manualmente.",
      });
    }
  },
);
app.post("/api/checkout", auth, async (req, res) => {
  if (!stripe || !env.STRIPE_PRICE_ID || !env.APP_URL)
    return res
      .status(503)
      .json({ error: "As assinaturas ainda não foram configuradas." });
  try {
    const existing = result(
      await db
        .from("subscriptions")
        .select("*")
        .eq("user_id", req.user.id)
        .maybeSingle(),
    );
    if (["active", "trialing"].includes(existing?.status))
      return res
        .status(409)
        .json({ error: "Você já tem Plus. Use Gerenciar assinatura." });
    let customer = existing?.customer_id;
    if (customer) {
      const active = await stripe.subscriptions.list({
        customer,
        status: "all",
        limit: 100,
      });
      if (active.data.some((s) => ["active", "trialing"].includes(s.status)))
        return res.status(409).json({
          error: "Você já tem uma assinatura. Use Gerenciar assinatura.",
        });
    }
    if (!customer) {
      const created = await stripe.customers.create(
        { email: req.user.email, metadata: { userId: req.user.id } },
        { idempotencyKey: "lumina-customer-" + req.user.id },
      );
      customer = created.id;
      result(
        await db.from("subscriptions").upsert({
          user_id: req.user.id,
          customer_id: customer,
          status: "none",
        }),
      );
    }
    const session = await stripe.checkout.sessions.create(
      {
        mode: "subscription",
        customer,
        line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
        client_reference_id: req.user.id,
        subscription_data: { metadata: { userId: req.user.id } },
        success_url: env.APP_URL + "/?billing=success",
        cancel_url: env.APP_URL + "/?billing=cancelled",
        allow_promotion_codes: true,
      },
      {
        idempotencyKey:
          "lumina-checkout-" +
          req.user.id +
          "-" +
          Math.floor(Date.now() / 300000),
      },
    );
    res.json({ url: session.url });
  } catch {
    res.status(502).json({ error: "Não foi possível abrir o checkout." });
  }
});
app.post("/api/portal", auth, async (req, res) => {
  if (!stripe || !env.APP_URL)
    return res.status(503).json({ error: "Cobrança não configurada." });
  try {
    const subscription = result(
      await db
        .from("subscriptions")
        .select("customer_id")
        .eq("user_id", req.user.id)
        .single(),
    );
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.customer_id,
      return_url: env.APP_URL,
    });
    res.json({ url: session.url });
  } catch {
    res
      .status(400)
      .json({ error: "Você ainda não tem uma assinatura para gerenciar." });
  }
});
app.post("/api/account-delete", auth, async (req, res) => {
  if (req.body.confirmation !== "EXCLUIR")
    return res.status(400).json({ error: "Confirme digitando EXCLUIR." });
  try {
    const billing = result(
      await db
        .from("subscriptions")
        .select("customer_id")
        .eq("user_id", req.user.id)
        .maybeSingle(),
    );
    if (billing?.customer_id) {
      if (!stripe)
        return res.status(503).json({
          error:
            "Não é possível encerrar a assinatura agora. Tente novamente mais tarde.",
        });
      const subscriptions = await stripe.subscriptions.list({
        customer: billing.customer_id,
        status: "all",
        limit: 100,
      });
      for (const subscription of subscriptions.data.filter(
        (s) => !["canceled", "incomplete_expired"].includes(s.status),
      ))
        await stripe.subscriptions.cancel(subscription.id);
    }
    for (const bucket of ["looks", "wardrobe"]) {
      while (true) {
        const files = result(
          await db.storage.from(bucket).list(req.user.id, { limit: 1000 }),
        );
        if (!files.length) break;
        result(
          await db.storage
            .from(bucket)
            .remove(files.map((file) => req.user.id + "/" + file.name)),
        );
      }
    }
    result(await db.auth.admin.deleteUser(req.user.id));
    res.json({ deleted: true });
  } catch {
    res.status(502).json({
      error:
        "Não foi possível concluir a exclusão. Tente novamente; parte dos dados pode já ter sido removida.",
    });
  }
});
app.use((error, _req, res, _next) =>
  res.status(error.type === "entity.too.large" ? 413 : 400).json({
    error:
      error.type === "entity.too.large"
        ? "A imagem é grande demais."
        : "Solicitação inválida.",
  }),
);
const missing = requireEnv(env, [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GEMINI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_ID",
  "STRIPE_WEBHOOK_SECRET",
]);
console.log("Lumina API: http://localhost:" + (env.PORT || 3001));
console.log(
  missing.length
    ? "Serviços pendentes: " + missing.join(", ")
    : "Serviços configurados.",
);
app.listen(Number(env.PORT || 3001), "0.0.0.0");
