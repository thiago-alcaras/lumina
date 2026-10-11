import { test } from "node:test";
import assert from "node:assert/strict";
import {
  imageRequest,
  detections,
  normalizeMatches,
  requireEnv,
} from "./contracts.mjs";
const id = "a84d7ff4-a4a1-4dd5-9cba-b8b8dad91b54";
const valid = {
  pieces: [
    {
      name: "Cardigã",
      category: "Tricô",
      color: "Rosa",
      brand: "",
      bbox: [10, 20, 500, 600],
      existingId: id,
      confidence: 0.85,
    },
  ],
};
test("rejects non-image payloads and remote URLs", () => {
  assert.equal(
    imageRequest.safeParse({ image: "https://internal/private" }).success,
    false,
  );
  assert.equal(
    imageRequest.safeParse({ image: "data:text/html;base64,WA==" }).success,
    false,
  );
  assert.equal(
    imageRequest.safeParse({ image: "data:image/jpeg;base64,WA==" }).success,
    true,
  );
});
test("rejects malformed boxes and oversized model results", () => {
  assert.equal(
    detections.safeParse({
      pieces: [{ ...valid.pieces[0], bbox: [500, 20, 10, 600] }],
    }).success,
    false,
  );
  assert.equal(
    detections.safeParse({ pieces: Array(21).fill(valid.pieces[0]) }).success,
    false,
  );
  assert.equal(detections.safeParse(valid).success, true);
});
test("model cannot link an item outside authenticated wardrobe", () => {
  assert.equal(normalizeMatches(valid, new Set()).pieces[0].existingId, null);
  assert.equal(normalizeMatches(valid, new Set([id])).pieces[0].existingId, id);
});
test("missing configuration is reported without exposing secrets", () => {
  assert.deepEqual(
    requireEnv({ SECRET: "do-not-print" }, ["SECRET", "DATABASE"]),
    ["DATABASE"],
  );
});
