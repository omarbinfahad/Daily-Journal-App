import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useFadeIn } from '@/hooks/use-fade-in';
import { useFontScale } from '@/hooks/use-font-scale';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getEntries, type JournalEntry, type Mood } from '@/lib/journal-storage';

const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'mood', label: 'By Mood' },
  { key: 'tag', label: 'By Tag' },
] as const;

const MOOD_OPTIONS: Array<{ value: Mood; label: string }> = [
  { value: 'happy', label: 'Happy' },
  { value: 'sad', label: 'Sad' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'anxious', label: 'Anxious' },
  { value: 'excited', label: 'Excited' },
];

const MOOD_EMOJI: Record<Mood, string> = {
  happy: '😊',
  sad: '😢',
  neutral: '😐',
  anxious: '😰',
  excited: '🤩',
};

const MOOD_CARD_COLORS: Record<
  Mood,
  {
    background: string;
    border: string;
  }
> = {
  happy: {
    background: '#FFFFFF',
    border: '#E0E0E0',
  },
  sad: {
    background: '#FFFFFF',
    border: '#E0E0E0',
  },
  neutral: {
    background: '#FFFFFF',
    border: '#E0E0E0',
  },
  anxious: {
    background: '#FFFFFF',
    border: '#E0E0E0',
  },
  excited: {
    background: '#FFFFFF',
    border: '#E0E0E0',
  },
};

