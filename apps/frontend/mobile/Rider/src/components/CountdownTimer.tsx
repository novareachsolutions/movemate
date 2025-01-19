import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TextStyle} from 'react-native';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';

const CountdownTimer: React.FC<{initialSeconds: number}> = ({
  initialSeconds,
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <View style={styles.timerContainer}>
      <View style={styles.circle}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 35,
    backgroundColor: colors.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    color: colors.white,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
  },
});

export default CountdownTimer;
