import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {colors} from '../../theme/colors';
import {typography} from '../../theme/typography';

interface BottomModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

const BottomModal: React.FC<BottomModalProps> = ({isVisible, onClose}) => {
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity(quantity + 1);
  const decrementQuantity = () => setQuantity(Math.max(1, quantity - 1));

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Drag Indicator */}
          <TouchableOpacity onPress={onClose}>
            <View style={styles.dragIndicator} />
          </TouchableOpacity>

          {!showQuantitySelector ? (
            <>
              <Text style={styles.title}>Confirm availability issue</Text>
              <Text style={styles.description}>
                Is the item completely unavailable or is the requested quantity
                not in stock?
              </Text>
              <TouchableOpacity
                style={styles.unavailableButton}
                onPress={onClose}>
                <Text style={styles.unavailableText}>Item Unavailable</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.missingButton}
                onPress={() => setShowQuantitySelector(true)}>
                <Text style={styles.missingText}>Quantity Missing</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Select Available Quantity</Text>
              <View style={styles.itemRow}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>Brown Bread</Text>
                  <Text style={styles.itemOrdered}>
                    Quantity ordered: 2 units
                  </Text>
                </View>
                <View style={styles.quantitySelector}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={decrementQuantity}>
                    <Text style={styles.quantityText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={incrementQuantity}>
                    <Text style={styles.quantityText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
                <Text style={styles.confirmText}>Confirm Quantity</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowQuantitySelector(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    maxHeight: SCREEN_HEIGHT * 0.8, // Prevent overflow
  },
  dragIndicator: {
    width: 50,
    height: 5,
    backgroundColor: colors.text.primaryGrey,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.text.primary,
    marginBottom: 10,
  },
  description: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primaryGrey,
    textAlign: 'center',
    marginVertical: 15,
  },
  unavailableButton: {
    backgroundColor: colors.error,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  unavailableText: {
    color: colors.white,
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
  },
  missingButton: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  missingText: {
    color: colors.error,
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  itemDetails: {flex: 2},
  itemName: {
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  itemOrdered: {
    fontSize: typography.fontSize.small,
    color: colors.text.primaryGrey,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightButtonBackground,
    borderRadius: 10,
    paddingHorizontal: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  quantityButton: {padding: 5},
  quantityText: {
    fontSize: typography.fontSize.large,
    color: colors.text.primary,
  },
  quantity: {
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  confirmButton: {
    backgroundColor: colors.green,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmText: {
    color: colors.white,
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  cancelText: {
    color: colors.error,
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
  },
});

export default BottomModal;
