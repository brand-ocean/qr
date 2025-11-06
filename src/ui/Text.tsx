import { createContext, ReactNode, useContext } from 'react';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { Text as ReactNativeText, TextProps, TextStyle } from 'react-native';
import { cx } from 'src/lib/cx.tsx';

// Context for applying button text styles
export const TextClassContext = createContext<string | undefined>(undefined);

// Map Tailwind font weight classes to AeonikPro font families
function getFontFamily(className?: string): string {
  if (!className) return 'AeonikPro-Regular';

  // Check for font weight classes
  if (className.includes('font-black')) return 'AeonikPro-Black';
  if (className.includes('font-bold')) return 'AeonikPro-Bold';
  if (className.includes('font-semibold')) return 'AeonikPro-Bold';
  if (className.includes('font-medium')) return 'AeonikPro-Medium';
  if (className.includes('font-light')) return 'AeonikPro-Light';
  if (className.includes('font-thin')) return 'AeonikPro-Thin';

  return 'AeonikPro-Regular';
}

export default function Text({
  children,
  className,
  style,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & TextProps) {
  const textClass = useContext(TextClassContext);
  const combinedClassName = cx(textClass, className);
  const fontFamily = getFontFamily(combinedClassName);

  return (
    <ReactNativeText
      className={cx('text-[var(--text)]', combinedClassName)}
      style={[{ fontFamily } as TextStyle, style]}
      {...props}
    >
      {children}
    </ReactNativeText>
  );
}
