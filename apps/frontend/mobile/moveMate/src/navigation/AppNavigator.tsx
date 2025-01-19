import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthScreens, AppScreens} from './ScreenNames';
import Onboarding from '../components/Onboarding';
import Login from '../Screens/LoginScreen';
import OtpScreen from '../Screens/OtpScreen';
import CompleteProfileScreen from '../Screens/CompleteProfileScreen';
import PrivacyPolicyScreen from '../Screens/PrivacyPolicyScreen';
import {RootStackParamList} from './type';
import AppLayoutScreen from '../Screens/AppLayoutScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={AuthScreens.OnboardingScreen}>
        {/* Auth Screens */}
        <Stack.Screen
          name={AuthScreens.OnboardingScreen}
          component={Onboarding}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={AuthScreens.LoginScreen}
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={AuthScreens.OtpScreen}
          component={OtpScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={AuthScreens.CompleteProfileScreen}
          component={CompleteProfileScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={AuthScreens.PrivacyPolicyScreen}
          component={PrivacyPolicyScreen}
          options={{headerShown: false}}
        />

        {/* App Screens */}
        <Stack.Screen
          name={AppScreens.AppLayoutScreen}
          component={AppLayoutScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
