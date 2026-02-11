import { Card, Phrase, Word } from '../types';
import { googleTranslateService } from '../services/googleTranslateService';

const WORD_DATABASE = {
  beginner: {
    common: [
      'hello',
      'goodbye',
      'please',
      'thank you',
      'yes',
      'no',
      'sorry',
      'excuse me',
      'water',
      'food',
      'house',
      'family',
      'friend',
      'today',
      'tomorrow',
      'happy',
      'sad',
      'hungry',
      'cold',
      'hot',
      'big',
      'small',
      'good',
      'bad',
      'man',
      'woman',
      'child',
      'cat',
      'dog',
      'book',
      'phone',
      'computer',
      'love',
      'want',
      'need',
      'know',
    ],
    phrases: [
      'How are you?',
      'I am fine',
      'Nice to meet you',
      'What is your name?',
      'My name is...',
      'Where are you from?',
      'I am from...',
      'I do not understand',
      'Please speak slowly',
      'Can you help me?',
      'Where is the bathroom?',
      'How much is this?',
      'Do you speak English?',
      'I am learning',
      'Good luck',
      'See you later',
      'Have a good day',
      'Sleep well',
    ],
  },
  intermediate: {
    common: [
      'beautiful',
      'important',
      'different',
      'possible',
      'necessary',
      'restaurant',
      'hospital',
      'library',
      'museum',
      'office',
      'breakfast',
      'lunch',
      'dinner',
      'coffee',
      'tea',
      'remember',
      'forget',
      'explain',
      'decide',
      'weather',
      'season',
      'healthy',
      'medicine',
      'vacation',
      'airport',
    ],
    phrases: [
      'Could you repeat that?',
      'I agree with you',
      'I do not think so',
      'That is a good idea',
      'What do you think?',
      'In my opinion...',
      'I would recommend...',
      'It depends on...',
      'Can I try this on?',
      'What time does it open?',
      'How long does it take?',
      'I have a reservation',
      'Could you give me directions?',
      'Can I have the bill, please?',
    ],
  },
  advanced: {
    common: [
      'achievement',
      'opportunity',
      'responsibility',
      'environment',
      'experience',
      'relationship',
      'communication',
      'information',
      'situation',
      'development',
      'analyze',
      'evaluate',
      'consider',
      'determine',
      'influence',
      'innovation',
      'technology',
      'automation',
    ],
    phrases: [
      'I could not agree more',
      'That is beside the point',
      'As far as I know...',
      'According to the research...',
      'Generally speaking...',
      'From my perspective...',
      'Taking everything into account...',
      'Would you mind if...',
      'I would appreciate it if...',
      'It goes without saying...',
      'The bottom line is...',
    ],
  },
} as const;

const LEVEL_TO_TARGET_LANGUAGE: Record<string, string> = {
  spanish: 'es',
  french: 'fr',
  german: 'de',
  italian: 'it',
  portuguese: 'pt',
  japanese: 'ja',
};

class ContentGenerator {
  async generateWords(
    count: number,
    level: 'beginner' | 'intermediate' | 'advanced',
    targetLanguage: string
  ): Promise<Word[]> {
    const words: Word[] = [];
    const sourceWords = WORD_DATABASE[level].common.slice(0, count);
    const targetCode = LEVEL_TO_TARGET_LANGUAGE[targetLanguage] || 'es';

    for (let i = 0; i < sourceWords.length; i++) {
      const englishWord = sourceWords[i];
      const translation = await googleTranslateService.translateText(englishWord, targetCode, 'en');
      const partOfSpeech = this.guessPartOfSpeech(englishWord);

      words.push({
        id: `w_${level}_${i}`,
        word: englishWord,
        translation,
        pronunciation: this.generatePronunciation(englishWord),
        audioUrl: googleTranslateService.generateTTSUrl(englishWord, 'en'),
        partOfSpeech,
        definition: this.generateDefinition(partOfSpeech),
        synonyms: this.getSynonyms(englishWord),
        level,
        category: this.categorize(englishWord),
      });

      await this.delay(75);
    }

    return words;
  }

