import type { PlannerData } from "../types";
export const STORAGE_KEY = "lumina_planner_v1";
export const emptyData = (): PlannerData => ({
  outfits: [],
  vision: [],
  events: [],
  journal: [],
  moods: [],
});
export function safeImage(value: string): boolean {
  return (
    /^https?:\/\//i.test(value) ||
    /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value)
  );
}
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object";
const str = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const date = (v: unknown): boolean =>
  str(v) &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  !Number.isNaN(Date.parse(v)) &&
  new Date(`${v}T12:00:00Z`).toISOString().slice(0, 10) === v;
const moods = ["happy", "calm", "productive", "tired", "inspired"];
export function validateData(value: unknown): PlannerData {
  if (!record(value)) throw new Error("invalid_data");
  for (const key of ["outfits", "vision", "events", "journal", "moods"])
    if (!Array.isArray(value[key])) throw new Error("invalid_data");
  const data = value as unknown as PlannerData;
  if (
    data.outfits.some(
      (v) =>
        !record(v) ||
        !str(v.id) ||
        !str(v.name) ||
        !safeImage(v.image) ||
        !["casual", "formal", "work", "sport"].includes(v.category) ||
        !str(v.dateAdded),
    ) ||
    data.vision.some(
      (v) =>
        !record(v) ||
        !str(v.id) ||
        !str(v.prompt) ||
        !safeImage(v.imageUrl) ||
        !str(v.category),
    ) ||
    data.events.some(
      (v) =>
        !record(v) ||
        !str(v.id) ||
        !str(v.title) ||
        !date(v.date) ||
        !["appointment", "social", "deadline", "self-care"].includes(v.type),
    ) ||
    data.journal.some(
      (v) =>
        !record(v) ||
        !str(v.id) ||
        !date(v.date) ||
        !str(v.content) ||
        !moods.includes(v.mood) ||
        (v.period !== undefined && !["morning", "evening"].includes(v.period)),
    ) ||
    data.moods.some(
      (v) => !record(v) || !date(v.date) || !moods.includes(v.mood),
    )
  )
    throw new Error("invalid_data");
  for (const key of ["outfits", "vision", "events", "journal"] as const)
    if (new Set(data[key].map((v) => v.id)).size !== data[key].length)
      throw new Error("invalid_data");
  if (new Set(data.moods.map((v) => v.date)).size !== data.moods.length)
    throw new Error("invalid_data");
  return {
    outfits: data.outfits,
    vision: data.vision,
    events: data.events,
    journal: data.journal,
    moods: data.moods,
  };
}
export const db = {
  async load(): Promise<PlannerData> {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return validateData(JSON.parse(saved));
    const data = emptyData();
    for (const key of ["outfits", "vision", "events"] as const) {
      const legacy = localStorage.getItem(`lumina_${key}`);
      if (legacy !== null) data[key] = JSON.parse(legacy);
    }
    return validateData(data);
  },
  async save(data: PlannerData): Promise<void> {
    const text = JSON.stringify(validateData(data));
    try {
      localStorage.setItem(STORAGE_KEY, text);
    } catch {
      throw new Error("save_error");
    }
  },
  async language(value?: "pt" | "en"): Promise<"pt" | "en"> {
    if (value) localStorage.setItem("lumina_language", value);
    return localStorage.getItem("lumina_language") === "en" ? "en" : "pt";
  },
  async import(text: string): Promise<PlannerData> {
    const parsed = JSON.parse(text);
    if (!record(parsed) || ("version" in parsed && parsed.version !== 1))
      throw new Error("invalid_data");
    const data = validateData(parsed.data ?? parsed);
    await db.save(data);
    return data;
  },
  export(data: PlannerData): string {
    return JSON.stringify({ version: 1, data: validateData(data) }, null, 2);
  },
};
