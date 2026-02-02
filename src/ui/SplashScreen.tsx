import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import SunburstBackground from './SunburstBackground.tsx';
import Text from './Text.tsx';

type SplashScreenProps = {
  readonly onComplete: () => void;
};

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar animation
    const duration = 2500;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <View style={styles.container}>
      {/* Sunburst Background - exact 1:1 match with web */}
      <SunburstBackground />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>VIRALS</Text>
          <Text style={styles.subtitle}>MEME EDITIE</Text>
        </View>

        <View style={styles.loaderContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.loadingText}>LADEN...</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    gap: 40,
    maxWidth: 400,
    paddingHorizontal: 20,
    width: '100%',
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    transform: [{ rotate: '-2deg' }],
  },
  loaderContainer: {
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  loadingText: {
    color: 'white',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 18,
    textShadowColor: '#000',
    textShadowOffset: { height: 2, width: 2 },
    textShadowRadius: 0,
  },
  progressBar: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderRadius: 10,
    borderWidth: 3,
    height: 20,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: '#4CD964',
    borderRightColor: 'black',
    borderRightWidth: 3,
    height: '100%',
  },
  subtitle: {
    color: '#FFCC00',
    fontFamily: 'AeonikFono-Black',
    fontSize: 40,
    marginTop: -10,
    textShadowColor: '#000',
    textShadowOffset: { height: 3, width: 3 },
    textShadowRadius: 0,
  },
  title: {
    color: 'white',
    fontFamily: 'AeonikFono-Black',
    fontSize: 80,
    letterSpacing: -2,
    lineHeight: 72,
    textShadowColor: '#000',
    textShadowOffset: { height: 4, width: 4 },
    textShadowRadius: 0,
  },
});
