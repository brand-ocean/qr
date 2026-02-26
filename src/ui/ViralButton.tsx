import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { playClickSound } from '../lib/sound.ts';
import Text from './Text.tsx';

type ViralButtonProps = {
  readonly disabled?: boolean;
  readonly onPress: () => void;
  readonly style?: ViewStyle;
  readonly title: string;
  readonly variant?: 'primary' | 'secondary' | 'outline';
};

export default function ViralButton({
  disabled = false,
  onPress,
  style,
  title,
  variant = 'primary',
}: ViralButtonProps) {
  const handlePress = () => {
    playClickSound();
    onPress();
  };

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={handlePress}
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  disabled: {
    opacity: 0.5,
  },
  // Primary - Blue button
  primaryButton: {
    backgroundColor: '#007AFF',
    borderColor: 'black',
    borderWidth: 4,
    elevation: 4,
    shadowColor: 'black',
    shadowOffset: { height: 4, width: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  primaryText: {
    color: 'white',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  // Secondary - Yellow/Gold button
  secondaryButton: {
    backgroundColor: '#FFD700',
    borderColor: 'black',
    borderWidth: 4,
    elevation: 4,
    shadowColor: 'black',
    shadowOffset: { height: 4, width: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  secondaryText: {
    color: 'black',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  // Outline - Transparent with border
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: 'black',
    borderWidth: 4,
  },
  outlineText: {
    color: 'black',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 14,
    textTransform: 'uppercase',
  },
});
