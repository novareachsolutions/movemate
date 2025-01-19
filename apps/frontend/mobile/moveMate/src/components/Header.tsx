import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {images} from '../assets/images/images';

const Header = ({showLogo = false}: {showLogo?: boolean}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButtonWrapper}>
        <Text style={styles.backButton}>{'<'}</Text>
      </TouchableOpacity>
      {showLogo && (
        <Image source={images.logo} style={styles.logo} resizeMode="contain" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'white',
    elevation: 2,
    position: 'relative',
  },
  backButtonWrapper: {
    position: 'absolute',
    left: 10,
  },
  backButton: {
    fontSize: 18,
    color: 'black',
  },
  logo: {
    height: 40,
    width: 100,
  },
});

export default Header;
