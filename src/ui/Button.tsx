import * as Slot from '@rn-primitives/slot';
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
  variants: {
    variant: {
      primary: 'ios:active:opacity-80 bg-primary',
      secondary:
        'ios:border-primary ios:active:bg-primary/5 border border-textLight/40',
      tonal:
        'ios:bg-primary/10 dark:ios:bg-primary/10 ios:active:bg-primary/15 bg-primary/15 dark:bg-primary/30',
      plain: 'ios:active:opacity-70',
    },
    size: {
      none: '',
      sm: 'py-1 px-2.5 rounded-full',
      md: 'ios:rounded-lg py-2 ios:py-1.5 ios:px-3.5 px-5 rounded-full',
      lg: 'py-2.5 px-5 ios:py-2 rounded-xl gap-2',
      icon: 'ios:rounded-lg h-10 w-10 rounded-full',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

const androidRootVariants = cva('overflow-hidden', {
  variants: {
    size: {
      none: '',
      icon: 'rounded-full',
      sm: 'rounded-full',
      md: 'rounded-full',
      lg: 'rounded-xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const buttonTextVariants = cva('font-medium', {
  variants: {
    variant: {
      primary: 'text-white',
      secondary: 'ios:text-primary text-text',
      tonal: 'ios:text-primary text-text',
      plain: 'text-text',
    },
    size: {
      none: '',
      icon: '',
      sm: 'text-[15px] leading-5',
      md: 'text-[17px] leading-7',
      lg: 'text-[17px] leading-7',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

const ANDROID_RIPPLE = {
  primary: { color: 'rgba(255, 255, 255, 0.3)', borderless: false },
  secondary: { color: 'rgba(255, 107, 53, 0.2)', borderless: false },
  plain: { color: 'rgba(0, 0, 0, 0.1)', borderless: false },
  tonal: { color: 'rgba(255, 107, 53, 0.2)', borderless: false },
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

const Root = Platform.OS === 'android' ? View : Slot.Pressable;

export default function Button({
  className,
  variant = 'primary',
  size,
  style = BORDER_CURVE,
  androidRootClassName,
  ...props
}: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Root
        className={Platform.select({
          ios: undefined,
          default: androidRootVariants({
            size,
            className: androidRootClassName,
          }),
        })}
      >
        <Pressable
          className={cx(
            props.disabled && 'opacity-50',
            buttonVariants({ variant, size, className }),
          )}
          style={style}
          android_ripple={ANDROID_RIPPLE[variant]}
          {...props}
        />
      </Root>
    </TextClassContext.Provider>
  );
}

export { buttonTextVariants, buttonVariants };
export type { ButtonProps };
