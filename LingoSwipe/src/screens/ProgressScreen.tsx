import React from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAppStore } from '../stores/useAppStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Progress'>;
const { width } = Dimensions.get('window');

export default function ProgressScreen({ navigation }: Props) {
  const { userProgress } = useAppStore();

  const totalWordsLearned = userProgress.wordsLearned.length;
  const totalPhrasesLearned = userProgress.phrasesLearned.length;
  const totalLessonsCompleted = userProgress.completedLessons.length;
  const currentStreak = userProgress.streakDays;

  const weeklyData = [
    { day: 'Mon', cards: 12 },
    { day: 'Tue', cards: 15 },
    { day: 'Wed', cards: 8 },
    { day: 'Thu', cards: 20 },
    { day: 'Fri', cards: 18 },
    { day: 'Sat', cards: 10 },
    { day: 'Sun', cards: 14 },
  ];

  const maxCards = Math.max(...weeklyData.map((d) => d.cards));
  const todayGoalProgress = Math.min(100, (totalWordsLearned / Math.max(userProgress.dailyGoal, 1)) * 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={Colors.textOnDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Progress</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.streakCard}>
            <View style={styles.streakIcon}>
              <Ionicons name="flame" size={48} color="#FF6B35" />
            </View>
            <View style={styles.streakContent}>
              <Text style={styles.streakNumber}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
              <Text style={styles.streakSubtext}>Keep it up! 🎉</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="book-outline" size={32} color={Colors.accentTeal} />
              <Text style={styles.statNumber}>{totalWordsLearned}</Text>
              <Text style={styles.statLabel}>Words Learned</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="chatbox-outline" size={32} color={Colors.accentTeal} />
              <Text style={styles.statNumber}>{totalPhrasesLearned}</Text>
              <Text style={styles.statLabel}>Phrases Learned</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle-outline" size={32} color={Colors.accentTeal} />
              <Text style={styles.statNumber}>{totalLessonsCompleted}</Text>
              <Text style={styles.statLabel}>Lessons Done</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="star-outline" size={32} color={Colors.accentTeal} />
              <Text style={styles.statNumber}>{userProgress.favorites.length}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.chartContainer}>
              <View style={styles.chart}>
                {weeklyData.map((item) => (
                  <View key={item.day} style={styles.chartColumn}>
                    <View style={styles.barContainer}>
                      <View style={[styles.bar, { height: `${(item.cards / maxCards) * 100}%` }]} />
                    </View>
                    <Text style={styles.barLabel}>{item.day}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.chartCaption}>Cards learned per day</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Goal</Text>
            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalText}>{userProgress.dailyGoal} cards per day</Text>
                <Ionicons name="trophy-outline" size={24} color={Colors.accentTeal} />
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${todayGoalProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {totalWordsLearned} / {userProgress.dailyGoal} completed today
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textOnDark,
  },
  content: {
    padding: 20,
  },
  streakCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    gap: 20,
  },
  streakIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakContent: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    lineHeight: 52,
  },
  streakLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  streakSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textOnDark,
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    marginBottom: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  barContainer: {
    flex: 1,
    width: '70%',
    justifyContent: 'flex-end',
  },
  bar: {
    backgroundColor: Colors.accentTeal,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chartCaption: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  goalCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accentTeal,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bottomSpacing: {
    height: 40,
  },
});
