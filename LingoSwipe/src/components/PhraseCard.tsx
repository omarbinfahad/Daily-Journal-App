import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Phrase } from '../types';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.6;

interface PhraseCardProps {
  phrase: Phrase;
}

export default function PhraseCard({ phrase }: PhraseCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.mainPhrase}>{phrase.phrase}</Text>
        <Text style={styles.pronunciation}>{phrase.pronunciation}</Text>

        <View style={styles.translationContainer}>
          <Text style={styles.translationLabel}>Spanish:</Text>
          <Text style={styles.translation}>{phrase.translation}</Text>
        </View>

        {phrase.context && (
          <View style={styles.contextContainer}>
            <Text style={styles.contextLabel}>Usage:</Text>
            <Text style={styles.context}>{phrase.context}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: width - 40,
    height: CARD_HEIGHT,
    backgroundColor: Colors.cardBackground,
    borderRadius: 24,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainPhrase: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  pronunciation: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  translationContainer: {
    width: '100%',
    marginBottom: 24,
  },
  translationLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  translation: {
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  contextContainer: {
    width: '100%',
    marginTop: 16,
  },
  contextLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  context: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});
