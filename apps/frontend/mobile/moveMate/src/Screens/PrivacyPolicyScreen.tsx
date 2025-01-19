import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {colors} from '../theme/colors';
import Header from '../components/Header';
import {typography} from '../theme/typography';

const PrivacyPolicyScreen = () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <Header />
      <View style={{padding: 15}}>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <Text style={styles.privacyHeader}>Information We Collect</Text>
        <Text style={styles.privacyPolicyText}>
          We may collect personal information such as your name, email address,
          phone number, and payment details when you register, make a purchase,
          or contact us. We collect information about how you interact with our
          website, including IP addresses, browser types, and pages visited. We
          collect information about how you interact with our website, including
          IP addresses, browser types, and pages visited.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  headerTitle: {
    marginVertical: 10,
    fontWeight: typography.fontWeight.bold as any,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.large,
  },
  privacyHeader: {
    marginVertical: 10,
    fontFamily: typography.fontFamily.regular,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primaryGrey,
    fontSize: typography.fontSize.medium + 2,
  },
  privacyPolicyText: {
    marginVertical: 10,
    color: colors.text.subText,
    fontSize: typography.fontSize.medium - 1,
    fontFamily: typography.fontFamily.regular,
    fontWeight: typography.fontWeight.regular as any,
    lineHeight: 25,
  },
});
