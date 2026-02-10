import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

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

  useEffect(() => {
    if (Constants.appOwnership === 'expo') {
      return;
    }
    const registerHandler = async () => {
      const notifications = await import('expo-notifications');
      notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
    };
    registerHandler();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          {storedPin && !isUnlocked ? (
            <PinLock pin={storedPin} onUnlock={() => setIsUnlocked(true)} />
          ) : (
            <Stack screenOptions={{ animation: 'fade' }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="entry/[id]" options={{ title: 'Entry' }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
          )}
        </SafeAreaView>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
