// Tremor Button — ported (CVA + accent tokens).
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import type React from 'react';
import { cx, focusRing } from '../../lib/utils';

const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-2 text-center font-medium text-sm shadow-sm transition-all duration-100 ease-in-out',
    'disabled:pointer-events-none disabled:shadow-none disabled:opacity-60',
    ...focusRing,
  ],
  {
    variants: {
      variant: {
        primary: [
          'border-transparent text-white',
          'bg-accent-500 hover:bg-accent-600',
        ],
        secondary: [
          'border-gray-300 dark:border-gray-800',
          'text-gray-900 dark:text-gray-50',
          'bg-white dark:bg-gray-950',
          'hover:bg-gray-50 dark:hover:bg-gray-900/60',
        ],
        light: [
          'shadow-none border-transparent',
          'text-gray-900 dark:text-gray-50',
          'bg-gray-200 dark:bg-gray-900',
          'hover:bg-gray-300/70 dark:hover:bg-gray-800/80',
        ],
        ghost: [
          'shadow-none border-transparent bg-transparent',
          'text-gray-900 dark:text-gray-50',
          'hover:bg-gray-100 dark:hover:bg-gray-800/80',
        ],
        destructive: [
          'text-white border-transparent',
          'bg-red-600 dark:bg-red-700',
          'hover:bg-red-700 dark:hover:bg-red-600',
        ],
      },
      size: {
        default: 'h-9',
        sm: 'h-8 px-2.5 py-1 text-xs',
        lg: 'h-10 px-4 py-2.5',
        icon: 'size-9 p-0',
        'icon-sm': 'size-8 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export { buttonVariants };
