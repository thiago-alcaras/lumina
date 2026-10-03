import { useState } from "react";
import {
  Button,
  Card,
  Typography,
  Empty,
  moodIcons,
  errorMessage,
  type FeatureProps,
} from "../components/Shared";
import { localDate, formatDate } from "../services/dateService";
import { getPlannerSuggestions } from "../services/geminiService";
import type { Mood, View } from "../types";
export default function Dashboard({
  data,
  setData,
  t,
  lang,
  notify,
  navigate,
}: FeatureProps & { navigate: (view: View, date?: string) => void }) {
  const today = localDate();
  const events = data.events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
  const mood = data.moods.find((v) => v.date === today)?.mood;
  const [tips, setTips] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <Typography variant="h2">{t.ui.upcoming}</Typography>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("calendar")}
            >
              {t.nav.calendar} →
            </Button>
          </div>
          {events.length ? (
            events.map((event) => (
              <Card key={event.id}>
                <button
                  className="text-left w-full"
                  onClick={() => navigate("calendar", event.date)}
                >
                  <Typography variant="small">
                    {formatDate(event.date, lang)} ·{" "}
                    {t.ui.event_types[event.type]}
                  </Typography>
                  <Typography variant="h3">{event.title}</Typography>
                </button>
              </Card>
            ))
          ) : (
            <Empty text={t.dashboard.no_plans} />
          )}
        </section>
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <Typography variant="h2">
              {t.dashboard.recent_manifestations}
            </Typography>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("vision-board")}
            >
              {t.ui.add} →
            </Button>
          </div>
          {data.vision.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {data.vision.slice(0, 3).map((v) => (
                <button key={v.id} onClick={() => navigate("vision-board")}>
                  <img
                    src={v.imageUrl}
                    alt={v.prompt}
                    className="aspect-square rounded-2xl object-cover w-full"
                  />
                </button>
              ))}
            </div>
          ) : (
            <Empty text={t.ui.empty} />
          )}
        </section>
      </div>
      <aside className="space-y-6">
        <Card className="!bg-lumina-900">
          <Typography variant="h2" className="!text-white italic mb-4">
            {t.ui.assistant}
          </Typography>
          <p className="text-sm text-lumina-100 mb-5">{t.ui.ai_notice}</p>
          <div className="space-y-3">
            <Button
              fullWidth
              variant="secondary"
              isLoading={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  setTips(
                    await getPlannerSuggestions(
                      JSON.stringify(
                        data.events.filter((e) => e.date === today),
                      ),
                      lang,
                    ),
                  );
                } catch (error) {
                  notify(errorMessage(error, t));
                  setTips(t.ui.tips);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {t.dashboard.ask_ai}
            </Button>
            <Button
              fullWidth
              variant="outline"
              className="!text-white"
              onClick={() => setTips(t.ui.tips)}
            >
              {t.ui.local_tips}
            </Button>
          </div>
          {tips.length > 0 && (
            <ul className="list-disc pl-5 mt-5 space-y-3 text-sm text-white">
              {tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <Typography variant="h3" className="mb-4">
            {t.dashboard.todays_mood}
          </Typography>
          <div className="flex justify-between gap-1">
            {Object.entries(moodIcons).map(([key, icon]) => (
              <button
                key={key}
                title={t.ui.moods[key as Mood]}
                aria-label={t.ui.moods[key as Mood]}
                aria-pressed={mood === key}
                onClick={() =>
                  setData((d) => ({
                    ...d,
                    moods: [
                      ...d.moods.filter((v) => v.date !== today),
                      { date: today, mood: key as Mood },
                    ],
                  }))
                }
                className={`w-10 h-10 rounded-full text-xl ${mood === key ? "bg-accent-rose ring-2 ring-lumina-400" : "hover:bg-lumina-50"}`}
              >
                {icon}
              </button>
            ))}
          </div>
          {mood && (
            <p className="text-sm mt-3 text-lumina-700">{t.ui.moods[mood]}</p>
          )}
        </Card>
        <Card className="!bg-accent-lavender/30">
          <Typography variant="h3" className="mb-2">
            {t.dashboard.journal_prompt}
          </Typography>
          <Typography className="mb-4">{t.ui.journal_prompt}</Typography>
          <Button variant="ghost" size="sm" onClick={() => navigate("journal")}>
            {t.ui.respond} →
          </Button>
        </Card>
      </aside>
    </div>
  );
}
