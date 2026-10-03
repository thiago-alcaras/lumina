import { useState } from "react";
import {
  Button,
  Card,
  Typography,
  Field,
  Empty,
  type FeatureProps,
} from "../components/Shared";
import { localDate, monthGrid, formatDate } from "../services/dateService";
import type { Event } from "../types";
export default function CalendarView({
  data,
  setData,
  t,
  lang,
  initialDate = localDate(),
}: FeatureProps & { initialDate?: string }) {
  const [month, setMonth] = useState(() => {
    const date = new Date(`${initialDate}T12:00:00`);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [selected, setSelected] = useState(initialDate);
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Event["type"]>("appointment");
  const changeMonth = (delta: number) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  const edit = (event: Event) => {
    setEditing(event.id);
    setTitle(event.title);
    setType(event.type);
    setSelected(event.date);
  };
  const reset = () => {
    setEditing(null);
    setTitle("");
    setType("appointment");
  };
  const dayEvents = data.events.filter((e) => e.date === selected);
  const locale = lang === "pt" ? "pt-BR" : "en-US";
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <Typography variant="h2">
            {month.toLocaleDateString(locale, {
              month: "long",
              year: "numeric",
            })}
          </Typography>
          <Typography>{t.ui.calendar_subtitle}</Typography>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => changeMonth(-1)}>
            {t.ui.previous}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setMonth(
                new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              );
              setSelected(localDate());
            }}
          >
            {t.ui.today}
          </Button>
          <Button size="sm" variant="outline" onClick={() => changeMonth(1)}>
            {t.ui.next}
          </Button>
        </div>
      </div>
      <Card padding="sm">
        <div className="grid grid-cols-7 gap-1 sm:gap-3">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="text-center text-xs py-2">
              {new Date(2024, 0, 7 + i).toLocaleDateString(locale, {
                weekday: "short",
              })}
            </div>
          ))}
          {monthGrid(month.getFullYear(), month.getMonth()).map((date, i) =>
            date ? (
              <button
                key={date}
                aria-label={formatDate(date, lang)}
                aria-pressed={selected === date}
                onClick={() => {
                  setSelected(date);
                  reset();
                }}
                className={`min-h-14 sm:min-h-24 rounded-xl border p-1 sm:p-3 text-left ${selected === date ? "bg-accent-rose border-lumina-400" : "border-lumina-100 hover:bg-lumina-50"} ${date === localDate() ? "font-bold" : ""}`}
              >
                <span>{Number(date.slice(-2))}</span>
                <div className="mt-2 flex gap-1 flex-wrap">
                  {data.events
                    .filter((e) => e.date === date)
                    .slice(0, 3)
                    .map((e) => (
                      <span
                        key={e.id}
                        title={e.title}
                        className="w-1.5 h-1.5 rounded-full bg-lumina-900"
                      />
                    ))}
                </div>
              </button>
            ) : (
              <div key={`blank-${i}`} />
            ),
          )}
        </div>
      </Card>
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="space-y-4">
          <Typography variant="h3">{formatDate(selected, lang)}</Typography>
          {dayEvents.length ? (
            dayEvents.map((event) => (
              <Card key={event.id}>
                <Typography variant="h3">{event.title}</Typography>
                <Typography variant="small">
                  {t.ui.event_types[event.type]}
                </Typography>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => edit(event)}
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
                          events: d.events.filter((e) => e.id !== event.id),
                        }));
                        if (editing === event.id) reset();
                      }
                    }}
                  >
                    {t.ui.delete}
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Empty text={t.ui.no_events} />
          )}
        </section>
        <Card>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim()) return;
              const event: Event = {
                id: editing ?? crypto.randomUUID(),
                title: title.trim(),
                date: selected,
                type,
              };
              setData((d) => ({
                ...d,
                events: editing
                  ? d.events.map((v) => (v.id === editing ? event : v))
                  : [...d.events, event],
              }));
              reset();
            }}
          >
            <Typography variant="h3">
              {editing ? t.ui.edit : t.ui.event}
            </Typography>
            <Field label={t.ui.title}>
              <input
                required
                maxLength={160}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Field label={t.ui.date}>
              <input
                required
                type="date"
                value={selected}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelected(value);
                  if (value) {
                    const date = new Date(`${value}T12:00:00`);
                    setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                  }
                }}
              />
            </Field>
            <Field label={t.ui.event_type}>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Event["type"])}
              >
                {Object.entries(t.ui.event_types).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
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
      </div>
    </div>
  );
}
