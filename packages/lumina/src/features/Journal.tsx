import { useState } from "react";
import {
  Button,
  Card,
  Typography,
  Field,
  Empty,
  moodIcons,
  type FeatureProps,
} from "../components/Shared";
import { localDate, formatDate } from "../services/dateService";
import type { JournalEntry, Mood } from "../types";
export default function Journal({ data, setData, t, lang }: FeatureProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [date, setDate] = useState(localDate());
  const [period, setPeriod] = useState<"morning" | "evening">("morning");
  const [mood, setMood] = useState<Mood>("calm");
  const reset = () => {
    setEditing(null);
    setContent("");
    setDate(localDate());
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Typography variant="h2">{t.journal.title}</Typography>
        <Typography>{t.journal.subtitle}</Typography>
      </div>
      <Card>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!content.trim()) return;
            const entry: JournalEntry = {
              id: editing ?? crypto.randomUUID(),
              content: content.trim(),
              date,
              mood,
              period,
            };
            setData((d) => ({
              ...d,
              journal: editing
                ? d.journal.map((v) => (v.id === editing ? entry : v))
                : [entry, ...d.journal],
            }));
            reset();
          }}
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label={t.ui.date}>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label={t.ui.category}>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as typeof period)}
              >
                <option value="morning">{t.journal.morning_title}</option>
                <option value="evening">{t.journal.evening_title}</option>
              </select>
            </Field>
            <Field label={t.ui.mood}>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value as Mood)}
              >
                {Object.entries(t.ui.moods).map(([k, v]) => (
                  <option key={k} value={k}>
                    {moodIcons[k as Mood]} {v}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field
            label={
              period === "morning"
                ? t.journal.morning_title
                : t.journal.evening_title
            }
          >
            <textarea
              required
              maxLength={20000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                period === "morning"
                  ? t.journal.morning_placeholder
                  : t.journal.evening_placeholder
              }
            />
          </Field>
          <div className="flex gap-2">
            <Button type="submit">{t.ui.save}</Button>
            {editing && (
              <Button type="button" variant="ghost" onClick={reset}>
                {t.ui.cancel}
              </Button>
            )}
          </div>
        </form>
      </Card>
      <section className="space-y-4">
        <Typography variant="h3">{t.journal.previous}</Typography>
        {data.journal.length ? (
          [...data.journal]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((entry) => (
              <Card key={entry.id}>
                <div className="flex justify-between">
                  <Typography variant="small">
                    {formatDate(entry.date, lang)} ·{" "}
                    {entry.period === "evening"
                      ? t.journal.evening_title
                      : t.journal.morning_title}
                  </Typography>
                  <span title={t.ui.moods[entry.mood]}>
                    {moodIcons[entry.mood]}
                  </span>
                </div>
                <p className="whitespace-pre-wrap break-words my-4">
                  {entry.content}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(entry.id);
                      setContent(entry.content);
                      setDate(entry.date);
                      setMood(entry.mood);
                      setPeriod(entry.period ?? "morning");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    {t.ui.edit}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(t.ui.confirm_delete)) {
                        setData((d) => ({
                          ...d,
                          journal: d.journal.filter((v) => v.id !== entry.id),
                        }));
                        if (editing === entry.id) reset();
                      }
                    }}
                  >
                    {t.ui.delete}
                  </Button>
                </div>
              </Card>
            ))
        ) : (
          <Empty text={t.ui.journal_empty} />
        )}
      </section>
    </div>
  );
}
