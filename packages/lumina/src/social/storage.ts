import type { State } from "./types";
import { seed } from "./data";
import { sha256 } from "@noble/hashes/sha256";
export function uid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return (
    hex.slice(0, 8) +
    "-" +
    hex.slice(8, 12) +
    "-" +
    hex.slice(12, 16) +
    "-" +
    hex.slice(16, 20) +
    "-" +
    hex.slice(20)
  );
}
const KEY = "lumina-social-v2";
function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(KEY, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("state");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function readState(): Promise<State> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const request = database
      .transaction("state")
      .objectStore("state")
      .get("current");
    request.onsuccess = async () => {
      const state: State = request.result || seed();
      database.close();
      state.wardrobe = await Promise.all(
        state.wardrobe.map(async (piece) => {
          if (piece.fingerprint || !piece.image.startsWith("/images/"))
            return piece;
          try {
            const response = await fetch(piece.image);
            if (!response.ok) return piece;
            const photo = await preparePhoto(
              new File([await response.blob()], "sample.jpg", {
                type: "image/jpeg",
              }),
            );
            return { ...piece, fingerprint: await fingerprint(photo) };
          } catch {
            return piece;
          }
        }),
      );
      resolve(state);
    };
    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
}
export async function writeState(state: State) {
  const database = await db();
  return new Promise<void>((resolve, reject) => {
    const tx = database.transaction("state", "readwrite");
    tx.objectStore("state").put(state, "current");
    tx.oncomplete = () => {
      database.close();
      resolve();
    };
    tx.onerror = () => {
      database.close();
      reject(tx.error);
    };
  });
}
export function safeLink(url: string) {
  try {
    const u = new URL(url);
    return ["https:", "http:"].includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
}
export async function preparePhoto(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Escolha uma imagem JPG, PNG ou WebP.");
  if (file.size > 12 * 1024 * 1024)
    throw new Error("A imagem precisa ter menos de 12 MB.");
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width * ratio;
  canvas.height = bitmap.height * ratio;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.86);
}
export async function fingerprint(image: string) {
  const response = await fetch(image);
  if (!response.ok)
    throw new Error("A foto não está mais disponível. Recarregue a página.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  return Array.from(sha256(bytes))
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
}
export async function cropPhoto(image: string, box: number[]): Promise<string> {
  const bitmap = await createImageBitmap(await (await fetch(image)).blob());
  const [y1, x1, y2, x2] = box.map(
    (n) => Math.min(1000, Math.max(0, n)) / 1000,
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, (x2 - x1) * bitmap.width);
  canvas.height = Math.max(1, (y2 - y1) * bitmap.height);
  canvas
    .getContext("2d")!
    .drawImage(
      bitmap,
      x1 * bitmap.width,
      y1 * bitmap.height,
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}
export function rankPosts<
  T extends { id: string; mood: string; likes: number; createdAt: string },
>(posts: T[], interests: Record<string, number>, salt: number) {
  if (!Object.values(interests).some((score) => score > 0)) {
    return [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return [...posts].sort((a, b) => score(b) - score(a));
  function score(p: T) {
    let hash = 0;
    for (const char of p.id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
    return (
      (interests[p.mood] || 0) * 4 +
      Math.log1p(p.likes) +
      Math.sin(hash + salt) * 3
    );
  }
}
