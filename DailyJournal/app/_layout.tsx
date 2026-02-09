import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';

import PinLock from '@/components/pin-lock';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getPin } from '@/lib/pin-storage';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadPin = async () => {
      const pin = await getPin();
      setStoredPin(pin);
      setIsUnlocked(!pin);
      setIsReady(true);
    };

    loadPin();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {storedPin && !isUnlocked ? (
        <PinLock pin={storedPin} onUnlock={() => setIsUnlocked(true)} />
      ) : (
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="entry/[id]" options={{ title: 'Entry' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
