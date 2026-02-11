import { create } from 'zustand';
import { Card, Lesson, UserProgress } from '../types';
import { contentGenerator } from '../data/contentGenerator';
import { mockLesson, mockLessons } from '../data/mockData';
import { cacheService } from '../services/cacheService';
import { firebaseService } from '../services/firebaseService';
import { LessonProgress, progressionService } from '../services/progressionService';

interface AppState {
  // User data
  userId: string | null;
  selectedLanguage: string;
  selectedLevel: string;
  userProgress: UserProgress;

  // Lessons
  lessons: Lesson[];
  currentLesson: Lesson | null;
  lessonProgress: LessonProgress[];
  isLoading: boolean;
  isOnline: boolean;

  // Actions
  setUserId: (userId: string | null) => void;
  setLanguage: (language: string) => void;
  setLevel: (level: string) => void;
  setIsOnline: (isOnline: boolean) => void;
  initializeLessons: (languageId: string) => Promise<void>;
  loadLessons: (languageId: string, forceRefresh?: boolean) => Promise<void>;
  loadLessonCards: (languageId: string, lessonId: string, forceRefresh?: boolean) => Promise<void>;
  loadUserProgress: (userId: string) => Promise<void>;
  addFavorite: (cardId: string) => void;
  removeFavorite: (cardId: string) => void;
  updateStreak: () => void;
  markCardComplete: (cardId: string) => void;
  completeCard: (lessonId: string) => void;
  checkAndUnlockLessons: () => void;
  getLessonProgress: (lessonId: string) => LessonProgress | undefined;
  setLessons: (lessons: Lesson[]) => void;
  setCurrentLesson: (lesson: Lesson) => void;
  syncProgress: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  userId: null,
  selectedLanguage: 'spanish',
  selectedLevel: 'beginner',
  userProgress: {
    streakDays: 5,
    lastActiveDate: new Date().toISOString(),
    wordsLearned: [],
    phrasesLearned: [],
    favorites: [],
    dailyGoal: 20,
    completedLessons: [],
  },
  lessons: [],
  currentLesson: null,
  lessonProgress: [],
  isLoading: false,
  isOnline: true,

  setUserId: (userId) => set({ userId }),

  setLanguage: (language) => set({ selectedLanguage: language }),
  setLevel: (level) => set({ selectedLevel: level }),
  setIsOnline: (isOnline) => set({ isOnline }),

  initializeLessons: async (languageId) => {
    set({ isLoading: true });
    try {
      const lessonStructure = progressionService.createLessonStructure(languageId);

      const firstLesson = lessonStructure[0];
      const words = await contentGenerator.generateWords(firstLesson.wordsCount, firstLesson.level, languageId);
      const phrases = await contentGenerator.generatePhrases(firstLesson.phrasesCount, firstLesson.level, languageId);
      const cards: Card[] = contentGenerator.combineAsCards(words, phrases);

      firstLesson.cards = cards;
      firstLesson.totalCards = cards.length;

      await cacheService.cacheLessons(languageId, lessonStructure);
      set({ lessons: lessonStructure, isLoading: false });
    } catch (error) {
      console.error('Error initializing lessons:', error);
      set({ lessons: mockLessons, isLoading: false });
    }
  },

  loadLessons: async (languageId, forceRefresh = false) => {
    set({ isLoading: true });

    try {
      if (!forceRefresh) {
        const cachedLessons = await cacheService.getCachedLessons(languageId);
        if (cachedLessons && cachedLessons.length > 0) {
          set({ lessons: cachedLessons, isLoading: false });

          void firebaseService
            .getLessons(languageId)
            .then(async (lessons) => {
              if (lessons.length > 0) {
                await cacheService.cacheLessons(languageId, lessons);
                await cacheService.setLastSyncTime();
                set({ lessons });
              }
            })
            .catch((error) => {
              console.error('Background refresh lessons error:', error);
            });

          return;
        }
      }

      const lessons = await firebaseService.getLessons(languageId);
      const nextLessons = lessons.length > 0 ? lessons : mockLessons;
      await cacheService.cacheLessons(languageId, nextLessons);
      await cacheService.setLastSyncTime();
      set({ lessons: nextLessons, isLoading: false });
    } catch (error) {
      console.error('Error loading lessons:', error);

      const cachedLessons = await cacheService.getCachedLessons(languageId);
      if (cachedLessons && cachedLessons.length > 0) {
        set({ lessons: cachedLessons, isLoading: false });
      } else {
        set({ lessons: mockLessons, isLoading: false });
      }
    }
  },

