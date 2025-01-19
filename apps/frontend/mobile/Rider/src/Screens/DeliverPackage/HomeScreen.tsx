import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Animated,
} from 'react-native';
import StatCard from '../../components/StatCard';
import {images} from '../../assets/images/images';
import {colors} from '../../theme/colors';
import HelpButton from '../../components/HelpButton';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {AppScreens, AppScreensParamList} from '../../navigation/ScreenNames';

const HomeScreen: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [drawerHeight] = useState(new Animated.Value(0));
  //   const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  //   const [isExpandedModalVisible, setIsExpandedModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<AppScreensParamList>>();

  const toggleStatus = () => {
    setIsOnline(!isOnline);
    Animated.timing(drawerHeight, {
      toValue: isOnline ? 0 : 120,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  //   // Show the `DeliveryModal` after 3 seconds
  //   useEffect(() => {
  //     const timer = setTimeout(() => {
  //       setIsOrderModalVisible(true);
  //     }, 3000);

  //     return () => clearTimeout(timer);
  //   }, []);

  //   const handleTakePhoto = () => {
  //     console.log('Taking a photo for proof...');
  //     // Add your camera logic here
  //   };

  //   const handleOrderDelivered = () => {
  //     console.log('Order marked as delivered.');
  //     setIsOrderModalVisible(false); // Close DeliveryModal
  //   };

  //     // Handle "Accept Order" button press
  //   const handleAcceptOrder = () => {
  //     setIsOrderModalVisible(false); // Close `OrderModal`
  //     setTimeout(() => {
  //       setIsExpandedModalVisible(true); // Open `ExpandedModal` with a slight delay
  //     }, 300);
  //   };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Map Image */}
      <View style={styles.mapContainer}>
        <Image source={images.map} style={styles.mapImage} />
      </View>

      {/* Status Button */}
      <View style={styles.statusContainer}>
        <TouchableOpacity
          onPress={toggleStatus}
          style={[
            styles.statusButton,
            isOnline ? styles.stopButton : styles.goButton,
          ]}>
          <Text
            style={[
              styles.statusButtonText,
              isOnline ? styles.stopText : styles.goText,
            ]}>
            {isOnline ? 'Stop' : 'GO'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.statusText}>
          {isOnline ? "You're Online" : "You're Offline"}
        </Text>
      </View>

      {/* Sliding Drawer */}
      <Animated.View style={[styles.drawer, {height: drawerHeight}]}>
        <View style={styles.statsContainer}>
          <StatCard icon={images.money} value="$50" label="EARNINGS" />
          <StatCard icon={images.cart} value="7" label="ORDERS" />
          <StatCard
            icon={images.directionIcon}
            value="30 Km"
            label="DISTANCE"
          />
        </View>
      </Animated.View>

      <View style={styles.helpButtonContainer}>
        <HelpButton
          onPress={() => {
            navigation.navigate(AppScreens.FAQScreen);
          }}
        />
      </View>

      {/* Order Modal */}
      {/* <OrderModal
        isVisible={isOrderModalVisible}
        onClose={handleAcceptOrder} // Trigger handleAcceptOrder on close
        earnings="$21.89"
        tip="$11.89"
        time="15 mins"
        distance="7.6 Km"
        pickupAddress="Yocha (Tom Roberts Parade)"
        dropoffAddress="O’Neil Avenue & Sheahan Crescent, Hoppers Crossing"
      /> */}

      {/* Earnings Modal */}
      {/* <EarningsModal
        isVisible={isOrderModalVisible}
        onClose={() => setIsOrderModalVisible(false)}
        tripTime="26 mins"
        tripDistance="5.2 km"
        tripPay={55}
        tip={5}
        totalEarnings={60}
      /> */}

      {/* Delivery Modal */}
      {/* <DeliveryModal
                isVisible={isOrderModalVisible}
                onClose={() => setIsOrderModalVisible(false)}
                driverName="Alexander V."
                deliveryAddress="O’Neil Avenue & Sheahan Crescent, Hoppers Crossing"
                deliveryInstructions={['Do not ring the bell', 'Drop-off at the door']}
                itemsToDeliver={['Documents']}
            /> */}

      {/*Order Expanded Modal */}
      {/* <OrderExpandedModal
        isVisible={isExpandedModalVisible}
        onClose={() => setIsExpandedModalVisible(false)} // Close ExpandedModal
        driverName="Alexander V."
        pickupAddress="Yocha (Tom Roberts Parade)"
        pickupNotes="Deliver to the back door, main gate is locked."
        items={['Documents', 'Laptop', 'Bag']}
      /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  mapContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: -60,
    marginBottom: 20,
  },
  statusButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  stopButton: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  goButton: {
    backgroundColor: colors.white,
    borderColor: colors.purple,
  },
  statusButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stopText: {
    color: colors.white,
  },
  goText: {
    color: colors.purple,
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  drawer: {
    backgroundColor: colors.white,
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: -2},
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  helpButtonContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});

export default HomeScreen;
