import { z } from "zod";
export const imageRequest = z.object({
  image: z
    .string()
    .max(12_000_000)
    .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/),
});
export const detections = z.object({
  pieces: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        category: z.enum([
          "Blusa",
          "Tricô",
          "Calça",
          "Saia",
          "Vestido",
          "Casaco",
          "Sapato",
          "Acessório",
          "Outro",
        ]),
        color: z.string().max(50),
        brand: z.string().max(100),
        bbox: z
          .array(z.number().min(0).max(1000))
          .length(4)
          .refine((b) => b[2] > b[0] && b[3] > b[1]),
        existingId: z.string().uuid().nullable(),
        confidence: z.number().min(0).max(1),
      }),
    )
    .max(20),
});
export function normalizeMatches(result, knownIds) {
  return {
    ...result,
    pieces: result.pieces.map((p) => ({
      ...p,
      existingId:
        p.existingId && knownIds.has(p.existingId) ? p.existingId : null,
    })),
  };
}
export function requireEnv(env, names) {
  return names.filter((name) => !env[name]);
}