  async generatePhrases(
    count: number,
    level: 'beginner' | 'intermediate' | 'advanced',
    targetLanguage: string
  ): Promise<Phrase[]> {
    const phrases: Phrase[] = [];
    const sourcePhrases = WORD_DATABASE[level].phrases.slice(0, count);
    const targetCode = LEVEL_TO_TARGET_LANGUAGE[targetLanguage] || 'es';

    for (let i = 0; i < sourcePhrases.length; i++) {
      const englishPhrase = sourcePhrases[i];
      const translation = await googleTranslateService.translateText(englishPhrase, targetCode, 'en');

      phrases.push({
        id: `p_${level}_${i}`,
        phrase: englishPhrase,
        translation,
        pronunciation: this.generatePronunciation(englishPhrase),
        audioUrl: googleTranslateService.generateTTSUrl(englishPhrase, 'en'),
        context: this.generateContext(level),
        level,
        category: this.categorizePhrase(englishPhrase),
      });

      await this.delay(75);
    }

    return phrases;
  }

  combineAsCards(words: Word[], phrases: Phrase[]): Card[] {
    return [
      ...words.map((w) => ({ type: 'word' as const, data: w })),
      ...phrases.map((p) => ({ type: 'phrase' as const, data: p })),
    ];
  }

  private guessPartOfSpeech(word: string): Word['partOfSpeech'] {
    const verbs = ['walk', 'run', 'eat', 'drink', 'sleep', 'think', 'know', 'like', 'love', 'want', 'need'];
    const adjectives = ['happy', 'sad', 'big', 'small', 'good', 'bad', 'hot', 'cold', 'fast', 'slow'];
    const interjections = ['hello', 'goodbye', 'sorry', 'please'];

    if (verbs.includes(word.toLowerCase())) return 'verb';
    if (adjectives.includes(word.toLowerCase())) return 'adjective';
    if (interjections.includes(word.toLowerCase())) return 'interjection';
    return 'noun';
  }

  private generateDefinition(partOfSpeech: Word['partOfSpeech']): string {
    const templates: Record<Word['partOfSpeech'], string> = {
      noun: 'A person, place, thing, or idea.',
      verb: 'An action or state.',
      adjective: 'A word that describes a noun.',
      adverb: 'A word that modifies a verb, adjective, or adverb.',
      interjection: 'A short exclamation or expression.',
    };
    return templates[partOfSpeech];
  }

  private getSynonyms(word: string): string[] {
    const synonymMap: Record<string, string[]> = {
      happy: ['joyful', 'cheerful', 'pleased'],
      sad: ['unhappy', 'sorrowful', 'dejected'],
      big: ['large', 'huge', 'enormous'],
      small: ['tiny', 'little', 'mini'],
      good: ['great', 'excellent', 'wonderful'],
      bad: ['poor', 'terrible', 'awful'],
    };
    return synonymMap[word.toLowerCase()] || [];
  }

  private categorize(word: string): string {
    if (['red', 'blue', 'green', 'yellow'].includes(word)) return 'colors';
    if (['one', 'two', 'three', 'four'].includes(word)) return 'numbers';
    if (['hello', 'goodbye', 'please'].includes(word)) return 'greetings';
    if (['happy', 'sad', 'angry'].includes(word)) return 'emotions';
    return 'general';
  }

  private categorizePhrase(phrase: string): string {
    if (phrase.includes('?')) return 'questions';
    if (phrase.toLowerCase().includes('please') || phrase.toLowerCase().includes('thank')) return 'courtesy';
    if (phrase.toLowerCase().includes('how are')) return 'greetings';
    return 'conversation';
  }

  private generateContext(level: 'beginner' | 'intermediate' | 'advanced'): string {
    const contexts: Record<'beginner' | 'intermediate' | 'advanced', string> = {
      beginner: 'Used in everyday casual conversation.',
      intermediate: 'Common in social and professional settings.',
      advanced: 'A more formal or nuanced expression.',
    };
    return contexts[level];
  }

  private generatePronunciation(text: string): string {
    return `/${text.toLowerCase()}/`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const contentGenerator = new ContentGenerator();
