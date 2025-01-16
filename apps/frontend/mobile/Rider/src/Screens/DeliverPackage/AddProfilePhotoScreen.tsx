import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import StepIndicator from '../../components/StepIndicator';
import TitleDescription from '../../components/TitleDescription';
import UploadPhoto from '../../components/UploadPhoto';
import {colors} from '../../theme/colors';
import {formStyles} from '../../theme/form';
// import {useNavigation} from '@react-navigation/native';

const AddProfilePhotoScreen: React.FC = () => {
  // const navigation = useNavigation();

  const handleUpload = () => {
    console.log('Upload button pressed');
    // Logic for opening the file picker or camera
  };

  const handleContinue = () => {
    console.log('Continue button pressed');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StepIndicator current={4} total={4} />
        <TitleDescription
          title="Add your Profile Photo"
          description="We encourage you to upload a latest picture"
        />
        <UploadPhoto onUpload={handleUpload} />
      </View>
      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[formStyles.button, formStyles.buttonEnabled]}
          onPress={handleContinue}>
          <Text style={[formStyles.buttonText, formStyles.buttonTextEnabled]}>
            Continue
          </Text>
        </TouchableOpacity>
        <Text style={formStyles.footerText}>
          By continuing you accept our{' '}
          <Text style={formStyles.link}>Terms of Service</Text> and{' '}
          <Text style={formStyles.link}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.white,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
  },
});

export default AddProfilePhotoScreen;
