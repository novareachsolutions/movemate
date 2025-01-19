import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TextStyle,
} from 'react-native';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {formStyles} from '../theme/form';
import {images} from '../assets/images/images';

const CancellationReasonScreen: React.FC = () => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const reasons = [
    {id: '1', text: 'Shop not open'},
    {id: '2', text: 'Customer not responding'},
    {id: '3', text: 'Wrong location'},
  ];

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.header}>Cancellation Reason</Text>
        <Text style={styles.subHeader}>Why are you canceling this order?</Text>

        <View style={styles.reasonList}>
          {reasons.map(reason => (
            <TouchableOpacity
              key={reason.id}
              style={[
                styles.reasonItem,
                selectedReason === reason.text && styles.selectedReasonItem,
              ]}
              onPress={() => handleReasonSelect(reason.text)}>
              <View style={styles.checkboxContainer}>
                <View
                  style={
                    selectedReason === reason.text
                      ? styles.checkboxSelected
                      : styles.checkbox
                  }
                />
                <Text style={styles.reasonText}>{reason.text}</Text>
              </View>
              {selectedReason === reason.text && (
                <View style={styles.photoUploadContainer}>
                  <Text style={styles.photoUploadText}>
                    Upload photo for proof
                  </Text>
                  <TouchableOpacity style={styles.photoUploadButton}>
                    <Image source={images.camera} style={styles.cameraIcon} />
                    <Text style={styles.photoUploadButtonText}>Take Photo</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Cancel Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={[formStyles.button, styles.cancelButton]}>
          <Text style={[formStyles.buttonText, styles.cancelButtonText]}>
            Cancel Order
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightButtonBackground,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 80, // Add padding to ensure the content is scrollable above the footer
  },
  header: {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
    color: colors.text.primary,
    marginBottom: 10,
  },
  subHeader: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primaryGrey,
    marginBottom: 20,
  },
  reasonList: {
    marginBottom: 20,
  },
  reasonItem: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  selectedReasonItem: {
    borderColor: colors.purple,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.black,
    marginRight: 10,
  },
  checkboxSelected: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.black,
    marginRight: 10,
  },
  reasonText: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium as TextStyle['fontWeight'],
  },
  photoUploadContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    paddingTop: 15,
  },
  photoUploadText: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primaryGrey,
    marginBottom: 10,
  },
  photoUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.purple,
    borderRadius: 8,
    paddingVertical: 15,
  },
  cameraIcon: {
    width: 20,
    height: 20,
    tintColor: colors.purple,
    marginRight: 10,
  },
  photoUploadButtonText: {
    color: colors.purple,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium as TextStyle['fontWeight'],
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  cancelButton: {
    borderColor: colors.error,
    borderWidth: 1,
    backgroundColor: colors.white,
  },
  cancelButtonText: {
    color: colors.error,
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
  },
});

export default CancellationReasonScreen;
