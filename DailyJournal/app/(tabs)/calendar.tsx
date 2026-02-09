import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useFadeIn } from '@/hooks/use-fade-in';
import { useFontScale } from '@/hooks/use-font-scale';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getEntries, type JournalEntry, type Mood } from '@/lib/journal-storage';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MOOD_LABELS: Array<{ mood: Mood; label: string }> = [
  { mood: 'happy', label: 'Happy' },
  { mood: 'sad', label: 'Sad' },
  { mood: 'neutral', label: 'Neutral' },
  { mood: 'anxious', label: 'Anxious' },
  { mood: 'excited', label: 'Excited' },
];

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildMonthMatrix = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const startWeekday = start.getDay();
  const totalDays = end.getDate();
  const slots: Array<{ date: Date | null; key: string }> = [];

  for (let i = 0; i < startWeekday; i += 1) {
    slots.push({ date: null, key: `empty-${year}-${month}-${i}` });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const entryDate = new Date(year, month, day);
    slots.push({ date: entryDate, key: formatDateKey(entryDate) });
  }

  const remainder = slots.length % 7;
  if (remainder !== 0) {
    const fill = 7 - remainder;
    for (let i = 0; i < fill; i += 1) {
      slots.push({ date: null, key: `tail-${year}-${month}-${i}` });
    }
  }

  return slots;
};

