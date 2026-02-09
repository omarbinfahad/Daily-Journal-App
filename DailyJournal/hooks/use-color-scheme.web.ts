import { useEffect, useMemo, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { getThemePreference, subscribeThemePreference, type ThemePreference } from '@/lib/theme-preference';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [preference, setPreference] = useState<ThemePreference>('system');
  const systemScheme = useRNColorScheme();

  useEffect(() => {
    let isActive = true;
    const loadPreference = async () => {
      const stored = await getThemePreference();
      if (isActive) {
        setPreference(stored);
      }
    };

    loadPreference();
    const unsubscribe = subscribeThemePreference((nextPreference) => {
      if (isActive) {
        setPreference(nextPreference);
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    setHasHydrated(true);
  }, []);
  const resolved = useMemo(() => {
    if (preference === 'system') {
      return systemScheme ?? 'light';
    }
    return preference;
  }, [preference, systemScheme]);

  if (!hasHydrated) {
    return 'light';
  }

  return resolved;
}
