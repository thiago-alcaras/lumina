export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function monthGrid(year: number, month: number): (string | null)[] {
  const start = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array(start).fill(null);
  for (let day = 1; day <= count; day++)
    cells.push(localDate(new Date(year, month, day)));
  while (cells.length % 7) cells.push(null);
  return cells;
}
export function formatDate(date: string, lang: "pt" | "en"): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(
    lang === "pt" ? "pt-BR" : "en-US",
    { day: "numeric", month: "short", year: "numeric" },
  );
}
