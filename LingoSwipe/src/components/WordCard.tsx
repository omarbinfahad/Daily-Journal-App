import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Word } from '../types';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.6;

interface WordCardProps {
  word: Word;
}

export default function WordCard({ word }: WordCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badge}>{word.partOfSpeech}</Text>
        </View>

        <Text style={styles.mainWord}>{word.word}</Text>
        <Text style={styles.pronunciation}>{word.pronunciation}</Text>

        <View style={styles.translationContainer}>
          <Text style={styles.translationLabel}>Spanish:</Text>
          <Text style={styles.translationValue}>{word.translation}</Text>
        </View>

        <Text style={styles.definition}>{word.definition}</Text>

        {word.synonyms.length > 0 && (
          <View style={styles.synonymsContainer}>
            <Text style={styles.synonymsLabel}>synonyms:</Text>
            <View style={styles.synonymsChips}>
              {word.synonyms.map((synonym, index) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{synonym}</Text>
                </View>
              ))}
            </View>
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
  badgeContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  badge: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  mainWord: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  pronunciation: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  definition: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
    marginBottom: 20,
  },
  translationContainer: {
    width: '100%',
    marginTop: 8,
  },
  translationLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  translationValue: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  synonymsContainer: {
    width: '100%',
    marginTop: 16,
  },
  synonymsLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  synonymsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(74, 155, 142, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
});
