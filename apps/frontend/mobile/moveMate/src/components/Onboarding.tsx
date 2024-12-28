import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';
import { images } from '../assets/images/images';
import { useNavigation } from '@react-navigation/native';
import { AuthScreens } from '../navigation/ScreenNames';
const { width, height } = Dimensions.get('window');

interface Slide {
    id: number;
    title: string;
    subtitle: string;
    image: any;
    description: string;
}

const slides: Slide[] = [
    {
        id: 0,
        title: 'Send a',
        subtitle: 'Package',
        image: images.introImage1,
        description:
            'Quickly send packages with ease. Choose pickup and delivery, and we handle the rest',
    },
    {
        id: 1,
        title: 'Buy from a',
        subtitle: 'Store',
        image: images.introImage2,
        description:
            'Shop from your favorite stores effortlessly. Select, pay, and have it delivered right to your door.',
    },
    {
        id: 2,
        title: 'Car',
        subtitle: 'Towing',
        image: images.introImage3,
        description:
            'Shop from your favorite stores effortlessly. Select, pay, and have it delivered right to your door.',
    },
    {
        id: 3,
        title: 'Home',
        subtitle: 'Moving',
        image: images.introImage4,
        description:
            'Quickly send packages with ease. Choose pickup and delivery, and we handle the rest',
    },
];

const Onboarding: React.FC = () => {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const navigation = useNavigation()
    const updateSlidePosition = (e: any) => {
        const contentOffsetX = e.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / width);
        setCurrentSlideIndex(currentIndex);
    };

    const handleNavigation = () => {
        navigation.navigate(AuthScreens.LoginScreen)
    }
    const Footer = () => (
        <View style={styles.footer}>
            <View style={styles.indicatorContainer}>
                {slides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            index <= currentSlideIndex ? styles.activeIndicator : {},
                        ]}
                    />
                ))}
            </View>
            <TouchableOpacity onPress={handleNavigation} style={styles.button}>
                <Text style={styles.buttonText}>
                    {currentSlideIndex === slides.length - 1
                        ? 'Get Started'
                        : 'Continue >'}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={handleNavigation}
                style={[
                    styles.button,
                    {
                        backgroundColor: colors.lightButtonBackground,
                        bottom: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                ]}>
                <Text style={styles.skip}>Skip</Text>
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
                renderItem={({ item }) => (
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
    container: { flex: 1, backgroundColor: colors.white },
    slide: { width, alignItems: 'center', justifyContent: 'center' },
    image: { height: height * 0.5, width: width * 0.8, resizeMode: 'contain' },
    title: {
        fontSize: typography.fontSize.large,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        fontWeight: typography.fontWeight.bold as any
    },
    subtitle: { color: colors.purple },
    description: {
        fontSize: typography.fontSize.medium,
        fontFamily: typography.fontFamily.regular,
        textAlign: 'center',
        marginTop: 10,
        color: colors.text.primary,
        paddingHorizontal: 20,
        fontWeight: typography.fontWeight.medium as any
    },
    footer: {
        height: height * 0.21,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    indicatorContainer: { flexDirection: 'row', marginTop: 20 },
    indicator: {
        height: 10,
        width: 10,
        backgroundColor: '#ccc',
        borderRadius: 5,
        marginHorizontal: 5,
    },
    activeIndicator: { backgroundColor: colors.purple },
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
        fontWeight: typography.fontWeight.bold as any,
    },
    skip: {
        color: colors.purple,
        marginTop: 10,
        fontSize: typography.fontSize.medium,
        fontWeight: typography.fontWeight.medium as any,
    },
});

export default Onboarding;
