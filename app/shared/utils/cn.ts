import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and merges tailwind utility conflicts.
 * Uses clsx for conditional class resolution and tailwind-merge for proper overrides.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
