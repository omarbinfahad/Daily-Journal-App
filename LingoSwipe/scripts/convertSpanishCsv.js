#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const TOTAL_WEEKS = 104;
const LESSONS_PER_WEEK = 2;
const CHUNK_PATTERN = [10, 11, 12, 13, 14, 15];

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function normalizeHeader(value) {
  return value.toLowerCase().replace(/[^a-z]/g, '');
}

function normalizeText(value) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function detectColumnIndices(headers) {
  const normalizedHeaders = headers.map(normalizeHeader);
  const englishIndex = normalizedHeaders.findIndex(
    (header) => header === 'english' || header.includes('english')
  );
  const spanishIndex = normalizedHeaders.findIndex(
    (header) => header === 'spanish' || header.includes('spanish') || header.includes('espanol')
  );

  if (englishIndex < 0 || spanishIndex < 0) {
    throw new Error(`Could not find required columns. Headers found: ${headers.join(', ')}`);
  }

  return { englishIndex, spanishIndex };
}

function chunkIntoLessons(words) {
  const lessons = [];

  let wordCursor = 0;
  let lessonCursor = 0;

  for (let weekNumber = 1; weekNumber <= TOTAL_WEEKS; weekNumber += 1) {
    const monthNumber = Math.ceil(weekNumber / 4);

    for (let lessonNumber = 1; lessonNumber <= LESSONS_PER_WEEK; lessonNumber += 1) {
      if (wordCursor >= words.length) {
        return {
          lessons,
          assignedWordCount: wordCursor,
          unassignedRowCount: 0,
        };
      }

      const targetChunkSize = CHUNK_PATTERN[lessonCursor % CHUNK_PATTERN.length];
      const chunk = words.slice(wordCursor, wordCursor + targetChunkSize);

      lessons.push({
        id: `w${weekNumber}_l${lessonNumber}`,
        title: `CSV Lesson ${weekNumber}.${lessonNumber}`,
        description: `Imported vocabulary set for Week ${weekNumber}, Lesson ${lessonNumber}`,
        weekNumber,
        monthNumber,
        words: chunk,
        phraseIds: [],
        totalCards: chunk.length,
        phrasesCount: 0,
        wordsCount: chunk.length,
        isLocked: weekNumber !== 1,
        source: 'csv-import',
      });

      wordCursor += chunk.length;
      lessonCursor += 1;
    }
  }

  return {
    lessons,
    assignedWordCount: wordCursor,
    unassignedRowCount: Math.max(0, words.length - wordCursor),
  };
}

async function cleanCsv(inputPath) {
  const stream = fs.createReadStream(inputPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  let lineNumber = 0;
  let englishIndex = -1;
  let spanishIndex = -1;

  const seen = new Set();
  const cleanedRows = [];

  for await (const rawLine of rl) {
    lineNumber += 1;

    if (!rawLine || !rawLine.trim()) continue;

    const columns = parseCsvLine(rawLine);

    if (lineNumber === 1) {
      console.log('CSV headers:', columns);
      const detected = detectColumnIndices(columns);
      englishIndex = detected.englishIndex;
      spanishIndex = detected.spanishIndex;
      continue;
    }

    if (englishIndex < 0 || spanishIndex < 0) {
      continue;
    }

    // Explicit mapping:
    // - primary word key from English column
    // - translation key from Spanish column
    const english = (columns[englishIndex] || '').trim();
    const spanish = (columns[spanishIndex] || '').trim();

    if (!english || !spanish) continue;

    const key = `${normalizeText(english)}|${normalizeText(spanish)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    cleanedRows.push({ english, spanish });
  }

  return cleanedRows;
}

async function main() {
  const defaultInput = '/Users/fahad/Downloads/data.csv';
  const inputPath = path.resolve(process.argv[2] || defaultInput);
  const outputDir = path.resolve(process.argv[3] || path.join(__dirname, '..', 'data', 'processed'));

  if (!fs.existsSync(inputPath)) {
    throw new Error(`CSV file not found at: ${inputPath}`);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const cleanedRows = await cleanCsv(inputPath);

  // Required exact Firestore words format.
  const words = cleanedRows.map((row) => ({
    word: row.english,
    translation: row.spanish,
  }));

  const allocation = chunkIntoLessons(words);

  const payload = {
    language: {
      id: 'spanish',
      name: 'Spanish',
      code: 'es',
    },
    stats: {
      totalInputRows: cleanedRows.length,
      assignedRows: allocation.assignedWordCount,
      unassignedRows: allocation.unassignedRowCount,
      totalLessons: allocation.lessons.length,
      totalWords: words.length,
      totalWeeksCovered: Math.ceil(allocation.lessons.length / LESSONS_PER_WEEK),
    },
    words,
    lessons: allocation.lessons,
  };

  const cleanedPath = path.join(outputDir, 'spanish_cleaned_rows.json');
  const wordsPath = path.join(outputDir, 'spanish_words_for_firestore.json');
  const lessonsPath = path.join(outputDir, 'spanish_lessons_for_firestore.json');
  const payloadPath = path.join(outputDir, 'spanish_seed_payload.json');

  fs.writeFileSync(cleanedPath, JSON.stringify(cleanedRows, null, 2), 'utf8');
  fs.writeFileSync(wordsPath, JSON.stringify(words, null, 2), 'utf8');
  fs.writeFileSync(lessonsPath, JSON.stringify(allocation.lessons, null, 2), 'utf8');
  fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 2), 'utf8');

  console.log('CSV conversion complete.');
  console.log(`Input: ${inputPath}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Cleaned rows: ${cleanedRows.length}`);
  console.log(`Assigned to lessons: ${allocation.assignedWordCount}`);
  console.log(`Unassigned rows: ${allocation.unassignedRowCount}`);
  console.log(`Lessons generated: ${allocation.lessons.length}`);
}

main().catch((error) => {
  console.error('CSV conversion failed:', error);
  process.exit(1);
});
