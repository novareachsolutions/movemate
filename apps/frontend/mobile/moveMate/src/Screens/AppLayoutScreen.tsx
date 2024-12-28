import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppScreens } from '../navigation/ScreenNames';
import HomeScreen from './HomeScreen';
import OrderScreen from './OrderScreen';
import NotificationScreen from './Offerscreen';
import AccountScreen from './AccountScreen';
import { Image, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { images } from '../assets/images/images';

const Tab = createBottomTabNavigator();

const AppLayoutScreen = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarStyle: { backgroundColor: colors.white },
                tabBarActiveTintColor: colors.purple,
                tabBarInactiveTintColor: colors.text.subText,
                tabBarLabelStyle: { fontSize: 12 },
                headerShown: false,
                tabBarLabelPosition: "above-icon",
                tabBarIcon: ({ focused, color, }) => {
                    // Common icon for active and inactive states
                    let icon;
                    if (route.name === AppScreens.HomeScreen) {
                        icon = images.home;
                    } else if (route.name === AppScreens.OrderScreen) {
                        icon = images.orders;
                    } else if (route.name === AppScreens.NotificationScreen) {
                        icon = images.notificatons;
                    } else if (route.name === AppScreens.AccountScreen) {
                        icon = images.account;
                    }
                    return (
                        <Image
                            source={icon}
                            style={[
                                styles.icon,
                                { tintColor: color },
                            ]}
                        />
                    );
                },
            })}>
            <Tab.Screen options={{ tabBarLabel: "Home", }} name={AppScreens.HomeScreen} component={HomeScreen} />
            <Tab.Screen options={{ tabBarLabel: "Orders" }} name={AppScreens.OrderScreen} component={OrderScreen} />
            <Tab.Screen options={{ tabBarLabel: "Notifications" }}
                name={AppScreens.NotificationScreen}
                component={NotificationScreen}
            />
            <Tab.Screen options={{ tabBarLabel: "Account" }} name={AppScreens.AccountScreen} component={AccountScreen} />
        </Tab.Navigator>
    );
};
export default AppLayoutScreen;

const styles = StyleSheet.create({
    icon: {
        width: 24,
        height: 24,
    },
});
