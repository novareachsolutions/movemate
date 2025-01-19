import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import StepIndicator from './StepIndicator';
import TitleDescription from './TitleDescription';
import {colors} from '../theme/colors';
import {formStyles} from '../theme/form';

interface DocumentUploadProps {
  stepIndicator: {current: number; total: number};
  title: string;
  guidelines: string[];
  uploadInstructions: string[];
  onUpload: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  stepIndicator,
  title,
  guidelines,
  uploadInstructions,
  onUpload,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StepIndicator
          current={stepIndicator.current}
          total={stepIndicator.total}
        />
        <TitleDescription
          title={title}
          description="Follow the guidelines below to upload"
        />
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Important Guidelines:</Text>
          {guidelines.map((guideline, index) => (
            <Text key={index} style={styles.guideline}>
              • {guideline}
            </Text>
          ))}

          <View style={styles.uploadCard}>
            <Text style={styles.sectionTitle}>How to Upload:</Text>
            {uploadInstructions.map((instruction, index) => (
              <Text key={index} style={styles.guideline}>
                {index + 1}. {instruction}
              </Text>
            ))}
          </View>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            style={[formStyles.button, formStyles.buttonEnabled]}
            onPress={onUpload}>
            <Text style={[formStyles.buttonText, formStyles.buttonTextEnabled]}>
              Upload
            </Text>
          </TouchableOpacity>
          <Text style={formStyles.footerText}>
            By continuing you accept our{' '}
            <Text style={formStyles.link}>Terms of Service</Text> and{' '}
            <Text style={formStyles.link}>Privacy Policy</Text>
          </Text>
        </View>
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
  content: {
    flex: 1,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 10,
  },
  guideline: {
    fontSize: 14,
    color: colors.text.subText,
    marginBottom: 10,
  },
  uploadCard: {
    padding: 20,
    backgroundColor: colors.lightButtonBackground,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: colors.border.primary,
  },
  footer: {
    // paddingVertical: 20,
  },
});

export default DocumentUpload;
