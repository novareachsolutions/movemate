import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AppScreens, AuthScreens, DeliverAPackage} from './ScreenNames';
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

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={AuthScreens.Onboarding}>
        <Stack.Screen
          name={AuthScreens.Onboarding}
          component={Onboarding}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={AuthScreens.Login}
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={AuthScreens.Otp}
          component={OtpScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={AuthScreens.SelectService}
          component={SelectServiceScreen}
          options={{headerShown: false}}
        />

        {/* Deliver a package */}
        <Stack.Screen
          name={DeliverAPackage.CompleteProfile}
          component={DAPCompleteProfileScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={DeliverAPackage.UploadDocuments}
          component={DAPUploadDocumentsScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={DeliverAPackage.UploadDocumentDetails}
          component={DAPUploadDocumentDetailsScreen}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name={DeliverAPackage.EnterVehicleDetails}
          component={EnterVehicleDetailsScreen}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name={DeliverAPackage.EnterABN}
          component={EnterABNScreen}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name={DeliverAPackage.AddProfilePhoto}
          component={AddProfilePhotoScreen}
          options={{headerShown: true}}
        />

        {/* App */}
        <Stack.Screen
          name={AppScreens.DocumentReview}
          component={DocumentReviewScreen}
          options={{headerShown: true}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
