import { test, expect } from "@playwright/test";
const image = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEElEQVR4nGP4cusWEDFAKABK1gqh02BDkAAAAABJRU5ErkJggg==",
  "base64",
);
async function nav(page, name) {
  await page
    .getByRole("navigation")
    .getByRole("button", { name, exact: true })
    .click();
}
test("complete planner lifecycle, reload, language, images and backup", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Seu espaço para florescer" }),
  ).toBeVisible();
  await nav(page, "Calendário");
  await page.getByLabel("Título", { exact: true }).fill("Consulta de teste");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Consulta de teste" }),
  ).toBeVisible();
  await page.reload();
  await nav(page, "Calendário");
  await expect(
    page.getByRole("heading", { name: "Consulta de teste" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page.getByLabel("Título", { exact: true }).fill("Consulta atualizada");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Consulta atualizada" }),
  ).toBeVisible();
  await nav(page, "Diário");
  await page
    .getByLabel("Intenção da Manhã", { exact: true })
    .fill("Minha primeira reflexão real.");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByText("Minha primeira reflexão real.", { exact: true }),
  ).toBeVisible();
  await nav(page, "Painel");
  await page.getByRole("button", { name: "Inspirado", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Inspirado", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Perguntar à Lumina" }).click();
  await expect(page.getByRole("status")).toContainText(
    "IA não está configurada",
  );
  await expect(
    page.getByText("Escolha uma prioridade possível para hoje."),
  ).toBeVisible();
  await nav(page, "Estilo");
  await page.getByRole("button", { name: "Adicionar Look" }).click();
  await page.getByLabel("Nome", { exact: true }).fill("Meu look");
  await page
    .getByLabel("Imagem (PNG, JPG ou WebP)", { exact: true })
    .setInputFiles({ name: "look.png", mimeType: "image/png", buffer: image });
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Meu look" })).toBeVisible();
  await nav(page, "Visão");
  await page.getByRole("button", { name: "Adicionar inspiração" }).click();
  await page.getByLabel("Objetivo ou inspiração").fill("Minha viagem");
  await page
    .getByLabel("Imagem (PNG, JPG ou WebP)", { exact: true })
    .setInputFiles({ name: "goal.png", mimeType: "image/png", buffer: image });
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Minha viagem" }),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("reflexão");
  await expect(
    page.getByRole("heading", { name: "Resultados da busca" }),
  ).toBeVisible();
  await page
    .getByText("Minha primeira reflexão real.", { exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "O Brilho Diário" }),
  ).toBeVisible();
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar backup" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toMatch(/^lumina-.*json$/);
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your space to flourish" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your space to flourish" }),
  ).toBeVisible();
  await nav(page, "Registry");
  await expect(page.getByRole("heading", { name: "Meu look" })).toBeVisible();
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Meu look" })).toHaveCount(0);
  await page.reload();
  await nav(page, "Registry");
  await expect(page.getByRole("heading", { name: "Meu look" })).toHaveCount(0);
  const restored = {
    version: 1,
    data: {
      outfits: [],
      vision: [],
      events: [
        {
          id: "restored",
          title: "Restored event",
          date: "2026-10-03",
          type: "social",
        },
      ],
      journal: [],
      moods: [],
    },
  };
  await page.getByLabel("Import backup", { exact: true }).setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(restored)),
  });
  await nav(page, "Calendar");
  await page.getByLabel("Date", { exact: true }).fill("2026-10-03");
  await expect(
    page.getByRole("heading", { name: "Restored event" }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/planner-${test.info().project.name}.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("existing and corrupted storage survive initial hydration", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "lumina_events",
      JSON.stringify([
        {
          id: "existing",
          title: "Preserved event",
          date: "2026-10-03",
          type: "social",
        },
      ]),
    ),
  );
  await page.goto("/");
  await nav(page, "Calendário");
  await page.getByLabel("Data", { exact: true }).fill("2026-10-03");
  await expect(
    page.getByRole("heading", { name: "Preserved event" }),
  ).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem("lumina_planner_v1", "{broken"),
  );
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("Eles foram preservados");
  expect(
    await page.evaluate(() => localStorage.getItem("lumina_planner_v1")),
  ).toBe("{broken");
});

test("invalid uploads and storage failures show actionable errors", async ({
  page,
}) => {
  await page.goto("/");
  await nav(page, "Estilo");
  await page.getByRole("button", { name: "Adicionar Look" }).click();
  await page.getByLabel("Nome", { exact: true }).fill("Invalid file");
  await page
    .getByLabel("Imagem (PNG, JPG ou WebP)", { exact: true })
    .setInputFiles({
      name: "broken.png",
      mimeType: "image/png",
      buffer: Buffer.from("not an image"),
    });
  await expect(page.getByRole("status")).toContainText("Escolha uma imagem");
  await expect(
    page.getByRole("button", { name: "Salvar", exact: true }),
  ).toBeDisabled();
  await nav(page, "Painel");
  await page.evaluate(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Full", "QuotaExceededError");
    };
  });
  await page.getByRole("button", { name: "Inspirado", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "N\u00e3o foi poss\u00edvel salvar",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar backup" }).click();
  expect((await download).suggestedFilename()).toMatch(/json$/);
});
