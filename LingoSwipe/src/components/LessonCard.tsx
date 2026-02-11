import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Lesson } from '../types';

const { width } = Dimensions.get('window');

interface LessonCardProps {
  lesson: Lesson;
  onPress: () => void;
}

export default function LessonCard({ lesson, onPress }: LessonCardProps) {
  const formatStats = () => {
    const stats: string[] = [];

    if (lesson.phrasesCount > 0) {
      stats.push(`${lesson.phrasesCount} phrases`);
    }

    if (lesson.wordsCount > 0) {
      stats.push(`${lesson.wordsCount} new words`);
    }

    if (lesson.title === 'listening') {
      return `${lesson.phrasesCount} podcasts / 1h 33 min`;
    }

    return stats.join(' / ');
  };

  const progressText = lesson.completedCards > 0 ? `${lesson.completedCards}/${lesson.totalCards}` : null;

  return (
    <TouchableOpacity
      style={[styles.container, lesson.isLocked && styles.containerLocked]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={lesson.isLocked}
    >
      <View style={styles.content}>
        {progressText && (
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>{progressText}</Text>
          </View>
        )}

        <Text style={styles.description}>{lesson.description}</Text>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.stats}>{formatStats()}</Text>

        <View style={styles.actionContainer}>
          {lesson.isLocked ? (
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={20} color={Colors.textSecondary} />
            </View>
          ) : (
            <TouchableOpacity style={styles.arrowButton} onPress={onPress}>
              <Ionicons name="arrow-forward" size={24} color={Colors.textOnDark} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    minHeight: 140,
  },
  containerLocked: {
    opacity: 0.6,
  },
  content: {
    position: 'relative',
  },
  progressBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  stats: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  actionContainer: {
    alignItems: 'flex-end',
  },
  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
