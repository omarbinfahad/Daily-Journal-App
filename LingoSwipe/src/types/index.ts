export interface Word {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  audioUrl: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'interjection';
  definition: string;
  synonyms: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

export interface Phrase {
  id: string;
  phrase: string;
  translation: string;
  pronunciation: string;
  audioUrl: string;
  context: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

export type Card =
  | { type: 'word'; data: Word }
  | { type: 'phrase'; data: Phrase };

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  weekNumber: number;
  cards: Card[];
  totalCards: number;
  completedCards: number;
  phrasesCount: number;
  wordsCount: number;
  isLocked: boolean;
}

export interface UserProgress {
  streakDays: number;
  lastActiveDate: string;
  wordsLearned: string[];
  phrasesLearned: string[];
  favorites: string[];
  dailyGoal: number;
  completedLessons: string[];
}
