import { Card, Lesson, Phrase, Word } from '../types';
import { generateTTSUrl } from '../utils/ttsService';

// Sample words
const sampleWords: Word[] = [
  {
    id: 'w1',
    word: 'serenity',
    translation: 'serenidad',
    pronunciation: '/səˈrenəti/',
    audioUrl: generateTTSUrl('serenity', 'en'),
    partOfSpeech: 'noun',
    definition: 'the state of being calm, peaceful, and untroubled.',
    synonyms: ['calm', 'quietness', 'tranquillity', 'peace'],
    level: 'beginner',
    category: 'emotions',
  },
  {
    id: 'w2',
    word: 'hello',
    translation: 'hola',
    pronunciation: '/həˈloʊ/',
    audioUrl: generateTTSUrl('hello', 'en'),
    partOfSpeech: 'interjection',
    definition: 'used as a greeting or to begin a conversation.',
    synonyms: ['hi', 'hey', 'greetings'],
    level: 'beginner',
    category: 'greetings',
  },
  {
    id: 'w3',
    word: 'beautiful',
    translation: 'hermoso',
    pronunciation: '/ˈbjuːtɪfəl/',
    audioUrl: generateTTSUrl('beautiful', 'en'),
    partOfSpeech: 'adjective',
    definition: 'pleasing the senses or mind aesthetically.',
    synonyms: ['gorgeous', 'stunning', 'lovely'],
    level: 'beginner',
    category: 'descriptions',
  },
  {
    id: 'w4',
    word: 'gratitude',
    translation: 'gratitud',
    pronunciation: '/ˈɡrætɪtuːd/',
    audioUrl: generateTTSUrl('gratitude', 'en'),
    partOfSpeech: 'noun',
    definition: 'the quality of being thankful; readiness to show appreciation.',
    synonyms: ['thankfulness', 'appreciation', 'thanks'],
    level: 'beginner',
    category: 'emotions',
  },
];

// Sample phrases
const samplePhrases: Phrase[] = [
  {
    id: 'p1',
    phrase: 'How are you?',
    translation: '¿Cómo estás?',
    pronunciation: '/haʊ ɑːr juː/',
    audioUrl: generateTTSUrl('How are you?', 'en'),
    context: 'Casual greeting used among friends and acquaintances.',
    level: 'beginner',
    category: 'greetings',
  },
  {
    id: 'p2',
    phrase: 'Good morning',
    translation: 'Buenos días',
    pronunciation: '/ɡʊd ˈmɔːrnɪŋ/',
    audioUrl: generateTTSUrl('Good morning', 'en'),
    context: 'Greeting used before noon.',
    level: 'beginner',
    category: 'greetings',
  },
  {
    id: 'p3',
    phrase: 'Thank you very much',
    translation: 'Muchas gracias',
    pronunciation: '/θæŋk juː ˈveri mʌtʃ/',
    audioUrl: generateTTSUrl('Thank you very much', 'en'),
    context: 'Expression of gratitude.',
    level: 'beginner',
    category: 'courtesy',
  },
  {
    id: 'p4',
    phrase: 'Have a nice day',
    translation: 'Que tengas un buen día',
    pronunciation: '/hæv ə naɪs deɪ/',
    audioUrl: generateTTSUrl('Have a nice day', 'en'),
    context: 'Friendly parting expression.',
    level: 'beginner',
    category: 'greetings',
  },
];

export const createMockCards = (): Card[] => {
  const cards: Card[] = [];
  const maxLength = Math.max(sampleWords.length, samplePhrases.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < sampleWords.length) {
      cards.push({ type: 'word', data: sampleWords[i] });
    }
    if (i < samplePhrases.length) {
      cards.push({ type: 'phrase', data: samplePhrases[i] });
    }
  }

  return cards;
};

export const mockLessons: Lesson[] = [
  {
    id: 'lesson1',
    title: 'pronunciation',
    description: 'continue',
    level: 'beginner',
    weekNumber: 1,
    cards: createMockCards(),
    totalCards: 8,
    completedCards: 0,
    phrasesCount: 4,
    wordsCount: 4,
    isLocked: false,
  },
  {
    id: 'lesson2',
    title: 'listening',
    description: '3 podcasts',
    level: 'beginner',
    weekNumber: 1,
    cards: [],
    totalCards: 0,
    completedCards: 0,
    phrasesCount: 3,
    wordsCount: 0,
    isLocked: true,
  },
  {
    id: 'lesson3',
    title: 'vocabulary',
    description: '7 topics',
    level: 'beginner',
    weekNumber: 1,
    cards: [],
    totalCards: 56,
    completedCards: 0,
    phrasesCount: 0,
    wordsCount: 56,
    isLocked: true,
  },
  {
    id: 'lesson4',
    title: 'pronunciation',
    description: 'Week 2 content',
    level: 'beginner',
    weekNumber: 2,
    cards: [],
    totalCards: 40,
    completedCards: 0,
    phrasesCount: 20,
    wordsCount: 40,
    isLocked: true,
  },
  {
    id: 'lesson5',
    title: 'listening',
    description: 'Week 2 podcasts',
    level: 'beginner',
    weekNumber: 2,
    cards: [],
    totalCards: 0,
    completedCards: 0,
    phrasesCount: 5,
    wordsCount: 0,
    isLocked: true,
  },
];

export const mockLesson: Lesson = mockLessons[0];
