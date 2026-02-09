import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PROMPTS } from '@/constants/prompts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getEntryById, saveEntry, type JournalEntry, type Mood } from '@/lib/journal-storage';

const MOOD_OPTIONS: Array<{ value: Mood; label: string; emoji: string }> = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'anxious', label: 'Anxious', emoji: '😰' },
  { value: 'excited', label: 'Excited', emoji: '🤩' },
];

export default function WriteEntryScreen() {
  const router = useRouter();
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  const [entryText, setEntryText] = useState('');
  const [loadedEntry, setLoadedEntry] = useState<JournalEntry | null>(null);
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mood, setMood] = useState<Mood>('neutral');
  const characterCount = entryText.length;
  const colorScheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const trimmedEntry = entryText.trim();
  const isContentEmpty = trimmedEntry.length === 0;
  const placeholderColor = useMemo(() => {
    return colorScheme === 'light' ? 'rgba(120,120,120,0.7)' : 'rgba(200,200,200,0.6)';
  }, [colorScheme]);
  const editorColors = useMemo(() => {
    if (colorScheme === 'light') {
      return {
        backgroundColor: 'rgba(120,120,120,0.06)',
        borderColor: 'rgba(120,120,120,0.2)',
      };
    }

    return {
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderColor: 'rgba(220,220,220,0.2)',
    };
  }, [colorScheme]);

  useEffect(() => {
    let isActive = true;

    const loadEntry = async () => {
      if (!entryId) {
        setLoadedEntry(null);
        setMood('neutral');
        return;
      }

      setIsLoadingEntry(true);
      const entry = await getEntryById(entryId);
      if (isActive) {
        setLoadedEntry(entry);
        setEntryText(entry?.content ?? '');
        setMood(entry?.mood ?? 'neutral');
        setIsLoadingEntry(false);
      }
    };

    loadEntry();

    return () => {
      isActive = false;
    };
  }, [entryId]);

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    if (isContentEmpty) {
      Alert.alert('Nothing to save', 'Please add some text before saving your entry.');
      return;
    }

    setIsSaving(true);
    const now = new Date();
    const dayIndex = Math.floor(
      new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86400000
    );
    const prompt = PROMPTS[dayIndex % PROMPTS.length];

    try {
      const entryDate = loadedEntry?.date ?? now.toISOString();
      await saveEntry({
        id: loadedEntry?.id ?? now.getTime().toString(),
        date: entryDate,
        prompt: loadedEntry?.prompt ?? prompt,
        content: trimmedEntry,
        mood,
      });
      setEntryText('');
      setLoadedEntry(null);
      setMood('neutral');
      Alert.alert('Saved', 'Your entry was saved.');
      router.replace('/');
    } catch (error) {
      Alert.alert('Save failed', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleRow}>
        <IconSymbol size={28} name="square.and.pencil" color={tintColor} />
        <ThemedText type="title">Write Entry</ThemedText>
      </ThemedView>
      <ThemedText style={styles.subtitle}>
        {loadedEntry ? 'Update your entry.' : 'Add your thoughts, highlights, or gratitude for today.'}
      </ThemedText>
      <ThemedView style={styles.moodRow}>
        {MOOD_OPTIONS.map((option) => {
          const isSelected = option.value === mood;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.moodButton,
                isSelected && { borderColor: tintColor, backgroundColor: `${tintColor}1A` },
              ]}
              onPress={() => setMood(option.value)}
              disabled={isLoadingEntry}>
              <ThemedText style={styles.moodEmoji}>{option.emoji}</ThemedText>
              <ThemedText style={styles.moodLabel}>{option.label}</ThemedText>
            </Pressable>
          );
        })}
      </ThemedView>
      <ThemedView style={[styles.editor, editorColors]}>
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="Start journaling..."
          placeholderTextColor={placeholderColor}
          multiline
          textAlignVertical="top"
          value={entryText}
          onChangeText={setEntryText}
          selectionColor={tintColor}
          cursorColor={tintColor}
          textAlign="left"
          autoCorrect
          autoCapitalize="sentences"
          editable={!isLoadingEntry}
        />
      </ThemedView>
      <ThemedView style={styles.footer}>
        <ThemedText style={styles.counter}>{characterCount} characters</ThemedText>
        <Pressable
          style={[
            styles.saveButton,
            { backgroundColor: tintColor },
            (isSaving || isLoadingEntry || isContentEmpty) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isSaving || isLoadingEntry || isContentEmpty}>
          <ThemedText type="defaultSemiBold" style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : loadedEntry ? 'Update Entry' : 'Save Entry'}
          </ThemedText>
        </Pressable>
      </ThemedView>
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
  editor: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.2)',
  },
  moodEmoji: {
    fontSize: 16,
  },
  moodLabel: {
    opacity: 0.9,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: 'inherit',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  counter: {
    opacity: 0.7,
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
  },
});
