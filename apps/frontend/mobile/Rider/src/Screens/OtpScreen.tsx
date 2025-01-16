import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  TextStyle,
} from 'react-native';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import TitleDescription from '../components/TitleDescription';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {AuthScreens, AuthScreensParamList} from '../navigation/ScreenNames';

interface OtpScreenProps {
  route: {
    params: {phoneNumber: string};
  };
}

const OtpScreen: React.FC<OtpScreenProps> = ({route}) => {
  const {phoneNumber} = route.params;
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState(false);
  const inputs = useRef<TextInput[]>([]);
  const navigation = useNavigation<NavigationProp<AuthScreensParamList>>();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus handling
    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp !== '1234') {
      setError(true);
    } else {
      setError(false);
      console.log('OTP Verified Successfully!');
      navigation.navigate(AuthScreens.SelectService);
    }
  };

  const handleResend = () => {
    setTimer(60);
    setOtp(['', '', '', '']);
    setError(false);
    inputs.current[0]?.focus();
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <TitleDescription
            title="Enter verification code"
            description={`Enter the code sent to: ${phoneNumber}`}
          />

          <View style={{marginBottom: 30}}>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => (inputs.current[index] = ref!)}
                  style={[
                    styles.input,
                    error
                      ? {borderColor: colors.error}
                      : digit
                        ? {borderColor: colors.purple}
                        : {borderColor: colors.border.primary},
                  ]}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={value => handleChange(value, index)}
                />
              ))}
            </View>

            {error && (
              <Text
                style={{fontSize: 14, color: colors.error, marginVertical: 10}}>
                Incorrect code, please try again
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              otp.every(digit => digit) && styles.buttonFilled,
            ]}
            onPress={handleVerify}>
            <Text
              style={[
                styles.buttonText,
                otp.every(digit => digit) && styles.buttonTextFilled,
              ]}>
              Verify Now
            </Text>
          </TouchableOpacity>

          <Text style={styles.timerText}>
            {timer > 0 ? (
              <>
                Resend code in <Text style={styles.timer}>{timer} secs</Text>
              </>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text>
                  Resend code <Text style={styles.timer}>again</Text>
                </Text>
              </TouchableOpacity>
            )}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.white,
    marginTop: 60,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
  },
  button: {
    borderWidth: 1,
    borderColor: colors.purple,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonFilled: {
    backgroundColor: colors.purple,
  },
  buttonText: {
    textAlign: 'center',
    color: colors.text.primary,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.semiBold as TextStyle['fontWeight'],
  },
  buttonTextFilled: {
    color: colors.white,
  },
  timerText: {
    textAlign: 'center',
    marginTop: 20,
    color: colors.text.primary,
    alignSelf: 'center',
  },
  timer: {
    color: colors.purple,
  },
});

export default OtpScreen;
