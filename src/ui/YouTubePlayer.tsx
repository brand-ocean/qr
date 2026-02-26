import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { ComponentType } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import _YoutubeIframe, {
  type YoutubeIframeRef,
} from 'react-native-youtube-iframe';
import { playClickSound } from 'src/lib/sound.ts';
import colors from './colors.ts';
import Text from './Text.tsx';

// Type assertion for React 19 compatibility (package uses deprecated React.VFC)
const YoutubeIframe = _YoutubeIframe as unknown as ComponentType<{
  allowWebViewZoom: boolean;
  forceAndroidAutoplay?: boolean;
  height: number;
  initialPlayerParams: {
    color: string;
    controls: boolean;
    end?: number;
    iv_load_policy: number;
    modestbranding?: boolean;
    preventFullScreen: boolean;
    rel: boolean;
    start: number;
  };
  onChangeState: (state: string) => void;
  onError: (error: string) => void;
  onReady: () => void;
  play: boolean;
  ref: React.Ref<YoutubeIframeRef>;
  videoId: string;
  webViewProps: {
    allowsLinkPreview?: boolean;
    androidLayerType?: 'none' | 'software' | 'hardware';
    bounces: boolean;
    mediaPlaybackRequiresUserAction?: boolean;
    onShouldStartLoadWithRequest?: (event: {
      navigationType: string;
      title?: string;
      url: string;
    }) => boolean;
    renderToHardwareTextureAndroid?: boolean;
    scrollEnabled: boolean;
  };
  webViewStyle?: StyleProp<ViewStyle>;
}>;

export type YouTubePlayerHandle = {
  replay: () => void;
  togglePlay: () => void;
};

type YouTubePlayerProps = {
  readonly endTime: number;
  readonly hideControls?: boolean;
  readonly onPlayStateChange?: (playing: boolean) => void;
  readonly onReadyChange?: (ready: boolean) => void;
  readonly onReplay?: () => void;
  readonly ref?: React.Ref<YouTubePlayerHandle>;
  readonly startTime: number;
  readonly videoId: string;
};

export default function YouTubePlayerComponent({
  endTime,
  hideControls = false,
  onPlayStateChange,
  onReadyChange,
  onReplay,
  ref,
  startTime,
  videoId,
}: YouTubePlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const playerRef = useRef<YoutubeIframeRef>(null);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  // Reset state when video changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPlaying(false);
      setIsReady(false);
      setError(null);
      onPlayStateChange?.(false);
      onReadyChange?.(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [videoId, onPlayStateChange, onReadyChange]);

  const handleStateChange = useCallback(
    async (state: string) => {
      if (state === 'ended') {
        if (endTime > 0 && playerRef.current) {
          await playerRef.current.seekTo(startTime, true);
          setPlaying(true);
          onPlayStateChange?.(true);
          return;
        }

        setPlaying(false);
        onPlayStateChange?.(false);
        return;
      }

      if (state === 'paused') {
        setPlaying(false);
        onPlayStateChange?.(false);
        return;
      }

      if (state === 'playing') {
        setPlaying(true);
        onPlayStateChange?.(true);
      }
    },
    [endTime, onPlayStateChange, startTime],
  );

  const handleReady = useCallback(() => {
    setIsReady(true);
    onReadyChange?.(true);
  }, [onReadyChange]);

  const handleError = useCallback(
    (errorMsg: string) => {
      setError(`Video error: ${errorMsg}`);
      setIsReady(false);
      onReadyChange?.(false);
    },
    [onReadyChange],
  );

  const handleReplay = useCallback(async () => {
    playClickSound();
    setPlaying(true);
    onPlayStateChange?.(true);
    if (playerRef.current) {
      await playerRef.current.seekTo(startTime, true);
    }
    onReplay?.();
  }, [startTime, onReplay, onPlayStateChange]);

  const handleTogglePlay = useCallback(async () => {
    playClickSound();
    const newState = !playing;
    setPlaying(newState);
    onPlayStateChange?.(newState);
    if (newState && playerRef.current) {
      const currentTime = await playerRef.current.getCurrentTime();
      await playerRef.current.seekTo(currentTime, true);
    }
  }, [playing, onPlayStateChange]);

  useImperativeHandle(
    ref,
    () => ({
      replay: handleReplay,
      togglePlay: handleTogglePlay,
    }),
    [handleTogglePlay, handleReplay],
  );

  // Block navigation to external YouTube links (logo, title clicks)
  const handleShouldStartLoad = useCallback(
    (event: { navigationType: string; title?: string; url: string }) => {
      const { url } = event;
      if (
        url.includes('youtube.com/embed/') ||
        url.includes('www.youtube.com/embed/')
      ) {
        return true;
      }
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return false;
      }
      return true;
    },
    [],
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={handleReplay} style={styles.retryButton}>
          <Text style={styles.buttonText}>OPNIEUW</Text>
        </Pressable>
      </View>
    );
  }

  const playerEndTime = endTime > 0 ? endTime : undefined;
  const videoHeight = containerWidth > 0 ? containerWidth * (9 / 16) : 220;

  return (
    <View style={styles.container}>
      <View onLayout={handleLayout} style={styles.videoWrapper}>
        {!isReady && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.primaryYellow} size="large" />
            <Text style={styles.loadingText}>Laden...</Text>
          </View>
        )}
        <YoutubeIframe
          allowWebViewZoom={false}
          forceAndroidAutoplay={true}
          height={videoHeight}
          initialPlayerParams={{
            color: 'white',
            controls: false,
            end: playerEndTime,
            iv_load_policy: 3,
            modestbranding: true,
            preventFullScreen: false,
            rel: false,
            start: startTime,
          }}
          key={`${videoId}-${startTime}-${endTime}`}
          onChangeState={handleStateChange}
          onError={handleError}
          onReady={handleReady}
          play={playing}
          ref={playerRef}
          videoId={videoId}
          webViewProps={{
            allowsLinkPreview: false,
            androidLayerType:
              Platform.OS === 'android' ? 'hardware' : undefined,
            bounces: false,
            mediaPlaybackRequiresUserAction:
              Platform.OS === 'android' ? false : undefined,
            onShouldStartLoadWithRequest: handleShouldStartLoad,
            renderToHardwareTextureAndroid: true,
            scrollEnabled: false,
          }}
          webViewStyle={{ opacity: 0.99 }}
        />
        <View pointerEvents="none" style={styles.titleBlurBar} />
      </View>

      {/* Control Buttons */}
      {!hideControls && (
        <View style={styles.controls}>
          <Pressable
            disabled={!isReady}
            onPress={handleTogglePlay}
            style={[
              styles.controlButton,
              !isReady && styles.controlButtonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>
              {!isReady ? '...' : playing ? 'PAUSE' : 'PLAY'}
            </Text>
          </Pressable>

          <Pressable
            disabled={!isReady}
            onPress={handleReplay}
            style={[
              styles.controlButton,
              !isReady && styles.controlButtonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>REPLAY</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    color: 'black',
    fontFamily: 'AeonikFono-Black',
    fontSize: 18,
  },
  container: {
    gap: 15,
    width: '100%',
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderColor: 'black',
    borderRadius: 16,
    borderWidth: 4,
    flex: 1,
    paddingVertical: 15,
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 16,
    gap: 16,
    padding: 32,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: '#000',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    borderColor: 'black',
    borderWidth: 4,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  titleBlurBar: {
    backgroundColor: '#000',
    height: 36,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  videoWrapper: {
    backgroundColor: '#000',
    borderColor: 'white',
    borderRadius: 20,
    borderWidth: 4,
    overflow: 'hidden',
    width: '100%',
  },
});
