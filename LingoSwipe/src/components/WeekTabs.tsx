import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface WeekTabsProps {
  selectedWeek: number;
  onWeekChange: (week: number) => void;
}

const weeks = [
  { number: 1, label: '1 week' },
  { number: 2, label: '2 weeks' },
  { number: 3, label: '1 month' },
];

export default function WeekTabs({ selectedWeek, onWeekChange }: WeekTabsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {weeks.map((week) => (
        <TouchableOpacity
          key={week.number}
          style={styles.tab}
          onPress={() => onWeekChange(week.number)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, selectedWeek === week.number && styles.tabTextActive]}>{week.label}</Text>
          {selectedWeek === week.number && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 32,
  },
  tab: {
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textGray,
  },
  tabTextActive: {
    color: Colors.textOnDark,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.textOnDark,
    borderRadius: 2,
  },
});
