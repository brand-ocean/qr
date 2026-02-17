import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getVideoById, type VideoCard } from 'src/data/videos.ts';
import SunburstBackground from 'src/ui/SunburstBackground.tsx';
import Text from 'src/ui/Text.tsx';
import ViralButton from 'src/ui/ViralButton.tsx';
import YouTubePlayer from 'src/ui/YouTubePlayer.tsx';

export default function VideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [acknowledgedWarningForId, setAcknowledgedWarningForId] = useState<
    string | null
  >(null);

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
    router.back();
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

  return (
    <View style={styles.container}>
      <SunburstBackground paused={isVideoPlaying} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.videoName}>{video.quote}</Text>
        </View>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
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
            ) : (
              <>
                <YouTubePlayer
                  endTime={video.endTime}
                  onPlayStateChange={setIsVideoPlaying}
                  startTime={video.startTime}
                  videoId={video.videoId}
                />
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
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  videoName: {
    color: 'white',
    fontFamily: 'AeonikFono-Black',
    fontSize: 36,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { height: 4, width: 4 },
    textShadowRadius: 0,
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
