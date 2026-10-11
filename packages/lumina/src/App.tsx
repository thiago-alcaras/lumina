import { Onboarding } from "./social/Onboarding";
import { listenNativeAuth } from "./social/nativeAuth";
import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import {
  Home,
  Shirt,
  CalendarDays,
  Bookmark,
  Heart,
  Plus,
  Search,
  Bell,
  ArrowUpRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  MoreHorizontal,
  Sparkles,
  X,
  LogOut,
  Settings,
  Coffee,
  Flower2,
  Palette,
  Leaf,
  Flame,
  Check,
  Flag,
  Ban,
  Camera,
} from "lucide-react";
import type {
  Page,
  State,
  Post,
  Piece,
  Person,
  Story,
  Mood,
  DayLook,
} from "./social/types";
import { seed, moods, people } from "./social/data";
import {
  readState,
  writeState,
  rankPosts,
  safeLink,
  uid,
} from "./social/storage";
import * as cloud from "./social/api";
import { Avatar, Modal, Empty, Loading, formatDate } from "./social/ui";
import { Composer } from "./social/Composer";
import { Auth } from "./social/Auth";
import "./social/styles.css";
const navigation = [
  { id: "feed", label: "Descobrir", icon: Home },
  { id: "wardrobe", label: "Meu guarda-roupa", icon: Shirt },
  { id: "calendar", label: "Calendário de looks", icon: CalendarDays },
  { id: "saved", label: "Meus salvos", icon: Bookmark },
  { id: "moods", label: "Meu mood", icon: Heart },
] as const;
const moodIcons = [Coffee, Flower2, Leaf, Palette, Flame];
export default function App() {
  useEffect(() => {
    let dispose = () => {};
    let cancelled = false;
    void listenNativeAuth(() => setRecovery(true), fail).then((cleanup) => {
      if (cancelled) cleanup();
      else dispose = cleanup;
    });
    return () => {
      cancelled = true;
      dispose();
    };
  }, []);
  const [state, setState] = useState<State>(seed);
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(
    !cloud.connected &&
      sessionStorage.getItem("lumina-demo-session") === "active",
  );
  const [recovery, setRecovery] = useState(
    sessionStorage.getItem("lumina-password-recovery") === "active",
  );
  const [page, setPage] = useState<Page>("feed");
  const [tab, setTab] = useState<"you" | "following">("you");
  const [mood, setMood] = useState("");
  const [search, setSearch] = useState("");
  const [composer, setComposer] = useState<"look" | "piece" | "story" | null>(
    null,
  );
  const [detail, setDetail] = useState<Post | null>(null);
  const [profile, setProfile] = useState<Person | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [plan, setPlan] = useState(false);
  const [settings, setSettings] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState(6);
  const [remoteFeed, setRemoteFeed] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [salt] = useState(() => Math.random() * 100);
  const sentinel = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const notify = (s: string) => {
    setToast(s);
    setError("");
  };
  const fail = (s: string) => {
    setError(s);
    setToast("");
  };
  useEffect(() => {
    if (!toast && !error) return;
    const timer = setTimeout(() => {
      setToast("");
      setError("");
    }, 6500);
    return () => clearTimeout(timer);
  }, [toast, error]);
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        if (cloud.connected) {
          const session = cloud.unwrap(
            await cloud.supabase!.auth.getSession(),
          ).session;
          if (!session) {
            if (alive) {
              setSignedIn(false);
              setReady(true);
            }
            return;
          }
          const account = await cloud.loadAccount();
          if (alive) {
            setState(account);
            setSignedIn(true);
          }
        } else {
          const local = await readState();
          if (alive) setState(local);
        }
      } catch (e) {
        fail((e as Error).message);
      } finally {
        if (alive) setReady(true);
      }
    }
    load();
    const listener = cloud.supabase?.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        sessionStorage.setItem("lumina-password-recovery", "active");
        setRecovery(true);
      }
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") setTimeout(load, 0);
    });
    return () => {
      alive = false;
      listener?.data.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (ready && !cloud.connected)
      writeState(state).catch(() =>
        fail(
          "Não foi possível salvar neste navegador. Verifique o espaço disponível.",
        ),
      );
  }, [state, ready]);
  useEffect(() => {
    if ("serviceWorker" in navigator && import.meta.env.PROD)
      navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  useEffect(() => {
    setVisible(6);
    if (!cloud.connected || !signedIn) return;
    let cancelled = false;
    setFetching(true);
    cloud
      .loadPage(0, tab === "following", mood, search)
      .then((posts) => {
        if (!cancelled) {
          setRemoteFeed(posts);
          setState((s) => ({
            ...s,
            posts: Array.from(
              new Map([...s.posts, ...posts].map((p) => [p.id, p])).values(),
            ),
          }));
          setHasMore(posts.length === 20);
        }
      })
      .catch((e) => fail(e.message))
      .finally(() => {
        if (!cancelled) setFetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, mood, search, signedIn]);
  const eligible = state.posts.filter(
    (p) =>
      !state.blocked.includes(p.author.id) &&
      (!mood || p.mood === mood) &&
      (!search ||
        (p.title + " " + p.description + " " + p.author.name + " " + p.mood)
          .toLowerCase()
          .includes(search.toLowerCase())) &&
      (tab !== "following" || state.follows.includes(p.author.id)),
  );
  const localFeed =
    tab === "following"
      ? [...eligible].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      : rankPosts(eligible, state.interests, salt);
  const feed = cloud.connected
    ? remoteFeed.filter(
        (p) =>
          !state.blocked.includes(p.author.id) &&
          (!mood || p.mood === mood) &&
          (tab !== "following" || state.follows.includes(p.author.id)),
      )
    : localFeed;
  const saved = state.posts.filter(
    (p) => state.saved.includes(p.id) && !state.blocked.includes(p.author.id),
  );
  const own = state.posts.filter((p) => p.author.id === state.profile.id);
  const activeStories = state.stories.filter(
    (s) =>
      new Date(s.expiresAt).getTime() > Date.now() &&
      !state.blocked.includes(s.author.id),
  );
  async function more() {
    if (fetching) return;
    if (!cloud.connected) {
      setVisible((v) => v + 6);
      return;
    }
    if (!hasMore) return;
    setFetching(true);
    try {
      const next = await cloud.loadPage(
        remoteFeed.length,
        tab === "following",
        mood,
        search,
      );
      setRemoteFeed((old) => [
        ...old,
        ...next.filter((n) => !old.some((p) => p.id === n.id)),
      ]);
      setState((old) => ({
        ...old,
        posts: Array.from(
          new Map([...old.posts, ...next].map((p) => [p.id, p])).values(),
        ),
      }));
      setHasMore(next.length === 20);
    } catch (e) {
      fail((e as Error).message);
    } finally {
      setFetching(false);
    }
  }
  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          (cloud.connected ? hasMore : visible < feed.length)
        )
          more();
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, feed.length, fetching, hasMore, page]);
  async function relation(
    kind: "likes" | "saved" | "follows" | "blocked",
    id: string,
    post?: Post,
  ) {
    if (pending) return;
    const enabled = !state[kind].includes(id);
    setPending(true);
    try {
      if (cloud.connected)
        await cloud.toggleRelation(
          kind === "blocked" ? "blocks" : kind,
          id,
          enabled,
        );
      setState((s) => ({
        ...s,
        [kind]: enabled ? [...s[kind], id] : s[kind].filter((x) => x !== id),
        posts:
          cloud.connected && kind === "likes"
            ? s.posts.map((p) =>
                p.id === id
                  ? { ...p, likes: Math.max(0, p.likes + (enabled ? 1 : -1)) }
                  : p,
              )
            : s.posts,
        interests: post
          ? {
              ...s.interests,
              [post.mood]: Math.max(
                0,
                (s.interests[post.mood] || 0) +
                  (enabled ? 1 : -1) * (kind === "saved" ? 2 : 1),
              ),
            }
          : s.interests,
      }));
      if (cloud.connected && kind === "likes")
        setRemoteFeed((s) =>
          s.map((p) =>
            p.id === id
              ? { ...p, likes: Math.max(0, p.likes + (enabled ? 1 : -1)) }
              : p,
          ),
        );
      if (kind === "saved")
        notify(
          enabled
            ? "Look guardado nas suas inspirações."
            : "Look removido dos salvos.",
        );
      if (kind === "blocked") {
        notify(
          enabled
            ? "Conta bloqueada. Seus posts foram ocultados."
            : "Conta desbloqueada.",
        );
        setProfile(null);
        setDetail(null);
      }
    } catch (e) {
      fail((e as Error).message);
    } finally {
      setPending(false);
    }
  }
  async function submit(value: {
    post?: Post;
    pieces: Piece[];
    story?: Story;
    date?: string;
  }) {
    let pieces = value.pieces;
    let post = value.post;
    let story = value.story;
    const newPieces = pieces.filter(
      (p) =>
        !state.wardrobe.some(
          (w) =>
            w.id === p.id || (w.fingerprint && w.fingerprint === p.fingerprint),
        ),
    );
    const unique = Array.from(
      new Map(newPieces.map((p) => [p.fingerprint || p.id, p])).values(),
    );
    const persisted = cloud.connected ? await cloud.addPieces(unique) : unique;
    const wardrobe = [...state.wardrobe, ...persisted];
    if (cloud.connected) setState((s) => ({ ...s, wardrobe }));
    pieces = pieces.map(
      (p) =>
        wardrobe.find(
          (w) =>
            w.id === p.id || (w.fingerprint && w.fingerprint === p.fingerprint),
        ) || p,
    );
    if (post) {
      post = { ...post, pieces };
      if (cloud.connected) post = await cloud.publish(post);
    }
    if (story && cloud.connected) story = await cloud.publishStory(story);
    let day: DayLook | undefined;
    let calendarFailed = false;
    if (value.date && post) {
      day = { date: value.date, postId: post.id, mood: post.mood, note: "" };
      if (cloud.connected) {
        try {
          await cloud.saveDay(day);
        } catch {
          day = undefined;
          calendarFailed = true;
        }
      }
    }
    setState((s) => ({
      ...s,
      wardrobe,
      posts: post ? [post, ...s.posts] : s.posts,
      stories: story ? [story, ...s.stories] : s.stories,
      calendar: day
        ? [...s.calendar.filter((d) => d.date !== day!.date), day]
        : s.calendar,
    }));
    if (post) {
      setRemoteFeed((s) => [post!, ...s]);
      setPage("profile");
    }
    if (calendarFailed) {
      fail(
        "Look publicado e peças salvas. O calendário não salvou; tente registrar pela Agenda.",
      );
      return;
    }
    notify(
      story
        ? "Seu story está no ar por 24 horas."
        : post
          ? "Look compartilhado. Seu estilo tem lugar aqui."
          : "Peças salvas, sem repetir cadastros.",
    );
  }
  async function saveDay(day: DayLook) {
    try {
      if (cloud.connected) await cloud.saveDay(day);
      setState((s) => ({
        ...s,
        calendar: [...s.calendar.filter((d) => d.date !== day.date), day],
      }));
      notify("Um dia, um look. Registrado!");
    } catch (e) {
      fail((e as Error).message);
      throw e;
    }
  }
  const openDetail = (p: Post) => {
    setDetail(p);
    if (cloud.connected)
      cloud
        .loadComments(p.id)
        .then((comments) =>
          setState((s) => ({
            ...s,
            comments: [
              ...s.comments.filter((c) => c.postId !== p.id),
              ...comments,
            ],
          })),
        )
        .catch((e) => fail(e.message));
  };
  const renderCards = (posts: Post[]) =>
    posts.map((p) => (
      <LookCard
        key={p.id}
        post={p}
        liked={state.likes.includes(p.id)}
        saved={state.saved.includes(p.id)}
        pending={pending}
        onLike={() => relation("likes", p.id, p)}
        onSave={() => relation("saved", p.id, p)}
        onOpen={() => openDetail(p)}
        onProfile={() => setProfile(p.author)}
      />
    ));
  if (!ready) return <Loading />;
  if (
    signedIn &&
    !recovery &&
    cloud.connected &&
    /^estilo\.[a-f0-9]{32}$/.test(state.profile.handle)
  )
    return (
      <Onboarding
        profile={state.profile}
        onDone={(profile) => setState((s) => ({ ...s, profile }))}
      />
    );
  if (!signedIn || recovery)
    return (
      <Auth
        key={recovery ? "recovery" : "login"}
        externalError={error}
        recovery={recovery}
        onDemo={() => {
          sessionStorage.setItem("lumina-demo-session", "active");
          setSignedIn(true);
        }}
        onDone={() => {
          sessionStorage.removeItem("lumina-password-recovery");
          setRecovery(false);
          location.assign(location.pathname);
        }}
      />
    );
  return (
    <>
      <div className="app-shell">
        <aside className="sidebar">
          <button
            className="brand"
            onClick={() => setPage("feed")}
            aria-label="Lumina, início"
          >
            <span className="brand-symbol">✦</span>lumina
            <span className="brand-dot">.</span>
          </button>
          <p className="brand-caption">SEU JEITO DE BRILHAR</p>
          <nav aria-label="Menu principal">
            {navigation.map((n) => (
              <button
                key={n.id}
                className={"nav-item " + (page === n.id ? "active" : "")}
                onClick={() => {
                  setPage(n.id);
                  setSearch("");
                }}
              >
                <n.icon size={21} />
                <span>{n.label}</span>
                {page === n.id && <span className="nav-dot" />}
              </button>
            ))}
          </nav>
          <button
            className="button primary create-button"
            onClick={() => setComposer("look")}
          >
            <Plus size={18} /> Criar um look
          </button>
          <div className="sidebar-note">
            <span>✷</span>
            <p>
              Não existe um jeito certo.
              <br />
              <strong>Existe o seu.</strong>
            </p>
          </div>
          <button
            className={"account " + (page === "profile" ? "selected" : "")}
            onClick={() => setPage("profile")}
          >
            <Avatar src={state.profile.avatar} name={state.profile.name} />
            <span>
              <strong>{state.profile.name}</strong>
              <small>@{state.profile.handle}</small>
            </span>
            <Settings
              size={17}
              onClick={(e) => {
                e.stopPropagation();
                setSettings(true);
              }}
            />
          </button>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <div className="mobile-brand">✦ lumina.</div>
            <div className="breadcrumb">
              <span>Seu espaço</span>
              <span>/</span>
              <strong>
                {navigation.find((n) => n.id === page)?.label || "Meu perfil"}
              </strong>
            </div>
            <label className="search-box">
              <Search size={17} />
              <input
                aria-label="Buscar looks, estilos ou pessoas"
                placeholder="Encontre sua próxima inspiração"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage("feed");
                }}
              />
              <kbd>⌕</kbd>
            </label>
            <div className="top-actions">
              <button
                className="icon-button"
                aria-label="Sair da conta"
                title="Sair da conta"
                onClick={async () => {
                  try {
                    if (cloud.supabase) {
                      const result = await cloud.supabase.auth.signOut();
                      if (result.error) throw result.error;
                    }
                    sessionStorage.removeItem("lumina-demo-session");
                    sessionStorage.removeItem("lumina-password-recovery");
                    location.assign(location.pathname);
                  } catch (e) {
                    fail((e as Error).message);
                  }
                }}
              >
                <LogOut size={19} />
              </button>
              <span className={"mode-badge " + (cloud.connected ? "live" : "")}>
                {cloud.connected ? "Comunidade" : "Modo demo"}
              </span>
              <button
                className="icon-button mobile-saved"
                aria-label="Meus salvos"
                onClick={() => setPage("saved")}
              >
                <Bookmark size={19} />
              </button>
              <button
                className="icon-button notification-button"
                aria-label="Notificações"
                onClick={() => setNotifications(true)}
              >
                <Bell size={20} />
              </button>
              <button
                className="profile-button"
                aria-label="Meu perfil"
                onClick={() => setPage("profile")}
              >
                <Avatar
                  src={state.profile.avatar}
                  name={state.profile.name}
                  size={34}
                />
              </button>
            </div>
          </header>
          <div className="content-layout">
            <main className="main-content">
              {page === "feed" && (
                <>
                  <div className="page-heading">
                    <div>
                      <p className="eyebrow">
                        UM POUCO DE INSPIRAÇÃO, MUITO DE VOCÊ
                      </p>
                      <h1>
                        Vista quem você <em>é.</em>
                      </h1>
                      <p>
                        Looks reais. Histórias suas. Um mundo de possibilidades.
                      </p>
                    </div>
                    <span className="heading-flower">✳</span>
                  </div>
                  <section className="stories" aria-label="Stories">
                    <button
                      className="story-item own-story"
                      onClick={() => setComposer("story")}
                    >
                      <span className="story-ring">
                        <Avatar
                          src={state.profile.avatar}
                          name="Você"
                          size={60}
                        />
                        <span className="story-plus">
                          <Plus size={12} />
                        </span>
                      </span>
                      <span>Seu story</span>
                    </button>
                    {activeStories.slice(0, 8).map((s) => (
                      <button
                        className="story-item"
                        key={s.id}
                        onClick={() => setStory(s)}
                      >
                        <span className="story-ring">
                          <Avatar
                            src={s.author.avatar}
                            name={s.author.name}
                            size={60}
                          />
                        </span>
                        <span>{s.author.name.split(" ")[0]}</span>
                      </button>
                    ))}
                  </section>
                  <section className="feed-section">
                    <div className="feed-toolbar">
                      <div
                        className="tabs"
                        role="tablist"
                        aria-label="Tipo de feed"
                      >
                        <button
                          role="tab"
                          aria-selected={tab === "you"}
                          className={tab === "you" ? "active" : ""}
                          onClick={() => setTab("you")}
                        >
                          Para você <Sparkles size={14} />
                        </button>
                        <button
                          role="tab"
                          aria-selected={tab === "following"}
                          className={tab === "following" ? "active" : ""}
                          onClick={() => setTab("following")}
                        >
                          Seguindo
                        </button>
                      </div>
                      <span className="feed-caption">
                        Encontre o que combina com você
                      </span>
                    </div>
                    <div className="chips" aria-label="Filtrar mood">
                      <button
                        className={"chip " + (!mood ? "active" : "")}
                        onClick={() => setMood("")}
                      >
                        Todos os moods
                      </button>
                      {moods.map((m, i) => {
                        const Icon = moodIcons[i];
                        return (
                          <button
                            key={m}
                            className={"chip " + (mood === m ? "active" : "")}
                            onClick={() => setMood(mood === m ? "" : m)}
                          >
                            <Icon size={14} />
                            {m}
                          </button>
                        );
                      })}
                    </div>
                    <div className="look-grid">
                      {renderCards(
                        cloud.connected ? feed : feed.slice(0, visible),
                      )}
                    </div>
                    {!feed.length && !fetching && (
                      <Empty
                        title={
                          tab === "following"
                            ? "Sua roda começa aqui."
                            : "Uma nova inspiração vem aí."
                        }
                      >
                        {tab === "following"
                          ? "Siga alguém da comunidade para ver seus looks nesta aba."
                          : "Experimente outro mood ou outra busca."}
                      </Empty>
                    )}
                    <div ref={sentinel} className="feed-end">
                      {fetching ? (
                        <span className="spinner" />
                      ) : (cloud.connected && hasMore) ||
                        (!cloud.connected && visible < feed.length) ? (
                        <button className="text-button" onClick={more}>
                          Mais inspirações <ArrowRight size={15} />
                        </button>
                      ) : (
                        <p>
                          {cloud.connected
                            ? "Você viu os looks disponíveis. Volte para encontrar novidades."
                            : "Você explorou os looks de demonstração. Crie o seu para continuar."}
                        </p>
                      )}
                    </div>
                  </section>
                </>
              )}
              {page === "wardrobe" && (
                <Wardrobe
                  pieces={state.wardrobe}
                  onAdd={() => setComposer("piece")}
                  onError={fail}
                  onDelete={async (p) => {
                    try {
                      if (cloud.connected)
                        cloud.unwrap(
                          await cloud
                            .supabase!.from("wardrobe")
                            .delete()
                            .eq("id", p.id),
                        );
                      setState((s) => ({
                        ...s,
                        wardrobe: s.wardrobe.filter((w) => w.id !== p.id),
                      }));
                      notify("Peça removida do guarda-roupa.");
                    } catch (e) {
                      fail((e as Error).message);
                    }
                  }}
                />
              )}
              {page === "calendar" && (
                <Calendar
                  posts={own}
                  state={state}
                  onSave={saveDay}
                  onOpen={openDetail}
                  onCreate={() => setComposer("look")}
                />
              )}
              {page === "saved" && (
                <>
                  <PageHeading
                    eyebrow="SEU PEQUENO ACERVO DE IDEIAS"
                    title="Inspirações para"
                    accent="guardar."
                    description="Aqueles looks que fizeram você pensar: quero tentar."
                  />
                  <div className="section-line">
                    <p>{saved.length} looks salvos</p>
                  </div>
                  {saved.length ? (
                    <div className="look-grid">{renderCards(saved)}</div>
                  ) : (
                    <Empty title="Um lugar para seus favoritos.">
                      Toque no marcador de um look e ele aparece aqui.
                    </Empty>
                  )}
                </>
              )}
              {page === "moods" && (
                <>
                  <PageHeading
                    eyebrow="HOJE EU QUERO ME SENTIR…"
                    title="No meu"
                    accent="mood."
                    description="Seu estilo pode mudar com você. Escolha uma vibe e explore."
                  />
                  <div className="mood-grid">
                    {moods.map((m, i) => {
                      const Icon = moodIcons[i];
                      return (
                        <button
                          className={"mood-card mood-" + i}
                          key={m}
                          onClick={() => {
                            setMood(m);
                            setTab("you");
                            setPage("feed");
                          }}
                        >
                          <img
                            src={
                              [
                                "/images/look-cozy.jpg",
                                "/images/look-pink.jpg",
                                "/images/look-minimal.jpg",
                                "/images/look-color.jpg",
                                "/images/look-street.jpg",
                              ][i]
                            }
                            alt=""
                          />
                          <div>
                            <Icon size={25} />
                            <h2>{m}</h2>
                            <p>
                              {
                                [
                                  "Dias leves, texturas macias.",
                                  "Delicadeza no seu próprio ritmo.",
                                  "O essencial que diz tudo.",
                                  "Misturas que só você faria.",
                                  "Seu espaço. Suas regras.",
                                ][i]
                              }
                            </p>
                            <span>
                              Explorar looks <ArrowUpRight size={18} />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="community-message">
                    <Heart size={22} />
                    <p>
                      Feminino é expressão, não uma regra.
                      <br />
                      Aqui, todos os jeitos de ser têm espaço.
                    </p>
                  </div>
                </>
              )}
              {page === "profile" && (
                <>
                  <div className="profile-hero">
                    <Avatar
                      src={state.profile.avatar}
                      name={state.profile.name}
                      size={90}
                    />
                    <div>
                      <p className="eyebrow">SEU ESTILO, SUA HISTÓRIA</p>
                      <h1>{state.profile.name}</h1>
                      <p>
                        @{state.profile.handle} · {state.profile.bio}
                      </p>
                    </div>
                    <button
                      className="button secondary"
                      onClick={() => setSettings(true)}
                    >
                      Editar perfil
                    </button>
                  </div>
                  <div className="profile-stats">
                    <span>
                      <strong>{own.length}</strong> looks
                    </span>
                    <span>
                      <strong>{state.wardrobe.length}</strong> peças
                    </span>
                    <span>
                      <strong>{state.follows.length}</strong> seguindo
                    </span>
                  </div>
                  <div className="section-line">
                    <h2>Meu diário de estilo</h2>
                    <button
                      className="text-button"
                      onClick={() => setComposer("look")}
                    >
                      Novo look <Plus size={16} />
                    </button>
                  </div>
                  {own.length ? (
                    <div className="look-grid">{renderCards(own)}</div>
                  ) : (
                    <Empty
                      title="Seu primeiro look merece um lugar. "
                      action={
                        <button
                          className="button primary"
                          onClick={() => setComposer("look")}
                        >
                          <Camera size={16} /> Criar meu primeiro look
                        </button>
                      }
                    >
                      Um registro de quem você é hoje. Amanhã, você pode ser
                      outra versão.
                    </Empty>
                  )}
                </>
              )}
            </main>
            <aside className="right-rail">
              <div className="daily-mood">
                <div className="section-line">
                  <p className="eyebrow">SEU MOOD DE HOJE</p>
                  <span>☼</span>
                </div>
                <h2>
                  Um domingo
                  <br />
                  <em>bem cozy.</em>
                </h2>
                <p>
                  Uma pausa, seu café favorito
                  <br />e um look que abraça.
                </p>
                <div className="palette-dots">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <button
                  className="text-button"
                  onClick={() => {
                    setMood("Cozy");
                    setPage("feed");
                  }}
                >
                  Entrar nesse mood <ArrowUpRight size={16} />
                </button>
                <Coffee
                  className="mood-illustration"
                  size={92}
                  strokeWidth={0.7}
                />
              </div>
              <section className="rail-section">
                <div className="section-line">
                  <h3>Sua próxima conexão</h3>
                  <Flower2 size={18} />
                </div>
                <p className="muted small-text">
                  Estilos diferentes. A mesma liberdade.
                </p>
                {(cloud.connected
                  ? Array.from(
                      new Map(
                        state.posts.map((p) => [p.author.id, p.author]),
                      ).values(),
                    )
                  : people
                )
                  .filter(
                    (p) =>
                      p.id !== state.profile.id &&
                      !state.blocked.includes(p.id),
                  )
                  .slice(0, 3)
                  .map((p) => (
                    <div className="suggestion" key={p.id}>
                      <button
                        className="person-summary"
                        onClick={() => setProfile(p)}
                      >
                        <Avatar src={p.avatar} name={p.name} />
                        <span>
                          <strong>{p.name}</strong>
                          <small>@{p.handle}</small>
                        </span>
                      </button>
                      <button
                        className={
                          "follow-button " +
                          (state.follows.includes(p.id) ? "following" : "")
                        }
                        disabled={pending}
                        onClick={() => relation("follows", p.id)}
                        aria-label={
                          state.follows.includes(p.id)
                            ? "Deixar de seguir " + p.name
                            : "Seguir " + p.name
                        }
                      >
                        {state.follows.includes(p.id) ? (
                          <Check size={15} />
                        ) : (
                          <Plus size={15} />
                        )}
                      </button>
                    </div>
                  ))}
              </section>
              <section className="closet-preview">
                <div className="section-line">
                  <h3>Seu guarda-roupa</h3>
                  <Shirt size={18} />
                </div>
                <p className="muted small-text">
                  Peças conhecidas. Novas possibilidades.
                </p>
                <div className="mini-pieces">
                  {state.wardrobe.slice(0, 3).map((p) => (
                    <button key={p.id} onClick={() => setPage("wardrobe")}>
                      <img src={p.image} alt={p.name} />
                    </button>
                  ))}
                </div>
                <button
                  className="text-button"
                  onClick={() => setPage("wardrobe")}
                >
                  Reencontre suas peças <ArrowRight size={15} />
                </button>
              </section>
              <button className="plus-promo" onClick={() => setPlan(true)}>
                <span className="eyebrow">
                  <Sparkles size={13} /> LUMINA PLUS
                </span>
                <h3>
                  Mais espaço para
                  <br />
                  ser você.
                </h3>
                <p>Conheça o seu próximo capítulo.</p>
                <span className="promo-link">
                  Explorar Plus <ArrowUpRight size={16} />
                </span>
              </button>
              <footer className="rail-footer">
                <button onClick={() => setSettings(true)}>
                  Sobre & privacidade
                </button>
                <span>Feito para você, com carinho.</span>
                <span>
                  © 2026 Lumina · {cloud.connected ? "Online" : "Demo local"}
                </span>
              </footer>
            </aside>
          </div>
        </div>
      </div>
      <nav className="mobile-nav" aria-label="Menu celular">
        {[
          { id: "feed", icon: Home, label: "Início" },
          { id: "wardrobe", icon: Shirt, label: "Peças" },
          { id: "create", icon: Plus, label: "Criar" },
          { id: "calendar", icon: CalendarDays, label: "Agenda" },
          { id: "profile", icon: Heart, label: "Eu" },
        ].map((n) => (
          <button
            key={n.id}
            className={
              (page === n.id ? "active " : "") +
              (n.id === "create" ? "mobile-create" : "")
            }
            onClick={() =>
              n.id === "create" ? setComposer("look") : setPage(n.id as Page)
            }
            aria-label={n.label}
          >
            <n.icon size={22} />
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
      {(toast || error) && (
        <div
          className={"toast " + (error ? "error" : "")}
          role={error ? "alert" : "status"}
        >
          {error || toast}
          <button
            aria-label="Fechar aviso"
            onClick={() => {
              setToast("");
              setError("");
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {composer && (
        <Composer
          type={composer}
          wardrobe={state.wardrobe}
          profile={state.profile}
          onClose={() => setComposer(null)}
          onSubmit={submit}
          onError={fail}
        />
      )}
      {detail && (
        <LookDetail
          post={detail}
          comments={state.comments.filter((c) => c.postId === detail.id)}
          liked={state.likes.includes(detail.id)}
          saved={state.saved.includes(detail.id)}
          pending={pending}
          onClose={() => setDetail(null)}
          onLike={() => relation("likes", detail.id, detail)}
          onSave={() => relation("saved", detail.id, detail)}
          onProfile={() => {
            setDetail(null);
            setProfile(detail.author);
          }}
          onComment={async (text) => {
            const c = {
              id: uid(),
              postId: detail.id,
              name: state.profile.name,
              text,
            };
            try {
              if (cloud.connected) await cloud.addComment(c);
              setState((s) => ({ ...s, comments: [...s.comments, c] }));
            } catch (e) {
              fail((e as Error).message);
              throw e;
            }
          }}
          onReport={async () => {
            try {
              if (cloud.connected) {
                const user = cloud.unwrap(
                  await cloud.supabase!.auth.getUser(),
                ).user!;
                cloud.unwrap(
                  await cloud.supabase!.from("reports").insert({
                    user_id: user.id,
                    post_id: detail.id,
                    reason: "Conteúdo inadequado",
                  }),
                );
              }
              notify(
                cloud.connected
                  ? "Denúncia registrada para revisão."
                  : "Denúncia demonstrativa registrada apenas nesta sessão.",
              );
            } catch (e) {
              fail((e as Error).message);
            }
          }}
        />
      )}
      {profile && (
        <Modal title="Um estilo para conhecer" onClose={() => setProfile(null)}>
          <div className="person-profile">
            <Avatar src={profile.avatar} name={profile.name} size={85} />
            <h2>{profile.name}</h2>
            <p>@{profile.handle}</p>
            <p>{profile.bio || "Um novo jeito de ver a moda."}</p>
            {profile.id !== state.profile.id && (
              <div className="profile-actions">
                <button
                  className="button primary"
                  disabled={pending}
                  onClick={() => relation("follows", profile.id)}
                >
                  {state.follows.includes(profile.id)
                    ? "Deixar de seguir"
                    : "Seguir estilo"}
                </button>
                <button
                  className="button secondary"
                  disabled={pending}
                  onClick={() => relation("blocked", profile.id)}
                >
                  <Ban size={16} /> Bloquear
                </button>
              </div>
            )}
            <div className="profile-photo-grid">
              {state.posts
                .filter((p) => p.author.id === profile.id)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setProfile(null);
                      openDetail(p);
                    }}
                  >
                    <img src={p.image} alt={p.title} />
                  </button>
                ))}
            </div>
          </div>
        </Modal>
      )}
      {story && (
        <StoryViewer
          story={story}
          stories={activeStories}
          onChange={setStory}
          onClose={() => setStory(null)}
        />
      )}
      {plan && <Plan onClose={() => setPlan(false)} onError={fail} />}
      {settings && (
        <ProfileSettings
          state={state}
          onClose={() => setSettings(false)}
          onError={fail}
          onSave={async (profile) => {
            if (cloud.connected)
              cloud.unwrap(
                await cloud
                  .supabase!.from("profiles")
                  .update({ name: profile.name, bio: profile.bio })
                  .eq("id", profile.id),
              );
            setState((s) => ({
              ...s,
              profile,
              posts: s.posts.map((p) =>
                p.author.id === profile.id ? { ...p, author: profile } : p,
              ),
            }));
            notify("Seu perfil foi atualizado.");
          }}
          onUnblock={(id) => relation("blocked", id)}
        />
      )}
      {notifications && (
        <Modal
          title="Seu cantinho de novidades"
          onClose={() => setNotifications(false)}
        >
          <Empty title="Tudo tranquilo por aqui.">
            Curtidas e comentários podem ser vistos nos seus looks. As
            notificações push serão habilitadas na etapa de publicação.
          </Empty>
        </Modal>
      )}
    </>
  );
}
function PageHeading({
  eyebrow,
  title,
  accent,
  description,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>
          {title} <em>{accent}</em>
        </h1>
        <p>{description}</p>
      </div>
    </div>
  );
}
function LookCard({
  post,
  liked,
  saved,
  pending,
  onLike,
  onSave,
  onOpen,
  onProfile,
}: {
  post: Post;
  liked: boolean;
  saved: boolean;
  pending: boolean;
  onLike: () => void;
  onSave: () => void;
  onOpen: () => void;
  onProfile: () => void;
}) {
  return (
    <article className="look-card">
      <div className="look-photo">
        <button className="photo-button" onClick={onOpen}>
          <img src={post.image} alt={post.title} loading="lazy" />
        </button>
        <span className="photo-mood">
          {post.mood === "Cozy" ? <Coffee size={12} /> : <Flower2 size={12} />}{" "}
          {post.mood}
        </span>
        <button
          className={"photo-save " + (saved ? "saved" : "")}
          aria-label={saved ? "Remover dos salvos" : "Salvar look"}
          disabled={pending}
          onClick={onSave}
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </button>
        <div className="photo-overlay">
          <button onClick={onOpen}>
            <h2>{post.title}</h2>
            <span>
              {post.pieces.length
                ? post.pieces.length + " peças no look"
                : "Ver história"}{" "}
              <ArrowUpRight size={13} />
            </span>
          </button>
        </div>
      </div>
      <div className="look-footer">
        <button className="person-summary" onClick={onProfile}>
          <Avatar src={post.author.avatar} name={post.author.name} size={31} />
          <span>
            <strong>{post.author.name}</strong>
            <small>@{post.author.handle}</small>
          </span>
        </button>
        <div className="look-actions">
          <button
            className={liked ? "liked" : ""}
            aria-label={liked ? "Descurtir look" : "Curtir look"}
            disabled={pending}
            onClick={onLike}
          >
            <Heart size={17} fill={liked ? "currentColor" : "none"} />
            <span>{post.likes + (!cloud.connected && liked ? 1 : 0)}</span>
          </button>
          <button aria-label="Ver comentários" onClick={onOpen}>
            <MessageCircle size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
function LookDetail({
  post,
  comments,
  liked,
  saved,
  pending,
  onClose,
  onLike,
  onSave,
  onProfile,
  onComment,
  onReport,
}: {
  post: Post;
  comments: State["comments"];
  liked: boolean;
  saved: boolean;
  pending: boolean;
  onClose: () => void;
  onLike: () => void;
  onSave: () => void;
  onProfile: () => void;
  onComment: (text: string) => Promise<void>;
  onReport: () => void;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  return (
    <Modal title={post.title} onClose={onClose} wide>
      <div className="detail-layout">
        <img className="detail-photo" src={post.image} alt={post.title} />
        <div className="detail-content">
          <button className="person-summary" onClick={onProfile}>
            <Avatar src={post.author.avatar} name={post.author.name} />
            <span>
              <strong>{post.author.name}</strong>
              <small>@{post.author.handle}</small>
            </span>
          </button>
          <span className="chip active">{post.mood}</span>
          <p>{post.description}</p>
          <div className="detail-actions">
            <button
              className={"button secondary " + (liked ? "liked" : "")}
              disabled={pending}
              onClick={onLike}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} />{" "}
              {liked ? "Curtido" : "Curtir"}
            </button>
            <button
              className="button secondary"
              disabled={pending}
              onClick={onSave}
            >
              <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
              {saved ? "Salvo" : "Salvar"}
            </button>
            <button
              className="icon-button"
              aria-label="Denunciar conteúdo"
              onClick={onReport}
            >
              <Flag size={17} />
            </button>
          </div>
          <h3>As peças dessa história</h3>
          {post.pieces.length ? (
            post.pieces.map((p) => (
              <div className="detail-piece" key={p.id}>
                <img src={p.image} alt={p.name} />
                <span>
                  <strong>{p.name}</strong>
                  <small>
                    {p.brand || "Marca não informada"} · {p.color}
                  </small>
                  {safeLink(p.link) && (
                    <a
                      href={safeLink(p.link)!}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver na loja <ArrowUpRight size={12} />
                    </a>
                  )}
                </span>
              </div>
            ))
          ) : (
            <p className="muted">Ainda não há peças marcadas neste look.</p>
          )}
          <h3>Conversa boa começa aqui</h3>
          <div className="comments">
            {comments.map((c) => (
              <p key={c.id}>
                <strong>{c.name}</strong> {c.text}
              </p>
            ))}
          </div>
          <form
            className="comment-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!text.trim()) return;
              setSending(true);
              try {
                await onComment(text.trim());
                setText("");
              } catch {
              } finally {
                setSending(false);
              }
            }}
          >
            <input
              value={text}
              maxLength={500}
              onChange={(e) => setText(e.target.value)}
              placeholder="Deixe um carinho…"
              aria-label="Comentário"
              required
            />
            <button
              className="icon-button"
              disabled={sending || !text.trim()}
              aria-label="Enviar comentário"
            >
              <ArrowRight size={19} />
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
function Wardrobe({
  pieces,
  onAdd,
  onDelete,
  onError,
}: {
  pieces: Piece[];
  onAdd: () => void;
  onDelete: (p: Piece) => Promise<void>;
  onError: (s: string) => void;
}) {
  const [category, setCategory] = useState("Todas");
  const [selected, setSelected] = useState<Piece | null>(null);
  const [confirm, setConfirm] = useState(false);
  const categories = [
    "Todas",
    ...Array.from(new Set(pieces.map((p) => p.category))),
  ];
  const filtered = pieces.filter(
    (p) => category === "Todas" || p.category === category,
  );
  return (
    <>
      <PageHeading
        eyebrow="O QUE VOCÊ TEM JÁ CONTA UMA HISTÓRIA"
        title="Seu guarda-roupa,"
        accent="redescoberto."
        description="Menos compras por impulso. Mais combinações com o que é seu."
      />
      <div className="section-line">
        <p>{pieces.length} peças · só você pode ver</p>
        <button className="button primary" onClick={onAdd}>
          <Plus size={16} /> Nova peça
        </button>
      </div>
      <div className="chips">
        {categories.map((c) => (
          <button
            key={c}
            className={"chip " + (category === c ? "active" : "")}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {filtered.length ? (
        <div className="wardrobe-grid">
          {filtered.map((p) => (
            <button
              className="wardrobe-card"
              key={p.id}
              onClick={() => {
                setSelected(p);
                setConfirm(false);
              }}
            >
              <div>
                <img src={p.image} alt={p.name} />
                <span>{p.category}</span>
              </div>
              <h3>{p.name}</h3>
              <p>
                {p.brand || "Sua peça"} · {p.color || "Cor não informada"}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <Empty
          title="Dê espaço às suas peças."
          action={
            <button className="button primary" onClick={onAdd}>
              Cadastrar uma peça
            </button>
          }
        >
          Uma foto é o primeiro passo para enxergar novas combinações.
        </Empty>
      )}
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <img
            className="piece-preview"
            src={selected.image}
            alt={selected.name}
          />
          <p>
            {selected.category} · {selected.color} ·{" "}
            {selected.brand || "Marca não informada"}
          </p>
          {safeLink(selected.link) && (
            <a
              className="button secondary"
              href={safeLink(selected.link)!}
              target="_blank"
              rel="noopener noreferrer"
            >
              Link de compra <ArrowUpRight size={16} />
            </a>
          )}
          <p className="muted small-text">
            Remover esta peça não altera seus looks já publicados.
          </p>
          <button
            className="button secondary full"
            onClick={async () => {
              if (!confirm) {
                setConfirm(true);
                return;
              }
              try {
                await onDelete(selected);
                setSelected(null);
              } catch (e) {
                onError((e as Error).message);
              }
            }}
          >
            {confirm ? "Confirmar remoção da peça" : "Remover do guarda-roupa"}
          </button>
        </Modal>
      )}
    </>
  );
}
function Calendar({
  posts,
  state,
  onSave,
  onOpen,
  onCreate,
}: {
  posts: Post[];
  state: State;
  onSave: (d: DayLook) => Promise<void>;
  onOpen: (p: Post) => void;
  onCreate: () => void;
}) {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selected, setSelected] = useState("");
  const [postId, setPostId] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const first = (month.getDay() + 6) % 7;
  const count = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const days = Array.from({ length: first + count }, (_, i) =>
    i < first ? null : i - first + 1,
  );
  const day = state.calendar.find((d) => d.date === selected);
  const look = state.posts.find((p) => p.id === day?.postId);
  return (
    <>
      <PageHeading
        eyebrow="UM REGISTRO DE CADA VERSÃO SUA"
        title="Dias que viram"
        accent="memórias."
        description="Lembre o que vestiu, como se sentiu e o que quer repetir."
      />
      <div className="calendar-panel">
        <div className="section-line">
          <h2>
            {month.toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="calendar-controls">
            <button
              className="icon-button"
              aria-label="Mês anterior"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="text-button"
              onClick={() =>
                setMonth(
                  new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                )
              }
            >
              Hoje
            </button>
            <button
              className="icon-button"
              aria-label="Próximo mês"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="calendar-grid">
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
            <span className="calendar-weekday" key={d}>
              {d}
            </span>
          ))}
          {days.map((n, i) => {
            if (!n) return <span className="blank-day" key={"b" + i} />;
            const date = formatDate(
              new Date(month.getFullYear(), month.getMonth(), n),
            );
            const record = state.calendar.find((d) => d.date === date);
            const p = state.posts.find((p) => p.id === record?.postId);
            return (
              <button
                className={
                  "calendar-day " +
                  (date === formatDate(new Date()) ? "today" : "")
                }
                key={date}
                onClick={() => {
                  setSelected(date);
                  setPostId(record?.postId || "");
                  setNote(record?.note || "");
                }}
                aria-label={date + (p ? " " + p.title : " sem look registrado")}
              >
                <span>{n}</span>
                {p ? (
                  <>
                    <img src={p.image} alt={p.title} />
                    <small>{record?.mood}</small>
                  </>
                ) : (
                  <Plus size={13} />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <p className="muted small-text">
        Toque em um dia para registrar seu look ou revisitar uma memória.
      </p>
      {selected && (
        <Modal
          title={new Date(selected + "T12:00:00").toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          onClose={() => setSelected("")}
        >
          <form
            className="stack-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const p = posts.find((p) => p.id === postId);
              if (!p) return;
              setSaving(true);
              try {
                await onSave({ date: selected, postId, mood: p.mood, note });
                setSelected("");
              } catch {
              } finally {
                setSaving(false);
              }
            }}
          >
            {look && (
              <button
                type="button"
                className="calendar-selected-look"
                onClick={() => {
                  setSelected("");
                  onOpen(look);
                }}
              >
                <img src={look.image} alt={look.title} />
                <span>{look.title}</span>
              </button>
            )}
            {posts.length ? (
              <>
                <label>
                  O look desse dia
                  <select
                    value={postId}
                    required
                    onChange={(e) => setPostId(e.target.value)}
                  >
                    <option value="">Escolha um dos seus looks</option>
                    {posts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Uma lembrança
                  <textarea
                    value={note}
                    maxLength={500}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Como você se sentiu?"
                  />
                </label>
                <button className="button primary" disabled={saving || !postId}>
                  {saving ? "Salvando…" : "Guardar esse dia"}
                </button>
              </>
            ) : (
              <Empty
                title="Sua história começa com uma foto."
                action={
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => {
                      setSelected("");
                      onCreate();
                    }}
                  >
                    Criar meu look
                  </button>
                }
              >
                Publique seu primeiro look para registrá-lo no calendário.
              </Empty>
            )}
          </form>
        </Modal>
      )}
    </>
  );
}
function StoryViewer({
  story,
  stories,
  onChange,
  onClose,
}: {
  story: Story;
  stories: Story[];
  onChange: (s: Story) => void;
  onClose: () => void;
}) {
  const index = stories.findIndex((s) => s.id === story.id);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const timer = setInterval(() => {
      const value = (Date.now() - start) / 7000;
      setProgress(Math.min(value, 1));
      if (value >= 1) {
        clearInterval(timer);
        if (index < stories.length - 1) onChange(stories[index + 1]);
        else onClose();
      }
    }, 50);
    return () => clearInterval(timer);
  }, [story.id, index, stories.length]);
  return (
    <Modal title="Story" onClose={onClose}>
      <div className="story-viewer">
        <img src={story.image} alt={story.title} />
        <div className="story-progress">
          {stories.map((s, i) => (
            <span key={s.id}>
              <i
                style={{
                  width:
                    (i < index ? 100 : i === index ? progress * 100 : 0) + "%",
                }}
              />
            </span>
          ))}
        </div>
        <div className="story-author">
          <Avatar src={story.author.avatar} name={story.author.name} />
          <strong>{story.author.name}</strong>
          <span>24h</span>
        </div>
        <div className="story-navigation">
          <button
            aria-label="Story anterior"
            disabled={index === 0}
            onClick={() => onChange(stories[index - 1])}
          >
            <ChevronLeft />
          </button>
          <button
            aria-label="Próximo story"
            onClick={() =>
              index < stories.length - 1
                ? onChange(stories[index + 1])
                : onClose()
            }
          >
            <ChevronRight />
          </button>
        </div>
        <h2>{story.title}</h2>
      </div>
    </Modal>
  );
}
function Plan({
  onClose,
  onError,
}: {
  onClose: () => void;
  onError: (s: string) => void;
}) {
  const native = Capacitor.isNativePlatform();
  const [busy, setBusy] = useState(false);
  async function billing(path: string) {
    setBusy(true);
    try {
      const result = await cloud.api(path);
      if (!result.url || !result.url.startsWith("https://"))
        throw new Error("URL de pagamento inválida.");
      location.assign(result.url);
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Lumina Plus" onClose={onClose}>
      <div className="plan-content">
        <Sparkles size={35} />
        <p className="eyebrow">MAIS ESPAÇO PARA SER VOCÊ</p>
        <h1>
          Seu estilo,
          <br />
          <em>novas possibilidades.</em>
        </h1>
        <p>
          Uma comunidade gratuita. Ferramentas extras para cuidar do seu acervo.
        </p>
        <ul>
          <li>
            <Check size={17} /> Reconhecimento de peças nas suas fotos
          </li>
          <li>
            <Check size={17} /> Comparação visual com seu guarda-roupa
          </li>
          <li>
            <Check size={17} /> Todos os looks e moods em um só lugar
          </li>
        </ul>
        <p className="notice">
          {native
            ? "Assinaturas nas lojas serão disponibilizadas após integrar o pagamento nativo."
            : cloud.connected
              ? "O valor e a periodicidade aparecem no checkout seguro."
              : "Esta é uma prévia do Plus. Nenhuma cobrança é feita no modo demo."}
        </p>
        <button
          className="button primary full"
          disabled={busy || !cloud.connected || native}
          onClick={() => billing("checkout")}
        >
          {busy ? "Abrindo…" : "Conhecer assinatura"}
        </button>
        {cloud.connected && !native && (
          <button
            className="text-button"
            disabled={busy}
            onClick={() => billing("portal")}
          >
            Gerenciar ou cancelar assinatura
          </button>
        )}
      </div>
    </Modal>
  );
}
function ProfileSettings({
  state,
  onClose,
  onSave,
  onError,
  onUnblock,
}: {
  state: State;
  onClose: () => void;
  onSave: (p: Person) => Promise<void>;
  onError: (s: string) => void;
  onUnblock: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [name, setName] = useState(state.profile.name);
  const [bio, setBio] = useState(state.profile.bio || "");
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="Seu perfil e seu espaço" onClose={onClose}>
      <form
        className="stack-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await onSave({
              ...state.profile,
              name: name.trim(),
              bio: bio.trim(),
            });
            onClose();
          } catch (e) {
            onError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Seu nome
          <input
            value={name}
            required
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Sobre você e seus pronomes
          <textarea
            value={bio}
            maxLength={250}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>
        <button className="button primary" disabled={busy || !name.trim()}>
          Salvar perfil
        </button>
        <div className="settings-section">
          <h3>Seu espaço, suas escolhas</h3>
          <p className="muted">
            O guarda-roupa e o calendário são privados. Looks e stories
            publicados são visíveis na comunidade. Bloqueie contas ou denuncie
            conteúdos pelo perfil e pelos looks.
          </p>
          {state.blocked.map((id) => (
            <button
              type="button"
              className="text-button"
              key={id}
              onClick={() => onUnblock(id)}
            >
              Desbloquear {people.find((p) => p.id === id)?.name || id}
            </button>
          ))}
          <p className="notice">
            {cloud.connected
              ? "Sua conta usa armazenamento seguro no Supabase."
              : "Modo demonstrativo: as alterações ficam neste navegador. As pessoas e os looks iniciais são exemplos."}
          </p>
        </div>
        {cloud.connected && (
          <button
            type="button"
            className="button secondary"
            onClick={async () => {
              await cloud.supabase!.auth.signOut();
              location.reload();
            }}
          >
            <LogOut size={16} /> Sair da conta
          </button>
        )}
        {cloud.connected && (
          <div className="settings-section">
            <button
              type="button"
              className="text-button danger"
              onClick={() => setDeleting(!deleting)}
            >
              Excluir minha conta
            </button>
            {deleting && (
              <>
                <p className="muted small-text">
                  Apagar conta, fotos, looks e guarda-roupa permanentemente e
                  encerrar a assinatura web. Cobranças passadas não são
                  estornadas automaticamente. Digite EXCLUIR para confirmar.
                </p>
                <input
                  aria-label="Confirmar exclusão"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="EXCLUIR"
                />
                <button
                  type="button"
                  className="button primary full"
                  disabled={confirmation !== "EXCLUIR" || busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await cloud.api("account-delete", { confirmation });
                      await cloud.supabase!.auth.signOut();
                      location.reload();
                    } catch (e) {
                      onError((e as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Excluir conta e encerrar assinatura
                </button>
              </>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
