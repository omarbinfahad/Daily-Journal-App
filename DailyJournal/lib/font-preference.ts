import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontSizePreference = 'small' | 'medium' | 'large';

const FONT_KEY = 'dailyjournal.font-preference';
let cachedPreference: FontSizePreference = 'medium';
let hasLoaded = false;
const listeners = new Set<(preference: FontSizePreference) => void>();

export async function getFontPreference(): Promise<FontSizePreference> {
  if (hasLoaded) {
    return cachedPreference;
  }

  const stored = await AsyncStorage.getItem(FONT_KEY);
  const normalized = normalizePreference(stored);
  cachedPreference = normalized;
  hasLoaded = true;
  return normalized;
}

export async function setFontPreference(preference: FontSizePreference): Promise<void> {
  cachedPreference = preference;
  hasLoaded = true;
  await AsyncStorage.setItem(FONT_KEY, preference);
  listeners.forEach((listener) => listener(preference));
}

export function subscribeFontPreference(
  listener: (preference: FontSizePreference) => void
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function normalizePreference(value: string | null): FontSizePreference {
  switch (value) {
    case 'small':
    case 'medium':
    case 'large':
      return value;
    default:
      return 'medium';
  }
}
