import { useEffect, useMemo, useState } from 'react';

import {
  getFontPreference,
  subscribeFontPreference,
  type FontSizePreference,
} from '@/lib/font-preference';

const SCALE_MAP: Record<FontSizePreference, number> = {
  small: 0.92,
  medium: 1,
  large: 1.12,
};

export function useFontScale() {
  const [preference, setPreference] = useState<FontSizePreference>('medium');
  const scale = useMemo(() => SCALE_MAP[preference], [preference]);

  useEffect(() => {
    let isActive = true;

    const loadPreference = async () => {
      const stored = await getFontPreference();
      if (isActive) {
        setPreference(stored);
      }
    };

    loadPreference();
    const unsubscribe = subscribeFontPreference((nextPreference) => {
      if (isActive) {
        setPreference(nextPreference);
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  return scale;
}
