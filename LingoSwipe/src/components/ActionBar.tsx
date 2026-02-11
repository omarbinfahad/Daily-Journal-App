import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface ActionBarProps {
  onPlayAudio: () => void;
  onRecord: () => void;
  onToggleFavorite: () => void;
  isFavorited: boolean;
  isLoadingAudio?: boolean;
}

export default function ActionBar({
  onPlayAudio,
  onRecord,
  onToggleFavorite,
  isFavorited,
  isLoadingAudio = false,
}: ActionBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPlayAudio} disabled={isLoadingAudio}>
        {isLoadingAudio ? (
          <ActivityIndicator size="small" color={Colors.textOnDark} />
        ) : (
          <Ionicons name="volume-high" size={28} color={Colors.textOnDark} />
        )}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.centerButton]} onPress={onRecord}>
        <Ionicons name="mic" size={32} color={Colors.textOnDark} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onToggleFavorite}>
        <Ionicons
          name={isFavorited ? 'star' : 'star-outline'}
          size={28}
          color={isFavorited ? '#FFD700' : Colors.textOnDark}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accentTeal,
  },
});
