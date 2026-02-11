import React from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { cacheService } from '../services/cacheService';
import { firebaseService } from '../services/firebaseService';
import { useAppStore } from '../stores/useAppStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { selectedLanguage, selectedLevel, userProgress, setLanguage, setLevel } = useAppStore();

  const handleLanguageChange = () => {
    Alert.alert('Change Language', 'Choose your learning language', [
      { text: 'Spanish', onPress: () => setLanguage('spanish') },
      { text: 'French', onPress: () => setLanguage('french') },
      { text: 'German', onPress: () => setLanguage('german') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleLevelChange = () => {
    Alert.alert('Change Level', 'Adjust your learning level', [
      { text: 'Beginner', onPress: () => setLevel('beginner') },
      { text: 'Intermediate', onPress: () => setLevel('intermediate') },
      { text: 'Advanced', onPress: () => setLevel('advanced') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'This removes downloaded lessons and temporary data.', [
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await cacheService.clearCache();
          Alert.alert('Success', 'Cache cleared successfully.');
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await firebaseService.signOutUser();
          } catch (error) {
            Alert.alert('Sign out failed', 'Please try again.');
            console.error('Sign out error:', error);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={Colors.textOnDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.statsCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={48} color={Colors.accentTeal} />
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{userProgress.streakDays}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{userProgress.wordsLearned.length}</Text>
                <Text style={styles.statLabel}>Words</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{userProgress.favorites.length}</Text>
                <Text style={styles.statLabel}>Favorites</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learning</Text>

            <TouchableOpacity style={styles.settingItem} onPress={handleLanguageChange}>
              <View style={styles.settingLeft}>
                <Ionicons name="language" size={24} color={Colors.accentTeal} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Language</Text>
                  <Text style={styles.settingValue}>
                    {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.textGray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleLevelChange}>
              <View style={styles.settingLeft}>
                <Ionicons name="bar-chart" size={24} color={Colors.accentTeal} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Level</Text>
                  <Text style={styles.settingValue}>
                    {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.textGray} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App</Text>

            <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
              <View style={styles.settingLeft}>
                <Ionicons name="trash-outline" size={24} color={Colors.accentTeal} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Clear Cache</Text>
                  <Text style={styles.settingSubtext}>Free up storage space</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.textGray} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle-outline" size={24} color={Colors.accentTeal} />
                <Text style={styles.inlineLabel}>Version</Text>
              </View>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
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
  statsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(74, 155, 142, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textOnDark,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  inlineLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 16,
  },
  settingValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  signOutButton: {
    marginTop: 8,
    backgroundColor: '#C0392B',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
