export interface LessonTemplate {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  weekNumber: number;
  monthNumber: number;
  category: string;
  wordCount: number;
  phraseCount: number;
  topics: string[];
  difficulty: number; // 1-10
}

type StageLevel = LessonTemplate['level'];

interface WeeklyFocusTemplate {
  category: string;
  lesson1Title: string;
  lesson1Description: string;
  lesson1Topics: string[];
  lesson2Title: string;
  lesson2Description: string;
  lesson2Topics: string[];
}

const BEGINNER_WEEKLY_THEMES: WeeklyFocusTemplate[] = [
  {
    category: 'Foundation',
    lesson1Title: 'basics & greetings',
    lesson1Description: 'start here',
    lesson1Topics: ['hello', 'goodbye', 'please', 'thank you', 'yes', 'no'],
    lesson2Title: 'numbers 1-10',
    lesson2Description: 'count it out',
    lesson2Topics: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
  },
  {
    category: 'People',
    lesson1Title: 'family members',
    lesson1Description: 'meet the family',
    lesson1Topics: ['mother', 'father', 'sister', 'brother', 'grandmother', 'grandfather'],
    lesson2Title: 'body parts',
    lesson2Description: 'head to toe',
    lesson2Topics: ['head', 'eyes', 'nose', 'mouth', 'hands', 'feet', 'arms', 'legs'],
  },
  {
    category: 'Daily Life',
    lesson1Title: 'home & rooms',
    lesson1Description: 'where you live',
    lesson1Topics: ['house', 'bedroom', 'kitchen', 'bathroom', 'living room', 'door', 'window'],
    lesson2Title: 'furniture',
    lesson2Description: 'fill your home',
    lesson2Topics: ['table', 'chair', 'bed', 'sofa', 'desk', 'lamp', 'shelf'],
  },
  {
    category: 'Food',
    lesson1Title: 'food basics',
    lesson1Description: 'time to eat',
    lesson1Topics: ['bread', 'water', 'milk', 'coffee', 'tea', 'apple', 'banana', 'rice'],
    lesson2Title: 'meals & eating',
    lesson2Description: 'breakfast lunch dinner',
    lesson2Topics: ['breakfast', 'lunch', 'dinner', 'hungry', 'thirsty', 'delicious'],
  },
  {
    category: 'Daily Life',
    lesson1Title: 'clothing',
    lesson1Description: 'what to wear',
    lesson1Topics: ['shirt', 'pants', 'dress', 'shoes', 'hat', 'jacket', 'socks'],
    lesson2Title: 'weather',
    lesson2Description: 'sun rain snow',
    lesson2Topics: ['sunny', 'rainy', 'cloudy', 'hot', 'cold', 'warm', 'windy'],
  },
  {
    category: 'Time',
    lesson1Title: 'telling time',
    lesson1Description: 'what time is it',
    lesson1Topics: ['hour', 'minute', 'morning', 'afternoon', 'evening', 'night', 'oclock'],
    lesson2Title: 'days of week',
    lesson2Description: 'monday to sunday',
    lesson2Topics: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  {
    category: 'Time',
    lesson1Title: 'months & seasons',
    lesson1Description: 'year round',
    lesson1Topics: ['January', 'February', 'March', 'spring', 'summer', 'autumn', 'winter'],
    lesson2Title: 'daily activities',
    lesson2Description: 'what you do',
    lesson2Topics: ['wake up', 'sleep', 'eat', 'drink', 'walk', 'run', 'read', 'write'],
  },
  {
    category: 'Places',
    lesson1Title: 'places in town',
    lesson1Description: 'around the city',
    lesson1Topics: ['restaurant', 'shop', 'bank', 'hospital', 'school', 'park', 'station'],
    lesson2Title: 'basic directions',
    lesson2Description: 'find your way',
    lesson2Topics: ['left', 'right', 'straight', 'near', 'far', 'here', 'there'],
  },
  {
    category: 'Nature',
    lesson1Title: 'animals',
    lesson1Description: 'wild and domestic',
    lesson1Topics: ['dog', 'cat', 'bird', 'fish', 'lion', 'elephant', 'horse', 'cow'],
    lesson2Title: 'nature',
    lesson2Description: 'outdoors',
    lesson2Topics: ['tree', 'flower', 'grass', 'mountain', 'river', 'sea', 'sky', 'sun'],
  },
  {
    category: 'Emotions',
    lesson1Title: 'feelings & emotions',
    lesson1Description: 'how you feel',
    lesson1Topics: ['happy', 'sad', 'angry', 'scared', 'excited', 'tired', 'bored'],
    lesson2Title: 'describing things',
    lesson2Description: 'big small good bad',
    lesson2Topics: ['big', 'small', 'tall', 'short', 'long', 'new', 'old', 'beautiful'],
  },
  {
    category: 'Foundation',
    lesson1Title: 'numbers 11-100',
    lesson1Description: 'count higher',
    lesson1Topics: ['eleven', 'twenty', 'thirty', 'forty', 'fifty', 'hundred'],
    lesson2Title: 'shopping basics',
    lesson2Description: 'buying things',
    lesson2Topics: ['buy', 'sell', 'price', 'money', 'expensive', 'cheap', 'pay'],
  },
  {
    category: 'Leisure',
    lesson1Title: 'hobbies & interests',
    lesson1Description: 'what you like',
    lesson1Topics: ['music', 'sports', 'reading', 'cooking', 'dancing', 'painting'],
    lesson2Title: 'sports',
    lesson2Description: 'play and watch',
    lesson2Topics: ['football', 'basketball', 'tennis', 'swimming', 'running', 'cycling'],
  },
];

const INTERMEDIATE_WEEKLY_THEMES: WeeklyFocusTemplate[] = [
  {
    category: 'Grammar',
    lesson1Title: 'present tense verbs',
    lesson1Description: 'actions now',
    lesson1Topics: ['I am', 'you are', 'he is', 'she is', 'we are', 'they are'],
    lesson2Title: 'asking questions',
    lesson2Description: 'who what where',
    lesson2Topics: ['who', 'what', 'where', 'when', 'why', 'how'],
  },
  {
    category: 'Food',
    lesson1Title: 'at the restaurant',
    lesson1Description: 'ordering food',
    lesson1Topics: ['menu', 'order', 'waiter', 'bill', 'tip', 'reservation'],
    lesson2Title: 'cooking',
    lesson2Description: 'in the kitchen',
    lesson2Topics: ['cook', 'boil', 'fry', 'bake', 'chop', 'mix', 'recipe'],
  },
  {
    category: 'Travel',
    lesson1Title: 'transportation',
    lesson1Description: 'getting around',
    lesson1Topics: ['bus', 'train', 'subway', 'taxi', 'traffic', 'route'],
    lesson2Title: 'travel planning',
    lesson2Description: 'plan your trip',
    lesson2Topics: ['ticket', 'booking', 'itinerary', 'passport', 'visa', 'luggage'],
  },
  {
    category: 'Health',
    lesson1Title: 'health & body',
    lesson1Description: 'wellness vocabulary',
    lesson1Topics: ['healthy', 'pain', 'fever', 'doctor', 'medicine', 'symptom'],
    lesson2Title: 'medical situations',
    lesson2Description: 'at the clinic',
    lesson2Topics: ['appointment', 'prescription', 'allergy', 'emergency', 'hospital', 'treatment'],
  },
  {
    category: 'Education',
    lesson1Title: 'study skills',
    lesson1Description: 'learning language',
    lesson1Topics: ['class', 'homework', 'exam', 'subject', 'grade', 'project'],
    lesson2Title: 'academic conversations',
    lesson2Description: 'school and university',
    lesson2Topics: ['lecture', 'research', 'assignment', 'deadline', 'presentation', 'discussion'],
  },
  {
    category: 'Work',
    lesson1Title: 'office communication',
    lesson1Description: 'professional basics',
    lesson1Topics: ['meeting', 'colleague', 'manager', 'report', 'schedule', 'task'],
    lesson2Title: 'career development',
    lesson2Description: 'growing at work',
    lesson2Topics: ['interview', 'promotion', 'salary', 'skills', 'experience', 'goal'],
  },
  {
    category: 'Technology',
    lesson1Title: 'digital life',
    lesson1Description: 'tech vocabulary',
    lesson1Topics: ['computer', 'phone', 'app', 'internet', 'browser', 'download'],
    lesson2Title: 'online communication',
    lesson2Description: 'email and messaging',
    lesson2Topics: ['email', 'attachment', 'password', 'privacy', 'notification', 'settings'],
  },
  {
    category: 'Conversation',
    lesson1Title: 'opinions & debates',
    lesson1Description: 'express your views',
    lesson1Topics: ['opinion', 'agree', 'disagree', 'reason', 'evidence', 'conclusion'],
    lesson2Title: 'social interactions',
    lesson2Description: 'deeper conversations',
    lesson2Topics: ['advice', 'suggestion', 'compliment', 'apology', 'invitation', 'response'],
  },
];

const ADVANCED_WEEKLY_THEMES: WeeklyFocusTemplate[] = [
  {
    category: 'Grammar Mastery',
    lesson1Title: 'complex sentences',
    lesson1Description: 'advanced structures',
    lesson1Topics: ['conditionals', 'subjunctive', 'relative clauses', 'passive voice', 'nuance'],
    lesson2Title: 'register & style',
    lesson2Description: 'formal and informal tone',
    lesson2Topics: ['register', 'tone', 'politeness', 'rhetoric', 'style'],
  },
  {
    category: 'Business',
    lesson1Title: 'business communication',
    lesson1Description: 'professional fluency',
    lesson1Topics: ['negotiation', 'strategy', 'stakeholder', 'proposal', 'contract', 'revenue'],
    lesson2Title: 'leadership language',
    lesson2Description: 'influence and clarity',
    lesson2Topics: ['leadership', 'decision', 'feedback', 'alignment', 'priority', 'vision'],
  },
  {
    category: 'Media',
    lesson1Title: 'news and analysis',
    lesson1Description: 'current events',
    lesson1Topics: ['headline', 'report', 'bias', 'analysis', 'source', 'fact-check'],
    lesson2Title: 'public communication',
    lesson2Description: 'speeches and arguments',
    lesson2Topics: ['speech', 'argument', 'persuasion', 'counterpoint', 'audience', 'impact'],
  },
  {
    category: 'Culture',
    lesson1Title: 'literature and arts',
    lesson1Description: 'cultural expression',
    lesson1Topics: ['novel', 'poetry', 'metaphor', 'symbolism', 'genre', 'critique'],
    lesson2Title: 'society and values',
    lesson2Description: 'culture in context',
    lesson2Topics: ['tradition', 'identity', 'ethics', 'norms', 'values', 'heritage'],
  },
  {
    category: 'Civics',
    lesson1Title: 'politics and policy',
    lesson1Description: 'institutional language',
    lesson1Topics: ['policy', 'election', 'legislation', 'governance', 'rights', 'justice'],
    lesson2Title: 'global issues',
    lesson2Description: 'international topics',
    lesson2Topics: ['diplomacy', 'conflict', 'migration', 'economy', 'cooperation', 'security'],
  },
  {
    category: 'Environment',
    lesson1Title: 'climate and science',
    lesson1Description: 'technical discussion',
    lesson1Topics: ['climate', 'emissions', 'ecosystem', 'renewable', 'sustainability', 'policy'],
    lesson2Title: 'problem solving',
    lesson2Description: 'solutions language',
    lesson2Topics: ['trade-off', 'impact', 'feasibility', 'implementation', 'measurement', 'outcome'],
  },
  {
    category: 'Fluency',
    lesson1Title: 'idioms and expressions',
    lesson1Description: 'natural sounding language',
    lesson1Topics: ['idiom', 'collocation', 'expression', 'humor', 'slang', 'context'],
    lesson2Title: 'storytelling mastery',
    lesson2Description: 'speak with confidence',
    lesson2Topics: ['narrative', 'transition', 'emphasis', 'pacing', 'clarity', 'engagement'],
  },
  {
    category: 'Mastery',
    lesson1Title: 'precision and nuance',
    lesson1Description: 'subtle meaning control',
    lesson1Topics: ['nuance', 'connotation', 'implication', 'tone shift', 'brevity', 'accuracy'],
    lesson2Title: 'advanced conversation',
    lesson2Description: 'high-level fluency',
    lesson2Topics: ['debate', 'interview', 'negotiation', 'reflection', 'synthesis', 'fluency'],
  },
];

const TOTAL_WEEKS = 104;
const LESSONS_PER_WEEK = 2;

function getMonthlyNumber(weekNumber: number): number {
  return Math.ceil(weekNumber / 4);
}

function levelForWeek(weekNumber: number): StageLevel {
  if (weekNumber <= 32) return 'beginner';
  if (weekNumber <= 72) return 'intermediate';
  return 'advanced';
}

function pickThemeForWeek(weekNumber: number): WeeklyFocusTemplate {
  const level = levelForWeek(weekNumber);
  const source =
    level === 'beginner'
      ? BEGINNER_WEEKLY_THEMES
      : level === 'intermediate'
        ? INTERMEDIATE_WEEKLY_THEMES
        : ADVANCED_WEEKLY_THEMES;
  return source[(weekNumber - 1) % source.length];
}

function difficultyForWeek(weekNumber: number): number {
  if (weekNumber <= 12) return Math.min(4, 1 + Math.floor((weekNumber - 1) / 3));
  if (weekNumber <= 32) return Math.min(5, 4 + Math.floor((weekNumber - 13) / 10));
  if (weekNumber <= 72) return Math.min(8, 5 + Math.floor((weekNumber - 33) / 10));
  return Math.min(10, 8 + Math.floor((weekNumber - 73) / 12));
}

function createLessonTemplate(weekNumber: number, lessonNumber: 1 | 2, theme: WeeklyFocusTemplate): LessonTemplate {
  const level = levelForWeek(weekNumber);
  const difficulty = difficultyForWeek(weekNumber);
  const monthNumber = getMonthlyNumber(weekNumber);
  const baseWordCount = 10 + difficulty * 2;
  const basePhraseCount = 6 + difficulty * 2;

  const title = lessonNumber === 1 ? theme.lesson1Title : theme.lesson2Title;
  const description = lessonNumber === 1 ? theme.lesson1Description : theme.lesson2Description;
  const topics = lessonNumber === 1 ? theme.lesson1Topics : theme.lesson2Topics;

  return {
    id: `w${weekNumber}_l${lessonNumber}_${title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`,
    title,
    description,
    level,
    weekNumber,
    monthNumber,
    category: theme.category,
    wordCount: lessonNumber === 1 ? baseWordCount : Math.max(8, baseWordCount - 2),
    phraseCount: lessonNumber === 1 ? Math.max(6, basePhraseCount - 2) : basePhraseCount,
    topics,
    difficulty,
  };
}

// Seeded with explicit absolute-beginner weeks, then expanded to full 104 weeks.
export const CURRICULUM_STRUCTURE: LessonTemplate[] = BEGINNER_WEEKLY_THEMES.slice(0, 12).flatMap((theme, index) => {
  const weekNumber = index + 1;
  return [createLessonTemplate(weekNumber, 1, theme), createLessonTemplate(weekNumber, 2, theme)];
});

export function generateFullCurriculum(): LessonTemplate[] {
  const lessons: LessonTemplate[] = [...CURRICULUM_STRUCTURE];
  const existingWeeks = new Set(lessons.map((lesson) => lesson.weekNumber));

  for (let weekNumber = 1; weekNumber <= TOTAL_WEEKS; weekNumber++) {
    if (existingWeeks.has(weekNumber)) {
      continue;
    }

    const theme = pickThemeForWeek(weekNumber);
    for (let lessonIndex = 1; lessonIndex <= LESSONS_PER_WEEK; lessonIndex++) {
      lessons.push(createLessonTemplate(weekNumber, lessonIndex as 1 | 2, theme));
    }
  }

  lessons.sort((a, b) => {
    if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
    return a.id.localeCompare(b.id);
  });

  return lessons;
}

export const FULL_CURRICULUM = generateFullCurriculum();
