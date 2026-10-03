import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createAppServer } from "../server/index.mjs";
async function withServer(options, callback) {
  const server = createAppServer(options);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await callback(base);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}
const post = (base, route, body, headers = {}) =>
  fetch(`${base}/api/${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
test("missing AI configuration is explicit and never returns the key", async () =>
  withServer({ apiKey: "" }, async (base) => {
    const status = await fetch(`${base}/api/status`);
    assert.deepEqual(await status.json(), { aiConfigured: false });
    const result = await post(base, "vision", { prompt: "A calm morning" });
    assert.equal(result.status, 503);
    assert.deepEqual(await result.json(), { error: "ai_unavailable" });
  }));
test("reject invalid input, methods and foreign origins before calling Gemini", async () =>
  withServer(
    {
      apiKey: "private-key",
      generateContent: () => {
        throw new Error("must not call");
      },
    },
    async (base) => {
      assert.equal((await post(base, "vision", { prompt: "" })).status, 400);
      assert.equal(
        (await post(base, "suggestions", { context: "[]", lang: "xx" })).status,
        400,
      );
      assert.equal(
        (
          await post(
            base,
            "vision",
            { prompt: "valid" },
            { Origin: "https://other.example" },
          )
        ).status,
        403,
      );
      assert.equal((await fetch(`${base}/api/vision`)).status, 405);
    },
  ));
test("returns the correct image MIME type and passes the key only to the provider", async () =>
  withServer(
    {
      apiKey: "private-key",
      generateContent: async (model, prompt, config, key) => {
        assert.equal(key, "private-key");
        assert.ok(prompt.includes("soft lighting"));
        return {
          candidates: [
            {
              content: {
                parts: [
                  { text: "image follows" },
                  { inlineData: { mimeType: "image/webp", data: "YQ==" } },
                ],
              },
            },
          ],
        };
      },
    },
    async (base) => {
      const result = await post(base, "vision", { prompt: "Calm" });
      assert.equal(result.status, 200);
      assert.deepEqual(await result.json(), {
        image: "data:image/webp;base64,YQ==",
      });
    },
  ));
test("structured planner suggestions are checked before returning to the UI", async () =>
  withServer(
    {
      apiKey: "private",
      generateContent: async () => ({
        candidates: [
          { content: { parts: [{ text: '{"tips":["One","Two","Three"]}' }] } },
        ],
      }),
    },
    async (base) => {
      const response = await post(base, "suggestions", {
        context: "[]",
        lang: "pt",
      });
      assert.deepEqual(await response.json(), {
        tips: ["One", "Two", "Three"],
      });
    },
  ));
test("provider failure hides upstream details and secrets", async () =>
  withServer(
    {
      apiKey: "private",
      generateContent: async () => {
        throw new Error("private upstream details");
      },
    },
    async (base) => {
      const response = await post(base, "vision", { prompt: "Calm" });
      assert.equal(response.status, 502);
      assert.deepEqual(await response.json(), { error: "ai_error" });
    },
  ));
