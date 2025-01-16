import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Text,
} from 'react-native';
import TitleDescription from '../../components/TitleDescription';
import {formStyles} from '../../theme/form';
import {colors} from '../../theme/colors';
import StepIndicator from '../../components/StepIndicator';
import {useNavigation} from '@react-navigation/native';
import {DeliverAPackage} from '../../navigation/ScreenNames';

const EnterABNScreen: React.FC = () => {
  const [abn, setAbn] = useState('');

  const navigation = useNavigation();

  const handleContinue = () => {
    console.log({abn});
    navigation.navigate(DeliverAPackage.AddProfilePhoto);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StepIndicator current={3} total={4} />
        <View style={styles.content}>
          <TitleDescription
            title="Enter your ABN details"
            description="Add your ABN to get started"
          />
          <View style={formStyles.inputWrapper}>
            <Text style={formStyles.inputLabel}>ABN</Text>
            <TextInput
              style={formStyles.input}
              placeholder="Enter your ABN"
              keyboardType="numeric"
              value={abn}
              onChangeText={setAbn}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[formStyles.button, abn ? formStyles.buttonEnabled : null]}
            onPress={handleContinue}
            disabled={!abn}>
            <Text
              style={[
                formStyles.buttonText,
                abn ? formStyles.buttonTextEnabled : null,
              ]}>
              Continue
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
  },
  content: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    backgroundColor: colors.white,
  },
});

export default EnterABNScreen;
