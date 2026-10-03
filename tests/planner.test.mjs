import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
async function loadTS(file) {
  const source = await readFile(new URL(file, import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
  );
}
const { db, emptyData, STORAGE_KEY, validateData } = await loadTS(
  "../packages/lumina/src/services/persistenceService.ts",
);
const { localDate, monthGrid } = await loadTS(
  "../packages/lumina/src/services/dateService.ts",
);
let storage;
beforeEach(() => {
  storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };
});
test("fresh data is empty; load does not write or invent sample records", async () => {
  assert.deepEqual(await db.load(), emptyData());
  assert.equal(storage.size, 0);
});
test("load and save retain existing events, journal, images and moods", async () => {
  const data = {
    ...emptyData(),
    events: [
      { id: "e", title: "Real event", date: "2026-10-03", type: "social" },
    ],
    journal: [
      { id: "j", date: "2026-10-03", content: "Gratitude", mood: "calm" },
    ],
    outfits: [
      {
        id: "o",
        name: "Look",
        category: "work",
        image: "data:image/jpeg;base64,YQ==",
        dateAdded: "2026-10-03T10:00:00Z",
      },
    ],
    moods: [{ date: "2026-10-03", mood: "inspired" }],
  };
  await db.save(data);
  assert.deepEqual(await db.load(), data);
  assert.deepEqual(await db.import(db.export(data)), data);
});
test("migration retains legacy data and leaves originals intact", async () => {
  const events = [
    { id: "old", title: "Existing", date: "2026-10-03", type: "social" },
  ];
  storage.set("lumina_events", JSON.stringify(events));
  const loaded = await db.load();
  assert.deepEqual(loaded.events, events);
  await db.save(loaded);
  assert.ok(storage.has("lumina_events"));
});
test("corrupt saved content is preserved and blocks loading", async () => {
  storage.set(STORAGE_KEY, "{broken");
  await assert.rejects(db.load());
  assert.equal(storage.get(STORAGE_KEY), "{broken");
});
test("invalid import does not replace existing data", async () => {
  await db.save(emptyData());
  const before = storage.get(STORAGE_KEY);
  await assert.rejects(db.import('{"data":{"events":[]}}'));
  assert.equal(storage.get(STORAGE_KEY), before);
});
test("schema rejects impossible dates, duplicate IDs and unsafe image URLs", () => {
  assert.throws(() =>
    validateData({
      ...emptyData(),
      events: [
        { id: "1", title: "Invalid", date: "2026-02-30", type: "social" },
      ],
    }),
  );
  const event = {
    id: "1",
    title: "Duplicate",
    date: "2026-10-03",
    type: "social",
  };
  assert.throws(() => validateData({ ...emptyData(), events: [event, event] }));
  assert.throws(() =>
    validateData({
      ...emptyData(),
      vision: [
        {
          id: "1",
          prompt: "Unsafe",
          category: "test",
          imageUrl: "javascript:alert(1)",
        },
      ],
    }),
  );
});
test("storage quota errors are explicit and preserve the previous snapshot", async () => {
  await db.save(emptyData());
  const before = storage.get(STORAGE_KEY);
  globalThis.localStorage.setItem = () => {
    throw new Error("QuotaExceededError");
  };
  await assert.rejects(db.save(emptyData()), /save_error/);
  assert.equal(storage.get(STORAGE_KEY), before);
});
test("calendar respects leap years, weekday offsets and local dates", () => {
  const feb = monthGrid(2024, 1);
  assert.equal(feb.filter(Boolean).length, 29);
  assert.equal(feb[4], "2024-02-01");
  assert.equal(feb.length % 7, 0);
  assert.equal(monthGrid(2026, 1).filter(Boolean).length, 28);
  assert.equal(localDate(new Date(2026, 9, 3, 23, 55)), "2026-10-03");
});

test("backup version validation rejects null and future formats without writing", async () => {
  await db.save(emptyData());
  const before = storage.get(STORAGE_KEY);
  await assert.rejects(db.import("null"), /invalid_data/);
  await assert.rejects(
    db.import(JSON.stringify({ version: 2, data: emptyData() })),
    /invalid_data/,
  );
  assert.equal(storage.get(STORAGE_KEY), before);
});
