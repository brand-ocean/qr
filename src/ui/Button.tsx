import { Pressable as SlotPressable } from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Platform,
  Pressable,
  PressableProps,
  View,
  ViewStyle,
} from 'react-native';
import { cx } from '../lib/cx.tsx';
import { TextClassContext } from './Text.tsx';

const buttonVariants = cva('flex-row items-center justify-center gap-2', {
  defaultVariants: {
    size: 'md',
    variant: 'plain',
  },
  variants: {
    size: {
      icon: 'ios:rounded-lg h-10 w-10 rounded-full',
      lg: 'py-2.5 px-5 ios:py-2 rounded-xl gap-2',
      md: 'ios:rounded-lg py-2 ios:py-1.5 ios:px-3.5 px-5 rounded-full',
      none: '',
      sm: 'py-1 px-2.5 rounded-full',
    },
    variant: {
      plain: 'ios:active:opacity-70',
      primary: 'ios:active:opacity-80 bg-primary',
      secondary:
        'ios:border-primary ios:active:bg-primary/5 border border-textLight/40',
      tonal:
        'ios:bg-primary/10 dark:ios:bg-primary/10 ios:active:bg-primary/15 bg-primary/15 dark:bg-primary/30',
    },
  },
});

const androidRootVariants = cva('overflow-hidden', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      icon: 'rounded-full',
      lg: 'rounded-xl',
      md: 'rounded-full',
      none: '',
      sm: 'rounded-full',
    },
  },
});

const buttonTextVariants = cva('font-medium', {
  defaultVariants: {
    size: 'md',
    variant: 'plain',
  },
  variants: {
    size: {
      icon: '',
      lg: 'text-[17px] leading-7',
      md: 'text-[17px] leading-7',
      none: '',
      sm: 'text-[15px] leading-5',
    },
    variant: {
      plain: 'text-text',
      primary: 'text-white',
      secondary: 'ios:text-primary text-text',
      tonal: 'ios:text-primary text-text',
    },
  },
});

const ANDROID_RIPPLE = {
  plain: { borderless: false, color: 'rgba(0, 0, 0, 0.1)' },
  primary: { borderless: false, color: 'rgba(255, 255, 255, 0.3)' },
  secondary: { borderless: false, color: 'rgba(255, 107, 53, 0.2)' },
  tonal: { borderless: false, color: 'rgba(255, 107, 53, 0.2)' },
};

// Add as class when possible: https://github.com/marklawlor/nativewind/issues/522
const BORDER_CURVE: ViewStyle = {
  borderCurve: 'continuous',
};

type ButtonVariantProps = Omit<
  VariantProps<typeof buttonVariants>,
  'variant'
> & {
  variant?: Exclude<VariantProps<typeof buttonVariants>['variant'], null>;
};

type AndroidOnlyButtonProps = {
  /**
   * ANDROID ONLY: The class name of root responsible for hiding the ripple overflow.
   */
  androidRootClassName?: string;
};

type ButtonProps = PressableProps & ButtonVariantProps & AndroidOnlyButtonProps;

const Root = Platform.OS === 'android' ? View : SlotPressable;

export default function Button({
  androidRootClassName,
  className,
  size,
  style = BORDER_CURVE,
  variant = 'plain',
  ...props
}: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ size, variant })}>
      <Root
        className={Platform.select({
          default: androidRootVariants({
            className: androidRootClassName,
            size,
          }),
          ios: undefined,
        })}
      >
        <Pressable
          android_ripple={ANDROID_RIPPLE[variant]}
          className={cx(
            props.disabled && 'opacity-50',
            buttonVariants({ className, size, variant }),
          )}
          style={style}
          {...props}
        />
      </Root>
    </TextClassContext.Provider>
  );
}

export { buttonTextVariants, buttonVariants };
export type { ButtonProps };
