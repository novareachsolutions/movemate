import {StyleSheet, TextStyle} from 'react-native';
import {colors} from './colors';
import {typography} from './typography';

export const formStyles = StyleSheet.create({
  inputLabel: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primaryGrey,
    marginBottom: 7,
  },
  inputWrapper: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 8,
    padding: 12,
    fontSize: typography.fontSize.medium,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  focusedInput: {
    borderColor: colors.purple,
  },
  errorInput: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.small,
    marginTop: 5,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonEnabled: {
    backgroundColor: colors.purple,
    borderWidth: 1,
    borderColor: colors.purple,
  },
  buttonSuccess: {
    backgroundColor: colors.green,
  },
  buttonText: {
    color: colors.text.primaryGrey,
    fontSize: typography.fontSize.medium,
    fontFamily: typography.fontFamily.regular,
    fontWeight: typography.fontWeight.semiBold as TextStyle['fontWeight'],
  },
  buttonTextEnabled: {
    color: colors.white,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.small,
    color: colors.text.primaryGrey,
    fontFamily: typography.fontFamily.regular,
    fontWeight: typography.fontWeight.regular as TextStyle['fontWeight'],
    textAlign: 'center',
    marginHorizontal: 25,
    marginTop: 10,
  },
  link: {
    color: colors.purple,
    textDecorationLine: 'underline',
  },
});
