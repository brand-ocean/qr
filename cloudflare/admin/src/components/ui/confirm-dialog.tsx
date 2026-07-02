import { AlertDialog } from '@base-ui/react/alert-dialog';
import type React from 'react';
import { Button } from './button';

// Base UI (shadcn-style) confirmation modal. Controlled via `open`.
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Bevestigen',
  cancelLabel = 'Annuleren',
  variant = 'primary',
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'destructive';
  onConfirm: () => void;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-[60] bg-black/50" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-6 shadow-xl outline-none dark:border-gray-800 dark:bg-gray-900">
          <AlertDialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-50">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </AlertDialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
            <Button
              variant={variant}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
