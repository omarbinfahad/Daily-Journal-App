import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import { Animated, Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useFadeIn } from '@/hooks/use-fade-in';
import { useFontScale } from '@/hooks/use-font-scale';
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
  const fontScale = useFontScale();
  const fadeIn = useFadeIn();
  const triggerHaptic = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // no-op
    }
  }, []);

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
      <Animated.View style={{ opacity: fadeIn.opacity }}>
        <ThemedText type="title">Enter PIN</ThemedText>
        <ThemedText style={styles.subtitle}>
          Please enter your 4-digit PIN to unlock your journal.
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              color: '#000000',
              borderColor: '#E0E0E0',
              fontSize: 22 * fontScale,
              letterSpacing: 8 * fontScale,
            },
          ]}
          value={value}
          onChangeText={(text) => {
            const digitsOnly = text.replace(/\D/g, '').slice(0, 4);
            setValue(digitsOnly);
            if (error) {
              setError('');
            }
          }}
          placeholder="••••"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          textAlign="center"
          inputMode="numeric"
        />
        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: '#000000' },
            pressed && styles.pressablePressed,
          ]}
          onPress={async () => {
            await triggerHaptic();
            handleSubmit();
          }}
          disabled={value.length < 4}>
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            Unlock
          </ThemedText>
        </Pressable>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  subtitle: {
    color: '#666666',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    fontSize: 22,
    letterSpacing: 8,
    minHeight: 44,
    backgroundColor: '#FFFFFF',
  },
  error: {
    color: '#d14343',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    opacity: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  pressablePressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});