export default function CalendarScreen() {
  const { width } = useWindowDimensions();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const fontScale = useFontScale();
  const fadeIn = useFadeIn();
  const monthAnim = useState(() => new Animated.Value(0))[0];
  const triggerHaptic = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // no-op
    }
  }, []);

  const moodColors: Record<Mood, string> = useMemo(
    () => ({
      happy: '#999999',
      sad: '#888888',
      neutral: '#B0B0B0',
      anxious: '#777777',
      excited: '#666666',
    }),
    []
  );

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const storedEntries = await getEntries();
      setEntries(storedEntries);
    } catch (error) {
      setLoadError('Unable to load calendar entries.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const entriesByDay = useMemo(() => {
    const map = new Map<string, JournalEntry>();
    entries.forEach((entry) => {
      const key = formatDateKey(new Date(entry.date));
      if (!map.has(key)) {
        map.set(key, entry);
      }
    });
    return map;
  }, [entries]);

  const monthSlots = useMemo(() => buildMonthMatrix(monthCursor), [monthCursor]);
  const monthLabel = monthCursor.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const horizontalPadding = 20;
  const gridGap = 8;
  const availableWidth = width - horizontalPadding * 2;
  const rawCell = (availableWidth - gridGap * 6) / 7;
  const cellSize = Math.max(44, Math.min(64, Math.floor(rawCell)));
  const gridWidth = cellSize * 7 + gridGap * 6;

  const hasEntries = entries.length > 0;

  const monthStats = useMemo(() => {
    const start = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const end = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
    const inMonth = entries.filter((entry) => {
      const d = new Date(entry.date);
      return d >= start && d <= end;
    });
    const total = inMonth.length;
    const moodCounts: Partial<Record<Mood, number>> = {};
    inMonth.forEach((entry) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] ?? 0) + 1;
    });
    let mostCommonMood: Mood | null = null;
    let max = 0;
    (Object.keys(moodCounts) as Mood[]).forEach((mood) => {
      const count = moodCounts[mood] ?? 0;
      if (count > max) {
        max = count;
        mostCommonMood = mood;
      }
    });
    return { total, mostCommonMood };
  }, [entries, monthCursor]);

  const handleChangeMonth = useCallback(
    async (direction: -1 | 1) => {
      await triggerHaptic();
      monthAnim.setValue(0);
      Animated.timing(monthAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
      setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    },
    [monthAnim, triggerHaptic]
  );

  const handleSelectEntry = useCallback(
    async (entry: JournalEntry | null) => {
      if (!entry) return;
      await triggerHaptic();
      setSelectedEntry(entry);
      setIsPreviewVisible(true);
    },
    [triggerHaptic]
  );

  const todayKey = formatDateKey(new Date());

  const streakSet = useMemo(() => {
    const keys = entries
      .map((e) => new Date(e.date))
      .sort((a, b) => a.getTime() - b.getTime())
      .map((d) => formatDateKey(d));
    const set = new Set(keys);
    const streakDays = new Set<string>();
    let currentKey = todayKey;
    while (set.has(currentKey)) {
      streakDays.add(currentKey);
      const [y, m, d] = currentKey.split('-').map((v) => parseInt(v, 10));
      const prev = new Date(y, m - 1, d - 1);
      currentKey = formatDateKey(prev);
    }
    return streakDays;
  }, [entries, todayKey]);

  const animatedTranslateX = monthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [directionGuess(width), 0],
  });

  function directionGuess(screenWidth: number) {
    return screenWidth > 0 ? screenWidth * 0.05 : 20;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeIn.opacity }]}>
        <ThemedView style={styles.titleRow}>
          <IconSymbol size={28} name="calendar" color="#000000" />
          <ThemedText type="title">Calendar</ThemedText>
        </ThemedView>
        <ThemedText style={styles.subtitle}>Tap a day to preview your entry.</ThemedText>

        <ThemedView style={styles.monthRow}>
          <Pressable
            style={({ pressed }) => [styles.navButton, pressed && styles.pressablePressed]}
            onPress={() => handleChangeMonth(-1)}>
            <IconSymbol size={18} name="chevron.left" color="#000000" />
          </Pressable>
          <ThemedText type="subtitle" style={styles.monthLabel}>
            {monthLabel}
          </ThemedText>
          <Pressable
            style={({ pressed }) => [styles.navButton, pressed && styles.pressablePressed]}
            onPress={() => handleChangeMonth(1)}>
            <IconSymbol size={18} name="chevron.right" color="#000000" />
          </Pressable>
        </ThemedView>

        <ThemedView style={[styles.summaryCard, styles.cardShadow]}>
          <ThemedText type="subtitle">This month</ThemedText>
          <ThemedView style={styles.summaryRow}>
            <ThemedView style={styles.summaryItem}>
              <ThemedText style={styles.summaryLabel}>Entries</ThemedText>
              <ThemedText style={styles.summaryValue}>{monthStats.total}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.summaryItem}>
              <ThemedText style={styles.summaryLabel}>Most common mood</ThemedText>
              {monthStats.mostCommonMood ? (
                <ThemedView style={styles.summaryMoodRow}>
                  <View
                    style={[
                      styles.summaryMoodDot,
                      { backgroundColor: moodColors[monthStats.mostCommonMood] },
                    ]}
                  />
                  <ThemedText style={styles.summaryMoodText}>
                    {
                      MOOD_LABELS.find((m) => m.mood === monthStats.mostCommonMood)?.label ??
                      monthStats.mostCommonMood
                    }
                  </ThemedText>
                </ThemedView>
              ) : (
                <ThemedText style={styles.summaryEmpty}>No entries yet</ThemedText>
              )}
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {isLoading ? (
          <ThemedView style={styles.centeredState}>
            <ActivityIndicator color="#000000" />
          </ThemedView>
        ) : loadError ? (
          <ThemedView style={styles.centeredState}>
            <ThemedText style={styles.errorText}>{loadError}</ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={[styles.calendarCard, styles.cardShadow]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.calendarScroll}>
              <Animated.View
                style={[
                  styles.calendarColumn,
                  { width: gridWidth, gap: gridGap, transform: [{ translateX: animatedTranslateX }] },
                ]}>
                <ThemedView style={styles.weekdayRow}>
                  {WEEKDAYS.map((day) => (
                    <ThemedText key={day} style={[styles.weekdayLabel, { width: cellSize }]}>
                      {day}
                    </ThemedText>
                  ))}
                </ThemedView>

                <ThemedView style={[styles.grid, { gap: gridGap }]}>
                  {monthSlots.map(({ date, key }) => {
                    const entryKey = date ? formatDateKey(date) : null;
                    const entry = entryKey ? entriesByDay.get(entryKey) : null;
                    const moodDot = entry ? moodColors[entry.mood] : null;
                    const isToday = entryKey === todayKey;
                    const inStreak = entryKey ? streakSet.has(entryKey) : false;

                    return (
                      <View key={key} style={styles.dayWrapper}>
                        {inStreak ? <View style={styles.streakConnector} /> : null}
                        <Pressable
                          disabled={!entry}
                          style={({ pressed }) => [
                            styles.dayCell,
                            {
                              width: cellSize,
                              height: cellSize,
                              borderColor: isToday ? '#000000' : '#E0E0E0',
                            },
                            entry && styles.dayCellActive,
                            entry ? { backgroundColor: '#F0F0F0' } : null,
                            pressed && entry && styles.dayCellPressed,
                            !date && styles.dayCellEmpty,
                          ]}
                          onPress={() => handleSelectEntry(entry ?? null)}>
                          {date ? (
                            <>
                              <ThemedText style={[styles.dayLabel, { fontSize: 13 * fontScale }]}>
                                {date.getDate()}
                              </ThemedText>
                              {entry?.photoUri ? (
                                <Image
                                  source={{ uri: entry.photoUri }}
                                  style={styles.dayPhoto}
                                  contentFit="cover"
                                />
                              ) : moodDot ? (
                                <View
                                  style={[
                                    styles.moodDot,
                                    styles.moodDotActive,
                                    { backgroundColor: moodDot },
                                  ]}
                                />
                              ) : null}
                            </>
                          ) : null}
                        </Pressable>
                      </View>
                    );
                  })}
                </ThemedView>
              </Animated.View>
            </ScrollView>
          </ThemedView>
        )}

        <ThemedView style={styles.legend}>
          {MOOD_LABELS.map((item) => (
            <ThemedView key={item.mood} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: moodColors[item.mood] }]} />
              <ThemedText style={styles.legendLabel}>{item.label}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
        {!isLoading && !loadError && !hasEntries ? (
          <ThemedView style={[styles.emptyCard, styles.cardShadow]}>
            <ThemedText style={styles.emptyEmoji}>📅</ThemedText>
            <ThemedText type="subtitle">No entries yet</ThemedText>
            <ThemedText style={styles.emptyText}>
              Start a new entry to see your month fill up.
            </ThemedText>
          </ThemedView>
        ) : null}
      </Animated.View>

      <Modal
        visible={isPreviewVisible && !!selectedEntry}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPreviewVisible(false)}>
        <View style={styles.modalBackdrop}>
          <ThemedView style={[styles.modalCard, styles.cardShadow]}>
            {selectedEntry ? (
              <>
                <ThemedView style={styles.modalHeader}>
                  <ThemedText type="subtitle">
                    {new Date(selectedEntry.date).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </ThemedText>
                  <ThemedView style={styles.modalMoodRow}>
                    <ThemedText style={styles.modalMoodEmoji}>
                      {MOOD_EMOJI[selectedEntry.mood]}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                {selectedEntry.photoUri ? (
                  <Image
                    source={{ uri: selectedEntry.photoUri }}
                    style={styles.modalPhoto}
                    contentFit="cover"
                  />
                ) : null}
                <ScrollView style={styles.modalContentScroll}>
                  <ThemedText style={styles.modalPreviewText} numberOfLines={6}>
                    {selectedEntry.content || 'No content yet.'}
                  </ThemedText>
                </ScrollView>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalCloseButton,
                    pressed && styles.pressablePressed,
                  ]}
                  onPress={() => setIsPreviewVisible(false)}>
                  <ThemedText type="defaultSemiBold" style={styles.modalCloseText}>
                    Close
                  </ThemedText>
                </Pressable>
              </>
            ) : null}
          </ThemedView>
        </View>
      </Modal>
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
    maxWidth: 860,
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
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  navButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    color: '#000000',
  },
  calendarScroll: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarColumn: {
    alignItems: 'center',
  },
  calendarCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  weekdayLabel: {
    width: 40,
    textAlign: 'center',
    color: '#666666',
  },
  grid: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCell: {
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
  },
  dayCellActive: {
    borderWidth: 1,
  },
  dayCellPressed: {
    transform: [{ scale: 0.96 }],
  },
  dayCellEmpty: {
    borderWidth: 0,
  },
  dayLabel: {
    color: '#000000',
  },
  moodDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  moodDotActive: {
    width: 14,
    height: 14,
    borderRadius: 999,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  legendLabel: {
    color: '#666666',
  },
  emptyText: {
    color: '#666666',
  },
  emptyCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 28,
  },
  centeredState: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#d14343',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  pressablePressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  summaryItem: {
    flex: 1,
    minWidth: 140,
    gap: 4,
  },
  summaryLabel: {
    color: '#666666',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  summaryEmpty: {
    color: '#666666',
  },
  summaryMoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryMoodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  summaryMoodText: {
    color: '#000000',
  },
  dayPhoto: {
    width: 26,
    height: 26,
    borderRadius: 8,
  },
  streakConnector: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#E0E0E0',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalMoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalMoodEmoji: {
    fontSize: 24,
  },
  modalPhoto: {
    width: '100%',
    borderRadius: 14,
    height: 180,
  },
  modalContentScroll: {
    maxHeight: 160,
  },
  modalPreviewText: {
    color: '#000000',
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalCloseText: {
    color: '#000000',
  },
});
