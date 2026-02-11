import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import LessonCard from '../components/LessonCard';
import OfflineIndicator from '../components/OfflineIndicator';
import { Colors } from '../constants/Colors';
import { FULL_CURRICULUM } from '../data/curriculumStructure';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAppStore } from '../stores/useAppStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const { userProgress, lessons, selectedLanguage, loadLessons, initializeLessons, isLoading } = useAppStore();

  useEffect(() => {
    if (selectedLanguage) {
      if (lessons.length === 0) {
        void initializeLessons(selectedLanguage);
      } else {
        void loadLessons(selectedLanguage);
      }
    }
  }, [initializeLessons, lessons.length, loadLessons, selectedLanguage]);

  const totalMonths = Math.max(Math.ceil((Math.max(...FULL_CURRICULUM.map((l) => l.weekNumber), 1) || 1) / 4), 1);
  const getUnlockedMonths = (): number => {
    const unlockedWeeks = lessons.filter((lesson) => !lesson.isLocked).map((lesson) => lesson.weekNumber);
    const maxUnlockedWeek = Math.max(...unlockedWeeks, 1);
    return Math.ceil(maxUnlockedWeek / 4);
  };
  const unlockedMonths = getUnlockedMonths();
  const weeksInMonth = Array.from({ length: 4 }, (_, i) => (selectedMonth - 1) * 4 + i + 1);

  useEffect(() => {
    setSelectedWeek(weeksInMonth[0]);
  }, [selectedMonth]);

  const filteredLessons = lessons.filter((lesson) => lesson.weekNumber === selectedWeek);

  const handleLessonPress = (lessonId: string, isLocked: boolean) => {
    if (!isLocked) {
      navigation.navigate('Lesson', { lessonId });
    }
  };

  if (isLoading && lessons.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.loaderContainer]}>
          <ActivityIndicator size="large" color={Colors.accentTeal} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <OfflineIndicator />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="menu" size={28} color={Colors.textOnDark} />
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <View style={styles.streakContainer}>
              <Ionicons name="flame" size={20} color="#FF6B35" />
              <Text style={styles.streakText}>{userProgress.streakDays}</Text>
            </View>

            <TouchableOpacity>
              <Ionicons name="search" size={28} color={Colors.textOnDark} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={28} color={Colors.textOnDark} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthTabs}>
          {Array.from({ length: totalMonths }, (_, i) => i + 1).map((month) => (
            <TouchableOpacity
              key={month}
              style={[
                styles.monthTab,
                selectedMonth === month && styles.monthTabActive,
                month > unlockedMonths && styles.monthTabLocked,
              ]}
              onPress={() => {
                if (month <= unlockedMonths) {
                  setSelectedMonth(month);
                }
              }}
              disabled={month > unlockedMonths}
            >
              <Text
                style={[
                  styles.monthTabText,
                  selectedMonth === month && styles.monthTabTextActive,
                  month > unlockedMonths && styles.monthTabTextLocked,
                ]}
              >
                Month {month}
              </Text>
              {month > unlockedMonths ? <Ionicons name="lock-closed" size={14} color={Colors.textGray} /> : null}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekTabs}>
          {weeksInMonth.map((week) => {
            const weekLessons = lessons.filter((lesson) => lesson.weekNumber === week);
            const isUnlocked = weekLessons.some((lesson) => !lesson.isLocked);

            return (
              <TouchableOpacity
                key={week}
                style={styles.weekTab}
                onPress={() => {
                  if (isUnlocked) {
                    setSelectedWeek(week);
                  }
                }}
                disabled={!isUnlocked}
              >
                <Text
                  style={[
                    styles.weekTabText,
                    selectedWeek === week && styles.weekTabTextActive,
                    !isUnlocked && styles.weekTabTextLocked,
                  ]}
                >
                  Week {week}
                </Text>
                {selectedWeek === week ? <View style={styles.weekActiveIndicator} /> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.progressSummary}>
          <Text style={styles.progressText}>
            Month {selectedMonth} - Week {selectedWeek}
          </Text>
          <Text style={styles.progressSubtext}>
            {filteredLessons.filter((lesson) => !lesson.isLocked).length} of {filteredLessons.length} lessons available
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.lessonsContainer}
          showsVerticalScrollIndicator={false}
        >
          {filteredLessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onPress={() => handleLessonPress(lesson.id, lesson.isLocked)}
            />
          ))}

          <View style={styles.bottomSpacing} />
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home" size={24} color={Colors.textOnDark} />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Favorites')}>
            <Ionicons name="star-outline" size={24} color={Colors.textGray} />
            <Text style={[styles.navText, styles.navTextInactive]}>Favorites</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Progress')}>
            <Ionicons name="stats-chart-outline" size={24} color={Colors.textGray} />
            <Text style={[styles.navText, styles.navTextInactive]}>Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-outline" size={24} color={Colors.textGray} />
            <Text style={[styles.navText, styles.navTextInactive]}>Profile</Text>
          </TouchableOpacity>
        </View>
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
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    marginRight: 12,
  },
  streakText: {
    color: Colors.textOnDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  monthTabs: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  monthTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  monthTabActive: {
    backgroundColor: Colors.accentTeal,
  },
  monthTabLocked: {
    opacity: 0.4,
  },
  monthTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textGray,
  },
  monthTabTextActive: {
    color: Colors.textOnDark,
  },
  monthTabTextLocked: {
    color: Colors.textGray,
  },
  weekTabs: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 20,
  },
  weekTab: {
    paddingBottom: 8,
  },
  weekTabText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textGray,
  },
  weekTabTextActive: {
    color: Colors.textOnDark,
  },
  weekTabTextLocked: {
    color: Colors.textGray,
    opacity: 0.5,
  },
  weekActiveIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.textOnDark,
  },
  progressSummary: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textOnDark,
  },
  progressSubtext: {
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  lessonsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  bottomSpacing: {
    height: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.darkBackground,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 12,
    color: Colors.textOnDark,
    fontWeight: '500',
  },
  navTextInactive: {
    color: Colors.textGray,
  },
});
