import { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
  type Code,
} from 'react-native-vision-camera';
import { getVideoById } from 'src/data/videos.ts';
import Text from './Text.tsx';
import ViralButton from './ViralButton.tsx';

type QRScannerProps = {
  readonly onClose: () => void;
  readonly onVideoFound: (videoId: string) => void;
};

export default function QRScanner({ onClose, onVideoFound }: QRScannerProps) {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const isProcessing = useRef(false);

  const handleCodeScanned = useCallback(
    (codes: Array<Code>) => {
      if (isProcessing.current) {
        return;
      }

      const code = codes[0];
      if (!code?.value) {
        return;
      }

      // Parse virals-app://video/xxx URL
      const match = code.value.match(/^virals-app:\/\/video\/(.+)$/);
      if (match) {
        const videoId = match[1];
        const video = getVideoById(videoId);

        if (video) {
          isProcessing.current = true;
          onVideoFound(videoId);
          // Reset after navigation
          setTimeout(() => {
            isProcessing.current = false;
          }, 1000);
        }
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
      <View style={styles.permissionContainer}>
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
      <View style={styles.errorContainer}>
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
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
        <Text style={styles.instructionText}>
          Richt de camera op een QR code
        </Text>
      </View>
      <View style={styles.closeButton}>
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
    bottom: 60,
    left: 20,
    position: 'absolute',
    right: 20,
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
