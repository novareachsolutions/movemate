import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageSourcePropType,
  TextStyle,
} from 'react-native';
import {typography} from '../theme/typography';
import {colors} from '../theme/colors';
import {images} from '../assets/images/images';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {AuthScreens, AuthScreensParamList} from '../navigation/ScreenNames';
const {width, height} = Dimensions.get('window');

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
  description: string;
}

const slides: Slide[] = [
  {
    id: 0,
    title: 'Become our trusted service provider',
    subtitle: '',
    image: images.introImage1,
    description: 'Join us today!',
  },
];

const Onboarding: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const navigation = useNavigation<NavigationProp<AuthScreensParamList>>();
  const updateSlidePosition = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const handleNavigation = () => {
    navigation.navigate(AuthScreens.Login);
  };
  const Footer = () => (
    <View style={styles.footer}>
      <TouchableOpacity onPress={handleNavigation} style={styles.button}>
        <Text style={styles.buttonText}>
          {currentSlideIndex === slides.length - 1
            ? 'Get Started'
            : 'Continue >'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={updateSlidePosition}
        renderItem={({item}) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.title}>
              {item.title} <Text style={styles.subtitle}>{item.subtitle}</Text>
            </Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.white},
  slide: {width, alignItems: 'center', justifyContent: 'flex-start'},
  image: {resizeMode: 'cover'},
  title: {
    fontSize: typography.fontSize.large,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
  },
  subtitle: {color: colors.purple},
  description: {
    fontSize: typography.fontSize.medium,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
    marginTop: 10,
    color: colors.text.primary,
    paddingHorizontal: 20,
    fontWeight: typography.fontWeight.medium as TextStyle['fontWeight'],
  },
  footer: {
    height: height * 0.21,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indicatorContainer: {flexDirection: 'row', marginTop: 20},
  indicator: {
    height: 10,
    width: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeIndicator: {backgroundColor: colors.purple},
  button: {
    backgroundColor: colors.purple,
    width: '80%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: colors.white,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
  },
  skip: {
    color: colors.purple,
    marginTop: 10,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium as TextStyle['fontWeight'],
  },
});

export default Onboarding;
