export type Mood = "Cozy" | "Romântico" | "Minimalista" | "Criativo" | "Ousado";
export type Page =
  "feed" | "wardrobe" | "calendar" | "saved" | "moods" | "profile";
export interface Person {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio?: string;
}
export interface Piece {
  id: string;
  name: string;
  category: string;
  color: string;
  brand: string;
  link: string;
  image: string;
  fingerprint?: string;
}
export interface Post {
  id: string;
  author: Person;
  title: string;
  description: string;
  image: string;
  mood: Mood;
  pieces: Piece[];
  likes: number;
  createdAt: string;
}
export interface Story {
  id: string;
  author: Person;
  image: string;
  title: string;
  expiresAt: string;
}
export interface Comment {
  id: string;
  postId: string;
  name: string;
  text: string;
}
export interface DayLook {
  date: string;
  postId: string;
  mood: string;
  note: string;
}
export interface State {
  posts: Post[];
  wardrobe: Piece[];
  stories: Story[];
  likes: string[];
  saved: string[];
  follows: string[];
  blocked: string[];
  comments: Comment[];
  calendar: DayLook[];
  interests: Record<string, number>;
  profile: Person;
}
export interface Detection {
  name: string;
  category: string;
  color: string;
  brand: string;
  bbox: number[];
  existingId: string | null;
  confidence: number;
}
