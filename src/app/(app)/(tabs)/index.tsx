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
  const { height } = useWindowDimensions();
  const router = useRouter();
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const logoWidth = height * 0.75;

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
      <SunburstBackground />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.layout}>
          {/* Left panel — logo */}
          <View style={styles.logoPanel}>
            <Pressable
              onPress={openRules}
              style={[styles.iconButton, styles.logoPanelInfoButton]}
            >
              <Text style={styles.iconText}>i</Text>
            </Pressable>
            <Image
              resizeMode="contain"
              source={viralLogo}
              style={[
                styles.logo,
                { height: logoWidth / LOGO_ASPECT_RATIO, width: logoWidth },
              ]}
            />
          </View>

          {/* Right panel — card + action */}
          <View style={styles.actionPanel}>
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
        </View>
      </SafeAreaView>

      <RulesModal onClose={() => setIsRulesOpen(false)} visible={isRulesOpen} />
    </View>
  );
}

const styles = StyleSheet.create({
  actionPanel: {
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
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
  layout: {
    flex: 1,
    flexDirection: 'row',
  },
  logo: {
    transform: [{ rotate: '-2deg' }],
  },
  logoPanel: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoPanelInfoButton: {
    left: 12,
    position: 'absolute',
    top: 12,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
});
