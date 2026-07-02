import type React from 'react';
import { cx } from '../../lib/utils';

export function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      className={cx(
        'text-sm font-medium text-gray-900 dark:text-gray-50',
        className,
      )}
      {...props}
    />
  );
}