  loadLessonCards: async (languageId, lessonId, forceRefresh = false) => {
    set({ isLoading: true });

    try {
      const lesson =
        get().lessons.find((l) => l.id === lessonId) ?? mockLessons.find((l) => l.id === lessonId) ?? mockLesson;

      if (!forceRefresh) {
        const cachedCards = await cacheService.getCachedLessonCards(languageId, lessonId);
        if (cachedCards && cachedCards.length > 0) {
          set({ currentLesson: { ...lesson, cards: cachedCards }, isLoading: false });

          void firebaseService
            .getLessonCards(languageId, lessonId)
            .then(async (cards) => {
              if (cards.length > 0) {
                await cacheService.cacheLessonCards(languageId, lessonId, cards);
                set({ currentLesson: { ...lesson, cards } });
              }
            })
            .catch((error) => {
              console.error('Background refresh lesson cards error:', error);
            });

          return;
        }
      }

      const cards = await firebaseService.getLessonCards(languageId, lessonId);
      let resolvedCards = cards.length > 0 ? cards : lesson.cards;

      // Generate lesson content on-demand when backend/cache has no cards yet.
      if (!resolvedCards || resolvedCards.length === 0) {
        resolvedCards = await progressionService.generateLessonContent(lesson, languageId);
      }

      await cacheService.cacheLessonCards(languageId, lessonId, resolvedCards);
      const updatedLesson = { ...lesson, cards: resolvedCards, totalCards: resolvedCards.length };
      const updatedLessons = get().lessons.map((l) => (l.id === lessonId ? updatedLesson : l));
      set({ currentLesson: updatedLesson, lessons: updatedLessons, isLoading: false });
    } catch (error) {
      console.error('Error loading lesson cards:', error);

      const lesson =
        get().lessons.find((l) => l.id === lessonId) ?? mockLessons.find((l) => l.id === lessonId) ?? mockLesson;
      const cachedCards = await cacheService.getCachedLessonCards(languageId, lessonId);

      if (cachedCards && cachedCards.length > 0) {
        set({ currentLesson: { ...lesson, cards: cachedCards }, isLoading: false });
      } else {
        try {
          const generatedCards = await progressionService.generateLessonContent(lesson, languageId);
          const updatedLesson = { ...lesson, cards: generatedCards, totalCards: generatedCards.length };
          const updatedLessons = get().lessons.map((l) => (l.id === lessonId ? updatedLesson : l));
          await cacheService.cacheLessonCards(languageId, lessonId, generatedCards);
          set({ currentLesson: updatedLesson, lessons: updatedLessons, isLoading: false });
        } catch (generateError) {
          console.error('Error generating fallback lesson cards:', generateError);
          set({ currentLesson: lesson, isLoading: false });
        }
      }
    }
  },

  loadUserProgress: async (userId) => {
    try {
      const progress = await firebaseService.getUserProgress(userId);
      if (progress) {
        await cacheService.cacheUserProgress(progress);
        set({ userProgress: progress });
        return;
      }

      const cachedProgress = await cacheService.getCachedUserProgress();
      if (cachedProgress) {
        set({ userProgress: cachedProgress });
      }
    } catch (error) {
      console.error('Error loading user progress:', error);

      const cachedProgress = await cacheService.getCachedUserProgress();
      if (cachedProgress) {
        set({ userProgress: cachedProgress });
      }
    }
  },

  addFavorite: (cardId) =>
    set((state) => {
      const alreadyFavorited = state.userProgress.favorites.includes(cardId);
      if (alreadyFavorited) return state;

      const newProgress = {
        ...state.userProgress,
        favorites: [...state.userProgress.favorites, cardId],
      };

      if (state.userId) {
        void firebaseService.addFavorite(state.userId, cardId);
      }
      void cacheService.cacheUserProgress(newProgress);

      return { userProgress: newProgress };
    }),

