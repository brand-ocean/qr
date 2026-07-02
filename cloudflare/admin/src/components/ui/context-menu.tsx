// Lean right-click context menu on Base UI, themed to the admin's tokens
// (Tremor-style gray surfaces + accent). Ported/simplified from the forz
// base-rhea context-menu.
import { ContextMenu as Primitive } from '@base-ui/react/context-menu';
import type React from 'react';
import { cx } from '../../lib/utils';

export const ContextMenu = Primitive.Root;
export const ContextMenuTrigger = Primitive.Trigger;
export const ContextMenuGroup = Primitive.Group;

export function ContextMenuContent({
  className,
  ...props
}: Primitive.Popup.Props) {
  return (
    <Primitive.Portal>
      <Primitive.Positioner className="isolate z-50 outline-none">
        <Primitive.Popup
          className={cx(
            'z-50 min-w-52 origin-(--transform-origin) overflow-hidden rounded-lg p-1 shadow-lg ring-1 outline-none',
            'bg-white text-gray-900 ring-black/5',
            'dark:bg-gray-900 dark:text-gray-50 dark:ring-white/10',
            className,
          )}
          {...props}
        />
      </Primitive.Positioner>
    </Primitive.Portal>
  );
}

// Plain label — NOT Base UI's GroupLabel, which requires a wrapping Group
// (it calls setLabelId from Group context and crashes without one).
export function ContextMenuLabel({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      role="presentation"
      className={cx('text-muted-foreground px-2 py-1 text-xs', className)}
      {...props}
    />
  );
}

export function ContextMenuItem({
  className,
  variant = 'default',
  ...props
}: Primitive.Item.Props & { variant?: 'default' | 'destructive' }) {
  return (
    <Primitive.Item
      data-variant={variant}
      className={cx(
        'relative flex min-h-8 cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none',
        'focus:bg-gray-100 data-highlighted:bg-gray-100 dark:focus:bg-gray-800 dark:data-highlighted:bg-gray-800',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        variant === 'destructive' &&
          'text-red-600 focus:bg-red-50 data-highlighted:bg-red-50 dark:text-red-400 dark:focus:bg-red-950/40 dark:data-highlighted:bg-red-950/40',
        className,
      )}
      {...props}
    />
  );
}

export function ContextMenuSeparator({
  className,
  ...props
}: Primitive.Separator.Props) {
  return (
    <Primitive.Separator
      className={cx('-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-800', className)}
      {...props}
    />
  );
}
