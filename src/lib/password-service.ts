// src/lib/password-service.ts

// --- TYPE DEFINITIONS ---
export interface PasswordSettings {
  passwordType: "random" | "passphrase";
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  minDigits: number;
  minSymbols: number;
  wordCount: number;
  separator: string;
  capitalizeWords: boolean;
  addNumbers: boolean;
}

// --- SECURE RANDOMNESS ---
const secureRandom = (max: number): number => {
  const randomValues = new Uint32Array(1);
  window.crypto.getRandomValues(randomValues);
  return randomValues[0] % max;
};

// --- CHARACTER SETS ---
const CHARSETS = {
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
  NUMBERS: '0123456789',
  SYMBOLS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  SIMILAR: /[il1Lo0O]/g,
  AMBIGUOUS: /[{}[\]()/\\'"`~,;:.<>]/g,
};

// --- HELPER: SHUFFLE ARRAY ---
const shuffle = (array: string[]): string[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// --- IMPROVED GENERATOR FUNCTIONS ---

/**
 * Generates a truly random password, guaranteeing requirements.
 */
export const generateRandomPassword = (options: PasswordSettings): string => {
  let availableChars = '';
  if (options.includeUppercase) availableChars += CHARSETS.UPPERCASE;
  if (options.includeLowercase) availableChars += CHARSETS.LOWERCASE;
  if (options.includeNumbers) availableChars += CHARSETS.NUMBERS;
  if (options.includeSymbols) availableChars += CHARSETS.SYMBOLS;

  if (options.excludeSimilar) availableChars = availableChars.replace(CHARSETS.SIMILAR, '');
  if (options.excludeAmbiguous) availableChars = availableChars.replace(CHARSETS.AMBIGUOUS, '');

  if (!availableChars) return "Select character types";

  let guaranteedChars: string[] = [];

  // Fulfill minimum requirements first
  if (options.includeNumbers) {
    for (let i = 0; i < options.minDigits; i++) {
      guaranteedChars.push(CHARSETS.NUMBERS[secureRandom(CHARSETS.NUMBERS.length)]);
    }
  }
  if (options.includeSymbols) {
    for (let i = 0; i < options.minSymbols; i++) {
      guaranteedChars.push(CHARSETS.SYMBOLS[secureRandom(CHARSETS.SYMBOLS.length)]);
    }
  }

  // Fill the rest of the password length
  const remainingLength = options.length - guaranteedChars.length;
  for (let i = 0; i < remainingLength; i++) {
    guaranteedChars.push(availableChars[secureRandom(availableChars.length)]);
  }

  // Shuffle to ensure random placement
  return shuffle(guaranteedChars).join('');
};

/**
 * Generates a passphrase from a given wordlist.
 */
export const generatePassphrase = (options: PasswordSettings, wordlist: string[]): string => {
  if (!wordlist || wordlist.length === 0) return "Wordlist loading...";
  
  const words = Array.from({ length: options.wordCount }, () => {
    let word = wordlist[secureRandom(wordlist.length)];
    return options.capitalizeWords ? word.charAt(0).toUpperCase() + word.slice(1) : word;
  });

  let passphrase = words.join(options.separator);
  if (options.addNumbers) {
    passphrase += secureRandom(1000); // Append a number up to 999
  }
  return passphrase;
};

// --- ANALYSIS FUNCTIONS ---

/**
 * Calculates entropy based on the generation settings, which is more accurate.
 */
export const calculateEntropy = (settings: PasswordSettings, wordlistSize: number): number => {
    if (settings.passwordType === 'passphrase') {
        if (wordlistSize === 0) return 0;
        const entropyPerWord = Math.log2(wordlistSize);
        let totalEntropy = settings.wordCount * entropyPerWord;
        // A rough addition for capitalization and numbers
        if (settings.capitalizeWords) totalEntropy += settings.wordCount;
        if (settings.addNumbers) totalEntropy += Math.log2(1000); // For numbers 0-999
        return parseFloat(totalEntropy.toFixed(2));
    }

    // For random passwords
    let poolSize = 0;
    if (settings.includeUppercase) poolSize += 26;
    if (settings.includeLowercase) poolSize += 26;
    if (settings.includeNumbers) poolSize += 10;
    if (settings.includeSymbols) poolSize += 32; // A common estimate
    if (poolSize === 0) return 0;
    
    const entropy = settings.length * Math.log2(poolSize);
    return parseFloat(entropy.toFixed(2));
};

/**
 * Provides a human-readable strength label and color.
 */
export const getStrengthInfo = (entropy: number) => {
    if (entropy < 40) return { label: "Very Weak", color: "bg-red-500" };
    if (entropy < 60) return { label: "Weak", color: "bg-orange-500" };
    if (entropy < 80) return { label: "Fair", color: "bg-yellow-500" };
    if (entropy < 100) return { label: "Good", color: "bg-blue-500" };
    return { label: "Strong", color: "bg-green-500" };
};

/**
 * Estimates the time to crack a password based on its entropy.
 */
export const estimateCrackTime = (entropy: number): string => {
    if (entropy === 0) return "N/A";

    const guessesPerSecond = 1e12; // 1 trillion guesses/sec (a very strong cracking setup)
    const totalCombinations = Math.pow(2, entropy);
    const seconds = totalCombinations / guessesPerSecond;

    if (seconds < 1) return "Instantly";
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
    if (seconds < 3153600000000) return `${Math.round(seconds / 31536000)} thousand years`;
    return "Centuries";
};