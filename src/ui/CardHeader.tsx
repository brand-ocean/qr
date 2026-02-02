import { VStack } from '@nkzw/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { cx } from 'src/lib/cx.tsx';
import colors from './colors.ts';
import Text from './Text.tsx';

// Enable className support for LinearGradient
cssInterop(LinearGradient, {
  className: { target: 'style' },
});

type CardHeaderProps = {
  readonly icon?: ReactNode;
  readonly subtitle?: string;
  readonly title: string;
};

export default function CardHeader({ icon, subtitle, title }: CardHeaderProps) {
  return (
    <LinearGradient
      className={cx('rounded-3xl px-6 py-4', 'shadow-lg')}
      colors={[colors.greenLight, colors.blueLight]}
      end={{ x: 1, y: 0 }}
      start={{ x: 0, y: 0 }}
    >
      <VStack gap={12}>
        {icon && <View className="h-8 w-8">{icon}</View>}
        <View className="flex-1">
          <Text className="text-2xl font-bold text-screen" numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text className="mt-1 text-sm text-screen opacity-90">
              {subtitle}
            </Text>
          )}
        </View>
      </VStack>
    </LinearGradient>
  );
}
