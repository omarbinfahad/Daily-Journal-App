import { FULL_CURRICULUM, LessonTemplate } from '../data/curriculumStructure';
import { contentGenerator } from '../data/contentGenerator';
import { Card, Lesson } from '../types';

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  cardsCompleted: number;
  totalCards: number;
  unlockedAt?: string;
  lastAccessedAt?: string;
}

class ProgressionService {
  createLessonStructure(_languageId: string): Lesson[] {
    return FULL_CURRICULUM.map((template) => ({
      id: template.id,
      title: template.title,
      description: template.description,
      level: template.level,
      weekNumber: template.weekNumber,
      cards: [],
      totalCards: template.wordCount + template.phraseCount,
      completedCards: 0,
      phrasesCount: template.phraseCount,
      wordsCount: template.wordCount,
      isLocked: template.weekNumber !== 1,
    }));
  }

  async generateLessonContent(lesson: Lesson, languageId: string, _template?: LessonTemplate): Promise<Card[]> {
    const targetLanguage = this.getTargetLanguageCode(languageId);
    const words = await contentGenerator.generateWords(lesson.wordsCount, lesson.level, targetLanguage);
    const phrases = await contentGenerator.generatePhrases(lesson.phrasesCount, lesson.level, targetLanguage);

    const cards: Card[] = [];
    const maxLength = Math.max(words.length, phrases.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < words.length) {
        cards.push({ type: 'word', data: words[i] });
      }
      if (i < phrases.length) {
        cards.push({ type: 'phrase', data: phrases[i] });
      }
    }

    return cards;
  }

  shouldUnlockLesson(currentLesson: Lesson, completedLessons: LessonProgress[]): boolean {
    if (currentLesson.weekNumber === 1) return true;

    const previousWeekNumber = currentLesson.weekNumber - 1;
    const previousWeekProgress = completedLessons.filter((progress) => {
      const lessonWeek = this.getWeekFromLessonId(progress.lessonId);
      return lessonWeek === previousWeekNumber;
    });

    const totalPreviousWeekLessons = FULL_CURRICULUM.filter((lesson) => lesson.weekNumber === previousWeekNumber).length;
    if (totalPreviousWeekLessons === 0) return false;

    const completedCount = previousWeekProgress.filter((progress) => progress.completed).length;
    return completedCount >= Math.ceil(totalPreviousWeekLessons * 0.6);
  }

  calculateCompletionPercentage(cardsCompleted: number, totalCards: number): number {
    if (totalCards <= 0) return 0;
    return Math.round((cardsCompleted / totalCards) * 100);
  }

  isLessonCompleted(cardsCompleted: number, totalCards: number): boolean {
    return this.calculateCompletionPercentage(cardsCompleted, totalCards) >= 80;
  }

  calculateScore(cardsCompleted: number, totalCards: number, mistakes: number): number {
    if (totalCards <= 0) return 0;
    const completionScore = (cardsCompleted / totalCards) * 70;
    const accuracyBonus = Math.max(0, 20 - mistakes * 2);
    const speedBonus = 10;
    return Math.round(completionScore + accuracyBonus + speedBonus);
  }

  private getTargetLanguageCode(languageId: string): string {
    const codes: Record<string, string> = {
      spanish: 'es',
      french: 'fr',
      german: 'de',
      italian: 'it',
      portuguese: 'pt',
      japanese: 'ja',
    };
    return codes[languageId] ?? 'es';
  }

  private getWeekFromLessonId(lessonId: string): number {
    const match = lessonId.match(/^w(\d+)_/);
    return match ? Number(match[1]) : 0;
  }
}

export const progressionService = new ProgressionService();
