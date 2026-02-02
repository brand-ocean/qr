import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SunburstBackground from 'src/ui/SunburstBackground.tsx';
import Text from 'src/ui/Text.tsx';
import useViewerContext from 'src/user/useViewerContext.tsx';

export default function Login() {
  const router = useRouter();
  const { login } = useViewerContext();
  const [progress, setProgress] = useState(0);
  const [showButton, setShowButton] = useState(false);

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
          setTimeout(() => setShowButton(true), 500);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  const onPress = useCallback(async () => {
    await login();
    router.replace('/');
  }, [login, router]);

  return (
    <View style={styles.container}>
      {/* Sunburst Background */}
      <SunburstBackground />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>VIRALS</Text>
            <Text style={styles.subtitle}>MEME EDITIE</Text>
          </View>

          {/* Loader or Start Button */}
          <View style={styles.loaderContainer}>
            {!showButton ? (
              <>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
                </View>
                <Text style={styles.loadingText}>LADEN...</Text>
              </>
            ) : (
              <Pressable onPress={onPress} style={styles.startButton}>
                <Text style={styles.startButtonText}>START SPEL</Text>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    gap: 60,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  header: {
    alignItems: 'center',
    transform: [{ rotate: '-2deg' }],
  },
  loaderContainer: {
    alignItems: 'center',
    gap: 15,
    width: '100%',
  },
  loadingText: {
    color: 'white',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 20,
    textShadowColor: '#000',
    textShadowOffset: { height: 2, width: 2 },
    textShadowRadius: 0,
  },
  progressBar: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderRadius: 12,
    borderWidth: 3,
    height: 24,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: '#4CD964',
    borderRightColor: 'black',
    borderRightWidth: 3,
    height: '100%',
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  startButton: {
    backgroundColor: '#4CD964',
    borderColor: 'black',
    borderWidth: 4,
    elevation: 6,
    paddingHorizontal: 40,
    paddingVertical: 20,
    shadowColor: 'black',
    shadowOffset: { height: 6, width: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  startButtonText: {
    color: 'black',
    fontFamily: 'AeonikFono-Black',
    fontSize: 24,
    textTransform: 'uppercase',
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
