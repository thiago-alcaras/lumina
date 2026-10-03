import { useState, useEffect, useRef } from "react";
import { Button, Card, Typography, errorMessage } from "./components/Shared";
import { translations, type Language } from "./locales";
import { db, emptyData } from "./services/persistenceService";
import { localDate } from "./services/dateService";
import type { PlannerData, View } from "./types";
import { ICONS } from "./constants";
import Dashboard from "./features/Dashboard";
import CalendarView from "./features/CalendarView";
import Registry from "./features/Registry";
import VisionBoard from "./features/VisionBoard";
import Journal from "./features/Journal";
const views: View[] = [
  "dashboard",
  "calendar",
  "registry",
  "vision-board",
  "journal",
];
const icons = [
  ICONS.Dashboard,
  ICONS.Calendar,
  ICONS.Registry,
  ICONS.Vision,
  ICONS.Journal,
];
function download(text: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function App() {
  const [lang, setLang] = useState<Language>("pt");
  const t = translations[lang];
  const [view, setView] = useState<View>("dashboard");
  const [calendarDate, setCalendarDate] = useState(localDate());
  const [data, setData] = useState<PlannerData>(emptyData);
  const [ready, setReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const importInput = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [saved, language] = await Promise.all([db.load(), db.language()]);
        if (active) {
          setData(saved);
          setLang(language);
          setReady(true);
        }
      } catch {
        if (active) {
          setLoadFailed(true);
          setReady(true);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!ready || loadFailed) return;
    const current = ++generation.current;
    db.save(data)
      .then(() => {
        if (generation.current === current)
          setMessage(translations[lang].ui.saved);
      })
      .catch(() => {
        if (generation.current === current)
          setMessage(translations[lang].ui.save_error);
      });
  }, [data, ready, loadFailed, lang]);
  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  }, [lang]);
  const labels = [
    t.nav.dashboard,
    t.nav.calendar,
    t.nav.registry,
    t.nav.vision,
    t.nav.journal,
  ];
  const navigate = (next: View, date?: string) => {
    if (next === "calendar") setCalendarDate(date ?? localDate());
    setView(next);
    setSearch("");
    window.scrollTo(0, 0);
  };
  const props = { data, setData, t, lang, notify: setMessage };
  const query = search.trim().toLocaleLowerCase();
  const results = [
    ...data.events.map((v) => ({
      id: v.id,
      text: v.title,
      date: v.date,
      view: "calendar" as View,
    })),
    ...data.outfits.map((v) => ({
      id: v.id,
      text: v.name,
      date: undefined,
      view: "registry" as View,
    })),
    ...data.vision.map((v) => ({
      id: v.id,
      text: v.prompt,
      date: undefined,
      view: "vision-board" as View,
    })),
    ...data.journal.map((v) => ({
      id: v.id,
      text: v.content,
      date: undefined,
      view: "journal" as View,
    })),
  ].filter((v) => v.text.toLocaleLowerCase().includes(query));
  return (
    <div className="min-h-screen md:flex">
      <nav
        aria-label="Lumina"
        className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-lumina-100 flex justify-around p-2 md:sticky md:top-0 md:h-screen md:w-24 lg:w-64 md:shrink-0 md:border-r md:border-t-0 md:flex-col md:justify-start md:p-5"
      >
        <div className="hidden md:flex items-center gap-3 mb-12 px-2">
          <span className="rounded-full bg-accent-rose w-10 h-10 flex items-center justify-center font-serif italic text-2xl">
            L
          </span>
          <span className="hidden lg:block font-serif text-2xl font-bold">
            Lumina
          </span>
        </div>
        {views.map((next, i) => {
          const Icon = icons[i];
          return (
            <button
              key={next}
              title={labels[i]}
              aria-label={labels[i]}
              aria-current={view === next ? "page" : undefined}
              onClick={() => navigate(next)}
              className={`flex flex-col lg:flex-row items-center gap-2 rounded-xl p-2 md:p-3 md:mb-2 lg:px-4 ${view === next ? "bg-accent-rose text-lumina-900" : "text-lumina-700 hover:bg-lumina-50"}`}
            >
              <Icon />
              <span className="text-[10px] lg:text-sm md:hidden lg:inline">
                {labels[i]}
              </span>
            </button>
          );
        })}
        <div className="hidden md:block mt-auto lg:p-3">
          <p className="hidden lg:block text-xs tracking-widest uppercase text-lumina-700">
            {t.ui.local}
          </p>
          <p className="hidden lg:block text-sm italic font-serif mt-2">
            {t.dashboard.quote}
          </p>
        </div>
      </nav>
      <main className="min-w-0 flex-1 pb-24 md:pb-8">
        <header className="p-5 md:p-10 space-y-6">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="uppercase tracking-[0.2em] text-xs text-lumina-700 mb-3">
                Lumina ·{" "}
                {new Date().toLocaleDateString(
                  lang === "pt" ? "pt-BR" : "en-US",
                  { weekday: "long", day: "numeric", month: "long" },
                )}
              </p>
              <Typography variant="h1">{t.dashboard.greeting}</Typography>
            </div>
            <div className="flex items-start gap-2">
              {(["pt", "en"] as const).map((l) => (
                <Button
                  key={l}
                  size="sm"
                  variant={lang === l ? "secondary" : "ghost"}
                  aria-pressed={lang === l}
                  onClick={() => {
                    setLang(l);
                    db.language(l).catch(() =>
                      setMessage(translations[l].ui.save_error),
                    );
                  }}
                >
                  {l.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
          <input
            type="search"
            aria-label={t.common.search}
            placeholder={t.ui.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={!ready || loadFailed}
          />
        </header>
        <div className="px-5 md:px-10 space-y-6">
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-lumina-700 min-h-5"
          >
            {message}
          </p>
          {!ready ? (
            <Typography>{t.ui.loading}</Typography>
          ) : loadFailed ? (
            <Card>
              <p role="alert" className="mb-4">
                {t.ui.load_error}
              </p>
              <Button
                onClick={() => {
                  try {
                    const originals: Record<string, string | null> = {};
                    for (const key of [
                      "lumina_planner_v1",
                      "lumina_outfits",
                      "lumina_vision",
                      "lumina_events",
                    ])
                      originals[key] = localStorage.getItem(key);
                    download(
                      JSON.stringify(originals, null, 2),
                      `lumina-original-${localDate()}.json`,
                    );
                  } catch {
                    setMessage(t.ui.save_error);
                  }
                }}
              >
                {t.ui.raw_export}
              </Button>
            </Card>
          ) : query ? (
            <section className="space-y-3">
              <Typography variant="h2">{t.ui.results}</Typography>
              {results.length ? (
                results.map((v) => (
                  <Card key={`${v.view}-${v.id}`}>
                    <button
                      className="text-left w-full break-words"
                      onClick={() => navigate(v.view, v.date)}
                    >
                      <p className="text-xs text-lumina-700 mb-2">
                        {labels[views.indexOf(v.view)]}
                      </p>
                      <p className="line-clamp-3">{v.text}</p>
                    </button>
                  </Card>
                ))
              ) : (
                <Typography>{t.ui.empty}</Typography>
              )}
            </section>
          ) : view === "dashboard" ? (
            <Dashboard {...props} navigate={navigate} />
          ) : view === "calendar" ? (
            <CalendarView
              {...props}
              key={calendarDate}
              initialDate={calendarDate}
            />
          ) : view === "registry" ? (
            <Registry {...props} />
          ) : view === "vision-board" ? (
            <VisionBoard {...props} />
          ) : (
            <Journal {...props} />
          )}
          {ready && (
            <footer className="border-t border-lumina-200 pt-6 mt-10 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-lumina-700 max-w-md">{t.ui.backup}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loadFailed}
                  onClick={() =>
                    download(db.export(data), `lumina-${localDate()}.json`)
                  }
                >
                  {t.ui.export}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => importInput.current?.click()}
                >
                  {t.ui.import_}
                </Button>
                <input
                  ref={importInput}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  aria-label={t.ui.import_}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file || !confirm(t.ui.confirm_import)) return;
                    try {
                      if (file.size > 25 * 1024 * 1024)
                        throw new Error("invalid_data");
                      const restored = await db.import(await file.text());
                      setData(restored);
                      setLoadFailed(false);
                      setMessage(t.ui.import_success);
                    } catch (error) {
                      setMessage(
                        error instanceof SyntaxError
                          ? t.ui.invalid_data
                          : errorMessage(error, t),
                      );
                    }
                  }}
                />
              </div>
            </footer>
          )}
        </div>
      </main>
    </div>
  );
}
