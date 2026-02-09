import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { clearPin, getPin, setPin } from '@/lib/pin-storage';

export default function SettingsScreen() {
  const [pinInput, setPinInput] = useState('');
  const [hasPin, setHasPin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    const loadPin = async () => {
      const stored = await getPin();
      setHasPin(Boolean(stored));
    };
    loadPin();
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

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleRow}>
        <IconSymbol size={28} name="gearshape.fill" color={tintColor} />
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>
      <ThemedText style={styles.subtitle}>Personalize your journal experience.</ThemedText>
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">PIN Lock</ThemedText>
        <ThemedText style={styles.helperText}>
          {hasPin ? 'PIN is enabled.' : 'Set a 4-digit PIN to protect your journal.'}
        </ThemedText>
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={pinInput}
          onChangeText={(text) => setPinInput(text.replace(/\D/g, '').slice(0, 4))}
          placeholder="Enter 4-digit PIN"
          placeholderTextColor="rgba(120,120,120,0.6)"
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          inputMode="numeric"
        />
        <Pressable
          style={[
            styles.primaryButton,
            { backgroundColor: tintColor },
            (isSaving || pinInput.length !== 4) && styles.buttonDisabled,
          ]}
          onPress={handleSavePin}
          disabled={isSaving || pinInput.length !== 4}>
          <ThemedText type="defaultSemiBold" style={styles.primaryButtonText}>
            {isSaving ? 'Saving...' : 'Save PIN'}
          </ThemedText>
        </Pressable>
        {hasPin ? (
          <Pressable style={styles.secondaryButton} onPress={handleClearPin} disabled={isSaving}>
            <ThemedText type="defaultSemiBold">Remove PIN</ThemedText>
          </Pressable>
        ) : null}
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
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.2)',
    gap: 8,
  },
  helperText: {
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.25)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  primaryButton: {
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
