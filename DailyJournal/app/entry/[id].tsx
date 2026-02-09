import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useFadeIn } from '@/hooks/use-fade-in';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getEntryById, type JournalEntry } from '@/lib/journal-storage';

export default function EntryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const tintColor = useThemeColor({}, 'tint');
  const fadeIn = useFadeIn();
  const triggerHaptic = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadEntry = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        const storedEntry = await getEntryById(id);
        if (isActive) {
          setEntry(storedEntry);
        }
      } catch (error) {
        if (isActive) {
          setLoadError('Unable to load this entry.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
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
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeIn.opacity }]}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressablePressed]}
          onPress={async () => {
            await triggerHaptic();
            router.back();
          }}>
          <ThemedText type="defaultSemiBold">Back</ThemedText>
        </Pressable>
        {isLoading ? (
          <ThemedView style={styles.centeredState}>
            <ActivityIndicator color="#000000" />
          </ThemedView>
        ) : loadError ? (
          <ThemedText style={styles.errorText}>{loadError}</ThemedText>
        ) : entry ? (
          <>
            <ThemedText type="title">{dateLabel}</ThemedText>
            <ThemedView style={[styles.entryCard, styles.cardShadow]}>
              <ThemedText style={styles.prompt}>{entry.prompt}</ThemedText>
              <ThemedText style={styles.entryContent}>{entry.content}</ThemedText>
            </ThemedView>
          </>
        ) : (
          <>
            <ThemedText type="title">Entry not found</ThemedText>
            <ThemedText style={styles.subtitle}>
              This entry may have been removed or is unavailable.
            </ThemedText>
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
    maxWidth: 720,
    alignSelf: 'center',
    gap: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    minHeight: 44,
    justifyContent: 'center',
  },
  subtitle: {
    color: '#666666',
  },
  prompt: {
    color: '#666666',
  },
  entryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  entryContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  centeredState: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#d14343',
  },
  pressablePressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
