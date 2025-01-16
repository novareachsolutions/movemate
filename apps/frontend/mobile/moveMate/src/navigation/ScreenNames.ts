import {AuthStackParamList, AppStackParamList} from './type';

export const AuthScreens: Record<
  keyof AuthStackParamList,
  keyof AuthStackParamList
> = {
  OnboardingScreen: 'OnboardingScreen',
  LoginScreen: 'LoginScreen',
  OtpScreen: 'OtpScreen',
  CompleteProfileScreen: 'CompleteProfileScreen',
  PrivacyPolicyScreen: 'PrivacyPolicyScreen',
};

export const AppScreens: Record<
  keyof AppStackParamList,
  keyof AppStackParamList
> = {
  HomeScreen: 'HomeScreen',
  OrderScreen: 'OrderScreen',
  NotificationScreen: 'NotificationScreen',
  AccountScreen: 'AccountScreen',
  AppLayoutScreen: 'AppLayoutScreen',
};
