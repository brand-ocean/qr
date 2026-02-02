import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { playClickSound } from '../lib/sound.ts';
import Text from './Text.tsx';

type RulesModalProps = {
  readonly onClose: () => void;
  readonly visible: boolean;
};

export default function RulesModal({ onClose, visible }: RulesModalProps) {
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
            <Text style={styles.title}>SPELREGELS</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.intro}>
              In het spel zijn de volgende POWER-UPS te vinden:
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vuur-emoji 🔥</Text>
              <Text style={styles.sectionText}>
                Leg deze op de tijdlijn van een tegenstander. Zodra die speler
                een kaart op die plek neerlegt en het jaartal klopt, wordt de
                kaart direct verbrand.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Steen kaart 🗿</Text>
              <Text style={styles.sectionText}>
                Leg deze op de tijdlijn van een tegenstander. De tegenstander
                moet voortaan ook rekening houden met dit jaartal, waardoor het
                spel moeilijker wordt. Echter telt deze kaart niet mee voor het
                winnen van het spel.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Glazen kaart 🪞</Text>
              <Text style={styles.sectionText}>
                Leg deze deels onder een kaart op de tijdlijn van een
                tegenstander (zodat hij nog zichtbaar is). Als die speler
                vervolgens een kaart neerlegt met exact hetzelfde jaartal,
                breekt de glazen kaart en wordt deze verwijderd.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TV-afstandsbediening 📺</Text>
              <Text style={styles.sectionText}>
                Gebruik deze kaart om een tegenstander te dwingen van kanaal te
                wisselen en een nieuwe kaart te pakken (handig als je denkt dat
                hij of zij het sowieso goed zou hebben).
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Piraten kaart 🏴‍☠️</Text>
              <Text style={styles.sectionText}>
                Zodra je denkt dat een tegenstander een kaart op de verkeerde
                positie legt, mag je deze met de piraten kaart proberen te
                kapen. Leg de piraten kaart op de plek waarvan jij denkt dat het
                de juiste is. Als je gelijk hebt, mag je de kaart toevoegen aan
                je eigen tijdlijn.
              </Text>
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
  header: {
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderBottomColor: 'black',
    borderBottomWidth: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  intro: {
    color: 'black',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 16,
    marginBottom: 20,
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
});
