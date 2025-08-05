// src/lib/password-service.ts

// --- SECURE RANDOM NUMBER GENERATOR ---
// Uses the browser's crypto API instead of the insecure Math.random()
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

// --- GENERATOR FUNCTIONS ---

/**
 * Generates a truly random password.
 */
export const generateRandomPassword = (options: any): string => {
  let charset = '';
  if (options.includeUppercase) charset += CHARSETS.UPPERCASE;
  if (options.includeLowercase) charset += CHARSETS.LOWERCASE;
  if (options.includeNumbers) charset += CHARSETS.NUMBERS;
  if (options.includeSymbols) charset += CHARSETS.SYMBOLS;

  if (options.excludeSimilar) charset = charset.replace(CHARSETS.SIMILAR, '');
  if (options.excludeAmbiguous) charset = charset.replace(CHARSETS.AMBIGUOUS, '');

  if (!charset) return "Select character types";

  let password = '';
  const charsetArray = Array.from(charset);
  
  // This loop is more robust for ensuring character requirements
  while (true) {
    password = '';
    for (let i = 0; i < options.length; i++) {
      password += charsetArray[secureRandom(charsetArray.length)];
    }

    // Validate against requirements
    const hasEnoughDigits = (password.match(/\d/g) || []).length >= options.minDigits;
    const hasEnoughSymbols = (password.match(/[!@#$%^&*()_+-=[\]{}|;:,.<>?]/g) || []).length >= options.minSymbols;

    if (hasEnoughDigits && hasEnoughSymbols) {
      break; // Password is valid
    }
  }

  return password;
};

/**
 * Generates a passphrase from a given wordlist.
 */
export const generatePassphrase = (options: any, wordlist: string[]): string => {
  if (!wordlist || wordlist.length === 0) {
    return "Wordlist loading...";
  }
  let words = [];
  for (let i = 0; i < options.wordCount; i++) {
    let word = wordlist[secureRandom(wordlist.length)];
    if (options.capitalizeWords) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    words.push(word);
  }

  let passphrase = words.join(options.separator);
  if (options.addNumbers) {
    passphrase += secureRandom(1000);
  }
  return passphrase;
};

/**
 * Calculates the entropy of a password.
 * Entropy (E) = log2(N^L) = L * log2(N)
 * L = password length
 * N = size of the character pool
 */
export const calculateEntropy = (password: string): number => {
    if (!password) return 0;
    
    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/\d/.test(password)) poolSize += 10;
    if (/[^a-zA-Z\d]/.test(password)) poolSize += 32; // Common symbol set size

    if (poolSize === 0) return 0;

    const entropy = password.length * Math.log2(poolSize);
    return parseFloat(entropy.toFixed(2));
};

export const getStrengthInfo = (entropy: number) => {
    if (entropy < 40) return { label: "Very Weak", color: "bg-red-500" };
    if (entropy < 60) return { label: "Weak", color: "bg-orange-500" };
    if (entropy < 80) return { label: "Fair", color: "bg-yellow-500" };
    if (entropy < 100) return { label: "Good", color: "bg-blue-500" };
    return { label: "Strong", color: "bg-green-500" };
}; 