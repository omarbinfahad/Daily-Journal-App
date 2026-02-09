import { useFocusEffect } from '@react-navigation/native';
import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PROMPTS } from '@/constants/prompts';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useFadeIn } from '@/hooks/use-fade-in';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getEntries } from '@/lib/journal-storage';
import { getProfile } from '@/lib/profile-storage';

export default function HomeScreen() {
  const [now, setNow] = useState(new Date());
  const { width } = useWindowDimensions();
  const [streakCount, setStreakCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [entriesThisWeek, setEntriesThisWeek] = useState(0);
  const [wordsThisWeek, setWordsThisWeek] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const todayLabel = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const dayIndex = Math.floor(
    new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86400000
  );
  const prompt = PROMPTS[dayIndex % PROMPTS.length];

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        setDisplayName(profile.name);
      } catch {
        // no-op
      }
    };
    loadProfile();
  }, []);

  const formatDateKey = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const loadStreak = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
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

      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      weekStart.setDate(weekStart.getDate() - 6);
      let entriesCount = 0;
      let wordCount = 0;
      entries.forEach((entry) => {
        const date = new Date(entry.date);
        const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (day >= weekStart && day <= now) {
          entriesCount += 1;
          const words = entry.content
            .trim()
            .split(/\s+/)
            .filter(Boolean).length;
          wordCount += words;
        }
      });
      setEntriesThisWeek(entriesCount);
      setWordsThisWeek(wordCount);
    } catch (error) {
      setLoadError('Unable to load your streak right now.');
    } finally {
      setIsLoading(false);
    }
  }, [formatDateKey]);

  useFocusEffect(
    useCallback(() => {
      loadStreak();
    }, [loadStreak])
  );

  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, [now]);

  const timeLabel = useMemo(
    () =>
      now.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      }),
    [now]
  );

  const hasName = displayName.trim().length > 0;
  const greetingLine = hasName ? `${greeting}, ${displayName.trim()}` : `${greeting}!`;

  const streakMessage = useMemo(() => {
    if (streakCount === 0) {
      return "Start your streak today. You've got this!";
    }
    if (streakCount === 1) {
      return "You're on a 1-day streak. Keep it going!";
    }
    return `You're on a ${streakCount}-day streak. Keep it going!`;
  }, [streakCount]);

  const horizontalPadding = width < 360 ? 16 : width > 960 ? 32 : 24;
  const fadeIn = useFadeIn();
  const triggerHaptic = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // no-op
    }
  }, []);

  return (
    <ThemedView style={[styles.screen, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingHorizontal: horizontalPadding }]}
        keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.content, { opacity: fadeIn.opacity }]}>
          <ThemedView style={styles.topSection}>
            <ThemedView style={styles.headerRow}>
              <ThemedView style={styles.greetingColumn}>
                <ThemedText style={styles.appName}>
                  Daily Journal
                </ThemedText>
                <ThemedText style={styles.greetingText}>{greetingLine}</ThemedText>
                <ThemedText style={styles.timeText}>{timeLabel}</ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView
              style={[
                styles.streakCard,
                styles.cardShadow,
                { backgroundColor: cardColor, borderColor },
              ]}>
              <ThemedView style={styles.streakHeaderRow}>
                <ThemedText type="subtitle" style={styles.streakLabel}>
                  Current streak
                </ThemedText>
                <ThemedText style={styles.streakBadge}>🔥 Sunrise streak</ThemedText>
              </ThemedView>
              {isLoading ? (
                <ThemedView style={styles.centeredRow}>
                  <ActivityIndicator color="#000000" />
                </ThemedView>
              ) : loadError ? (
                <ThemedText style={styles.errorText}>{loadError}</ThemedText>
              ) : (
                <>
                  <ThemedView style={styles.streakValueRow}>
                    <ThemedText style={styles.streakNumber}>{streakCount}</ThemedText>
                    <ThemedText style={styles.streakUnit}>days</ThemedText>
                  </ThemedView>
                  <ThemedText style={styles.streakMessage}>{streakMessage}</ThemedText>
                </>
              )}
            </ThemedView>
            <ThemedView
              style={[
                styles.card,
                styles.cardShadow,
                { backgroundColor: cardColor, borderColor },
              ]}>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                Today&apos;s prompt
              </ThemedText>
              <ThemedText style={styles.cardDate}>{todayLabel}</ThemedText>
              <ThemedText style={styles.promptText}>{prompt}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statsRow}>
              <ThemedView
                style={[
                  styles.statCard,
                  styles.cardShadow,
                  { backgroundColor: cardColor, borderColor, width: '48%' },
                ]}>
                <ThemedView style={styles.statHeader}>
                  <IconSymbol size={20} name="calendar" color="#666666" />
                  <ThemedText type="defaultSemiBold" style={styles.statLabel}>
                    Entries this week
                  </ThemedText>
                </ThemedView>
                <ThemedText style={styles.statValue}>{entriesThisWeek}</ThemedText>
                <ThemedText style={styles.statHelper}>last 7 days</ThemedText>
              </ThemedView>
              <ThemedView
                style={[
                  styles.statCard,
                  styles.cardShadow,
                  { backgroundColor: cardColor, borderColor, width: '48%' },
                ]}>
                <ThemedView style={styles.statHeader}>
                  <IconSymbol size={20} name="doc.text" color="#666666" />
                  <ThemedText type="defaultSemiBold" style={styles.statLabel}>
                    Words written
                  </ThemedText>
                </ThemedView>
                <ThemedText style={styles.statValue}>{wordsThisWeek}</ThemedText>
                <ThemedText style={styles.statHelper}>this week</ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView style={styles.illustrationRow}>
              <ThemedText style={styles.illustrationEmoji}>📖</ThemedText>
              <ThemedText style={styles.illustrationText}>
                A quiet place to capture the little moments that matter.
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.actionRow}>
            <Link href="/(tabs)/write-entry" asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  styles.cardShadow,
                  { backgroundColor: '#000000' },
                  pressed && styles.buttonPressed,
                ]}
                onPress={triggerHaptic}>
                <IconSymbol size={20} name="square.and.pencil" color="#FFFFFF" />
                <ThemedText type="defaultSemiBold" style={styles.primaryButtonText}>
                  Start Writing
                </ThemedText>
              </Pressable>
            </Link>
          </ThemedView>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    gap: 16,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    gap: 24,
  },
  actionRow: {
    marginTop: 16,
  },
  subtitle: {
    opacity: 0.8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
  },
  greetingColumn: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
  },
  appName: {
    color: '#000000',
    fontSize: 28,
    fontWeight: '700',
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
  },
  timeText: {
    color: '#999999',
    fontSize: 14,
  },
  dateText: {
    color: '#A0A0A0',
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  streakCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  streakHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  streakLabel: {
    color: '#666666',
  },
  streakBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F0F0F0',
    color: '#666666',
    fontSize: 12,
  },
  streakValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#000000',
  },
  streakUnit: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 6,
  },
  streakCount: {
    fontSize: 28,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakIcon: {
    fontSize: 22,
  },
  streakMessage: {
    opacity: 1,
    color: '#666666',
    marginTop: 4,
  },
  centeredRow: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  errorText: {
    color: '#d14343',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardTitle: {
    color: '#000000',
    marginBottom: 4,
  },
  cardDate: {
    color: '#666666',
    marginBottom: 8,
  },
  promptText: {
    color: '#000000',
    fontSize: 16,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    color: '#666666',
    fontSize: 13,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  statHelper: {
    color: '#666666',
    fontSize: 13,
  },
  illustrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  illustrationEmoji: {
    fontSize: 24,
  },
  illustrationText: {
    color: '#666666',
    flex: 1,
  },
});
