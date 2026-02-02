import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRandomVideo, type VideoCard } from 'src/data/videos.ts';
import { playClickSound, playSuccessSound } from 'src/lib/sound.ts';
import RulesModal from 'src/ui/RulesModal.tsx';
import SuggestionModal from 'src/ui/SuggestionModal.tsx';
import SunburstBackground from 'src/ui/SunburstBackground.tsx';
import Text from 'src/ui/Text.tsx';
import ViralButton from 'src/ui/ViralButton.tsx';
import YouTubePlayer from 'src/ui/YouTubePlayer.tsx';

export default function GameScreen() {
  const router = useRouter();
  const [selectedCard, setSelectedCard] = useState<VideoCard | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const openRules = () => {
    playClickSound();
    setIsRulesOpen(true);
  };

  const openSuggestion = () => {
    playClickSound();
    setIsSuggestionOpen(true);
  };

  const openScanner = () => {
    playClickSound();
    router.push('/(app)/(tabs)/scanner' as Href);
  };

  const loadRandomCard = () => {
    playSuccessSound();
    setSelectedCard(getRandomVideo());
  };

  return (
    <View style={styles.container}>
      {/* Sunburst Background */}
      <SunburstBackground paused={isVideoPlaying} />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Right Info Button */}
        <View style={styles.topButtons}>
          <Pressable onPress={openRules} style={styles.iconButton}>
            <Text style={styles.iconText}>i</Text>
          </Pressable>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>VIRALS</Text>
          <Text style={styles.subtitle}>MEME EDITIE</Text>
        </View>

        {/* Main Card */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            {selectedCard ? (
              <>
                <YouTubePlayer
                  endTime={selectedCard.endTime}
                  onPlayStateChange={setIsVideoPlaying}
                  startTime={selectedCard.startTime}
                  videoId={selectedCard.videoId}
                />
                <ViralButton
                  onPress={openScanner}
                  style={styles.fullWidthButton}
                  title="SCAN KAART"
                  variant="primary"
                />
              </>
            ) : (
              <View style={styles.emptyState}>
                {/* Fake Video Placeholder */}
                <View style={styles.cardPlaceholder}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
                <Text style={styles.emptyText}>
                  Scan een QR code op een kaart om de video te bekijken!
                </Text>
                <ViralButton
                  onPress={openScanner}
                  style={styles.fullWidthButton}
                  title="SCAN KAART"
                  variant="primary"
                />
                {/* Dev Button */}
                <ViralButton
                  onPress={loadRandomCard}
                  style={styles.fullWidthButton}
                  title="Test Video (Dev)"
                  variant="dev"
                />
              </View>
            )}

            <ViralButton
              onPress={openSuggestion}
              style={StyleSheet.flatten([
                styles.fullWidthButton,
                styles.suggestionButton,
              ])}
              title="TIP ACHTERLATEN?"
              variant="outline"
            />
          </View>
        </View>
      </SafeAreaView>

      {/* Modals */}
      <RulesModal onClose={() => setIsRulesOpen(false)} visible={isRulesOpen} />
      <SuggestionModal
        onClose={() => setIsSuggestionOpen(false)}
        visible={isSuggestionOpen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderRadius: 30,
    borderWidth: 5,
    elevation: 10,
    gap: 20,
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
  cardPlaceholder: {
    alignItems: 'center',
    aspectRatio: 16 / 9,
    backgroundColor: 'black',
    borderColor: 'white',
    borderRadius: 20,
    borderWidth: 4,
    justifyContent: 'center',
    width: '100%',
  },
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    gap: 20,
    paddingVertical: 20,
  },
  emptyText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 26,
    textAlign: 'center',
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
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: 'black',
    borderRadius: 20,
    borderWidth: 3,
    elevation: 3,
    height: 40,
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOffset: { height: 3, width: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    width: 40,
  },
  iconText: {
    color: 'black',
    fontFamily: 'AeonikFono-Black',
    fontSize: 20,
    lineHeight: 22,
  },
  playIcon: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 48,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  subtitle: {
    color: '#FFCC00',
    fontFamily: 'AeonikFono-Black',
    fontSize: 32,
    marginTop: -8,
    textShadowColor: '#000',
    textShadowOffset: { height: 3, width: 3 },
    textShadowRadius: 0,
  },
  suggestionButton: {
    marginTop: 10,
    opacity: 0.6,
  },
  title: {
    color: 'white',
    fontFamily: 'AeonikFono-Black',
    fontSize: 64,
    letterSpacing: -2,
    textShadowColor: '#000',
    textShadowOffset: { height: 4, width: 4 },
    textShadowRadius: 0,
  },
  topButtons: {
    position: 'absolute',
    right: 20,
    top: 60,
    zIndex: 10,
  },
});
