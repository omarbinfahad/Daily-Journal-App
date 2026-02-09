import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getEntries, type JournalEntry } from '@/lib/journal-storage';

export default function HistoryScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const placeholderColor = textColor === '#1C242B' ? 'rgba(120,120,120,0.7)' : 'rgba(200,200,200,0.6)';

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    const storedEntries = await getEntries();
    setEntries(storedEntries);
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const filteredEntries = useMemo(() => {
    if (!query.trim()) {
      return entries;
    }
    const lowered = query.toLowerCase();
    return entries.filter((entry) => entry.content.toLowerCase().includes(lowered));
  }, [entries, query]);

  const renderItem = ({ item }: { item: JournalEntry }) => {
    const dateLabel = new Date(item.date).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const preview =
      item.content.length > 100 ? `${item.content.slice(0, 100).trim()}...` : item.content;

    return (
      <Pressable
        style={styles.entryCard}
        onPress={() => router.push({ pathname: '/(tabs)/write-entry', params: { entryId: item.id } })}>
        <ThemedText type="defaultSemiBold">{dateLabel}</ThemedText>
        <ThemedText style={styles.preview}>{preview || 'No content yet.'}</ThemedText>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleRow}>
        <IconSymbol size={28} name="clock.fill" color={tintColor} />
        <ThemedText type="title">History</ThemedText>
      </ThemedView>
      <ThemedText style={styles.subtitle}>
        Browse previous entries by date and revisit memories.
      </ThemedText>
      <TextInput
        style={[styles.searchInput, { color: textColor, borderColor: tintColor }]}
        value={query}
        onChangeText={setQuery}
        placeholder="Search entries..."
        placeholderTextColor={placeholderColor}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {isLoading ? (
        <ThemedText style={styles.placeholderText}>Loading entries...</ThemedText>
      ) : filteredEntries.length === 0 ? (
        <ThemedView style={styles.placeholder}>
          <ThemedText type="subtitle">
            {entries.length === 0 ? 'No entries yet' : 'No matches found'}
          </ThemedText>
          <ThemedText>
            {entries.length === 0
              ? 'Your saved entries will appear here.'
              : 'Try a different keyword.'}
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
        />
      )}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  placeholder: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.2)',
    gap: 8,
  },
  placeholderText: {
    opacity: 0.7,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  list: {
    paddingBottom: 16,
    gap: 12,
  },
  entryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.2)',
    gap: 8,
  },
  preview: {
    opacity: 0.8,
  },
});
