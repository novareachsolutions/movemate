import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

// Auth Stack Param List
export type AuthStackParamList = {
  OnboardingScreen: undefined;
  LoginScreen: undefined;
  OtpScreen: {phoneNumber: string};
  CompleteProfileScreen: undefined;
  PrivacyPolicyScreen: undefined;
};

// App Stack Param List
export type AppStackParamList = {
  HomeScreen: undefined;
  OrderScreen: undefined;
  NotificationScreen: undefined;
  AccountScreen: undefined;
  AppLayoutScreen: undefined;
};

// Combined Param List
export type RootStackParamList = AuthStackParamList & AppStackParamList;

// Navigation and Route Prop Types
export type RootNavigationProp<T extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, T>;
export type RootRouteProp<T extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  T
>;
