import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

type PinLockProps = {
  pin: string;
  onUnlock: () => void;
};

export default function PinLock({ pin, onUnlock }: PinLockProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  const handleSubmit = () => {
    if (value === pin) {
      setError('');
      setValue('');
      onUnlock();
      return;
    }

    setError('Incorrect PIN. Try again.');
    setValue('');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Enter PIN</ThemedText>
      <ThemedText style={styles.subtitle}>
        Please enter your 4-digit PIN to unlock your journal.
      </ThemedText>
      <TextInput
        style={[styles.input, { color: textColor, borderColor: tintColor }]}
        value={value}
        onChangeText={(text) => {
          const digitsOnly = text.replace(/\D/g, '').slice(0, 4);
          setValue(digitsOnly);
          if (error) {
            setError('');
          }
        }}
        placeholder="••••"
        placeholderTextColor="rgba(120,120,120,0.6)"
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        textAlign="center"
        inputMode="numeric"
      />
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      <Pressable
        style={[styles.button, { backgroundColor: tintColor }]}
        onPress={handleSubmit}
        disabled={value.length < 4}>
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>
          Unlock
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
    justifyContent: 'center',
  },
  subtitle: {
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    fontSize: 22,
    letterSpacing: 8,
  },
  error: {
    color: '#d14343',
  },
  button: {
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    opacity: 1,
  },
  buttonText: {
    color: '#fff',
  },
});
