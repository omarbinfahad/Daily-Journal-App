import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PROMPTS } from '@/constants/prompts';
import { useFadeIn } from '@/hooks/use-fade-in';
import { useFontScale } from '@/hooks/use-font-scale';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getEntries, getEntryById, saveEntry, type JournalEntry, type Mood } from '@/lib/journal-storage';

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
  const { width, height } = useWindowDimensions();
  const [entryText, setEntryText] = useState('');
  const [loadedEntry, setLoadedEntry] = useState<JournalEntry | null>(null);
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mood, setMood] = useState<Mood>('neutral');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [knownTags, setKnownTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const saveSuccessOpacity = useRef(new Animated.Value(0)).current;
  const characterCount = entryText.length;
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const fontScale = useFontScale();
  const trimmedEntry = entryText.trim();
  const isContentEmpty = trimmedEntry.length === 0;
  const isNarrow = width < 360;
  const editorMinHeight = Math.min(420, Math.max(240, Math.round(height * 0.34)));
  const placeholderColor = '#A0A0A0';
  const editorColors = useMemo(() => {
    return {
      backgroundColor: '#FFFEF7',
      borderColor: '#E0E0E0',
    };
  }, []);
  const activePrompt = useMemo(() => {
    if (loadedEntry?.prompt) {
      return loadedEntry.prompt;
    }
    const now = new Date();
    const dayIndex = Math.floor(
      new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86400000
    );
    return PROMPTS[dayIndex % PROMPTS.length];
  }, [loadedEntry]);
  const wordCount = useMemo(() => {
    if (!trimmedEntry) return 0;
    return trimmedEntry.split(/\s+/).filter(Boolean).length;
  }, [trimmedEntry]);

  const fadeIn = useFadeIn();
  const triggerHaptic = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    if (saveSuccess) {
      saveSuccessOpacity.setValue(0);
      Animated.timing(saveSuccessOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [saveSuccess, saveSuccessOpacity]);

  useEffect(() => {
    let isActive = true;

    const loadEntry = async () => {
      if (!entryId) {
        setLoadedEntry(null);
        setMood('neutral');
        return;
      }

      setIsLoadingEntry(true);
      setLoadError(null);
      try {
        const entry = await getEntryById(entryId);
        if (isActive) {
          setLoadedEntry(entry);
          setEntryText(entry?.content ?? '');
          setMood(entry?.mood ?? 'neutral');
          setPhotoUri(entry?.photoUri ?? null);
          setTags(entry?.tags ?? []);
          setIsFavorite(Boolean(entry?.favorite));
        }
      } catch (error) {
        if (isActive) {
          setLoadError('Unable to load this entry.');
        }
      } finally {
        if (isActive) {
          setIsLoadingEntry(false);
        }
      }
    };

    loadEntry();

    return () => {
      isActive = false;
    };
  }, [entryId]);

  useEffect(() => {
    let isActive = true;
    const loadTags = async () => {
      try {
        const entries = await getEntries();
        const tagSet = new Set<string>();
        entries.forEach((entry) => {
          entry.tags?.forEach((tag) => tagSet.add(tag));
        });
        if (isActive) {
          setKnownTags(Array.from(tagSet).sort());
        }
      } catch (error) {
        if (isActive) {
          setKnownTags([]);
        }
      }
    };
    loadTags();
    return () => {
      isActive = false;
    };
  }, []);

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

    try {
      const entryDate = loadedEntry?.date ?? now.toISOString();
      await saveEntry({
        id: loadedEntry?.id ?? now.getTime().toString(),
        date: entryDate,
        prompt: activePrompt,
        content: trimmedEntry,
        mood,
        photoUri,
        tags,
        favorite: isFavorite,
      });
      setEntryText('');
      setLoadedEntry(null);
      setMood('neutral');
      setPhotoUri(null);
      setTags([]);
      setTagInput('');
      setIsFavorite(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        router.replace('/');
      }, 900);
    } catch (error) {
      Alert.alert('Save failed', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const normalizeTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const stripped = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
    const cleaned = stripped.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!cleaned) {
      return null;
    }
    return `#${cleaned.toLowerCase()}`;
  };

  const addTag = (value: string) => {
    const normalized = normalizeTag(value);
    if (!normalized || tags.includes(normalized)) {
      return;
    }
    setTags((prev) => [...prev, normalized]);
    setTagInput('');
  };

  const removeTag = (value: string) => {
    setTags((prev) => prev.filter((tag) => tag !== value));
  };

  const tagSuggestions = useMemo(() => {
    const normalizedInput = normalizeTag(tagInput);
    const query = (normalizedInput ?? tagInput).toLowerCase();
    if (!query) {
      return [];
    }
    return knownTags
      .filter((tag) => tag.toLowerCase().includes(query))
      .filter((tag) => !tags.includes(tag))
      .slice(0, 6);
  }, [knownTags, tagInput, tags]);

  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow access to your photo library to add a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow camera access to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.content, { opacity: fadeIn.opacity }]}>
          <ThemedView style={styles.titleRow}>
            <ThemedView style={styles.titleLeft}>
              <Pressable
                style={({ pressed }) => [styles.backButton, pressed && styles.pressablePressed]}
                onPress={async () => {
                  await triggerHaptic();
                  router.back();
                }}>
                <IconSymbol size={18} name="chevron.left" color={textColor} />
              </Pressable>
              <IconSymbol size={28} name="square.and.pencil" color="#000000" />
              <ThemedText type="title">Write Entry</ThemedText>
            </ThemedView>
            <Pressable
              style={({ pressed }) => [
                styles.favoriteButton,
                isFavorite && styles.favoriteButtonActive,
                pressed && styles.pressablePressed,
              ]}
              onPress={async () => {
                await triggerHaptic();
                setIsFavorite((prev) => !prev);
              }}>
              <IconSymbol
                size={26}
                name={isFavorite ? 'star.fill' : 'star'}
                color="#000000"
              />
            </Pressable>
          </ThemedView>
          <ThemedText style={styles.subtitle}>
            {loadedEntry
              ? 'Update your reflections for this day.'
              : 'Slow down, breathe, and capture what mattered today.'}
          </ThemedText>
          <ThemedView style={styles.promptHeader}>
            <IconSymbol size={18} name="sparkles" color="#666666" />
            <ThemedText style={styles.promptHeaderText}>
              Inspired by: <ThemedText style={styles.promptHeaderPrompt}>"{activePrompt}"</ThemedText>
            </ThemedText>
          </ThemedView>
          {isLoadingEntry ? (
            <ThemedView style={styles.centeredState}>
              <ActivityIndicator color="#000000" />
            </ThemedView>
          ) : loadError ? (
            <ThemedView style={styles.centeredState}>
              <ThemedText style={styles.errorText}>{loadError}</ThemedText>
            </ThemedView>
          ) : null}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodScrollContent}
            style={styles.moodScroll}>
            <ThemedView style={styles.moodRow}>
              {MOOD_OPTIONS.map((option) => {
                const isSelected = option.value === mood;
                return (
                  <Pressable
                    key={option.value}
                    style={({ pressed }) => [
                      styles.moodButton,
                      isSelected && styles.moodButtonSelected,
                      pressed && styles.pressablePressed,
                    ]}
                    onPress={async () => {
                      await triggerHaptic();
                      setMood(option.value);
                    }}
                    disabled={isLoadingEntry}>
                  <ThemedText style={styles.moodEmoji}>{option.emoji}</ThemedText>
                  </Pressable>
                );
              })}
            </ThemedView>
          </ScrollView>
        {photoUri ? (
          <View style={[styles.photoWrapper, styles.cardShadow]}>
            <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
            <Pressable style={styles.removePhotoButton} onPress={() => setPhotoUri(null)}>
              <ThemedText type="defaultSemiBold">Remove</ThemedText>
            </Pressable>
          </View>
        ) : null}
        <ThemedView
          style={[styles.editor, styles.cardShadow, editorColors, { minHeight: editorMinHeight }]}>
          <View style={styles.editorPaper}>
            <View style={styles.paperTopAccent} />
            <TextInput
              style={[
                styles.input,
                {
                  color: '#000000',
                  fontSize: 16 * fontScale,
                  lineHeight: 22 * fontScale,
                },
              ]}
              placeholder="What made today meaningful to you?"
              placeholderTextColor={placeholderColor}
              multiline
              textAlignVertical="top"
              value={entryText}
              onChangeText={setEntryText}
              selectionColor="#000000"
              cursorColor="#000000"
              textAlign="left"
              autoCorrect
              autoCapitalize="sentences"
              editable={!isLoadingEntry}
            />
          </View>
          <ThemedView style={styles.editorToolbar}>
            <ThemedView style={styles.photoActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressablePressed,
                ]}
                onPress={async () => {
                  await triggerHaptic();
                  handleAddPhoto();
                }}>
                <IconSymbol size={18} name="plus" color="#000000" />
                <ThemedText type="defaultSemiBold" style={styles.secondaryButtonText}>
                  Add Photo
                </ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressablePressed,
                ]}
                onPress={async () => {
                  await triggerHaptic();
                  handleTakePhoto();
                }}>
                <IconSymbol size={18} name="camera" color="#000000" />
                <ThemedText type="defaultSemiBold" style={styles.secondaryButtonText}>
                  Take Photo
                </ThemedText>
              </Pressable>
            </ThemedView>
            <ThemedText style={styles.counter}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'} · {characterCount} characters
            </ThemedText>
          </ThemedView>
        </ThemedView>
        <ThemedView style={styles.tagsSection}>
          <ThemedText type="subtitle">Tags</ThemedText>
          <TextInput
            style={[
              styles.tagInput,
              { color: '#1F2933', fontSize: 15 * fontScale },
            ]}
            value={tagInput}
            onChangeText={setTagInput}
            placeholder="Add a tag and press return (e.g., #gratitude)"
            placeholderTextColor={placeholderColor}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={() => addTag(tagInput)}
            returnKeyType="done"
          />
          {tagSuggestions.length > 0 ? (
            <View style={styles.suggestionsRow}>
              {tagSuggestions.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  style={styles.suggestionChip}
                  onPress={() => addTag(suggestion)}>
                  <ThemedText type="defaultSemiBold" style={styles.suggestionText}>
                    {suggestion}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          ) : null}
          {tags.length > 0 ? (
            <View style={styles.tagChips}>
              {tags.map((tag) => (
                <Pressable key={tag} style={styles.tagChip} onPress={() => removeTag(tag)}>
                  <ThemedText type="defaultSemiBold" style={styles.tagText}>
                    {tag}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          ) : null}
        </ThemedView>
      </Animated.View>
      </ScrollView>
      <ThemedView style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.saveFab,
            { backgroundColor: '#000000' },
            (isSaving || isLoadingEntry || isContentEmpty) && styles.saveButtonDisabled,
            pressed && styles.pressablePressed,
          ]}
          onPress={async () => {
            await triggerHaptic();
            handleSave();
          }}
          disabled={isSaving || isLoadingEntry || isContentEmpty}>
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <IconSymbol size={24} name="checkmark.circle.fill" color="#FFFFFF" />
          )}
        </Pressable>
        {saveSuccess ? (
          <Animated.View style={[styles.successToast, { opacity: saveSuccessOpacity }]}>
            <IconSymbol size={18} name="checkmark.circle.fill" color="#000000" />
            <ThemedText style={styles.successText}>Entry saved</ThemedText>
          </Animated.View>
        ) : null}
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 120,
    backgroundColor: '#F5F5F5',
  },
  flex: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    gap: 20,
  },
  subtitle: {
    color: '#666666',
    marginTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  favoriteButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  favoriteButtonActive: {
    borderColor: '#000000',
  },
  editor: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 220,
  },
  editorPaper: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#FFFEF7',
  },
  paperTopAccent: {
    height: 3,
    borderRadius: 999,
    backgroundColor: '#E0E0E0',
    marginBottom: 10,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  moodScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  moodScrollContent: {
    paddingVertical: 4,
  },
  moodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 40,
    backgroundColor: '#FFFFFF',
  },
  moodButtonSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  moodEmoji: {
    fontSize: 16,
  },
  moodLabel: {
    opacity: 0.9,
  },
  tagsSection: {
    gap: 8,
    marginTop: 16,
  },
  tagInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    minHeight: 32,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  tagChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    minHeight: 32,
    justifyContent: 'center',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  secondaryButton: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  photoWrapper: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  removePhotoButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  counter: {
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'right',
  },
  saveFab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    paddingHorizontal: 20,
    gap: 12,
    alignItems: 'flex-end',
  },
  centeredState: {
    minHeight: 60,
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
  pressablePressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 6,
  },
  promptHeaderText: {
    flex: 1,
    color: '#666666',
  },
  promptHeaderPrompt: {
    color: '#666666',
    fontStyle: 'italic',
  },
  editorToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  secondaryButtonText: {
    color: '#000000',
  },
  suggestionText: {
    color: '#000000',
  },
  tagText: {
    color: '#000000',
  },
  successToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  successText: {
    color: '#000000',
  },
});