export default function HistoryScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTER_OPTIONS)[number]['key']>('all');
  const [selectedMood, setSelectedMood] = useState<Mood>('happy');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const fontScale = useFontScale();
  const placeholderColor = '#9CA3AF';
  const fadeIn = useFadeIn();
  const triggerHaptic = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // no-op
    }
  }, []);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const storedEntries = await getEntries();
      setEntries(storedEntries);
    } catch (error) {
      setLoadError('Unable to load entries right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach((entry) => {
      entry.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [entries]);

  const filteredEntries = useMemo(() => {
    let next = entries;

    if (filter === 'favorites') {
      next = next.filter((entry) => entry.favorite);
    }

    if (filter === 'mood') {
      next = next.filter((entry) => entry.mood === selectedMood);
    }

    if (filter === 'tag') {
      if (!selectedTag) {
        return [];
      }
      next = next.filter((entry) => entry.tags?.includes(selectedTag));
    }

    if (!query.trim()) {
      return next;
    }
    const lowered = query.toLowerCase();
    return next.filter((entry) => entry.content.toLowerCase().includes(lowered));
  }, [entries, filter, query, selectedMood, selectedTag]);

  const renderCardItem = ({ item }: { item: JournalEntry }) => {
    const dateLabel = new Date(item.date).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const firstLine = item.content.split('\n').find((line) => line.trim().length > 0) ?? '';
    const preview =
      firstLine.length > 100 ? `${firstLine.slice(0, 100).trim()}...` : firstLine || item.content;
    const colors = MOOD_CARD_COLORS[item.mood];

    return (
      <Pressable
        style={({ pressed }) => [
          styles.entryCard,
          styles.cardShadow,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
          pressed && styles.cardPressed,
        ]}
        onPress={async () => {
          await triggerHaptic();
          router.push({ pathname: '/(tabs)/write-entry', params: { entryId: item.id } });
        }}>
        <ThemedView style={styles.entryRow}>
          {item.photoUri ? (
            <Image source={{ uri: item.photoUri }} style={styles.entryThumbnail} contentFit="cover" />
          ) : (
            <ThemedView style={styles.entryThumbnailPlaceholder}>
              <ThemedText style={styles.entryThumbnailEmoji}>📝</ThemedText>
            </ThemedView>
          )}
          <ThemedView style={styles.entryBody}>
            <ThemedView style={styles.entryHeader}>
              <ThemedText type="defaultSemiBold" style={styles.entryDateText}>
                {dateLabel}
              </ThemedText>
              <ThemedView style={styles.entryMeta}>
                <ThemedText style={styles.moodEmoji}>{MOOD_EMOJI[item.mood]}</ThemedText>
                {item.favorite ? (
                  <IconSymbol size={18} name="star.fill" color={tintColor} />
                ) : null}
              </ThemedView>
            </ThemedView>
            <ThemedText style={styles.preview}>{preview || 'No content yet.'}</ThemedText>
          </ThemedView>
        </ThemedView>
      </Pressable>
    );
  };

  const renderTimelineItem = ({ item }: { item: JournalEntry }) => {
    const dateLabel = new Date(item.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const colors = MOOD_CARD_COLORS[item.mood];
    const firstLine = item.content.split('\n').find((line) => line.trim().length > 0) ?? '';
    const preview =
      firstLine.length > 120 ? `${firstLine.slice(0, 120).trim()}...` : firstLine || item.content;

    return (
      <Pressable
        style={({ pressed }) => [styles.timelineItem, pressed && styles.cardPressed]}
        onPress={async () => {
          await triggerHaptic();
          router.push({ pathname: '/(tabs)/write-entry', params: { entryId: item.id } });
        }}>
        <ThemedView style={styles.timelineLeft}>
          <ThemedView style={styles.timelineLine} />
          <ThemedView style={[styles.timelineDot, { borderColor: colors.border, backgroundColor: colors.background }]} />
        </ThemedView>
        <ThemedView
          style={[
            styles.timelineCard,
            styles.cardShadow,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}>
          <ThemedText type="defaultSemiBold" style={styles.entryDateText}>
            {dateLabel}
          </ThemedText>
          <ThemedView style={styles.timelineMetaRow}>
            <ThemedText style={styles.moodEmoji}>{MOOD_EMOJI[item.mood]}</ThemedText>
            {item.favorite ? (
              <IconSymbol size={16} name="star.fill" color={tintColor} />
            ) : null}
          </ThemedView>
          <ThemedText style={styles.preview}>{preview || 'No content yet.'}</ThemedText>
        </ThemedView>
      </Pressable>
    );
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadEntries();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadEntries]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ThemedView style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeIn.opacity }]}>
          <ThemedView style={styles.titleRow}>
            <IconSymbol size={28} name="clock.fill" color={tintColor} />
            <ThemedText type="title">History</ThemedText>
          </ThemedView>
          <ThemedText style={styles.subtitle}>
            Browse previous entries by date and revisit memories.
          </ThemedText>
          <ThemedView style={styles.searchBar}>
            <IconSymbol size={18} name="magnifyingglass" color="#999999" />
            <TextInput
              style={[styles.searchInput, { color: textColor, fontSize: 16 * fontScale }]}
              value={query}
              onChangeText={setQuery}
              placeholder="Search entries..."
              placeholderTextColor={placeholderColor}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </ThemedView>
          <ThemedView style={styles.filterRow}>
            {FILTER_OPTIONS.map((option) => {
              const isSelected = filter === option.key;
              const iconName =
                option.key === 'all'
                  ? 'doc.text'
                  : option.key === 'favorites'
                  ? 'star.fill'
                  : option.key === 'mood'
                  ? 'sun.max.fill'
                  : 'square.and.pencil';
              return (
                <Pressable
                  key={option.key}
                  style={({ pressed }) => [
                    styles.filterChip,
                    isSelected && styles.filterChipActive,
                    pressed && styles.pressablePressed,
                  ]}
                  onPress={async () => {
                    await triggerHaptic();
                    setFilter(option.key);
                  }}>
                  <IconSymbol
                    size={16}
                    name={iconName}
                    color={isSelected ? '#FFFFFF' : '#000000'}
                  />
                  <ThemedText
                    type="defaultSemiBold"
                    style={isSelected ? styles.filterChipLabelActive : styles.filterChipLabel}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ThemedView>
          <ThemedView style={styles.viewToggleRow}>
            <Pressable
              style={({ pressed }) => [
                styles.viewToggleChip,
                viewMode === 'cards' && styles.viewToggleChipActive,
                pressed && styles.pressablePressed,
              ]}
              onPress={async () => {
                await triggerHaptic();
                setViewMode('cards');
              }}>
              <IconSymbol
                size={16}
                name="doc.text"
                color={viewMode === 'cards' ? '#FFFFFF' : '#000000'}
              />
              <ThemedText
                type="defaultSemiBold"
                style={viewMode === 'cards' ? styles.viewToggleLabelActive : styles.viewToggleLabel}>
                Cards
              </ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.viewToggleChip,
                viewMode === 'timeline' && styles.viewToggleChipActive,
                pressed && styles.pressablePressed,
              ]}
              onPress={async () => {
                await triggerHaptic();
                setViewMode('timeline');
              }}>
              <IconSymbol
                size={16}
                name="clock.fill"
                color={viewMode === 'timeline' ? '#FFFFFF' : '#000000'}
              />
              <ThemedText
                type="defaultSemiBold"
                style={viewMode === 'timeline' ? styles.viewToggleLabelActive : styles.viewToggleLabel}>
                Timeline
              </ThemedText>
            </Pressable>
          </ThemedView>
          {filter === 'mood' ? (
            <ThemedView style={styles.filterRow}>
              {MOOD_OPTIONS.map((option) => {
                const isSelected = selectedMood === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={({ pressed }) => [
                      styles.filterChip,
                      isSelected && styles.filterChipActive,
                      pressed && styles.pressablePressed,
                    ]}
                    onPress={async () => {
                      await triggerHaptic();
                      setSelectedMood(option.value);
                    }}>
                    <ThemedText type="defaultSemiBold" style={styles.filterChipLabel}>
                      {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ThemedView>
          ) : null}
          {filter === 'tag' ? (
            <ThemedView style={styles.filterRow}>
              {availableTags.length === 0 ? (
                <ThemedText style={styles.placeholderText}>No tags found yet.</ThemedText>
              ) : (
                availableTags.map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <Pressable
                      key={tag}
                      style={({ pressed }) => [
                        styles.filterChip,
                        isSelected && styles.filterChipActive,
                        pressed && styles.pressablePressed,
                      ]}
                      onPress={async () => {
                        await triggerHaptic();
                        setSelectedTag(tag);
                      }}>
                      <ThemedText type="defaultSemiBold" style={styles.filterChipLabel}>
                        {tag}
                      </ThemedText>
                    </Pressable>
                  );
                })
              )}
            </ThemedView>
          ) : null}
          {isLoading ? (
            <ThemedView style={styles.centeredState}>
              <ActivityIndicator color={tintColor} />
            </ThemedView>
          ) : loadError ? (
            <ThemedView style={styles.centeredState}>
              <ThemedText style={styles.errorText}>{loadError}</ThemedText>
            </ThemedView>
          ) : filteredEntries.length === 0 ? (
            <ThemedView style={[styles.placeholder, styles.cardShadow]}>
              <ThemedText style={styles.emptyEmoji}>🌿</ThemedText>
              <ThemedText type="subtitle">
                {entries.length === 0 ? 'No entries yet' : 'No matches found'}
              </ThemedText>
              <ThemedText>
                {entries.length === 0
                  ? 'Start with a small note today — your first entry will show up here.'
                  : 'Try a different keyword or filter.'}
              </ThemedText>
            </ThemedView>
          ) : (
            <Animated.FlatList
              data={filteredEntries}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              renderItem={viewMode === 'cards' ? renderCardItem : renderTimelineItem}
              onRefresh={onRefresh}
              refreshing={isRefreshing}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Animated.View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    gap: 16,
  },
  subtitle: {
    color: '#666666',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeholder: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  placeholderText: {
    opacity: 0.7,
  },
  centeredState: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    minHeight: 48,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 16,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterChipLabel: {
    color: '#000000',
  },
  filterChipLabelActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingBottom: 16,
    gap: 16,
  },
  entryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  entryRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  entryThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  entryThumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryThumbnailEmoji: {
    fontSize: 24,
  },
  entryBody: {
    flex: 1,
    gap: 6,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  entryDateText: {
    color: '#000000',
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodEmoji: {
    fontSize: 16,
  },
  preview: {
    opacity: 0.85,
    color: '#666666',
  },
  emptyEmoji: {
    fontSize: 28,
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
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  pressablePressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  viewToggleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  viewToggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  viewToggleChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  viewToggleLabel: {
    color: '#000000',
  },
  viewToggleLabelActive: {
    color: '#FFFFFF',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineLeft: {
    width: 32,
    alignItems: 'center',
  },
  timelineLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#E0E0E0',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  timelineCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  timelineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
