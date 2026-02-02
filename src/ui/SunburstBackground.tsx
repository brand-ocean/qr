import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { Path, Svg } from 'react-native-svg';

type SunburstBackgroundProps = {
  readonly paused?: boolean;
  readonly style?: ViewStyle;
};

// Exact segment definitions matching web CSS conic-gradient 1:1
const SUNBURST_SEGMENTS = [
  // Greens (0-72deg)
  { color: '#22B331', endDeg: 23, startDeg: 0 },
  { color: '#016A2A', endDeg: 46, startDeg: 23 },
  { color: '#22B331', endDeg: 69, startDeg: 46 },
  { color: '#FFFFFF', endDeg: 72, startDeg: 69 },
  // Reds (72-144deg)
  { color: '#EC001B', endDeg: 95, startDeg: 72 },
  { color: '#7E131C', endDeg: 118, startDeg: 95 },
  { color: '#EC001B', endDeg: 141, startDeg: 118 },
  { color: '#FFFFFF', endDeg: 144, startDeg: 141 },
  // Yellows (144-216deg)
  { color: '#FFF200', endDeg: 167, startDeg: 144 },
  { color: '#FF8C00', endDeg: 190, startDeg: 167 },
  { color: '#FFF200', endDeg: 213, startDeg: 190 },
  { color: '#FFFFFF', endDeg: 216, startDeg: 213 },
  // Blues (216-288deg)
  { color: '#00B1E0', endDeg: 239, startDeg: 216 },
  { color: '#1B5096', endDeg: 262, startDeg: 239 },
  { color: '#00B1E0', endDeg: 285, startDeg: 262 },
  { color: '#FFFFFF', endDeg: 288, startDeg: 285 },
  // Purples (288-360deg)
  { color: '#B52D87', endDeg: 311, startDeg: 288 },
  { color: '#6D297F', endDeg: 334, startDeg: 311 },
  { color: '#B52D87', endDeg: 357, startDeg: 334 },
  { color: '#FFFFFF', endDeg: 360, startDeg: 357 },
];

// Convert degrees to radians
const degToRad = (deg: number) => (deg * Math.PI) / 180;

// Create SVG arc path for a pie slice
function createPieSlice(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  // SVG coordinates: 0 degrees is at 3 o'clock, but CSS conic-gradient starts at 12 o'clock
  // So we need to subtract 90 degrees
  const startRad = degToRad(startAngle - 90);
  const endRad = degToRad(endAngle - 90);

  const x1 = centerX + radius * Math.cos(startRad);
  const y1 = centerY + radius * Math.sin(startRad);
  const x2 = centerX + radius * Math.cos(endRad);
  const y2 = centerY + radius * Math.sin(endRad);

  // Large arc flag: 1 if angle > 180 degrees
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
}

export default function SunburstBackground({
  paused = false,
  style,
}: SunburstBackgroundProps) {
  const { height, width } = useWindowDimensions();
  const baseSize = Math.max(width, height) || 1;
  const svgSize = baseSize * 2; // match CSS 200vmax
  const center = svgSize / 2;
  const radius = svgSize / 2;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (paused) {
      // Stop animation
      if (animationRef.current) {
        animationRef.current.stop();
      }
    } else {
      // Start/resume rotation animation - 60s for full rotation like web
      animationRef.current = Animated.loop(
        Animated.timing(rotateAnim, {
          duration: 60_000,
          easing: Easing.linear,
          toValue: 1,
          useNativeDriver: true,
        }),
      );
      animationRef.current.start();
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [paused, rotateAnim]);

  const spin = useMemo(
    () =>
      rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      }),
    [rotateAnim],
  );

  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.sunburst,
          {
            height: svgSize,
            transform: [{ rotate: spin }],
            width: svgSize,
          },
        ]}
      >
        <Svg
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          width={svgSize}
        >
          {SUNBURST_SEGMENTS.map((segment, index) => (
            <Path
              d={createPieSlice(
                center,
                center,
                radius,
                segment.startDeg,
                segment.endDeg,
              )}
              fill={segment.color}
              key={index}
            />
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sunburst: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
