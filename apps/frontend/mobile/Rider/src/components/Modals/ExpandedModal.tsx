import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import {colors} from '../../theme/colors';
import {formStyles} from '../../theme/form';
import {typography} from '../../theme/typography';
import {images} from '../../assets/images/images';
import ConfirmPhotoModal from './ConfirmPhotoModal';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {AppScreens, AppScreensParamList, AuthScreensParamList} from '../../navigation/ScreenNames';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface ExpandedModalProps {
  isVisible: boolean;
  onClose: () => void;
  driverName: string;
  pickupAddress: string;
  pickupNotes: string;
  items: string[];
}

const InfoRow: React.FC<{iconSource: any; text: string; bold?: boolean}> = ({
  iconSource,
  text,
  bold,
}) => (
  <View style={styles.infoRow}>
    <Image source={iconSource} style={styles.infoIcon} />
    <Text
      style={[
        styles.infoText,
        bold ? {fontWeight: typography.fontWeight.bold as any} : {},
      ]}>
      {text}
    </Text>
  </View>
);

const OrderExpandedModal: React.FC<ExpandedModalProps> = ({
  isVisible,
  onClose,
  driverName,
  pickupAddress,
  pickupNotes,
  items,
}) => {
  const [height] = useState(new Animated.Value(SCREEN_HEIGHT * 0.2)); // Start with 20% height
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfirmPhotoVisible, setIsConfirmPhotoVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<AppScreensParamList>>();

  const handleExpand = () => {
    setIsExpanded(true);
    Animated.timing(height, {
      toValue: SCREEN_HEIGHT * 0.8,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    Animated.timing(height, {
      toValue: SCREEN_HEIGHT * 0.23, // Collapse back to 20% height
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleRetry = () => {
    console.log('Retry pressed: Open camera to retake photo');
    // Camera logic can be implemented here
  };

  const handleDone = () => {
    console.log('Done pressed: Confirm photo and proceed');
    setIsConfirmPhotoVisible(false); // Close ConfirmPhotoModal
  };

  return (
    <>
      {/* Main Expanded Modal */}
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={handleCollapse}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.modalContainer, {height}]}>
                {/* Drag Indicator */}
                <TouchableOpacity onPress={handleExpand}>
                  <View style={styles.dragIndicator} />
                </TouchableOpacity>

                {/* Title */}
                <Text style={styles.title}>Arriving in 10 mins</Text>

                {/* Content: Show only in collapsed state */}
                <View style={styles.location}>
                  {!isExpanded && (
                    <InfoRow iconSource={images.package} text={pickupAddress} />
                  )}
                </View>

                {/* Expanded Content */}
                {isExpanded && (
                  <>
                    <View style={styles.sectionContainer}>
                      <InfoRow
                        iconSource={images.greenCircle}
                        text={'Pickup Details'}
                        bold
                      />
                      <View style={styles.pickUpDetails}>
                        <View style={styles.pickUpDetailsTextContainer}>
                          <Text style={styles.infoBoldText}>{driverName}</Text>
                          <Text style={styles.infoText}>{pickupAddress}</Text>
                        </View>
                        <View style={styles.pickupIcons}>
                          <Image
                            source={images.phone}
                            style={styles.pickupIcon}
                          />
                          <TouchableOpacity
                            onPress={() => {
                              navigation.navigate(AppScreens.Chat);
                            }}>
                            <Image
                              source={images.message}
                              style={styles.pickupIcon}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    <View style={styles.sectionContainer}>
                      <InfoRow
                        iconSource={images.pickUpNotesIcon}
                        text={'Pickup Notes'}
                        bold
                      />
                      <View style={styles.pickUpDetails}>
                        <Text style={styles.infoText}>{pickupNotes}</Text>
                      </View>
                    </View>

                    <View style={styles.sectionContainer}>
                      <InfoRow
                        iconSource={images.cartItemsIcon}
                        text={'Items to Pickup'}
                        bold
                      />
                      <View
                        style={[
                          styles.itemsContainer,
                          styles.pickUpDetailsTextContainer,
                        ]}>
                        {items.map((item, index) => (
                          <Text key={index} style={styles.itemText}>
                            • {item}
                          </Text>
                        ))}
                        <TouchableOpacity
                          style={[formStyles.button, formStyles.buttonEnabled]}
                          onPress={() => setIsConfirmPhotoVisible(true)}>
                          <Text
                            style={[
                              formStyles.buttonText,
                              formStyles.buttonTextEnabled,
                            ]}>
                            Verify Items
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}

                {/* Button at the Bottom */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[formStyles.button, formStyles.buttonSuccess]}>
                    <Text
                      style={[
                        formStyles.buttonText,
                        formStyles.buttonTextEnabled,
                      ]}>
                      I Have Arrived
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Confirm Photo Modal */}
      <ConfirmPhotoModal
        isVisible={isConfirmPhotoVisible}
        onClose={() => setIsConfirmPhotoVisible(false)}
        onRetry={handleRetry}
        onDone={handleDone}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  dragIndicator: {
    width: 50,
    height: 5,
    backgroundColor: colors.text.subText,
    alignSelf: 'center',
    borderRadius: 3,
    marginBottom: 10,
  },
  title: {
    fontSize: typography.fontSize.semiMedium,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionContainer: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    paddingBottom: 10,
  },
  sectionHeader: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  infoIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
  },
  infoText: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
  },
  infoBoldText: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontWeight: typography.fontWeight.bold as any,
  },
  itemsContainer: {
    padding: 20,
    backgroundColor: colors.lightButtonBackground,
    borderRadius: 20,
    marginTop: 10,
  },
  itemText: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
    marginBottom: 5,
    fontWeight: typography.fontWeight.bold as any,
  },
  location: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  pickUpDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  pickUpDetailsTextContainer: {
    flexDirection: 'column',
    gap: 5,
  },
  pickupIcon: {
    width: 22,
    height: 22,
  },
  pickupIcons: {
    flexDirection: 'row',
    gap: 40,
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmPhotoTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: 20,
  },
  photoPreview: {
    width: 300,
    height: 300,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.purple,
    marginBottom: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  retryButton: {
    borderColor: colors.purple,
  },
});

export default OrderExpandedModal;
