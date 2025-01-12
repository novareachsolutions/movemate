import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthScreens } from './ScreenNames';
import Onboarding from '../components/Onboarding';
import Login from '../Screens/LoginScreen';
import OtpScreen from '../Screens/OtpScreen';

const Stack = createNativeStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={AuthScreens.Onboarding}>
                <Stack.Screen name={AuthScreens.Onboarding} component={Onboarding} options={{ headerShown: false }} />
                <Stack.Screen name={AuthScreens.Login} component={Login} options={{ headerShown: false }} />
                <Stack.Screen name={AuthScreens.Otp} component={OtpScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
