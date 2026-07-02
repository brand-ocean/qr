// Tremor Badge — ported (CVA + accent tokens).
import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import { cx } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-x-1 whitespace-nowrap rounded-md px-2 py-1 font-medium text-xs ring-1 ring-inset',
  {
    variants: {
      variant: {
        default: [
          'bg-accent-50 text-accent-900 ring-accent-500/30',
          'dark:bg-accent-400/10 dark:text-accent-400 dark:ring-accent-400/30',
        ],
        neutral: [
          'bg-gray-50 text-gray-900 ring-gray-500/30',
          'dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20',
        ],
        success: [
          'bg-emerald-50 text-emerald-900 ring-emerald-600/30',
          'dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20',
        ],
        error: [
          'bg-red-50 text-red-900 ring-red-600/20',
          'dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20',
        ],
        warning: [
          'bg-yellow-50 text-yellow-900 ring-yellow-600/30',
          'dark:bg-yellow-400/10 dark:text-yellow-500 dark:ring-yellow-400/20',
        ],
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

interface BadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cx(badgeVariants({ variant }), className)} {...props} />
  );
}
