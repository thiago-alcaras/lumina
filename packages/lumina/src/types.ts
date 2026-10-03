export type View =
  "dashboard" | "calendar" | "registry" | "vision-board" | "journal";
export type Mood = "happy" | "calm" | "productive" | "tired" | "inspired";
export interface Outfit {
  id: string;
  image: string;
  name: string;
  category: "casual" | "formal" | "work" | "sport";
  dateAdded: string;
}
export interface VisionItem {
  id: string;
  imageUrl: string;
  prompt: string;
  category: string;
}
export interface Event {
  id: string;
  title: string;
  date: string;
  type: "appointment" | "social" | "deadline" | "self-care";
}
export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: Mood;
  period?: "morning" | "evening";
}
export interface MoodEntry {
  date: string;
  mood: Mood;
}
export interface PlannerData {
  outfits: Outfit[];
  vision: VisionItem[];
  events: Event[];
  journal: JournalEntry[];
  moods: MoodEntry[];
}
