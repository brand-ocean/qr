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
      supportedOrientations={['landscape', 'landscape-left', 'landscape-right']}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>INFORMATIE</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.groupTitle}>Hoe werkt het spel</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Pak een kaart van de stapel
              </Text>
              <Text style={styles.sectionText}>
                Pak een kaart zonder te kijken naar de achterkant met het
                jaartal.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Scan de QR-code</Text>
              <Text style={styles.sectionText}>
                Tik op SCAN KAART en richt de camera op de QR-code. De video
                opent automatisch.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bekijk de video</Text>
              <Text style={styles.sectionText}>
                Klik op ▶ om de video te starten. Gebruik ❚❚ om te pauzeren of
                ↻ om opnieuw te bekijken.
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Inhoudswaarschuwing</Text>
              <Text style={styles.sectionText}>
                Sommige kaarten bevatten schokkende of beledigende inhoud. Zet
                de waarschuwing aan om vóór het spelen van deze kaarten een
                melding te krijgen.
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
    padding: 4,
  },
  closeText: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  content: {
    padding: 12,
  },
  divider: {
    borderTopColor: '#eee',
    borderTopWidth: 2,
    marginBottom: 12,
  },
  groupTitle: {
    color: 'black',
    fontFamily: 'AeonikFono-Black',
    fontSize: 15,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderBottomColor: 'black',
    borderBottomWidth: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modal: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderRadius: 20,
    borderWidth: 4,
    maxHeight: '92%',
    maxWidth: 600,
    overflow: 'hidden',
    width: '100%',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  section: {
    marginBottom: 12,
  },
  sectionText: {
    color: '#333',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    borderBottomColor: '#eee',
    borderBottomWidth: 2,
    color: 'black',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 14,
    marginBottom: 6,
    paddingBottom: 3,
    textTransform: 'uppercase',
  },
  title: {
    color: 'black',
    fontFamily: 'AeonikFono-Black',
    fontSize: 15,
    textTransform: 'uppercase',
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
});
