import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'light' | 'dark' | 'system';

const THEME_KEY = 'dailyjournal.theme-preference';
let cachedPreference: ThemePreference = 'system';
let hasLoaded = false;
const listeners = new Set<(preference: ThemePreference) => void>();

export async function getThemePreference(): Promise<ThemePreference> {
  if (hasLoaded) {
    return cachedPreference;
  }

  const stored = await AsyncStorage.getItem(THEME_KEY);
  const normalized = normalizePreference(stored);
  cachedPreference = normalized;
  hasLoaded = true;
  return normalized;
}

export async function setThemePreference(preference: ThemePreference): Promise<void> {
  cachedPreference = preference;
  hasLoaded = true;
  await AsyncStorage.setItem(THEME_KEY, preference);
  listeners.forEach((listener) => listener(preference));
}

export function subscribeThemePreference(
  listener: (preference: ThemePreference) => void
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function normalizePreference(value: string | null): ThemePreference {
  switch (value) {
    case 'light':
    case 'dark':
    case 'system':
      return value;
    default:
      return 'system';
  }
}