  removeFavorite: (cardId) =>
    set((state) => {
      const newProgress = {
        ...state.userProgress,
        favorites: state.userProgress.favorites.filter((id) => id !== cardId),
      };

      if (state.userId) {
        void firebaseService.removeFavorite(state.userId, cardId);
      }
      void cacheService.cacheUserProgress(newProgress);

      return { userProgress: newProgress };
    }),

  updateStreak: () =>
    set((state: AppState) => {
      const today = new Date().toISOString().split('T')[0];
      const lastActive = state.userProgress.lastActiveDate.split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      let newStreak = state.userProgress.streakDays;

      if (lastActive === yesterday) {
        newStreak += 1;
      } else if (lastActive !== today) {
        newStreak = 1;
      }

      const newProgress = {
        ...state.userProgress,
        streakDays: newStreak,
        lastActiveDate: new Date().toISOString(),
      };

      if (state.userId) {
        void firebaseService.saveUserProgress(state.userId, newProgress);
      }
      void cacheService.cacheUserProgress(newProgress);

      return {
        userProgress: newProgress,
      };
    }),

  markCardComplete: (cardId) =>
    set((state) => {
      const newProgress = {
        ...state.userProgress,
        wordsLearned: [...state.userProgress.wordsLearned, cardId],
      };

      if (state.userId) {
        void firebaseService.saveUserProgress(state.userId, newProgress);
      }
      void cacheService.cacheUserProgress(newProgress);

      return { userProgress: newProgress };
    }),

  completeCard: (lessonId) =>
    set((state) => {
      const lesson = state.lessons.find((l) => l.id === lessonId);
      if (!lesson) return state;

      const nextCompletedCards = Math.min(lesson.completedCards + 1, Math.max(lesson.totalCards, 1));
      const updatedLesson = { ...lesson, completedCards: nextCompletedCards };
      const updatedLessons = state.lessons.map((l) => (l.id === lessonId ? updatedLesson : l));

      const completed = progressionService.isLessonCompleted(updatedLesson.completedCards, updatedLesson.totalCards);
      const score = progressionService.calculateScore(
        updatedLesson.completedCards,
        Math.max(updatedLesson.totalCards, 1),
        0
      );

      const existing = state.lessonProgress.find((p) => p.lessonId === lessonId);
      const nextProgress: LessonProgress = {
        lessonId,
        completed,
        score,
        cardsCompleted: updatedLesson.completedCards,
        totalCards: updatedLesson.totalCards,
        unlockedAt: existing?.unlockedAt || new Date().toISOString(),
      };

      const lessonProgress = existing
        ? state.lessonProgress.map((p) => (p.lessonId === lessonId ? nextProgress : p))
        : [...state.lessonProgress, nextProgress];

      const completedLessons = lessonProgress.filter((p) => p.completed).map((p) => p.lessonId);
      const newUserProgress = {
        ...state.userProgress,
        completedLessons,
      };

      const unlockedLessons = updatedLessons.map((candidate) => {
        if (!candidate.isLocked) return candidate;
        const shouldUnlock = progressionService.shouldUnlockLesson(candidate, lessonProgress);
        return {
          ...candidate,
          isLocked: !shouldUnlock,
        };
      });

      if (state.userId) {
        void firebaseService.saveUserProgress(state.userId, newUserProgress);
      }
      void cacheService.cacheUserProgress(newUserProgress);

      return {
        lessons: unlockedLessons,
        lessonProgress,
        userProgress: newUserProgress,
      };
    }),

  checkAndUnlockLessons: () =>
    set((state) => {
      const updatedLessons = state.lessons.map((lesson) => {
        if (!lesson.isLocked) return lesson;
        const shouldUnlock = progressionService.shouldUnlockLesson(lesson, state.lessonProgress);
        return {
          ...lesson,
          isLocked: !shouldUnlock,
        };
      });

      return { lessons: updatedLessons };
    }),

  getLessonProgress: (lessonId) => get().lessonProgress.find((p) => p.lessonId === lessonId),

  setLessons: (lessons) => set({ lessons }),
  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),

  syncProgress: async () => {
    const state = get();
    if (!state.userId) return;
    await firebaseService.saveUserProgress(state.userId, state.userProgress);
    await cacheService.cacheUserProgress(state.userProgress);
    await cacheService.setLastSyncTime();
  },
}));
