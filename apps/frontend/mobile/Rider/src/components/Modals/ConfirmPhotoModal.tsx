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
import {formStyles} from '../../theme/form';
import {images} from '../../assets/images/images';

interface ConfirmPhotoModalProps {
  isVisible: boolean;
  onClose: () => void;
  onRetry: () => void;
  onDone: () => void;
}

const ConfirmPhotoModal: React.FC<ConfirmPhotoModalProps> = ({
  isVisible,
  onClose,
  onRetry,
  onDone,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Confirm Photo</Text>

        {/* Placeholder Image */}
        <View style={styles.imageContainer}>
          <Image source={images.introImage1} style={styles.image} />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={onRetry}
            style={[styles.retryButton, formStyles.button]}>
            <Text style={[formStyles.buttonText, styles.retryText]}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDone}
            style={[
              formStyles.button,
              formStyles.buttonEnabled,
              styles.doneButton,
            ]}>
            <Text style={[formStyles.buttonText, formStyles.buttonTextEnabled]}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
    color: colors.text.primary,
    marginBottom: 20,
  },
  imageContainer: {
    width: 300,
    height: 400,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 40,
    backgroundColor: colors.lightButtonBackground,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '87%',
    height: '87%',
    resizeMode: 'cover',
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  retryButton: {
    borderWidth: 2,
    borderColor: colors.purple,
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: colors.purple,
    fontWeight: typography.fontWeight.semiBold as TextStyle['fontWeight'],
  },
  doneButton: {
    backgroundColor: colors.purple,
    paddingVertical: 12,
    borderRadius: 8,
  },
});

export default ConfirmPhotoModal;
