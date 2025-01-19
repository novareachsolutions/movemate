import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  TextStyle,
} from 'react-native';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {images} from '../assets/images/images';
import TitleDescription from '../components/TitleDescription';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {
  DeliverAPackage,
  DeliverAPackageParamList,
} from '../navigation/ScreenNames';

const services = [
  {
    id: '1',
    title: 'Deliver a Package',
    description:
      'Deliver parcels, ensuring they reach their destination on time.',
    image: images.package,
  },
  {
    id: '2',
    title: 'Car Towing',
    description:
      'Assist stranded drivers by towing their vehicles safely to their desired location.',
    image: images.towing,
  },
  {
    id: '3',
    title: 'Home Moving',
    description: 'Transport belongings securely for home moves.',
    image: images.moving,
  },
];

const SelectServiceScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<DeliverAPackageParamList>>();
  const renderService = ({item}: {item: (typeof services)[0]}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(DeliverAPackage.CompleteProfile)}>
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
        <Image source={images.arrow} style={styles.arrow} />
      </View>
      <Image source={item.image} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <TitleDescription
            title="Choose Your Service"
            description="Select the service you want to offer"
          />
          <FlatList
            data={services}
            renderItem={renderService}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
          />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.white,
    marginTop: 60,
  },
  list: {
    paddingTop: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: colors.white,
    borderRadius: 10,
    elevation: 7,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 2},
    marginBottom: 15,
    gap: 20,
  },
  textContainer: {
    flex: 1,
    paddingRight: 15,
  },
  cardTitle: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
    color: colors.text.primary,
  },
  cardDescription: {
    fontSize: typography.fontSize.small,
    color: colors.text.subText,
    marginTop: 5,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  arrow: {
    marginTop: 10,
  },
});

export default SelectServiceScreen;
