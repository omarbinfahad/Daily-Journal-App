import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ActionBar from '../components/ActionBar';
import PhraseCard from '../components/PhraseCard';
import WordCard from '../components/WordCard';
import { Colors } from '../constants/Colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAppStore } from '../stores/useAppStore';
import { audioPlayer } from '../utils/audioPlayer';
import { Card } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Lesson'>;
const { height } = Dimensions.get('window');

export default function LessonScreen({ navigation, route }: Props) {
  const { lessonId } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const flatListRef = useRef<FlatList<Card>>(null);
  const currentIndexRef = useRef(0);
  const lessonIdRef = useRef(lessonId);

  const { userProgress, addFavorite, removeFavorite, completeCard, currentLesson, selectedLanguage, loadLessonCards, isLoading } =
    useAppStore();
  const completeCardRef = useRef(completeCard);

  useEffect(() => {
    void loadLessonCards(selectedLanguage, lessonId);
  }, [lessonId, selectedLanguage, loadLessonCards]);

  useEffect(() => {
    setCurrentIndex(0);
    currentIndexRef.current = 0;
  }, [lessonId]);

  useEffect(() => {
    lessonIdRef.current = lessonId;
  }, [lessonId]);

  useEffect(() => {
    completeCardRef.current = completeCard;
  }, [completeCard]);

  const cards = currentLesson?.cards ?? [];
  const currentCard = cards[currentIndex];
  const currentCardId = currentCard?.data.id ?? '';
  const isFavorited = currentCardId ? userProgress.favorites.includes(currentCardId) : false;

  useEffect(() => {
    return () => {
      void audioPlayer.cleanup();
    };
  }, []);

  useEffect(() => {
    if (!cards || currentIndex >= cards.length - 1) return;
    const nextCard = cards[currentIndex + 1];
    if (!nextCard?.data?.audioUrl) return;
    void audioPlayer.preloadSound(nextCard.data.audioUrl);
  }, [cards, currentIndex]);

  const handlePlayAudio = async () => {
    if (!currentCard) return;

    try {
      setIsLoadingAudio(true);
      await audioPlayer.playSound(currentCard.data.audioUrl);
    } catch (error) {
      Alert.alert('Audio Error', 'Failed to play audio. Please check your internet connection.', [{ text: 'OK' }]);
      console.error('Audio playback error:', error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleRecord = () => {
    Alert.alert('Coming Soon', 'Voice recording feature will be available in the next update!', [{ text: 'OK' }]);
  };

  const handleToggleFavorite = () => {
    if (!currentCardId) return;
    if (isFavorited) {
      removeFavorite(currentCardId);
    } else {
      addFavorite(currentCardId);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      const newIndex = viewableItems[0].index;
      const prevIndex = currentIndexRef.current;

      setCurrentIndex(newIndex);
      currentIndexRef.current = newIndex;
      void audioPlayer.stopSound();
      setIsLoadingAudio(false);

      if (newIndex > prevIndex) {
        completeCardRef.current(lessonIdRef.current);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderCard = ({ item }: { item: Card }) => {
    return (
      <View style={styles.cardPage}>
        {item.type === 'word' ? <WordCard word={item.data} /> : <PhraseCard phrase={item.data} />}
      </View>
    );
  };

  if (isLoading || !currentLesson) {
    return (
      <View style={[styles.container, styles.loaderContainer]}>
        <ActivityIndicator size="large" color={Colors.accentTeal} />
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={[styles.container, styles.loaderContainer]}>
        <Text style={styles.emptyTitle}>No lesson content yet</Text>
        <Text style={styles.emptySubtitle}>Please go back and open this lesson again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={Colors.textOnDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentLesson.title}</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={28} color={Colors.textOnDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        <FlatList
          ref={flatListRef}
          data={cards}
          renderItem={renderCard}
          keyExtractor={(item, index) => `${item.type}-${item.data.id}-${index}`}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={height}
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: height,
            offset: height * index,
            index,
          })}
        />
      </View>

      <ActionBar
        onPlayAudio={handlePlayAudio}
        onRecord={handleRecord}
        onToggleFavorite={handleToggleFavorite}
        isFavorited={isFavorited}
        isLoadingAudio={isLoadingAudio}
      />

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {cards.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 18,
    color: Colors.textOnDark,
    fontWeight: '500',
  },
  cardsContainer: {
    flex: 1,
  },
  cardPage: {
    height,
    justifyContent: 'center',
  },
  progressContainer: {
    position: 'absolute',
    top: 120,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressText: {
    color: Colors.textOnDark,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyTitle: {
    color: Colors.textOnDark,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: Colors.textGray,
    fontSize: 14,
  },
});
