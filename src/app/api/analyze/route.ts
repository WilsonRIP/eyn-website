import { NextResponse } from 'next/server';

// --- Utility Functions for Text Analysis ---

// A simple syllable counter using regex. Not perfect, but a good approximation.
const countSyllables = (word: string): number => {
  word = word.toLowerCase();
  if (word.length <= 3) { return 1; }
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 0;
};

// --- Main Analysis Function ---

const analyzeText = (text: string) => {
  if (!text.trim()) {
    return {
      characters: 0, words: 0, sentences: 0, paragraphs: 0, lines: 0,
      charactersNoSpaces: 0, uniqueWords: 0, averageWordLength: 0,
      averageSentenceLength: 0, readingTime: 0, speakingTime: 0,
      fleschScore: 0, readingLevel: 'N/A', topWords: [],
    };
  }

  // Basic Counts
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  // A more robust regex for words (handles hyphens within words)
  const wordsArray = text.trim().match(/[\w'-]+/g) || [];
  const words = wordsArray.length;
  // A better sentence counter that avoids issues with "Mr. Smith" etc.
  const sentences = (text.match(/[^.!?]+[.!?]+/g) || []).length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  const lines = text.split('\n').length;
  
  // Word Analysis
  const sanitizedWords = text.toLowerCase().match(/\b\w+\b/g) || [];
  const uniqueWords = new Set(sanitizedWords).size;

  // Frequency Analysis
  const frequency: Record<string, number> = sanitizedWords.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topWords = Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5) // Top 5 is often cleaner for UI
    .map(([word, count]) => ({ word, count }));
    
  // Advanced Metrics
  const totalWordLength = sanitizedWords.reduce((sum, word) => sum + word.length, 0);
  const averageWordLength = words > 0 ? totalWordLength / words : 0;
  const averageSentenceLength = sentences > 0 ? words / sentences : 0;
  
  // Reading/Speaking Time
  const readingTime = Math.ceil(words / 200); // 200 WPM
  const speakingTime = Math.ceil(words / 150); // 150 WPM

  // Flesch Reading Ease Score
  const totalSyllables = sanitizedWords.reduce((sum, word) => sum + countSyllables(word), 0);
  let fleschScore = 0;
  if (words > 0 && sentences > 0) {
    fleschScore = 206.835 - 1.015 * (words / sentences) - 84.6 * (totalSyllables / words);
  }
  
  const getReadingLevelFromScore = (score: number) => {
    if (score >= 90) return "Very Easy";
    if (score >= 80) return "Easy";
    if (score >= 70) return "Fairly Easy";
    if (score >= 60) return "Standard";
    if (score >= 50) return "Fairly Difficult";
    if (score >= 30) return "Difficult";
    return "Very Confusing";
  };
  
  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    uniqueWords,
    averageWordLength: parseFloat(averageWordLength.toFixed(2)),
    averageSentenceLength: parseFloat(averageSentenceLength.toFixed(2)),
    readingTime,
    speakingTime,
    fleschScore: parseFloat(fleschScore.toFixed(2)),
    readingLevel: getReadingLevelFromScore(fleschScore),
    topWords,
  };
};

// --- API Handler ---

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid input: text must be a string.' }, { status: 400 });
    }

    const stats = analyzeText(text);
    return NextResponse.json(stats);

  } catch (error) {
    console.error('Analysis API Error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 