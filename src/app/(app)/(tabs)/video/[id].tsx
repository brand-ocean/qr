import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import {
  lockAsync,
  OrientationLock,
  unlockAsync,
} from 'expo-screen-orientation';
import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getVideoById, type VideoCard } from 'src/data/videos.ts';
import SunburstBackground from 'src/ui/SunburstBackground.tsx';
import Text from 'src/ui/Text.tsx';
import ViralButton from 'src/ui/ViralButton.tsx';
import YouTubePlayer from 'src/ui/YouTubePlayer.tsx';
import viralLogo from '../../../../../assets/images/virals-logo.png';

const LOGO_ASPECT_RATIO = 1279 / 771;

export default function VideoScreen() {
  const { height, width } = useWindowDimensions();
  const screenWidth = width;
  const isLandscape = width > height;
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [acknowledgedWarningForId, setAcknowledgedWarningForId] = useState<
    string | null
  >(null);

  useEffect(() => {
    unlockAsync();
    return () => {
      lockAsync(OrientationLock.PORTRAIT_UP);
    };
  }, []);

  const normalizedId = useMemo(() => {
    return id?.toLowerCase() ?? '';
  }, [id]);

  const video = useMemo<VideoCard | null>(() => {
    if (!normalizedId) {
      return null;
    }
    return getVideoById(normalizedId);
  }, [normalizedId]);

  const error = useMemo(() => {
    if (!normalizedId || video) {
      return null;
    }
    return `Video "${normalizedId}" niet gevonden`;
  }, [normalizedId, video]);

  const goBack = () => {
    router.replace('/');
  };

  const goHome = () => {
    router.replace('/');
  };

  if (error) {
    return (
      <View style={styles.container}>
        <SunburstBackground />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <View style={styles.buttonGroup}>
              <ViralButton onPress={goBack} title="TERUG" variant="outline" />
              <ViralButton
                onPress={goHome}
                title="NAAR HOME"
                variant="primary"
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!video) {
    return (
      <View style={styles.container}>
        <SunburstBackground />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Laden...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const shouldShowWarning =
    video.contentWarning && acknowledgedWarningForId !== video.id;

  // In landscape the card is 90% of screen height; compute the video width
  // that fits the card's inner height at 16:9, leaving room for the hint
  // text below: cardInnerHeight - border(10) - padding(40) - gap(16) - text(18)
  const landscapeVideoWidth = (height * 0.9 - 84) * (16 / 9);

  return (
    <View style={styles.container}>
      <SunburstBackground paused={isVideoPlaying} />
      <SafeAreaView style={styles.safeArea}>
        {!isLandscape && (
          <View style={styles.header}>
            <Image
              resizeMode="contain"
              source={viralLogo}
              style={[
                styles.logo,
                { height: (screenWidth * 0.8) / LOGO_ASPECT_RATIO },
              ]}
            />
          </View>
        )}
        <View
          style={[
            styles.cardContainer,
            isLandscape && { paddingVertical: height * 0.05 },
          ]}
        >
          <View style={[styles.card, isLandscape && styles.cardLandscape]}>
            {shouldShowWarning ? (
              <View style={styles.warningContainer}>
                <Text style={styles.warningTitle}>Let op</Text>
                <Text style={styles.warningText}>
                  Deze kaart bevat mogelijk schokkende of beledigende inhoud.
                </Text>
                <ViralButton
                  onPress={() => setAcknowledgedWarningForId(video.id)}
                  style={styles.fullWidthButton}
                  title="DOORGAAN"
                  variant="primary"
                />
                <ViralButton
                  onPress={goBack}
                  style={styles.fullWidthButton}
                  title="TERUG"
                  variant="outline"
                />
              </View>
            ) : isLandscape ? (
              <>
                <View
                  style={[
                    styles.landscapeVideoContainer,
                    { width: landscapeVideoWidth },
                  ]}
                >
                  <YouTubePlayer
                    endTime={video.endTime}
                    hideControls={true}
                    onPlayStateChange={setIsVideoPlaying}
                    startTime={video.startTime}
                    videoId={video.videoId}
                  />
                </View>
                <Text style={styles.rotateHint}>
                  ↺ Draai terug voor controls
                </Text>
              </>
            ) : (
              <>
                <YouTubePlayer
                  endTime={video.endTime}
                  onPlayStateChange={setIsVideoPlaying}
                  startTime={video.startTime}
                  videoId={video.videoId}
                />
                <Text style={styles.rotateHint}>
                  ↻ Draai voor groter scherm
                </Text>
                <ViralButton
                  onPress={() => router.push('/(app)/(tabs)/scanner' as Href)}
                  style={styles.fullWidthButton}
                  title="SCAN NIEUWE KAART"
                  variant="primary"
                />
                <ViralButton
                  onPress={goBack}
                  style={styles.fullWidthButton}
                  title="TERUG"
                  variant="outline"
                />
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonGroup: {
    gap: 16,
    maxWidth: 300,
    width: '100%',
  },
  card: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderRadius: 30,
    borderWidth: 5,
    elevation: 10,
    gap: 16,
    padding: 20,
    shadowColor: 'black',
    shadowOffset: { height: 15, width: 15 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardLandscape: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  errorCard: {
    alignItems: 'center',
    flex: 1,
    gap: 24,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: 'white',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 24,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { height: 3, width: 3 },
    textShadowRadius: 0,
  },
  fullWidthButton: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 80,
    transform: [{ rotate: '-2deg' }],
  },
  landscapeVideoContainer: {
    alignSelf: 'center',
  },
  loadingCard: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 24,
    textShadowColor: '#000',
    textShadowOffset: { height: 3, width: 3 },
    textShadowRadius: 0,
  },
  logo: {
    width: '80%',
  },
  rotateHint: {
    color: '#888',
    fontFamily: 'AeonikFono-Regular',
    fontSize: 13,
    textAlign: 'center',
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  warningContainer: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  warningText: {
    color: 'black',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  warningTitle: {
    color: 'black',
    fontFamily: 'AeonikFono-Black',
    fontSize: 30,
  },
});
