// Tremor Textarea — mirrors Input (accent focus tokens).
import type React from 'react';
import { cx, focusInput } from '../../lib/utils';

export function Textarea({
  className,
  rows = 3,
  ...props
}: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      rows={rows}
      className={cx(
        'block w-full appearance-none rounded-md border px-2.5 py-2 shadow-sm transition outline-none sm:text-sm',
        'border-gray-300 dark:border-gray-800',
        'text-gray-900 dark:text-gray-50',
        'placeholder-gray-400 dark:placeholder-gray-500',
        'bg-white dark:bg-gray-950',
        'disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400',
        'disabled:dark:border-gray-700 disabled:dark:bg-gray-800 disabled:dark:text-gray-500',
        ...focusInput,
        className,
      )}
      {...props}
    />
  );
}
