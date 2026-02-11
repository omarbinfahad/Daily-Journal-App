import { GoogleAuthProvider, signInAnonymously, signInWithCredential, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';
import { Card, Lesson, UserProgress } from '../types';

class FirebaseService {
  async signInAnonymous() {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  }

  async signInWithEmail(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  async signUpWithEmail(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  async signInWithGoogleIdToken(idToken: string) {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  }

  async signOutUser() {
    await signOut(auth);
  }

  async getLessons(languageId: string): Promise<Lesson[]> {
    try {
      const lessonsRef = collection(db, 'languages', languageId, 'lessons');
      const q = query(lessonsRef, orderBy('weekNumber'), orderBy('title'));
      const snapshot = await getDocs(q);

      const lessons: Lesson[] = [];
      for (const lessonDoc of snapshot.docs) {
        const data = lessonDoc.data();
        lessons.push({
          id: lessonDoc.id,
          title: data.title,
          description: data.description,
          level: data.level,
          weekNumber: data.weekNumber,
          cards: [],
          totalCards: data.totalCards || 0,
          completedCards: 0,
          phrasesCount: data.phrasesCount || 0,
          wordsCount: data.wordsCount || 0,
          isLocked: data.isLocked || false,
        });
      }

      return lessons;
    } catch (error) {
      console.error('Error fetching lessons:', error);
      return [];
    }
  }

  async getLessonCards(languageId: string, lessonId: string): Promise<Card[]> {
    try {
      const lessonRef = doc(db, 'languages', languageId, 'lessons', lessonId);
      const lessonSnap = await getDoc(lessonRef);

      if (!lessonSnap.exists()) return [];

      const lessonData = lessonSnap.data();
      const cards: Card[] = [];

      if (lessonData.wordIds?.length) {
        for (const wordId of lessonData.wordIds as string[]) {
          const wordRef = doc(db, 'languages', languageId, 'words', wordId);
          const wordSnap = await getDoc(wordRef);
          if (!wordSnap.exists()) continue;

          const wordData = wordSnap.data();
          cards.push({
            type: 'word',
            data: {
              id: wordSnap.id,
              word: wordData.word,
              translation: wordData.translation,
              pronunciation: wordData.pronunciation,
              audioUrl: wordData.audioUrl,
              partOfSpeech: wordData.partOfSpeech,
              definition: wordData.definition,
              synonyms: wordData.synonyms || [],
              level: wordData.level,
              category: wordData.category,
            },
          });
        }
      }

      if (lessonData.phraseIds?.length) {
        for (const phraseId of lessonData.phraseIds as string[]) {
          const phraseRef = doc(db, 'languages', languageId, 'phrases', phraseId);
          const phraseSnap = await getDoc(phraseRef);
          if (!phraseSnap.exists()) continue;

          const phraseData = phraseSnap.data();
          cards.push({
            type: 'phrase',
            data: {
              id: phraseSnap.id,
              phrase: phraseData.phrase,
              translation: phraseData.translation,
              pronunciation: phraseData.pronunciation,
              audioUrl: phraseData.audioUrl,
              context: phraseData.context,
              level: phraseData.level,
              category: phraseData.category,
            },
          });
        }
      }

      return cards;
    } catch (error) {
      console.error('Error fetching lesson cards:', error);
      return [];
    }
  }

  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const progressRef = doc(db, 'users', userId, 'progress', 'data');
      const progressSnap = await getDoc(progressRef);
      if (!progressSnap.exists()) return null;

      const data = progressSnap.data();
      return {
        streakDays: data.streakDays || 0,
        lastActiveDate: data.lastActiveDate || new Date().toISOString(),
        wordsLearned: data.wordsLearned || [],
        phrasesLearned: data.phrasesLearned || [],
        favorites: data.favorites || [],
        dailyGoal: data.dailyGoal || 20,
        completedLessons: data.completedLessons || [],
      };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return null;
    }
  }

  async saveUserProgress(userId: string, progress: UserProgress): Promise<void> {
    const progressRef = doc(db, 'users', userId, 'progress', 'data');
    await setDoc(progressRef, progress, { merge: true });
  }

  async addFavorite(userId: string, cardId: string): Promise<void> {
    const progressRef = doc(db, 'users', userId, 'progress', 'data');
    const progressSnap = await getDoc(progressRef);
    if (!progressSnap.exists()) return;

    const data = progressSnap.data();
    const favorites: string[] = data.favorites || [];
    if (favorites.includes(cardId)) return;

    await updateDoc(progressRef, { favorites: [...favorites, cardId] });
  }

  async removeFavorite(userId: string, cardId: string): Promise<void> {
    const progressRef = doc(db, 'users', userId, 'progress', 'data');
    const progressSnap = await getDoc(progressRef);
    if (!progressSnap.exists()) return;

    const data = progressSnap.data();
    const favorites = (data.favorites || []).filter((id: string) => id !== cardId);
    await updateDoc(progressRef, { favorites });
  }

  async uploadAudio(file: Blob, languageId: string, filename: string): Promise<string> {
    const audioRef = ref(storage, `audio/${languageId}/${filename}`);
    await uploadBytes(audioRef, file);
    return getDownloadURL(audioRef);
  }

  async getAudioUrl(languageId: string, filename: string): Promise<string> {
    const audioRef = ref(storage, `audio/${languageId}/${filename}`);
    return getDownloadURL(audioRef);
  }
}

export const firebaseService = new FirebaseService();
