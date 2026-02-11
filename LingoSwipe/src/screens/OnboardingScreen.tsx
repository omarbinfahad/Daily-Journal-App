import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '../constants/Colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAppStore } from '../stores/useAppStore';
import { setOnboardingCompleted } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const languages = [
  { id: 'spanish', name: 'Spanish', flag: '🇪🇸' },
  { id: 'french', name: 'French', flag: '🇫🇷' },
  { id: 'german', name: 'German', flag: '🇩🇪' },
  { id: 'italian', name: 'Italian', flag: '🇮🇹' },
  { id: 'portuguese', name: 'Portuguese', flag: '🇵🇹' },
  { id: 'japanese', name: 'Japanese', flag: '🇯🇵' },
];

const levels = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Just starting out',
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Know some basics',
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Looking to improve',
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const { setLanguage, setLevel } = useAppStore();

  const handleContinue = async () => {
    if (step === 1 && selectedLanguage) {
      setStep(2);
    } else if (step === 2 && selectedLevel) {
      setLanguage(selectedLanguage);
      setLevel(selectedLevel);
      await setOnboardingCompleted();
      navigation.replace('Home');
    }
  };

  const canContinue = step === 1 ? selectedLanguage : selectedLevel;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
          <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step === 1 ? (
            <>
              <Text style={styles.title}>Choose your language</Text>
              <Text style={styles.subtitle}>Which language do you want to learn?</Text>

              <View style={styles.optionsContainer}>
                {languages.map((language) => (
                  <TouchableOpacity
                    key={language.id}
                    style={[styles.optionCard, selectedLanguage === language.id && styles.optionCardSelected]}
                    onPress={() => setSelectedLanguage(language.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.flag}>{language.flag}</Text>
                    <Text style={styles.optionText}>{language.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>Choose your level</Text>
              <Text style={styles.subtitle}>What&apos;s your current level?</Text>

              <View style={styles.optionsContainer}>
                {levels.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    style={[styles.levelCard, selectedLevel === level.id && styles.levelCardSelected]}
                    onPress={() => setSelectedLevel(level.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.levelName}>{level.name}</Text>
                    <Text style={styles.levelDescription}>{level.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.bottomContainer}>
          {step === 2 && (
            <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!canContinue}
          >
            <Text style={styles.continueButtonText}>{step === 1 ? 'Continue' : 'Get Started'}</Text>
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textGray,
  },
  progressDotActive: {
    backgroundColor: Colors.accentTeal,
    width: 24,
  },
  content: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textOnDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textGray,
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  optionCardSelected: {
    backgroundColor: 'rgba(74, 155, 142, 0.1)',
    borderColor: Colors.accentTeal,
  },
  flag: {
    fontSize: 32,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textOnDark,
  },
  levelCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 16,
    padding: 24,
  },
  levelCardSelected: {
    backgroundColor: 'rgba(74, 155, 142, 0.1)',
    borderColor: Colors.accentTeal,
  },
  levelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textOnDark,
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
    color: Colors.textGray,
  },
  bottomContainer: {
    padding: 24,
    gap: 12,
  },
  backButton: {
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textGray,
  },
  continueButton: {
    backgroundColor: Colors.accentTeal,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textOnDark,
  },
});
