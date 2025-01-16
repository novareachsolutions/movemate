import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {colors} from '../theme/colors';
import {formStyles} from '../theme/form';
import StepIndicator from '../components/StepIndicator';
import TitleDescription from '../components/TitleDescription';

interface DocumentReviewProps {
  route: {
    params: {
      title: string;
      uploadedImage: string;
    };
  };
}

const DocumentReviewScreen: React.FC<DocumentReviewProps> = ({route}) => {
  const {title, uploadedImage} = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StepIndicator current={2} total={4} />
        <TitleDescription
          title={title}
          description="Review your uploaded document below"
        />
        <View style={styles.imageContainer}>
          <Image source={{uri: uploadedImage}} style={styles.image} />
        </View>
        <View style={styles.footer}>
          <TouchableOpacity style={[formStyles.button, styles.halfButton]}>
            <Text style={formStyles.buttonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              formStyles.button,
              formStyles.buttonEnabled,
              styles.halfButton,
            ]}>
            <Text style={[formStyles.buttonText, formStyles.buttonTextEnabled]}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
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
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  halfButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default DocumentReviewScreen;
