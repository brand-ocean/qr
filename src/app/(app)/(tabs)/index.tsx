import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playClickSound } from 'src/lib/sound.ts';
import RulesModal from 'src/ui/RulesModal.tsx';
import SunburstBackground from 'src/ui/SunburstBackground.tsx';
import Text from 'src/ui/Text.tsx';
import ViralButton from 'src/ui/ViralButton.tsx';
import viralLogo from '../../../../assets/images/virals-logo.png';

const LOGO_ASPECT_RATIO = 1279 / 771;

export default function GameScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const openRules = () => {
    playClickSound();
    setIsRulesOpen(true);
  };

  const openScanner = () => {
    playClickSound();
    router.push('/(app)/(tabs)/scanner' as Href);
  };

  return (
    <View style={styles.container}>
      {/* Sunburst Background */}
      <SunburstBackground />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Right Info Button */}
        <View style={styles.topButtons}>
          <Pressable onPress={openRules} style={styles.iconButton}>
            <Text style={styles.iconText}>i</Text>
          </Pressable>
        </View>

        {/* Header */}
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

        {/* Main Card */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.emptyText}>
              Scan een QR code op een kaart om de video te bekijken!
            </Text>
            <ViralButton
              onPress={openScanner}
              style={styles.fullWidthButton}
              title="SCAN KAART"
              variant="primary"
            />
          </View>
        </View>
      </SafeAreaView>

      {/* Modals */}
      <RulesModal onClose={() => setIsRulesOpen(false)} visible={isRulesOpen} />
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
    bottom: 20,
    left: 20,
    position: 'absolute',
    right: 20,
  },
  container: {
    flex: 1,
    overflow: 'hidden',
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
    flex: 1,
    justifyContent: 'center',
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
  logo: {
    width: '80%',
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  topButtons: {
    position: 'absolute',
    right: 20,
    top: 60,
    zIndex: 10,
  },
});
