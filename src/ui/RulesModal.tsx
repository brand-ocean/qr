import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSettings } from '../context/SettingsContext.tsx';
import { playClickSound } from '../lib/sound.ts';
import Text from './Text.tsx';

type RulesModalProps = {
  readonly onClose: () => void;
  readonly visible: boolean;
};

export default function RulesModal({ onClose, visible }: RulesModalProps) {
  const { setShowContentWarning, showContentWarning } = useSettings();

  const handleClose = () => {
    playClickSound();
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleClose}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>HOE WERKT HET</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Pak een kaart</Text>
              <Text style={styles.sectionText}>
                Pak een willekeurige kaart uit het spel. Op elke kaart staat een
                QR-code.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Scan de QR-code</Text>
              <Text style={styles.sectionText}>
                Tik op SCAN KAART en richt de camera op de QR-code. De
                bijbehorende video wordt automatisch geopend.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Bekijk de video</Text>
              <Text style={styles.sectionText}>
                Tik op PLAY om de video te starten. Gebruik PAUSE om te pauzeren
                en REPLAY om opnieuw te beginnen.
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Inhoudswaarschuwing</Text>
              <Text style={styles.sectionText}>
                Sommige kaarten bevatten mogelijk schokkende of beledigende
                inhoud. Zet de waarschuwing aan om een melding te krijgen
                voordat je zo&apos;n kaart bekijkt.
              </Text>
              <View style={styles.toggleRow}>
                <Text style={styles.sectionText}>Toon waarschuwing</Text>
                <Switch
                  onValueChange={setShowContentWarning}
                  value={showContentWarning}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    padding: 5,
  },
  closeText: {
    color: 'black',
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  content: {
    padding: 20,
  },
  divider: {
    borderTopColor: '#eee',
    borderTopWidth: 2,
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderBottomColor: 'black',
    borderBottomWidth: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderRadius: 20,
    borderWidth: 4,
    maxHeight: '80%',
    maxWidth: 500,
    overflow: 'hidden',
    width: '100%',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 21,
  },
  sectionTitle: {
    borderBottomColor: '#eee',
    borderBottomWidth: 2,
    color: 'black',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 18,
    marginBottom: 8,
    paddingBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    color: 'black',
    fontFamily: 'AeonikFono-Black',
    fontSize: 24,
    textTransform: 'uppercase',
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
