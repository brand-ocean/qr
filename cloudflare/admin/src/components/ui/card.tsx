// Tremor Raw Card — ported.
import type React from 'react';
import { cx } from '../../lib/utils';

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cx(
        'relative w-full rounded-lg border p-6 text-left shadow-sm',
        'bg-white dark:bg-gray-900',
        'border-gray-200 dark:border-gray-800',
        className,
      )}
      {...props}
    />
  );
}
