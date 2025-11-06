import { VStack } from '@nkzw/stack';
import { BlurView } from 'expo-blur';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import { ActivityIndicator, View } from 'react-native';
import _YoutubeIframe, {
  type YoutubeIframeRef,
} from 'react-native-youtube-iframe';
import { cx } from 'src/lib/cx.tsx';
import Button from './Button.tsx';
import colors from './colors.ts';
import Text from './Text.tsx';

// Type assertion for React 19 compatibility (package uses deprecated React.VFC)
const YoutubeIframe = _YoutubeIframe as unknown as ComponentType<{
  ref: React.Ref<YoutubeIframeRef>;
  height: number;
  play: boolean;
  videoId: string;
  onChangeState: (state: string) => void;
  onReady: () => void;
  onError: (error: string) => void;
  initialPlayerParams: {
    start: number;
    end: number;
    preventFullScreen: boolean;
    controls: boolean;
    color: string;
    iv_load_policy: number;
    rel: boolean;
  };
  webViewProps: {
    scrollEnabled: boolean;
    bounces: boolean;
    allowsLinkPreview?: boolean;
    onShouldStartLoadWithRequest?: (event: {
      url: string;
      title?: string;
      navigationType: string;
    }) => boolean;
  };
  allowWebViewZoom: boolean;
}>;

type YouTubePlayerProps = {
  readonly videoId: string;
  readonly startTime: number; // in seconds
  readonly endTime: number; // in seconds
  readonly onReplay?: () => void;
};

export default function YouTubePlayerComponent({
  videoId,
  startTime,
  endTime,
  onReplay,
}: YouTubePlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReplay, setShowReplay] = useState(true); // Show play button initially
  const [hasPlayed, setHasPlayed] = useState(false); // Track if video has been played
  const playerRef = useRef<YoutubeIframeRef>(null);

  const handleStateChange = useCallback((state: string) => {
    if (state === 'ended' || state === 'paused') {
      setPlaying(false);
      if (state === 'ended') {
        setShowReplay(true);
      }
    } else if (state === 'playing') {
      setPlaying(true);
      setShowReplay(false);
      setHasPlayed(true);
    }
  }, []);

  const handleReady = useCallback(() => {
    setIsReady(true);
    // Don't autoplay - wait for user to press play button
  }, []);

  const handleError = useCallback((error: string) => {
    setError(`Video error: ${error}`);
    setIsReady(false);
  }, []);

  const handleReplay = useCallback(async () => {
    setShowReplay(false);
    setPlaying(true);
    if (playerRef.current) {
      await playerRef.current.seekTo(startTime, true);
    }
    onReplay?.();
  }, [startTime, onReplay]);

  // Block navigation to external YouTube links (logo, title clicks)
  const handleShouldStartLoad = useCallback(
    (event: { url: string; title?: string; navigationType: string }) => {
      const { url } = event;

      // Allow the initial video embed load
      if (
        url.includes('youtube.com/embed/') ||
        url.includes('www.youtube.com/embed/')
      ) {
        return true;
      }

      // Block any navigation to youtube.com (logo/title clicks)
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        console.log(
          '[YouTubePlayer] Blocked external YouTube navigation:',
          url,
        );
        return false; // Block the navigation
      }

      // Allow other URLs (though there shouldn't be any)
      return true;
    },
    [],
  );

  // Monitor playback time and stop at endTime
  const handleProgress = useCallback(
    async (currentTime: number) => {
      if (currentTime >= endTime && playing) {
        // Pause the video
        if (playerRef.current) {
          // Note: There's no explicit pause method, but setting playing to false should work
          // The YouTube API will stop at the 'end' parameter we set
        }
        setPlaying(false);
        setShowReplay(true);
      }
    },
    [endTime, playing],
  );

  // Set up interval to check current time
  useEffect(() => {
    if (!playing || !isReady) return;

    const interval = setInterval(async () => {
      if (playerRef.current) {
        const currentTime = await playerRef.current.getCurrentTime();
        await handleProgress(currentTime);
      }
    }, 500); // Check every 500ms

    return () => clearInterval(interval);
  }, [playing, isReady, handleProgress]);

  if (error) {
    return (
      <VStack alignCenter center className="bg-error/10 rounded-2xl p-8">
        <Text className="text-center text-lg font-semibold text-error">
          {error}
        </Text>
        <Button variant="primary" onPress={handleReplay}>
          Try Again
        </Button>
      </VStack>
    );
  }

  return (
    <VStack gap={16} className="w-full">
      <View
        className={cx('overflow-hidden rounded-3xl bg-videoBg', 'shadow-2xl')}
      >
        {!isReady && (
          <View className="absolute inset-0 z-10 items-center justify-center bg-videoBg">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="mt-4 text-base text-screen">Loading video...</Text>
          </View>
        )}
        <YoutubeIframe
          key={`${videoId}-${startTime}-${endTime}`}
          ref={playerRef}
          height={220}
          play={playing}
          videoId={videoId}
          onChangeState={handleStateChange}
          onReady={handleReady}
          onError={handleError}
          initialPlayerParams={{
            start: startTime,
            end: endTime,
            preventFullScreen: true, // Disable fullscreen
            controls: false, // Remove all YouTube controls
            color: 'white', // Less prominent branding
            iv_load_policy: 3, // Disable video annotations
            rel: false, // Don't show related videos at end
          }}
          webViewProps={{
            scrollEnabled: false, // Disable scrolling
            bounces: false, // Disable bounce effect
            allowsLinkPreview: false, // Disable link previews (iOS)
            onShouldStartLoadWithRequest: handleShouldStartLoad, // Block external navigation
          }}
          allowWebViewZoom={false} // Disable zooming
        />

        {/* Top blur overlay - hides video title and channel name */}
        <BlurView
          intensity={35}
          tint="dark"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 48,
            zIndex: 20,
            pointerEvents: 'none',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        />
      </View>

      {showReplay && (
        <Button variant="primary" onPress={handleReplay} className="w-full">
          <Text className="text-white text-xl">{hasPlayed ? '🔄' : '▶️'}</Text>
          <Text>{hasPlayed ? 'Replay' : 'Play'}</Text>
        </Button>
      )}
    </VStack>
  );
}
