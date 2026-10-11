import { uid } from "./storage";
import { createClient } from "@supabase/supabase-js";
import type {
  State,
  Post,
  Person,
  Piece,
  Story,
  Detection,
  Comment,
  DayLook,
} from "./types";
const env = import.meta.env;
export const supabase =
  env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY
    ? createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
        auth: { flowType: "pkce", detectSessionInUrl: true },
      })
    : null;
const API = env.VITE_API_URL || "";
export const connected = !!supabase;
export function unwrap<T>(result: { data: T; error: any }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
export function person(row: any): Person {
  return {
    id: row.id,
    name: row.name,
    handle: row.handle,
    avatar: row.avatar || "/icon.svg",
    bio: row.bio,
  };
}
export function post(row: any): Post {
  return {
    id: row.id,
    author: person(row.author),
    title: row.title,
    description: row.description,
    image: row.image,
    mood: row.mood,
    pieces: row.pieces || [],
    likes: row.like_count || 0,
    createdAt: row.created_at,
  };
}
export async function api(path: string, body?: unknown) {
  const session = unwrap(await supabase!.auth.getSession()).session;
  if (!session) throw new Error("Entre na sua conta para continuar.");
  const response = await fetch(API + "/api/" + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + session.access_token,
    },
    body: JSON.stringify(body || {}),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Não foi possível concluir.");
  return result;
}
export async function loadPage(
  offset = 0,
  following = false,
  mood = "",
  search = "",
): Promise<Post[]> {
  const rows = unwrap(
    await supabase!.rpc("feed_page", {
      page_offset: offset,
      following_only: following,
      mood_filter: mood,
      search_text: search,
    }),
  );
  return (rows || []).map(post);
}
export async function signedImage(path: string) {
  return unwrap(
    await supabase!.storage.from("wardrobe").createSignedUrl(path, 3600),
  ).signedUrl;
}
export async function loadAccount(): Promise<State> {
  const user = unwrap(await supabase!.auth.getUser()).user!;
  const id = user.id;
  const results = await Promise.all([
    supabase!.from("profiles").select("*").eq("id", id).single(),
    supabase!.from("wardrobe").select("*").eq("owner_id", id),
    supabase!.from("likes").select("post_id").eq("user_id", id),
    supabase!
      .from("saved")
      .select("post_id, posts(*, author:profiles!posts_owner_id_fkey(*))")
      .eq("user_id", id),
    supabase!.from("follows").select("following_id").eq("follower_id", id),
    supabase!.from("blocks").select("blocked_id").eq("user_id", id),
    supabase!.from("calendar").select("*").eq("owner_id", id),
    supabase!.from("interests").select("*").eq("user_id", id),
    supabase!
      .from("stories")
      .select("*, author:profiles!stories_owner_id_fkey(*)")
      .gt("expires_at", new Date().toISOString()),
  ]);
  const [
    profile,
    wardrobe,
    likes,
    saved,
    follows,
    blocks,
    calendar,
    interests,
    stories,
  ] = results.map(unwrap);
  const first = await loadPage();
  const own = unwrap(
    await supabase!
      .from("posts")
      .select("*, author:profiles!posts_owner_id_fkey(*)")
      .eq("owner_id", id)
      .order("created_at", { ascending: false })
      .limit(100),
  ).map(post);
  const extra = (saved as any[])
    .map((s) => (s.posts ? post(s.posts) : null))
    .filter(Boolean) as Post[];
  const posts = Array.from(
    new Map([...first, ...own, ...extra].map((p) => [p.id, p])).values(),
  );
  return {
    profile: person(profile),
    posts,
    wardrobe: await Promise.all(
      (wardrobe as any[]).map(async (p) => ({
        ...p,
        image: await signedImage(p.image_path),
      })),
    ),
    likes: likes.map((r: any) => r.post_id),
    saved: saved.map((r: any) => r.post_id),
    follows: follows.map((r: any) => r.following_id),
    blocked: blocks.map((r: any) => r.blocked_id),
    calendar: calendar.map((r: any) => ({
      date: r.date,
      postId: r.post_id,
      mood: r.mood,
      note: r.note,
    })),
    interests: Object.fromEntries(interests.map((r: any) => [r.mood, r.score])),
    stories: stories.map((r: any) => ({
      id: r.id,
      author: person(r.author),
      image: r.image,
      title: r.title,
      expiresAt: r.expires_at,
    })),
    comments: [],
  };
}
export async function upload(image: string, bucket = "looks") {
  const blob = await (await fetch(image)).blob();
  const user = unwrap(await supabase!.auth.getUser()).user!;
  const path = user.id + "/" + uid() + ".jpg";
  unwrap(
    await supabase!.storage
      .from(bucket)
      .upload(path, blob, { contentType: "image/jpeg", upsert: false }),
  );
  return {
    path,
    url:
      bucket === "looks"
        ? supabase!.storage.from(bucket).getPublicUrl(path).data.publicUrl
        : await signedImage(path),
  };
}
export async function addPieces(pieces: Piece[]) {
  const user = unwrap(await supabase!.auth.getUser()).user!;
  const result: Piece[] = [];
  for (const p of pieces) {
    const existing = unwrap(
      await supabase!
        .from("wardrobe")
        .select("id,image_path")
        .eq("owner_id", user.id)
        .eq("fingerprint", p.fingerprint)
        .maybeSingle(),
    );
    if (existing) {
      result.push({
        ...p,
        id: existing.id,
        image: await signedImage(existing.image_path),
      });
      continue;
    }
    const image = await upload(p.image, "wardrobe");
    try {
      unwrap(
        await supabase!.from("wardrobe").insert({
          id: p.id,
          owner_id: user.id,
          name: p.name,
          category: p.category,
          color: p.color,
          brand: p.brand,
          link: p.link,
          image_path: image.path,
          fingerprint: p.fingerprint,
        }),
      );
      result.push({ ...p, image: image.url });
    } catch (error) {
      await supabase!.storage.from("wardrobe").remove([image.path]);
      throw error;
    }
  }
  return result;
}
export async function publish(p: Post) {
  const image = await upload(p.image);
  const pieces = await Promise.all(
    p.pieces.map(async (item) => ({
      ...item,
      image: (await upload(item.image)).url,
    })),
  );
  try {
    unwrap(
      await supabase!.from("posts").insert({
        id: p.id,
        owner_id: p.author.id,
        title: p.title,
        description: p.description,
        image: image.url,
        mood: p.mood,
        pieces,
      }),
    );
    return { ...p, image: image.url, pieces };
  } catch (error) {
    await supabase!.storage.from("looks").remove([image.path]);
    throw error;
  }
}
export async function publishStory(s: Story) {
  const image = await upload(s.image);
  unwrap(
    await supabase!.from("stories").insert({
      id: s.id,
      owner_id: s.author.id,
      image: image.url,
      title: s.title,
      expires_at: s.expiresAt,
    }),
  );
  return { ...s, image: image.url };
}
export async function toggleRelation(
  table: "likes" | "saved" | "follows" | "blocks",
  target: string,
  enabled: boolean,
) {
  const user = unwrap(await supabase!.auth.getUser()).user!;
  const key =
    table === "follows"
      ? "following_id"
      : table === "blocks"
        ? "blocked_id"
        : "post_id";
  const owner = table === "follows" ? "follower_id" : "user_id";
  unwrap(
    enabled
      ? await supabase!
          .from(table)
          .insert({ [owner]: user.id, [key]: target } as any)
      : await supabase!.from(table).delete().eq(owner, user.id).eq(key, target),
  );
}
export async function saveDay(day: DayLook) {
  const user = unwrap(await supabase!.auth.getUser()).user!;
  unwrap(
    await supabase!.from("calendar").upsert(
      {
        owner_id: user.id,
        date: day.date,
        post_id: day.postId,
        mood: day.mood,
        note: day.note,
      },
      { onConflict: "owner_id,date" },
    ),
  );
}
export async function loadComments(postId: string): Promise<Comment[]> {
  return unwrap(
    await supabase!
      .from("comments")
      .select("*, profiles(name)")
      .eq("post_id", postId)
      .order("created_at"),
  ).map((r: any) => ({
    id: r.id,
    postId: r.post_id,
    name: r.profiles.name,
    text: r.text,
  }));
}
export async function addComment(c: Comment) {
  const user = unwrap(await supabase!.auth.getUser()).user!;
  unwrap(
    await supabase!
      .from("comments")
      .insert({ id: c.id, user_id: user.id, post_id: c.postId, text: c.text }),
  );
}
export async function analyze(image: string): Promise<Detection[]> {
  return (await api("vision", { image })).pieces;
}
