import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
const PieChart = Platform.OS === 'web' ? null : require('react-native-chart-kit').PieChart;

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useFadeIn } from '@/hooks/use-fade-in';
import { useFontScale } from '@/hooks/use-font-scale';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getEntries, type JournalEntry, type Mood } from '@/lib/journal-storage';

const MOOD_COLORS: Record<Mood, string> = {
  happy: '#999999',
  sad: '#888888',
  neutral: '#B0B0B0',
  anxious: '#777777',
  excited: '#666666',
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split('-').map((part) => Number(part));
  if (!year || !month || !day) {
    return new Date();
  }
  return new Date(year, month - 1, day);
};

const countWords = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
};

const computeStreaks = (entries: JournalEntry[]) => {
  const entryDays = new Set(entries.map((entry) => formatDateKey(new Date(entry.date))));
  const today = new Date();
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  let currentStreak = 0;
  while (entryDays.has(formatDateKey(currentDate))) {
    currentStreak += 1;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  const sortedDays = Array.from(entryDays)
    .map((key) => parseDateKey(key))
    .sort((a, b) => a.getTime() - b.getTime());

  let longestStreak = 0;
  let activeStreak = 0;
  let prevDate: Date | null = null;

  sortedDays.forEach((date) => {
    if (!prevDate) {
      activeStreak = 1;
      longestStreak = Math.max(longestStreak, activeStreak);
      prevDate = date;
      return;
    }

    const diff = Math.floor((date.getTime() - prevDate.getTime()) / 86400000);
    if (diff === 1) {
      activeStreak += 1;
    } else if (diff > 1) {
      activeStreak = 1;
    }
    longestStreak = Math.max(longestStreak, activeStreak);
    prevDate = date;
  });

  return { currentStreak, longestStreak };
};

export default function StatsScreen() {
  const { width } = useWindowDimensions();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [displayEntries, setDisplayEntries] = useState(0);
  const [displayWords, setDisplayWords] = useState(0);
  const [displayCurrentStreak, setDisplayCurrentStreak] = useState(0);
  const [displayLongestStreak, setDisplayLongestStreak] = useState(0);
  const chartOpacity = useRef(new Animated.Value(0)).current;
  const fadeIn = useFadeIn();
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const fontScale = useFontScale();
  const triggerHaptic = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // no-op
    }
  }, []);
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const stored = await getEntries();
      setEntries(stored);
    } catch (error) {
      setLoadError('Unable to load statistics right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const totalWords = entries.reduce((sum, entry) => sum + countWords(entry.content), 0);
    const moodCounts: Record<Mood, number> = {
      happy: 0,
      sad: 0,
      neutral: 0,
      anxious: 0,
      excited: 0,
    };
    entries.forEach((entry) => {
      moodCounts[entry.mood] += 1;
    });

    const { currentStreak, longestStreak } = computeStreaks(entries);
    return { totalEntries, totalWords, moodCounts, currentStreak, longestStreak };
  }, [entries]);

  useEffect(() => {
    const animateValue = (target: number, setter: (value: number) => void) => {
      const duration = 650;
      const start = performance.now();
      const from = 0;

      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(from + (target - from) * eased);
        setter(value);
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    };

    animateValue(stats.totalEntries, setDisplayEntries);
    animateValue(stats.totalWords, setDisplayWords);
    animateValue(stats.currentStreak, setDisplayCurrentStreak);
    animateValue(stats.longestStreak, setDisplayLongestStreak);
  }, [stats]);

  useEffect(() => {
    chartOpacity.setValue(0);
    Animated.timing(chartOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [chartOpacity, stats]);

  const isWeb = Platform.OS === 'web' || !PieChart;
  const chartWidth = Math.min(520, Math.max(280, width - 64));
  const cardWidth = width < 420 ? '100%' : '48%';
  const positiveColor = '#666666';
  const neutralColor = '#666666';
  const colorWithAlpha = (hex: string, alpha: number) => {
    const value = hex.replace('#', '');
    const r = parseInt(value.substring(0, 2), 16);
    const g = parseInt(value.substring(2, 4), 16);
    const b = parseInt(value.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  const pieData = (Object.keys(stats.moodCounts) as Mood[])
    .map((mood) => ({
      name: mood[0].toUpperCase() + mood.slice(1),
      count: stats.moodCounts[mood],
      color:
        selectedMood && selectedMood !== mood
          ? colorWithAlpha(MOOD_COLORS[mood], 0.25)
          : MOOD_COLORS[mood],
      legendFontColor: textColor,
      legendFontSize: 12 * fontScale,
    }))
    .filter((item) => item.count > 0);

  const insights = useMemo(() => {
    if (entries.length === 0) {
      return ['Start writing to see your personal insights appear here.'];
    }
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = Array(7).fill(0);
    entries.forEach((entry) => {
      const d = new Date(entry.date);
      dayCounts[d.getDay()] += 1;
    });
    const maxDayIndex = dayCounts.indexOf(Math.max(...dayCounts));

    const moodCounts = stats.moodCounts;
    let dominantMood: Mood | null = null;
    let maxMoodCount = 0;
    (Object.keys(moodCounts) as Mood[]).forEach((mood) => {
      if (moodCounts[mood] > maxMoodCount) {
        maxMoodCount = moodCounts[mood];
        dominantMood = mood;
      }
    });

    const avgWords =
      stats.totalEntries === 0 ? 0 : Math.round(stats.totalWords / stats.totalEntries);

    const lines: string[] = [];
    lines.push(`You write most on ${dayNames[maxDayIndex]}s.`);
    if (dominantMood) {
      const moodLabel = dominantMood[0].toUpperCase() + dominantMood.slice(1);
      lines.push(`Most of your entries feel ${moodLabel}.`);
    }
    lines.push(`On average, you write about ${avgWords} words per entry.`);
    if (stats.currentStreak >= 3) {
      lines.push(`You're currently on a ${stats.currentStreak}-day streak. Keep it going!`);
    } else if (stats.longestStreak >= 3) {
      lines.push(`Your longest streak so far is ${stats.longestStreak} days. You can beat it!`);
    }
    return lines;
  }, [entries, stats]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeIn.opacity }]}>
        <ThemedView style={styles.titleRow}>
          <IconSymbol size={28} name="chart.bar.fill" color="#000000" />
          <ThemedText type="title">Statistics</ThemedText>
        </ThemedView>
        <ThemedText style={styles.subtitle}>Your journaling insights at a glance.</ThemedText>

        {isLoading ? (
          <ThemedView style={styles.centeredState}>
            <ActivityIndicator color={tintColor} />
          </ThemedView>
        ) : loadError ? (
          <ThemedView style={styles.centeredState}>
            <ThemedText style={styles.errorText}>{loadError}</ThemedText>
          </ThemedView>
        ) : (
          <>
            <ThemedView style={styles.cardsRow}>
              <ThemedView
                style={[
                  styles.statCard,
                  styles.cardShadow,
                  { width: cardWidth, backgroundColor: cardColor, borderColor },
                ]}>
                <ThemedView style={styles.statHeader}>
                  <ThemedView style={[styles.statIcon, { backgroundColor: '#F0F0F0' }]}>
                    <IconSymbol size={18} name="square.and.pencil" color="#666666" />
                  </ThemedView>
                  <ThemedText type="subtitle" style={styles.statLabel}>
                    Entries
                  </ThemedText>
                </ThemedView>
                <ThemedText style={styles.statValue}>{displayEntries}</ThemedText>
              </ThemedView>
              <ThemedView
                style={[
                  styles.statCard,
                  styles.cardShadow,
                  { width: cardWidth, backgroundColor: cardColor, borderColor },
                ]}>
                <ThemedView style={styles.statHeader}>
                  <ThemedView style={[styles.statIcon, { backgroundColor: '#F0F0F0' }]}>
                    <IconSymbol size={18} name="paperplane.fill" color="#666666" />
                  </ThemedView>
                  <ThemedText type="subtitle" style={styles.statLabel}>
                    Words
                  </ThemedText>
                </ThemedView>
                <ThemedText style={styles.statValue}>{displayWords}</ThemedText>
              </ThemedView>
              <ThemedView
                style={[
                  styles.statCard,
                  styles.cardShadow,
                  { width: cardWidth, backgroundColor: cardColor, borderColor },
                ]}>
                <ThemedView style={styles.statHeader}>
                  <ThemedView style={[styles.statIcon, { backgroundColor: '#F0F0F0' }]}>
                    <IconSymbol size={18} name="clock.fill" color="#666666" />
                  </ThemedView>
                  <ThemedText type="subtitle" style={styles.statLabel}>
                    Current Streak
                  </ThemedText>
                </ThemedView>
                <ThemedText style={styles.statValue}>{displayCurrentStreak} days</ThemedText>
              </ThemedView>
              <ThemedView
                style={[
                  styles.statCard,
                  styles.cardShadow,
                  { width: cardWidth, backgroundColor: cardColor, borderColor },
                ]}>
                <ThemedView style={styles.statHeader}>
                  <ThemedView style={[styles.statIcon, { backgroundColor: '#F0F0F0' }]}>
                    <IconSymbol size={18} name="star.fill" color="#666666" />
                  </ThemedView>
                  <ThemedText type="subtitle" style={styles.statLabel}>
                    Longest Streak
                  </ThemedText>
                </ThemedView>
                <ThemedText style={styles.statValue}>{displayLongestStreak} days</ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView
              style={[
                styles.chartCard,
                styles.cardShadow,
                { backgroundColor: cardColor, borderColor },
              ]}>
              <ThemedText type="subtitle">Mood Distribution</ThemedText>
              {pieData.length === 0 ? (
                <ThemedText style={styles.emptyText}>Add entries to see mood trends.</ThemedText>
              ) : isWeb ? (
                <View style={styles.legendRow}>
                  {pieData.map((item) => (
                    <Pressable
                      key={item.name}
                      style={({ pressed }) => [styles.legendItem, pressed && styles.pressablePressed]}
                      onPress={async () => {
                        await triggerHaptic();
                        setSelectedMood((prev) =>
                          prev === (item.name.toLowerCase() as Mood) ? null : (item.name.toLowerCase() as Mood)
                        );
                      }}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <ThemedText>{`${Math.round(
                        (item.count / stats.totalEntries) * 100
                      )}% ${item.name}`}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <>
                  <Animated.View style={[styles.chartWrapper, { opacity: chartOpacity }]}>
                    <View style={styles.donutContainer}>
                      <PieChart
                        data={pieData.map((item) => ({
                          name: item.name,
                          population: item.count,
                          color: item.color,
                          legendFontColor: item.legendFontColor,
                          legendFontSize: item.legendFontSize,
                        }))}
                        width={chartWidth}
                        height={220}
                        accessor="population"
                        chartConfig={{
                          color: () => textColor,
                          labelColor: () => textColor,
                          propsForLabels: {
                            fontSize: 12 * fontScale,
                          },
                          backgroundGradientFrom: 'transparent',
                          backgroundGradientTo: 'transparent',
                        }}
                        paddingLeft="0"
                        hasLegend={false}
                        avoidFalseZero
                      />
                      <View style={[styles.donutCenter, { backgroundColor }]} />
                    </View>
                  </Animated.View>
                  <View style={styles.legendRow}>
                    {pieData.map((item) => (
                      <Pressable
                        key={item.name}
                        style={({ pressed }) => [styles.legendItem, pressed && styles.pressablePressed]}
                        onPress={async () => {
                          await triggerHaptic();
                          setSelectedMood((prev) =>
                            prev === (item.name.toLowerCase() as Mood) ? null : (item.name.toLowerCase() as Mood)
                          );
                        }}>
                        <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                        <ThemedText>{`${Math.round(
                          (item.count / stats.totalEntries) * 100
                        )}% ${item.name}`}</ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
            </ThemedView>

            <ThemedView
              style={[
                styles.chartCard,
                styles.cardShadow,
                { backgroundColor: cardColor, borderColor },
              ]}>
              <ThemedText type="subtitle">Insights</ThemedText>
              {insights.map((line, index) => (
                <ThemedText key={index} style={styles.insightText}>
                  • {line}
                </ThemedText>
              ))}
            </ThemedView>
          </>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  content: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    gap: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtitle: {
    color: '#666666',
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    minWidth: 150,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    flexGrow: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    color: '#000000',
    fontWeight: '700',
  },
  statLabel: {
    color: '#666666',
  },
  chartCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  donutContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutCenter: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  pressablePressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyText: {
    color: '#666666',
  },
  centeredState: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
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
  insightText: {
    marginTop: 4,
    color: '#666666',
  },
});
