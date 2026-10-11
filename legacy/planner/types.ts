
export type View = 'dashboard' | 'calendar' | 'registry' | 'vision-board' | 'journal';

export interface Outfit {
  id: string;
  image: string;
  name: string;
  category: 'casual' | 'formal' | 'work' | 'sport';
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
  type: 'appointment' | 'social' | 'deadline' | 'self-care';
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: 'happy' | 'calm' | 'productive' | 'tired' | 'inspired';
}
