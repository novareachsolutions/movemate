import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    FlatList,
} from 'react-native';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';
import { images } from '../assets/images/images';

// Mock Data
const address = '123 Main Street, Springfield, USA';
const gridButtons = [
    {
        id: 1,
        title: 'SEND A PACKAGE',
        subTitle: 'Hassle-Free',
        image: images.package,
    },
    { id: 2, title: 'BUY FROM STORE', subTitle: 'Easy Shop', image: images.store },
    { id: 3, title: 'CAR TOWING', subTitle: 'Fast Tow', image: images.towTruck },
    {
        id: 4,
        title: 'HOME MOVING',
        subTitle: 'Swift Shifting',
        image: images.shoppingCart,
    },
];

const HomeScreen = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View style={styles.rowButton}>
                    <TouchableOpacity style={styles.rowButton}>
                        <Image style={styles.icon} source={images.location} />
                        <Text style={styles.homeText}>Home</Text>
                        <Text style={styles.icon}>⬇</Text>
                    </TouchableOpacity>
                    <Image
                        source={images.account}
                        style={{ marginLeft: "60%", height: 30, width: 30 }}
                    />
                </View>

                <Text style={styles.address}>{address}</Text>
            </View>

            <View style={styles.bannerContainer}>
                <Image
                    source={images.banner} // Replace with a static banner image
                    style={styles.banner}
                    resizeMode="contain"
                />
                {/* <TouchableOpacity style={styles.bannerButton}>
                    <Text style={styles.bannerButtonText}>Claim Your Cashback</Text>
                </TouchableOpacity> */}
            </View>

            <FlatList
                data={gridButtons}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.gridButton}>
                        <Text style={styles.gridButtonText}>{item.title}</Text>
                        <Text style={styles.gridButtonSubText}>{item.subTitle}</Text>
                        <Image source={item.image} style={styles.gridButtonImage} />
                    </TouchableOpacity>
                )}
            />
            {/* <View style={styles.bannerContainer}>
                <Image
                    source={images.banner2} // Replace with a static banner image
                    style={styles.banner}
                    resizeMode="contain"
                />
               
            </View> */}
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        padding: 16,
        backgroundColor: colors.white,
        // borderBottomWidth: 1,
        // borderBottomColor: '#ddd',
    },
    rowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    icon: {
        fontSize: 18,
        marginHorizontal: 4,
    },
    homeText: {
        fontSize: typography.fontSize.medium + 2,
        fontFamily: typography.fontFamily.regular,
        color: colors.purple,
        fontWeight: typography.fontWeight.bold as any,
    },
    address: {
        color: colors.grey,
        fontSize: typography.fontSize.medium - 2,
        fontWeight: typography.fontWeight.medium as any,
        fontFamily: typography.fontFamily.regular,
        paddingLeft: 22
    },
    bannerContainer: {
        margin: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    banner: {
        width: '100%',
        height: 150,
    },
    bannerButton: {
        position: 'absolute',
        bottom: 16,
        alignSelf: 'center',
        backgroundColor: colors.blue,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    bannerButtonText: {
        color: colors.white,
        fontWeight: typography.fontWeight.bold as any,
        fontSize: typography.fontSize.small - 1,
        fontFamily: typography.fontFamily.regular,
    },
    gridButton: {
        flex: 1,
        margin: 8,
        padding: 16,
        backgroundColor: '#f0f0f0',
        elevation: 5,
        borderRadius: 8,
    },
    gridButtonImage: {
        width: 91,
        height: 91,
        marginBottom: 8,
        alignSelf: 'flex-end',
    },
    gridButtonText: {
        fontSize: typography.fontSize.medium - 2,

        color: colors.text.primary,
        fontFamily: typography.fontFamily.regular,
        fontWeight: typography.fontWeight.bold as any,
    },
    gridButtonSubText: {
        fontSize: typography.fontSize.medium,

        color: colors.grey,
        fontFamily: typography.fontFamily.regular,
        fontWeight: typography.fontWeight.medium as any,
    },
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});
