// seedData.js - Run with: node seedData.js
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const defaultServiceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
const providedPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const serviceAccountPath = providedPath ? path.resolve(providedPath) : defaultServiceAccountPath;

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Missing Firebase service account key JSON.');
  console.error(`Expected at: ${serviceAccountPath}`);
  console.error('');
  console.error('Fix:');
  console.error('1) Download a service account key from Firebase Console > Project Settings > Service accounts.');
  console.error('2) Save it as ./serviceAccountKey.json in this project root, OR');
  console.error('3) Set GOOGLE_APPLICATION_CREDENTIALS to its absolute path.');
  console.error('');
  console.error('Examples:');
  console.error('  GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/key.json" npm run seed');
  console.error('  # or place file at ./serviceAccountKey.json then run npm run seed');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const generatedPayloadPath = path.resolve(__dirname, 'data', 'processed', 'spanish_seed_payload.json');

const chunkArray = (items, size) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const seedData = async () => {
  try {
    const spanishRef = db.collection('languages').doc('spanish');
    await spanishRef.set({
      name: 'Spanish',
      code: 'es',
      nativeScript: 'Espanol',
      isActive: true,
    });

    if (fs.existsSync(generatedPayloadPath)) {
      const payload = JSON.parse(fs.readFileSync(generatedPayloadPath, 'utf8'));
      const wordsData = Array.isArray(payload.words) ? payload.words : [];
      const lessonsData = Array.isArray(payload.lessons) ? payload.lessons : [];

      for (const wordsChunk of chunkArray(wordsData, 400)) {
        const batch = db.batch();
        wordsChunk.forEach((word) => {
          const ref = spanishRef.collection('words').doc(word.id);
          batch.set(ref, word, { merge: true });
        });
        await batch.commit();
      }

      for (const lessonsChunk of chunkArray(lessonsData, 400)) {
        const batch = db.batch();
        lessonsChunk.forEach((lesson) => {
          const ref = spanishRef.collection('lessons').doc(lesson.id);
          batch.set(ref, lesson, { merge: true });
        });
        await batch.commit();
      }

      console.log('Seed data added successfully from generated CSV payload.');
      console.log(`Words upserted: ${wordsData.length}`);
      console.log(`Lessons upserted: ${lessonsData.length}`);
    } else {
      const wordsData = [
        {
          id: 'w1',
          word: 'serenity',
          translation: 'serenidad',
          pronunciation: '/səˈrenəti/',
          audioUrl: 'https://translate.google.com/translate_tts?ie=UTF-8&q=serenity&tl=en&client=tw-ob',
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
          audioUrl: 'https://translate.google.com/translate_tts?ie=UTF-8&q=hello&tl=en&client=tw-ob',
          partOfSpeech: 'interjection',
          definition: 'used as a greeting or to begin a conversation.',
          synonyms: ['hi', 'hey', 'greetings'],
          level: 'beginner',
          category: 'greetings',
        },
      ];

      for (const word of wordsData) {
        await spanishRef.collection('words').doc(word.id).set(word);
      }

      const phrasesData = [
        {
          id: 'p1',
          phrase: 'How are you?',
          translation: 'Como estas?',
          pronunciation: '/haʊ ɑːr juː/',
          audioUrl: 'https://translate.google.com/translate_tts?ie=UTF-8&q=How%20are%20you&tl=en&client=tw-ob',
          context: 'Casual greeting used among friends.',
          level: 'beginner',
          category: 'greetings',
        },
      ];

      for (const phrase of phrasesData) {
        await spanishRef.collection('phrases').doc(phrase.id).set(phrase);
      }

      await spanishRef.collection('lessons').doc('lesson1').set({
        title: 'pronunciation',
        description: 'continue',
        level: 'beginner',
        weekNumber: 1,
        wordIds: ['w1', 'w2'],
        phraseIds: ['p1'],
        totalCards: 3,
        phrasesCount: 1,
        wordsCount: 2,
        isLocked: false,
      });

      console.log('Seed data added successfully (fallback sample mode).');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
