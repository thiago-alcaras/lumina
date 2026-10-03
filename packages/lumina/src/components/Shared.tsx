import { useId } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";
import { Button, Card, Typography } from "@lumina/aurora";
import type { Language, Translations } from "../locales";
import type { PlannerData } from "../types";
export { Button, Card, Typography };
export interface FeatureProps {
  data: PlannerData;
  setData: Dispatch<SetStateAction<PlannerData>>;
  t: Translations;
  lang: Language;
  notify: (message: string) => void;
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <label className="space-y-2" id={id}>
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Empty({ text }: { text: string }) {
  return (
    <Card className="py-12 text-center border-dashed">
      <Typography>{text}</Typography>
    </Card>
  );
}
export function errorMessage(error: unknown, t: Translations): string {
  const code = error instanceof Error ? error.message : "ai_error";
  const translated = t.ui[code as keyof typeof t.ui];
  return typeof translated === "string" ? translated : t.ui.ai_error;
}
export const moodIcons = {
  happy: "✨",
  calm: "🌊",
  productive: "🌿",
  tired: "🌙",
  inspired: "🌸",
};
