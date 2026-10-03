async function request<T>(route: string, payload: unknown): Promise<T> {
  const response = await fetch(`/api/${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(90000),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "ai_error");
  return body;
}
export async function generateVisionBoardImage(
  prompt: string,
): Promise<string> {
  const result = await request<{ image: string }>("vision", { prompt });
  return result.image;
}
export async function getPlannerSuggestions(
  context: string,
  lang: "pt" | "en",
): Promise<string[]> {
  const result = await request<{ tips: string[] }>("suggestions", {
    context,
    lang,
  });
  return result.tips;
}
