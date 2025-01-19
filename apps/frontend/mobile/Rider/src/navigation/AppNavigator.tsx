import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppScreens, AuthScreens, BuyFromStore, DeliverAPackage } from './ScreenNames';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Onboarding from '../components/Onboarding';
import Login from '../Screens/LoginScreen';
import OtpScreen from '../Screens/OtpScreen';
import SelectServiceScreen from '../Screens/SelectServiceScreen';
import DAPCompleteProfileScreen from '../Screens/DeliverPackage/CompleteProfileScreen';
import DAPUploadDocumentDetailsScreen from '../Screens/DeliverPackage/UploadDocumentDetailsScreen';
import DAPUploadDocumentsScreen from '../Screens/DeliverPackage/UploadDocumentsScreen';
import DocumentReviewScreen from '../Screens/DocumentReviewScreen';
import EnterVehicleDetailsScreen from '../Screens/DeliverPackage/EnterVehicleDetailsScreen';
import EnterABNScreen from '../Screens/DeliverPackage/EnterABN';
import AddProfilePhotoScreen from '../Screens/DeliverPackage/AddProfilePhotoScreen';
import HomeScreen from '../Screens/DeliverPackage/HomeScreen';
import FAQScreen from '../Screens/FaqScreen';
import CancellationReasonScreen from '../Screens/CancellationReasonScreen';
import ChatScreen from '../components/ChatModule';
import ItemsReviewScreen from '../Screens/BuyFromStore/ItemsReviewScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={AuthScreens.Onboarding}>
        <Stack.Screen
          name={AuthScreens.Onboarding}
          component={Onboarding}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={AuthScreens.Login}
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={AuthScreens.Otp}
          component={OtpScreen as React.FC}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={AuthScreens.SelectService}
          component={SelectServiceScreen}
          options={{ headerShown: false }}
        />

        {/* Deliver a Package */}
        <Stack.Screen
          name={DeliverAPackage.CompleteProfile}
          component={DAPCompleteProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={DeliverAPackage.UploadDocuments}
          component={DAPUploadDocumentsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={DeliverAPackage.UploadDocumentDetails}
          component={DAPUploadDocumentDetailsScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name={DeliverAPackage.EnterVehicleDetails}
          component={EnterVehicleDetailsScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name={DeliverAPackage.EnterABN}
          component={EnterABNScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name={DeliverAPackage.AddProfilePhoto}
          component={AddProfilePhotoScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name={DeliverAPackage.Home}
          component={HomeScreen}
          options={{ headerShown: false }}
        />

        {/* Buy From Store */}
        <Stack.Screen
          name={BuyFromStore.ItemsReviewScreen}
          component={ItemsReviewScreen}
          options={{ headerShown: true }}
        />

        {/* App */}
        <Stack.Screen
          name={AppScreens.DocumentReview}
          component={DocumentReviewScreen as React.FC}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name={AppScreens.FAQScreen}
          component={FAQScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name={AppScreens.CancellationReason}
          component={CancellationReasonScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name={AppScreens.Chat}
          component={ChatScreen as React.FC}
          options={{ headerShown: true }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
