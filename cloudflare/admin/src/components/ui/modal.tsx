// Lightweight controlled modal, same overlay pattern as CardDialog: click the
// backdrop or press Escape to close, content clicks don't propagate. Kept as a
// plain overlay (rather than Base UI Dialog) to match the existing admin style.
import type React from 'react';
import { cx } from '../../lib/utils';
import { CancelIcon } from '../icons';
import { Button } from './button';

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      role="presentation"
    >
      <div
        className={cx(
          'my-8 w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900',
          className,
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-50">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Sluiten"
          >
            <CancelIcon className="size-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
