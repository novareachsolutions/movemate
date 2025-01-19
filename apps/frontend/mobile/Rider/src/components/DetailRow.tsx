import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';

interface DetailRowProps {
  label: string;
  value: string | number;
  icon?: any;
}

const DetailRow: React.FC<DetailRowProps> = ({icon, label, value}) => {
  return (
    <View style={styles.detailRow}>
      {icon && <Image source={icon} style={styles.icon} />}
      <Text
        style={[
          styles.detailText,
          icon
            ? {
                fontWeight: typography.fontWeight.regular as any,
              }
            : {
                fontWeight: typography.fontWeight.bold as any,
              },
        ]}>
        {label}
      </Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: colors.text.primaryGrey,
    marginRight: 10,
  },
  detailText: {
    flex: 1,
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
  },
  detailValue: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
  },
});

export default DetailRow;
