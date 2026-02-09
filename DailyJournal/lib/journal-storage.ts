import AsyncStorage from '@react-native-async-storage/async-storage';

export type Mood = 'happy' | 'sad' | 'neutral' | 'anxious' | 'excited';

export type JournalEntry = {
  id: string;
  date: string;
  prompt: string;
  content: string;
  mood: Mood;
  photoUri?: string | null;
  tags?: string[];
  favorite?: boolean;
};

const STORAGE_KEY = 'dailyjournal.entries';

export async function getEntries(): Promise<JournalEntry[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as Partial<JournalEntry>[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((entry) => entry && typeof entry === 'object')
      .map((entry) => ({
        id: entry.id ?? `${Date.now()}`,
        date: entry.date ?? new Date().toISOString(),
        prompt: entry.prompt ?? '',
        content: entry.content ?? '',
        mood: normalizeMood(entry.mood),
        photoUri: typeof entry.photoUri === 'string' ? entry.photoUri : null,
        tags: Array.isArray(entry.tags) ? entry.tags.filter((tag) => typeof tag === 'string') : [],
        favorite: Boolean(entry.favorite),
      }));
  } catch {
    return [];
  }
}

export async function saveEntry(entry: JournalEntry): Promise<JournalEntry[]> {
  const entries = await getEntries();
  const updated = [entry, ...entries.filter((item) => item.id !== entry.id)];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export async function clearEntries(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function getEntryById(id: string): Promise<JournalEntry | null> {
  const entries = await getEntries();
  return entries.find((entry) => entry.id === id) ?? null;
}

function normalizeMood(mood: unknown): Mood {
  switch (mood) {
    case 'happy':
    case 'sad':
    case 'neutral':
    case 'anxious':
    case 'excited':
      return mood;
    default:
      return 'neutral';
  }
}
