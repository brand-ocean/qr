import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { playClickSound, playSuccessSound } from '../lib/sound.ts';
import Text from './Text.tsx';

type SuggestionModalProps = {
  readonly onClose: () => void;
  readonly visible: boolean;
};

export default function SuggestionModal({
  onClose,
  visible,
}: SuggestionModalProps) {
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    playClickSound();
    onClose();
    // Reset state after closing
    setTimeout(() => {
      setSubmitted(false);
      setSuggestion('');
    }, 300);
  };

  const handleSubmit = () => {
    if (!suggestion.trim()) {
      return;
    }

    playSuccessSound();
    setSubmitted(true);

    setTimeout(() => {
      handleClose();
    }, 2000);
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
            <Text style={styles.title}>SUGGESTIES</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <View style={styles.content}>
            {submitted ? (
              <View style={styles.successMessage}>
                <Text style={styles.successText}>Bedankt voor je tip!</Text>
                <Text style={styles.checkmark}>✅</Text>
              </View>
            ) : (
              <>
                <Text style={styles.intro}>
                  Heb je een idee of tip voor het spel? Laat het ons weten!
                </Text>
                <TextInput
                  multiline
                  numberOfLines={5}
                  onChangeText={setSuggestion}
                  placeholder="Schrijf hier je suggestie..."
                  placeholderTextColor="#999"
                  style={styles.textarea}
                  textAlignVertical="top"
                  value={suggestion}
                />
                <Pressable
                  disabled={!suggestion.trim()}
                  onPress={handleSubmit}
                  style={[
                    styles.submitButton,
                    !suggestion.trim() && styles.submitButtonDisabled,
                  ]}
                >
                  <Text style={styles.submitText}>VERSTUREN</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  checkmark: {
    fontSize: 48,
  },
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
    color: '#333',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderRadius: 20,
    borderWidth: 4,
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
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#4CD964',
    borderColor: 'black',
    borderWidth: 3,
    marginTop: 20,
    padding: 15,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: 'black',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  successMessage: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 40,
  },
  successText: {
    color: 'black',
    fontFamily: 'AeonikFono-Bold',
    fontSize: 24,
  },
  textarea: {
    backgroundColor: '#f9f9f9',
    borderColor: 'black',
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 16,
    minHeight: 120,
    padding: 15,
    width: '100%',
  },
  title: {
    color: 'black',
    fontFamily: 'AeonikFono-Black',
    fontSize: 24,
    textTransform: 'uppercase',
  },
});
