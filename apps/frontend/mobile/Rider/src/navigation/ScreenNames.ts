export type AuthScreensParamList = {
  OnboardingScreen: undefined;
  LoginScreen: undefined;
  OtpScreen: {
    phoneNumber:string
  };
  SelectServiceScreen: undefined;
};

export const AuthScreens = {
  Onboarding: 'OnboardingScreen',
  Login: 'LoginScreen',
  Otp: 'OtpScreen',
  SelectService: 'SelectServiceScreen',
} as const;

export const AppScreens = {
  Home: 'HomeScreen',
  Dashboard: 'DashboardScreen',
  DocumentReview: 'DocumentReviewScreen',
};

export type DeliverAPackageParamList = {
  CompleteProfileScreen: undefined;
  UploadDocumentDetails: undefined;
  UploadDocumentsScreen: undefined;
  DashboardScreen: undefined;
  EnterVehicleDetailsScreen: undefined;
  EnterABNScreen: undefined;
  AddProfilePhotoScreen: undefined;
};

export const DeliverAPackage = {
  CompleteProfile: 'CompleteProfileScreen',
  UploadDocumentDetails: 'UploadDocumentDetails',
  UploadDocuments: 'UploadDocumentsScreen',
  Dashboard: 'DashboardScreen',
  EnterVehicleDetails: 'EnterVehicleDetailsScreen',
  EnterABN: 'EnterABNScreen',
  AddProfilePhoto: 'AddProfilePhotoScreen',
} as const;
