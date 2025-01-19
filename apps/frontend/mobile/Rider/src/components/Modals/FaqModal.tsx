import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  TextStyle,
} from 'react-native';
import {colors} from '../../theme/colors';
import {typography} from '../../theme/typography';
import {images} from '../../assets/images/images';

interface FAQModalProps {
  isVisible: boolean;
  onClose: () => void;
  question: string;
  answer: string;
}

const FAQModal: React.FC<FAQModalProps> = ({
  isVisible,
  onClose,
  question,
  answer,
}) => {
  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        {/* Question Section */}
        <Text style={styles.question}>{question}</Text>
        <Text style={styles.answer}>{answer}</Text>

        {/* Support Section */}
        <Text style={styles.supportHeader}>Still need support?</Text>
        <View style={styles.supportOptions}>
          {/* Chat With Us */}
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>Chat With Us</Text>
            <Image source={images.message} style={styles.supportIcon} />
          </TouchableOpacity>

          {/* Call Us */}
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>Call Us</Text>
            <Image source={images.phone} style={styles.supportIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.lightButtonBackground,
    padding: 20,
    marginTop: 20,
  },
  question: {
    fontSize: typography.fontSize.semiMedium,
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
    color: colors.text.primary,
    marginBottom: 20,
    lineHeight: 25,
  },
  answer: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primaryGrey,
    marginBottom: 40,
    lineHeight: 25,
  },
  supportHeader: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
    color: colors.text.primary,
    marginBottom: 20,
  },
  supportOptions: {
    flexDirection: 'column',
    gap: 10,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 212, 212, 1)',
  },

  supportButtonText: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium as TextStyle['fontWeight'],
    color: colors.purple,
  },
  supportIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});

export default FAQModal;
