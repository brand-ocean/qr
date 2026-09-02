import { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
  type Code,
} from 'react-native-vision-camera';
import { getVideoById } from 'src/data/videos.ts';
import { parseCardIdFromScannedValue } from 'src/lib/parseCardId.ts';
import Text from './Text.tsx';
import ViralButton from './ViralButton.tsx';

/** Marge tussen de SLUITEN-knop en de rand van het veilige gebied. */
const CONTROL_MARGIN = 20;

type QRScannerProps = {
  readonly onClose: () => void;
  readonly onVideoFound: (videoId: string) => void;
};

export default function QRScanner({ onClose, onVideoFound }: QRScannerProps) {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const isProcessing = useRef(false);
  // Edge-to-edge staat sinds SDK 54 aan: het camerabeeld mag onder de
  // systeembalken door lopen, de bediening niet. In landscape zit de
  // navigatiebalk of de cutout aan de zijkant, dus links en rechts tellen mee.
  const insets = useSafeAreaInsets();
  const safeAreaPadding = {
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
    paddingTop: insets.top,
  };

  const handleCodeScanned = useCallback(
    (codes: Array<Code>) => {
      if (isProcessing.current) {
        return;
      }

      const code = codes[0];
      if (!code?.value) {
        return;
      }

      const videoId = parseCardIdFromScannedValue(code.value);
      if (!videoId) {
        return;
      }

      const video = getVideoById(videoId);
      if (video) {
        isProcessing.current = true;
        onVideoFound(videoId);
        // Reset after navigation
        setTimeout(() => {
          isProcessing.current = false;
        }, 1000);
      }
    },
    [onVideoFound],
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: handleCodeScanned,
  });

  if (!hasPermission) {
    return (
      <View style={[styles.permissionContainer, safeAreaPadding]}>
        <Text style={styles.permissionText}>
          Camera toegang nodig om QR codes te scannen
        </Text>
        <View style={styles.buttonContainer}>
          <ViralButton
            onPress={requestPermission}
            title="GEEF TOEGANG"
            variant="primary"
          />
          <ViralButton onPress={onClose} title="ANNULEREN" variant="outline" />
        </View>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.errorContainer, safeAreaPadding]}>
        <Text style={styles.errorText}>Geen camera gevonden</Text>
        <ViralButton onPress={onClose} title="TERUG" variant="outline" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        codeScanner={codeScanner}
        device={device}
        isActive={true}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.overlay, safeAreaPadding]}>
        <View style={styles.scanArea} />
        <Text style={styles.instructionText}>
          Richt de camera op een QR code
        </Text>
      </View>
      <View
        style={[
          styles.closeButton,
          {
            bottom: insets.bottom + CONTROL_MARGIN,
            left: insets.left + CONTROL_MARGIN,
            right: insets.right + CONTROL_MARGIN,
          },
        ]}
      >
        <ViralButton onPress={onClose} title="SLUITEN" variant="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    gap: 16,
    maxWidth: 300,
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
  },
  container: {
    backgroundColor: 'black',
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#22B331',
    flex: 1,
    gap: 24,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: 'white',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 20,
    textShadowColor: 'black',
    textShadowOffset: { height: 2, width: 2 },
    textShadowRadius: 0,
  },
  instructionText: {
    color: 'white',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 18,
    marginTop: 24,
    textAlign: 'center',
    textShadowColor: 'black',
    textShadowOffset: { height: 2, width: 2 },
    textShadowRadius: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionContainer: {
    alignItems: 'center',
    backgroundColor: '#22B331',
    flex: 1,
    gap: 24,
    justifyContent: 'center',
    padding: 20,
  },
  permissionText: {
    color: 'white',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 20,
    textAlign: 'center',
    textShadowColor: 'black',
    textShadowOffset: { height: 2, width: 2 },
    textShadowRadius: 0,
  },
  scanArea: {
    borderColor: 'white',
    borderRadius: 20,
    borderWidth: 4,
    height: 250,
    width: 250,
  },
});
