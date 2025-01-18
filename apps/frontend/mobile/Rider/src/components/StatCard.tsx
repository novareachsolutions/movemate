import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';

interface StatCardProps {
  icon: any;
  value: string | number;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({icon, value, label}) => {
  return (
    <View style={styles.container}>
      <Image source={icon} style={styles.icon} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 5,
    objectFit: 'contain',
  },
  value: {
    fontSize: typography.fontSize.medium,
    fontWeight: '600',
    color: colors.text.primary,
  },
  label: {
    fontSize: typography.fontSize.small,
    color: colors.text.subText,
  },
});

export default StatCard;
