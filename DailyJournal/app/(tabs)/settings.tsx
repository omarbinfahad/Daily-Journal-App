import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { EncodingType, documentDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
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
import { clearEntries, getEntries } from '@/lib/journal-storage';
import { clearPin, getPin, setPin } from '@/lib/pin-storage';
import { getProfile, saveProfile } from '@/lib/profile-storage';
import { getReminderSettings, saveReminderSettings } from '@/lib/reminder-storage';
import { getFontPreference, setFontPreference, type FontSizePreference } from '@/lib/font-preference';
const FONT_OPTIONS: Array<{ label: string; value: FontSizePreference; icon: string }> = [
  { label: 'Small', value: 'small', icon: 'textformat.size' },
  { label: 'Medium', value: 'medium', icon: 'textformat.size' },
  { label: 'Large', value: 'large', icon: 'textformat.size' },
];

export default function SettingsScreen() {
  const [pinInput, setPinInput] = useState('');
  const [hasPin, setHasPin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [fontPreference, setFontPreferenceState] = useState<FontSizePreference>('medium');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isUpdatingReminder, setIsUpdatingReminder] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const pendingReminderTimeRef = useRef<Date | null>(null);
  const isUpdatingReminderRef = useRef(false);
  const reminderEnabledRef = useRef(false);
  const notificationIdRef = useRef<string | null>(null);
  const [focusedField, setFocusedField] = useState<'name' | 'bio' | 'pin' | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const profileSavedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width } = useWindowDimensions();
  const avatarSize = 80;
  const avatarButtonStyle = useMemo(
    () => ({
      ...StyleSheet.flatten(styles.avatarButton),
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
    }),
    [avatarSize]
  );
  const avatarImageStyle = useMemo(
    () => ({
      ...StyleSheet.flatten(styles.avatarImage),
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
    }),
    [avatarSize]
  );
  const fontScale = useFontScale();
  const isExpoGo = Constants.appOwnership === 'expo';
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const fadeIn = useFadeIn();
  const triggerHaptic = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // no-op
    }
  }, []);
  const appVersion =
    (Constants.expoConfig as any)?.version ??
    (Constants.manifest as any)?.version ??
    '1.0.0';

  useEffect(() => {
    const loadPin = async () => {
      const stored = await getPin();
      setHasPin(Boolean(stored));
    };
    loadPin();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getProfile();
      setDisplayName(profile.name);
      setBio(profile.bio);
      setAvatarUri(profile.avatarUri);
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const loadFontPreference = async () => {
      const stored = await getFontPreference();
      setFontPreferenceState(stored);
    };
    loadFontPreference();
  }, []);

  useEffect(() => {
    const loadReminder = async () => {
      const stored = await getReminderSettings();
      setReminderEnabled(stored.enabled);
      setNotificationId(stored.notificationId);
      reminderEnabledRef.current = stored.enabled;
      notificationIdRef.current = stored.notificationId;
      const time = new Date();
      time.setHours(stored.hour, stored.minute, 0, 0);
      setReminderTime(time);
    };
    loadReminder();
  }, []);

  useEffect(() => {
    isUpdatingReminderRef.current = isUpdatingReminder;
  }, [isUpdatingReminder]);

  useEffect(() => {
    reminderEnabledRef.current = reminderEnabled;
  }, [reminderEnabled]);

  useEffect(() => {
    notificationIdRef.current = notificationId;
  }, [notificationId]);

  useEffect(() => {
    return () => {
      if (profileSavedTimer.current) {
        clearTimeout(profileSavedTimer.current);
      }
    };
  }, []);

  const handleSavePin = async () => {
    if (pinInput.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN.');
      return;
    }

    setIsSaving(true);
    try {
      await setPin(pinInput);
      setHasPin(true);
      setPinInput('');
      Alert.alert('PIN saved', 'Your PIN has been updated.');
    } catch (error) {
      Alert.alert('Error', 'Could not save PIN.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearPin = async () => {
    setIsSaving(true);
    try {
      await clearPin();
      setHasPin(false);
      Alert.alert('PIN removed', 'Your PIN has been cleared.');
    } catch (error) {
      Alert.alert('Error', 'Could not clear PIN.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow access to your photo library to pick an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      await saveProfile({ name: displayName, bio, avatarUri: uri });
    }
  };

  const handleSaveProfile = async () => {
    try {
      await saveProfile({ name: displayName, bio, avatarUri });
      setProfileSaved(true);
      if (profileSavedTimer.current) {
        clearTimeout(profileSavedTimer.current);
      }
      profileSavedTimer.current = setTimeout(() => {
        setProfileSaved(false);
      }, 2200);
    } catch (error) {
      Alert.alert('Error', 'Could not save your profile.');
    }
  };

  const handleFontChange = async (preference: FontSizePreference) => {
    setFontPreferenceState(preference);
    await setFontPreference(preference);
  };

  const getNotifications = async () => {
    if (isExpoGo) {
      return null;
    }
    const module = await import('expo-notifications');
    return module;
  };

  const scheduleReminder = async (date: Date) => {
    if (isExpoGo) {
      Alert.alert(
        'Notifications unavailable in Expo Go',
        'Use a development build to enable reminders.'
      );
      return null;
    }
    const notifications = await getNotifications();
    if (!notifications) {
      return null;
    }
    const { status } = await notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Enable notifications to receive daily reminders.');
      return null;
    }

    const id = await notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to journal',
        body: 'Take a moment to reflect and write your entry.',
      },
      trigger: {
        type: notifications.SchedulableTriggerInputTypes.DAILY,
        hour: date.getHours(),
        minute: date.getMinutes(),
      },
    });

    return id;
  };

  const applyReminderTime = useCallback(async (nextTime: Date) => {
    const runUpdate = async (targetTime: Date) => {
      if (isUpdatingReminderRef.current) {
        pendingReminderTimeRef.current = targetTime;
        setReminderTime(targetTime);
        return;
      }

      setReminderTime(targetTime);

      if (!reminderEnabledRef.current) {
        await saveReminderSettings({
          enabled: false,
          hour: targetTime.getHours(),
          minute: targetTime.getMinutes(),
          notificationId: null,
        });
        return;
      }

      setIsUpdatingReminder(true);
      isUpdatingReminderRef.current = true;
      const currentId = notificationIdRef.current;
      if (currentId) {
        const notifications = await getNotifications();
        if (notifications) {
          await notifications.cancelScheduledNotificationAsync(currentId);
        }
      }
      const newId = await scheduleReminder(targetTime);
      if (!newId) {
        setReminderEnabled(false);
        reminderEnabledRef.current = false;
        setNotificationId(null);
        notificationIdRef.current = null;
        await saveReminderSettings({
          enabled: false,
          hour: targetTime.getHours(),
          minute: targetTime.getMinutes(),
          notificationId: null,
        });
        setIsUpdatingReminder(false);
        isUpdatingReminderRef.current = false;
        return;
      }

      setNotificationId(newId);
      notificationIdRef.current = newId;
      await saveReminderSettings({
        enabled: true,
        hour: targetTime.getHours(),
        minute: targetTime.getMinutes(),
        notificationId: newId,
      });
      setIsUpdatingReminder(false);
      isUpdatingReminderRef.current = false;
    };

    await runUpdate(nextTime);

    while (pendingReminderTimeRef.current) {
      const pending = pendingReminderTimeRef.current;
      pendingReminderTimeRef.current = null;
      await runUpdate(pending);
    }
  }, []);

  const handleToggleReminder = async (value: boolean) => {
    if (isExpoGo) {
      Alert.alert(
        'Notifications unavailable in Expo Go',
        'Use a development build to enable reminders.'
      );
      return;
    }
    if (isUpdatingReminder) {
      return;
    }

    setIsUpdatingReminder(true);
    setReminderEnabled(value);
    if (!value) {
      if (notificationId) {
        const notifications = await getNotifications();
        if (notifications) {
          await notifications.cancelScheduledNotificationAsync(notificationId);
        }
      }
      setNotificationId(null);
      await saveReminderSettings({
        enabled: false,
        hour: reminderTime.getHours(),
        minute: reminderTime.getMinutes(),
        notificationId: null,
      });
      setIsUpdatingReminder(false);
      return;
    }

    const newId = await scheduleReminder(reminderTime);
    if (!newId) {
      setReminderEnabled(false);
      setNotificationId(null);
      await saveReminderSettings({
        enabled: false,
        hour: reminderTime.getHours(),
        minute: reminderTime.getMinutes(),
        notificationId: null,
      });
      setIsUpdatingReminder(false);
      return;
    }

    setNotificationId(newId);
    await saveReminderSettings({
      enabled: true,
      hour: reminderTime.getHours(),
      minute: reminderTime.getMinutes(),
      notificationId: newId,
    });
    setIsUpdatingReminder(false);

    if (pendingReminderTimeRef.current) {
      const pending = pendingReminderTimeRef.current;
      pendingReminderTimeRef.current = null;
      await applyReminderTime(pending);
    }
  };

  const handleTimeChange = async (_event: DateTimePickerEvent, selected?: Date) => {
    setShowTimePicker(false);
    if (!selected) {
      return;
    }

    const nextTime = new Date(reminderTime);
    nextTime.setHours(selected.getHours(), selected.getMinutes(), 0, 0);

    await applyReminderTime(nextTime);
  };

  const buildExportText = (entries: Awaited<ReturnType<typeof getEntries>>) => {
    return entries
      .map((entry) => {
        const dateLabel = new Date(entry.date).toLocaleDateString();
        const tags = entry.tags?.length ? entry.tags.join(', ') : 'None';
        return [
          `Date: ${dateLabel}`,
          `Mood: ${entry.mood}`,
          `Favorite: ${entry.favorite ? 'Yes' : 'No'}`,
          `Tags: ${tags}`,
          `Prompt: ${entry.prompt}`,
          '',
          entry.content,
        ].join('\n');
      })
      .join('\n\n---\n\n');
  };

  const exportEntries = async (format: 'json' | 'txt') => {
    if (isExporting) {
      return;
    }
    setIsExporting(true);

    try {
      const entries = await getEntries();
      if (entries.length === 0) {
        Alert.alert('Nothing to export', 'Add a journal entry before exporting.');
        return;
      }

      if (!documentDirectory) {
        Alert.alert('Export unavailable', 'File storage is not available on this device.');
        return;
      }

      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `dailyjournal-export-${stamp}.${format}`;
      const fileUri = `${documentDirectory}${fileName}`;
      const content = format === 'json' ? JSON.stringify(entries, null, 2) : buildExportText(entries);

      await writeAsStringAsync(fileUri, content, {
        encoding: EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Export saved', `File saved at ${fileUri}`);
      }
      } catch (error) {
        Alert.alert('Export failed', 'Unable to export entries right now.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearEntries = () => {
    if (isClearing) {
      return;
    }
    Alert.alert('Clear all entries?', 'This will permanently delete all journal entries.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          setIsClearing(true);
          try {
            await clearEntries();
            Alert.alert('Entries cleared', 'Your journal entries have been removed.');
          } catch (error) {
            Alert.alert('Clear failed', 'Unable to clear entries right now.');
          } finally {
            setIsClearing(false);
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.content, { opacity: fadeIn.opacity }]}>
          <ThemedView style={styles.titleRow}>
              <MaterialIcons name="settings" size={26} color="#000000" />
            <ThemedText type="title">Settings</ThemedText>
          </ThemedView>
          <ThemedText style={styles.subtitle}>Personalize your journal experience.</ThemedText>

          {/* Profile */}
          <ThemedView style={[styles.card, styles.cardShadow]}>
            <ThemedView style={styles.sectionHeader}>
              <MaterialIcons name="person" size={20} color="#000000" />
              <ThemedText type="subtitle">Profile</ThemedText>
            </ThemedView>
            <ThemedText style={styles.helperText}>Add a few details about yourself.</ThemedText>
            <ThemedView style={styles.profileRow}>
              <Pressable
                style={({ pressed }) => [avatarButtonStyle, pressed && styles.pressablePressed]}
                onPress={async () => {
                  await triggerHaptic();
                  handlePickAvatar();
                }}>
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={avatarImageStyle}
                    contentFit="cover"
                  />
                ) : (
                  <MaterialIcons name="person" size={40} color="#666666" />
                )}
              </Pressable>
              <ThemedText style={styles.profileHint}>Tap to choose a profile photo</ThemedText>
            </ThemedView>
            <TextInput
              style={[
                styles.input,
                focusedField === 'name' && { borderColor: '#000000' },
                { color: '#111827', fontSize: 16 * fontScale },
              ]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor="#A0A0A0"
              returnKeyType="done"
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
            />
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                focusedField === 'bio' && { borderColor: '#000000' },
                { color: '#111827', fontSize: 16 * fontScale },
              ]}
              value={bio}
              onChangeText={setBio}
              placeholder="Your journaling goal or bio"
              placeholderTextColor="#A0A0A0"
              multiline
              textAlignVertical="top"
              onFocus={() => setFocusedField('bio')}
              onBlur={() => setFocusedField(null)}
            />
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: '#000000' },
                pressed && styles.pressablePressed,
              ]}
              onPress={async () => {
                await triggerHaptic();
                handleSaveProfile();
              }}>
              <ThemedView style={styles.buttonRow}>
                <IconSymbol size={18} name="checkmark.circle.fill" color="#fff" />
                <ThemedText type="defaultSemiBold" style={styles.primaryButtonText}>
                  Save Profile
                </ThemedText>
              </ThemedView>
            </Pressable>
            {profileSaved ? (
              <ThemedView style={styles.successRow}>
                <IconSymbol size={18} name="checkmark.circle.fill" color="#22c55e" />
                <ThemedText style={styles.successText}>Profile saved</ThemedText>
              </ThemedView>
            ) : null}
          </ThemedView>

          <ThemedView style={styles.sectionDivider} />

          {/* Font size */}
          <ThemedView style={[styles.card, styles.cardShadow]}>
            <ThemedView style={styles.sectionHeader}>
              <MaterialIcons name="text-fields" size={20} color="#000000" />
              <ThemedText type="subtitle">Font Size</ThemedText>
            </ThemedView>
            <ThemedText style={styles.helperText}>
              Adjust text size for comfortable reading.
            </ThemedText>
            <ThemedView style={styles.fontRow}>
              {FONT_OPTIONS.map((option) => {
                const isSelected = fontPreference === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={({ pressed }) => [
                      styles.fontOption,
                      isSelected && styles.optionActive,
                      pressed && styles.pressablePressed,
                    ]}
                    onPress={async () => {
                      await triggerHaptic();
                      handleFontChange(option.value);
                    }}>
                    <ThemedView style={styles.optionRow}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={isSelected ? styles.fontOptionTextSelected : styles.fontOptionText}>
                        {option.label}
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                );
              })}
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.sectionDivider} />

          {/* Daily reminder */}
          <ThemedView style={[styles.card, styles.cardShadow]}>
            <ThemedView style={styles.sectionHeader}>
              <MaterialIcons name="notifications-active" size={20} color="#000000" />
              <ThemedText type="subtitle">Daily Reminder</ThemedText>
            </ThemedView>
            <ThemedText style={styles.helperText}>
              {isExpoGo
                ? 'Reminders require a development build (Expo Go does not support notifications).'
                : 'Set a daily time to get a gentle nudge to journal.'}
            </ThemedText>
            <View style={styles.reminderRow}>
              <ThemedText style={styles.reminderLabel}>
                {reminderTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
              </ThemedText>
              <Switch
                value={reminderEnabled}
                onValueChange={handleToggleReminder}
                disabled={isUpdatingReminder || isExpoGo}
                thumbColor={reminderEnabled ? tintColor : undefined}
                trackColor={{ false: '#E0E0E0', true: '#000000' }}
              />
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                styles.timeButton,
                pressed && styles.pressablePressed,
              ]}
              onPress={async () => {
                await triggerHaptic();
                setShowTimePicker(true);
              }}
              disabled={isUpdatingReminder || isExpoGo}>
              <ThemedView style={styles.buttonRow}>
                <IconSymbol size={16} name="clock.fill" color="#000000" />
                <ThemedText type="defaultSemiBold">Change time</ThemedText>
              </ThemedView>
            </Pressable>
            {showTimePicker ? (
              <DateTimePicker
                value={reminderTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={handleTimeChange}
              />
            ) : null}
          </ThemedView>

          <ThemedView style={styles.sectionDivider} />

          {/* Data & Privacy */}
          <ThemedView style={[styles.card, styles.cardShadow]}>
            <ThemedView style={styles.sectionHeader}>
              <MaterialIcons name="shield" size={20} color="#000000" />
              <ThemedText type="subtitle">Data &amp; Privacy</ThemedText>
            </ThemedView>
            <ThemedText style={styles.helperText}>
              Export your data or clear your journal from this device.
            </ThemedText>
            <ThemedView style={styles.exportRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  styles.exportButton,
                  pressed && styles.pressablePressed,
                ]}
                onPress={async () => {
                  await triggerHaptic();
                  exportEntries('txt');
                }}
                disabled={isExporting}>
                <ThemedView style={styles.buttonRow}>
                  <IconSymbol size={16} name="doc.text" color="#000000" />
                  <ThemedText type="defaultSemiBold">
                    {isExporting ? 'Exporting...' : 'Export as Text'}
                  </ThemedText>
                </ThemedView>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  styles.exportButton,
                  pressed && styles.pressablePressed,
                ]}
                onPress={async () => {
                  await triggerHaptic();
                  exportEntries('json');
                }}
                disabled={isExporting}>
                <ThemedView style={styles.buttonRow}>
                  <IconSymbol size={16} name="square.and.arrow.up" color="#000000" />
                  <ThemedText type="defaultSemiBold">
                    {isExporting ? 'Exporting...' : 'Export as JSON'}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </ThemedView>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                styles.clearButton,
                pressed && styles.pressablePressed,
              ]}
              onPress={async () => {
                await triggerHaptic();
                handleClearEntries();
              }}
              disabled={isClearing}>
              <ThemedView style={styles.buttonRow}>
                <IconSymbol size={16} name="trash" color="#000000" />
                <ThemedText type="defaultSemiBold">
                  {isClearing ? 'Clearing...' : 'Clear All Entries'}
                </ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>

          <ThemedView style={styles.sectionDivider} />

          {/* PIN lock */}
          <ThemedView style={[styles.card, styles.cardShadow]}>
            <ThemedView style={styles.sectionHeader}>
              <MaterialIcons name="lock" size={20} color="#000000" />
              <ThemedText type="subtitle">PIN Lock</ThemedText>
            </ThemedView>
            <ThemedText style={styles.helperText}>
              {hasPin ? 'PIN is enabled.' : 'Set a 4-digit PIN to protect your journal.'}
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                focusedField === 'pin' && { borderColor: '#000000' },
                { color: textColor, fontSize: 16 * fontScale },
              ]}
              value={pinInput}
              onChangeText={(text) => setPinInput(text.replace(/\D/g, '').slice(0, 4))}
              placeholder="Enter 4-digit PIN"
              placeholderTextColor="#A0A0A0"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              inputMode="numeric"
              onFocus={() => setFocusedField('pin')}
              onBlur={() => setFocusedField(null)}
            />
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: '#000000' },
                (isSaving || pinInput.length !== 4) && styles.buttonDisabled,
                pressed && styles.pressablePressed,
              ]}
              onPress={async () => {
                await triggerHaptic();
                handleSavePin();
              }}
              disabled={isSaving || pinInput.length !== 4}>
              <ThemedView style={styles.buttonRow}>
                <IconSymbol size={16} name="lock.fill" color="#fff" />
                <ThemedText type="defaultSemiBold" style={styles.primaryButtonText}>
                  {isSaving ? 'Saving...' : 'Save PIN'}
                </ThemedText>
              </ThemedView>
            </Pressable>
            {hasPin ? (
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  styles.clearButton,
                  pressed && styles.pressablePressed,
                ]}
                onPress={async () => {
                  await triggerHaptic();
                  handleClearPin();
                }}
                disabled={isSaving}>
                <ThemedView style={styles.buttonRow}>
                <IconSymbol size={16} name="trash" color="#000000" />
                  <ThemedText type="defaultSemiBold">Remove PIN</ThemedText>
                </ThemedView>
              </Pressable>
            ) : null}
          </ThemedView>

          <ThemedText style={styles.versionText}>Version {appVersion}</ThemedText>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  flex: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    gap: 24,
  },
  subtitle: {
    color: '#666666',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  card: {
    padding: 16,
    gap: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  profileRow: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  avatarButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatarImage: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  profileHint: {
    color: '#666666',
    textAlign: 'center',
  },
  themeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 120,
    alignItems: 'center',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  fontRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
  },
  fontOption: {
    width: 80,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionActive: {
    backgroundColor: '#000000',
    borderWidth: 0,
  },
  helperText: {
    color: '#666666',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  reminderLabel: {
    fontSize: 16,
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 96,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  exportRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exportButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 999,
    paddingHorizontal: 16,
    flexGrow: 1,
    minWidth: 150,
  },
  clearButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 999,
    marginTop: 8,
    paddingHorizontal: 16,
    width: '100%',
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successText: {
    color: '#22c55e',
  },
  pressablePressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 999,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#000000',
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#000000',
  },
  versionText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666666',
  },
  fontOptionText: {
    color: '#000000',
  },
  fontOptionTextSelected: {
    color: '#FFFFFF',
  },
});
