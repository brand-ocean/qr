import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tremor Raw cx — merge + dedupe Tailwind classes.
export function cx(...args: ClassValue[]): string {
  return twMerge(clsx(...args));
}

// Tremor Raw focusRing — accent-driven focus outline.
export const focusRing = [
  'outline outline-offset-2 outline-0 focus-visible:outline-2',
  'outline-accent-500 dark:outline-accent-500',
];

// Tremor Raw focusInput — accent-driven focus for inputs.
export const focusInput = [
  'focus:ring-2',
  'focus:ring-accent-200 focus:dark:ring-accent-700/30',
  'focus:border-accent-500 focus:dark:border-accent-700',
];
