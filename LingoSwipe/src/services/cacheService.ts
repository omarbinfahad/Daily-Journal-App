import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Lesson, UserProgress } from '../types';

const CACHE_KEYS = {
  LESSONS: 'cached_lessons_',
  LESSON_CARDS: 'cached_lesson_cards_',
  USER_PROGRESS: 'cached_user_progress',
  LAST_SYNC: 'last_sync_time',
};

class CacheService {
  async cacheLessons(languageId: string, lessons: Lesson[]): Promise<void> {
    try {
      const key = `${CACHE_KEYS.LESSONS}${languageId}`;
      await AsyncStorage.setItem(key, JSON.stringify(lessons));
    } catch (error) {
      console.error('Error caching lessons:', error);
    }
  }

  async getCachedLessons(languageId: string): Promise<Lesson[] | null> {
    try {
      const key = `${CACHE_KEYS.LESSONS}${languageId}`;
      const cached = await AsyncStorage.getItem(key);
      return cached ? (JSON.parse(cached) as Lesson[]) : null;
    } catch (error) {
      console.error('Error getting cached lessons:', error);
      return null;
    }
  }

  async cacheLessonCards(languageId: string, lessonId: string, cards: Card[]): Promise<void> {
    try {
      const key = `${CACHE_KEYS.LESSON_CARDS}${languageId}_${lessonId}`;
      await AsyncStorage.setItem(key, JSON.stringify(cards));
    } catch (error) {
      console.error('Error caching lesson cards:', error);
    }
  }

  async getCachedLessonCards(languageId: string, lessonId: string): Promise<Card[] | null> {
    try {
      const key = `${CACHE_KEYS.LESSON_CARDS}${languageId}_${lessonId}`;
      const cached = await AsyncStorage.getItem(key);
      return cached ? (JSON.parse(cached) as Card[]) : null;
    } catch (error) {
      console.error('Error getting cached lesson cards:', error);
      return null;
    }
  }

  async cacheUserProgress(progress: UserProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.USER_PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Error caching user progress:', error);
    }
  }

  async getCachedUserProgress(): Promise<UserProgress | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.USER_PROGRESS);
      return cached ? (JSON.parse(cached) as UserProgress) : null;
    } catch (error) {
      console.error('Error getting cached user progress:', error);
      return null;
    }
  }

  async setLastSyncTime(): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('Error setting last sync time:', error);
    }
  }

  async getLastSyncTime(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith('cached_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export const cacheService = new CacheService();
