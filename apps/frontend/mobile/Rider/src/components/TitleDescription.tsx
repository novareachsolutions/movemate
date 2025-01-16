import React from 'react';
import {View, Text, StyleSheet, TextStyle} from 'react-native';
import {typography} from '../theme/typography'; // Import typography
import {colors} from '../theme/colors'; // Import colors

interface TitleDescriptionProps {
  title: string;
  description: string;
}

const TitleDescription: React.FC<TitleDescriptionProps> = ({
  title,
  description,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>{title}</Text>
      <Text style={styles.subtext}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
    color: colors.purple,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'left',
    marginBottom: 10,
  },
  subtext: {
    fontSize: typography.fontSize.medium,
    color: colors.text.subText,
    textAlign: 'left',
  },
});

export default TitleDescription;
