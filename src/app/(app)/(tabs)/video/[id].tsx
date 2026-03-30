import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';
import { useSettings } from 'src/context/SettingsContext.tsx';
import { getVideoById, type VideoCard } from 'src/data/videos.ts';
import SunburstBackground from 'src/ui/SunburstBackground.tsx';
import Text from 'src/ui/Text.tsx';
import ViralButton from 'src/ui/ViralButton.tsx';
import YouTubePlayer, {
  type YouTubePlayerHandle,
} from 'src/ui/YouTubePlayer.tsx';
import viralLogo from '../../../../../assets/images/virals-logo.png';

const LOGO_ASPECT_RATIO = 1279 / 771;

export default function VideoScreen() {
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const { setShowContentWarning, showContentWarning } = useSettings();

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

  if (error) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <View style={styles.buttonGroup}>
              <ViralButton onPress={goBack} title="TERUG" variant="outline" />
              <ViralButton
                onPress={goBack}
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
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Laden...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const shouldShowWarning = video.contentWarning && showContentWarning;

  return (
    <View style={styles.container}>
      <SunburstBackground paused />
      <View style={styles.darkOverlay} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header hidden in landscape — kept in tree to preserve YouTubePlayer mount index */}
        <View style={styles.headerHidden}>
          <Image
            resizeMode="contain"
            source={viralLogo}
            style={[styles.logo, { height: (width * 0.8) / LOGO_ASPECT_RATIO }]}
          />
        </View>

        <View style={styles.mainLayout}>
          {/* Video section */}
          <View style={styles.videoSection}>
            {shouldShowWarning ? (
              <View style={styles.noticeCard}>
                <Text style={styles.noticeTitle}>Let op</Text>
                <Text style={styles.noticeText}>
                  Deze kaart bevat mogelijk schokkende of beledigende inhoud.
                  Door op doorgaan te klikken, zet je de waarschuwing voortaan
                  uit. Je kunt dit altijd weer aanzetten via de spelregels.
                </Text>
                <ViralButton
                  onPress={() => setShowContentWarning(false)}
                  style={styles.fullWidthButton}
                  title="DOORGAAN"
                  variant="secondary"
                />
                <ViralButton
                  onPress={goBack}
                  style={styles.fullWidthButton}
                  title="TERUG"
                  variant="outline"
                />
              </View>
            ) : videoError ? (
              <View style={styles.noticeCard}>
                <Text style={styles.noticeTitle}>Video niet beschikbaar</Text>
                <Text style={styles.noticeText}>{videoError}</Text>
                <ViralButton
                  onPress={() => setVideoError(null)}
                  style={styles.fullWidthButton}
                  title="OPNIEUW PROBEREN"
                  variant="secondary"
                />
              </View>
            ) : (
              <View style={styles.videoFrame}>
                <YouTubePlayer
                  endTime={video.endTime}
                  onPlayStateChange={setIsVideoPlaying}
                  onReadyChange={setIsPlayerReady}
                  onVideoError={setVideoError}
                  ref={playerRef}
                  startTime={video.startTime}
                  videoId={video.videoId}
                />
              </View>
            )}
          </View>

          {/* Button panel */}
          <View style={styles.buttonPanel}>
            <View style={styles.signalBars}>
              <Svg height="30" viewBox="0 0 60 30" width="60">
                <Path
                  d="M 10 10 Q 30 0 50 10"
                  fill="none"
                  stroke="white"
                  strokeLinecap="round"
                  strokeWidth="4"
                />
                <Path
                  d="M 20 23 Q 30 16 40 23"
                  fill="none"
                  stroke="white"
                  strokeLinecap="round"
                  strokeWidth="4"
                />
              </Svg>
            </View>
            <View style={styles.buttonCard}>
              <ViralButton
                onPress={() => router.push('/(app)/(tabs)/scanner' as Href)}
                style={styles.compactButton}
                title="SCAN KAART"
                variant="primary"
              />
              <View style={styles.playRow}>
                <Pressable
                  disabled={!isPlayerReady}
                  onPress={() => playerRef.current?.togglePlay()}
                  style={[
                    styles.iconButton,
                    !isPlayerReady && styles.iconButtonDisabled,
                  ]}
                >
                  <Ionicons
                    color="black"
                    name={isVideoPlaying ? 'pause' : 'play'}
                    size={26}
                  />
                </Pressable>
                <Pressable
                  disabled={!isPlayerReady}
                  onPress={() => playerRef.current?.replay()}
                  style={[
                    styles.iconButton,
                    !isPlayerReady && styles.iconButtonDisabled,
                  ]}
                >
                  <MaterialIcons color="black" name="replay" size={26} />
                </Pressable>
              </View>
              <ViralButton
                onPress={goBack}
                style={styles.compactButton}
                title="TERUG"
                variant="outline"
              />
            </View>
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
  signalBars: {
    alignItems: 'center',
    marginBottom: 2,
  },
  buttonCard: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderRadius: 20,
    borderWidth: 4,
    elevation: 8,
    gap: 8,
    padding: 8,
    shadowColor: 'black',
    shadowOffset: { height: 6, width: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
  },
  buttonPanel: {
    justifyContent: 'center',
    paddingLeft: 12,
    paddingRight: 0,
    width: 185,
  },
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  errorCard: {
    alignItems: 'center',
    flex: 1,
    gap: 24,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: 'black',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 24,
    textAlign: 'center',
  },
  compactButton: {
    paddingHorizontal: 8,
    width: '100%',
  },
  fullWidthButton: {
    width: '100%',
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderColor: 'black',
    borderRadius: 16,
    borderWidth: 4,
    elevation: 4,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
    shadowColor: 'black',
    shadowOffset: { height: 4, width: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },
  playRow: {
    flexDirection: 'row',
    gap: 8,
  },
  headerHidden: {
    display: 'none',
  },
  loadingCard: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: 'black',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 24,
  },
  logo: {
    width: '80%',
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    paddingHorizontal: 12,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  videoFrame: {
    alignSelf: 'stretch',
    borderColor: 'white',
    borderRadius: 4,
    borderWidth: 4,
    overflow: 'hidden',
  },
  videoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  noticeCard: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderColor: 'black',
    borderRadius: 20,
    borderWidth: 4,
    elevation: 8,
    gap: 12,
    maxWidth: 340,
    padding: 20,
    shadowColor: 'black',
    shadowOffset: { height: 6, width: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    width: '90%',
  },
  noticeText: {
    color: 'black',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  noticeTitle: {
    color: 'black',
    fontFamily: 'AeonikFono-Black',
    fontSize: 22,
  },
});
