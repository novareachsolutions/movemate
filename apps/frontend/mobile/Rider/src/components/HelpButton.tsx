import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {images} from '../assets/images/images';

const HelpButton: React.FC<{onPress: () => void}> = ({onPress}) => {
  return (
    <TouchableOpacity style={styles.helpButton} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Image source={images.helpIcon} style={styles.icon} />
      </View>
      <Text style={styles.text}>Help</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 2},
    elevation: 3, // For Android shadow
  },
  iconContainer: {
    marginRight: 6,
  },
  icon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: colors.purple,
  },
  text: {
    fontSize: typography.fontSize.medium,
    color: colors.purple,
    fontWeight: typography.fontWeight.medium as any,
  },
});

export default HelpButton;
