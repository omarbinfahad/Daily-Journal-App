import { useFocusEffect } from '@react-navigation/native';
import { Link } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PROMPTS } from '@/constants/prompts';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getEntries } from '@/lib/journal-storage';

export default function HomeScreen() {
  const today = new Date();
  const [streakCount, setStreakCount] = useState(0);
  const tintColor = useThemeColor({}, 'tint');
  const todayLabel = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const dayIndex = Math.floor(
    new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 86400000
  );
  const prompt = PROMPTS[dayIndex % PROMPTS.length];

  const formatDateKey = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const loadStreak = useCallback(async () => {
    const entries = await getEntries();
    const entryDays = new Set(entries.map((entry) => formatDateKey(new Date(entry.date))));
    const now = new Date();
    const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let streak = 0;

    while (entryDays.has(formatDateKey(current))) {
      streak += 1;
      current.setDate(current.getDate() - 1);
    }

    setStreakCount(streak);
  }, [formatDateKey]);

  useFocusEffect(
    useCallback(() => {
      loadStreak();
    }, [loadStreak])
  );

  const streakMessage = useMemo(() => {
    if (streakCount === 0) {
      return "Start your streak today. You've got this!";
    }
    if (streakCount === 1) {
      return "You're on a 1-day streak. Keep it going!";
    }
    return `You're on a ${streakCount}-day streak. Keep it going!`;
  }, [streakCount]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Daily Journal</ThemedText>
      <ThemedText style={styles.subtitle}>{todayLabel}</ThemedText>
      <ThemedView style={styles.streakCard}>
        <ThemedText type="subtitle">Streak</ThemedText>
        <ThemedText style={styles.streakCount}>{streakCount} days</ThemedText>
        <ThemedText style={styles.streakMessage}>{streakMessage}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Daily Prompt</ThemedText>
        <ThemedText>{prompt}</ThemedText>
      </ThemedView>
      <Link href="/(tabs)/write-entry" asChild>
        <Pressable style={[styles.primaryButton, { backgroundColor: tintColor }]}>
          <ThemedText type="defaultSemiBold" style={styles.primaryButtonText}>
            Write Entry
          </ThemedText>
        </Pressable>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  subtitle: {
    opacity: 0.8,
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.2)',
    gap: 8,
  },
  streakCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.2)',
    gap: 6,
  },
  streakCount: {
    fontSize: 28,
  },
  streakMessage: {
    opacity: 0.8,
  },
});
