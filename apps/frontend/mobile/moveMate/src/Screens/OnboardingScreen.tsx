import React from 'react';
import {SafeAreaView} from 'react-native';
import Onboarding from '../components/Onboarding';
import {colors} from '../theme/colors';

const OnboardingScreen = () => (
  <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
    <Onboarding />
  </SafeAreaView>
);

export default OnboardingScreen;
