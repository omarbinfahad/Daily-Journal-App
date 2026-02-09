import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getEntryById, type JournalEntry } from '@/lib/journal-storage';

export default function EntryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadEntry = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      const storedEntry = await getEntryById(id);
      if (isActive) {
        setEntry(storedEntry);
        setIsLoading(false);
      }
    };

    loadEntry();
    return () => {
      isActive = false;
    };
  }, [id]);

  const dateLabel =
    entry &&
    new Date(entry.date).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <ThemedView style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <ThemedText type="defaultSemiBold">Back</ThemedText>
      </Pressable>
      {isLoading ? (
        <ThemedText style={styles.subtitle}>Loading entry...</ThemedText>
      ) : entry ? (
        <>
          <ThemedText type="title">{dateLabel}</ThemedText>
          <ThemedText style={styles.prompt}>{entry.prompt}</ThemedText>
          <ThemedText style={styles.content}>{entry.content}</ThemedText>
        </>
      ) : (
        <>
          <ThemedText type="title">Entry not found</ThemedText>
          <ThemedText style={styles.subtitle}>
            This entry may have been removed or is unavailable.
          </ThemedText>
        </>
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
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.2)',
  },
  subtitle: {
    opacity: 0.7,
  },
  prompt: {
    opacity: 0.8,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
});
