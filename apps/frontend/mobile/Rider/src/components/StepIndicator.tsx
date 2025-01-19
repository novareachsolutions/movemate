import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors} from '../theme/colors';

interface StepIndicatorProps {
  current: number;
  total: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({current, total}) => {
  return (
    <View style={styles.container}>
      {Array.from({length: total}, (_, index) => (
        <View
          key={index}
          style={[
            styles.step,
            index < current ? styles.activeStep : styles.inactiveStep,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
    // marginVertical: 20,
  },
  step: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 4,
  },
  activeStep: {
    backgroundColor: colors.purple,
  },
  inactiveStep: {
    backgroundColor: colors.lightButtonBackground,
  },
});

export default StepIndicator;
