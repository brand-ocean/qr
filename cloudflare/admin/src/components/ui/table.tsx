import type React from 'react';
import { cx } from '../../lib/utils';

export function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table
        className={cx(
          'w-full caption-bottom border-collapse text-sm',
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function TableHead({
  className,
  ...props
}: React.ComponentProps<'thead'>) {
  return (
    <thead
      className={cx(
        'border-b border-gray-200 text-left dark:border-gray-800',
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      className={cx('divide-y divide-gray-200 dark:divide-gray-800', className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      className={cx(
        'transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/40',
        className,
      )}
      {...props}
    />
  );
}

export function TableHeaderCell({
  className,
  ...props
}: React.ComponentProps<'th'>) {
  return (
    <th
      className={cx(
        'px-3 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap text-gray-500 uppercase dark:text-gray-400',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      className={cx(
        'px-3 py-2.5 whitespace-nowrap text-gray-700 dark:text-gray-300',
        className,
      )}
      {...props}
    />
  );
}
