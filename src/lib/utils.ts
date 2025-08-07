import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a cryptographically secure random number between 0 and max (exclusive)
 * @param max The maximum value (exclusive)
 * @returns A secure random number
 */
export function secureRandom(max: number): number {
  if (max <= 0) return 0;
  
  // Use crypto.getRandomValues for secure random numbers
  const randomValues = new Uint32Array(1);
  crypto.getRandomValues(randomValues);
  return randomValues[0] % max;
}

/**
 * Generates a cryptographically secure random number between min and max (inclusive)
 * @param min The minimum value (inclusive)
 * @param max The maximum value (inclusive)
 * @returns A secure random number
 */
export function secureRandomRange(min: number, max: number): number {
  if (min >= max) return min;
  return min + secureRandom(max - min + 1);
}

/**
 * Generates a cryptographically secure random string of specified length
 * @param length The length of the string to generate
 * @param charset The character set to use (default: alphanumeric)
 * @returns A secure random string
 */
export function secureRandomString(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  
  return result;
}
