import type { ComponentType, CSSProperties, SVGProps } from 'react';
import { cx } from '../lib/utils';

// Two-tone "Bulk" icons (kiesbeter icon library). Each SVG has a primary layer
// and a secondary layer marked opacity="0.4". We remap both to CSS variables so
// a single text `color` (currentColor) drives the whole icon — the secondary
// layer just renders at reduced strength.
type BulkIconStyle = CSSProperties & {
  '--icon-primary'?: string;
  '--icon-secondary'?: string;
};

const MONO_TONE: BulkIconStyle = {
  '--icon-primary': 'currentColor',
  '--icon-secondary': 'color-mix(in oklch, currentColor 45%, transparent)',
};

export interface BulkIconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  size?: number | string;
  className?: string;
}

export function BulkIcon({
  icon: Icon,
  size = 20,
  className,
  style,
  ...props
}: BulkIconProps) {
  return (
    <Icon
      width={size}
      height={size}
      aria-hidden="true"
      className={cx(
        "shrink-0 [&_g[opacity='0.4']_path]:fill-[var(--icon-secondary)]! [&_path]:fill-[var(--icon-primary)]! [&_path[opacity='0.4']]:fill-[var(--icon-secondary)]!",
        className,
      )}
      style={{ ...MONO_TONE, ...style } as BulkIconStyle}
      {...props}
    />
  );
}
