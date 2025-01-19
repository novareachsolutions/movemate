import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  TextStyle,
} from 'react-native';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {formStyles} from '../theme/form';
import {images} from '../assets/images/images';
import FAQModal from '../components/Modals/FaqModal';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {AppScreens, AppScreensParamList} from '../navigation/ScreenNames';

interface FAQ {
  question: string;
  answer: string;
}

const FAQs: FAQ[] = [
  {
    question:
      "What should I do if I can't find the customer or delivery address?",
    answer:
      "If you can't find the customer or delivery address, contact support for assistance or try reaching out to the customer directly.",
  },
  {
    question: "What if the customer isn't answering their phone?",
    answer:
      'In such cases, leave a message for the customer and wait for a response. If the issue persists, contact support.',
  },
  {
    question: 'What should I do if my vehicle breaks down during delivery?',
    answer:
      'If your vehicle breaks down, inform the customer and contact support to reschedule or arrange alternate transportation.',
  },
  {
    question: 'The app isn’t working or has frozen; how can I resolve this?',
    answer:
      'Restart the app or your device. If the problem persists, contact support for further assistance.',
  },
  {
    question: 'Can I contact support for immediate help?',
    answer:
      'Yes, you can contact support through the app or by calling the provided support hotline.',
  },
];

const FAQScreen: React.FC = () => {
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const navigation = useNavigation<NavigationProp<AppScreensParamList>>();

  const renderFAQItem = ({item}: {item: FAQ}) => (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setSelectedFAQ(item)}>
      <Text style={styles.faqQuestion}>{item.question}</Text>
      <Image source={images.arrow} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.subHeader}>Having trouble with your order?</Text>

      {/* FAQ List */}
      <FlatList
        data={FAQs}
        renderItem={renderFAQItem}
        keyExtractor={(item, index) => `faq-${index}`}
        style={styles.faqList}
      />

      {/* Cancel Order Button */}
      <TouchableOpacity
        style={[formStyles.button, styles.cancelButton]}
        onPress={() => {
          navigation.navigate(AppScreens.CancellationReason);
        }}>
        <Text style={[formStyles.buttonText, styles.cancelButtonText]}>
          Cancel Order
        </Text>
      </TouchableOpacity>

      {/* FAQ Modal */}
      {selectedFAQ && (
        <FAQModal
          isVisible={!!selectedFAQ}
          onClose={() => setSelectedFAQ(null)}
          question={selectedFAQ.question}
          answer={selectedFAQ.answer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
  },
  header: {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: typography.fontSize.semiMedium,
    color: colors.text.primaryGrey,
    marginBottom: 20,
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
  },
  faqList: {
    marginBottom: 20,
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 25,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  faqQuestion: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
    flex: 1,
    marginRight: 40,
    fontWeight: typography.fontWeight.medium as TextStyle['fontWeight'],
  },
  cancelButton: {
    borderColor: colors.error,
    borderWidth: 1,
    backgroundColor: colors.white,
    marginTop: 20,
  },
  cancelButtonText: {
    color: colors.error,
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
  },
  modalHeader: {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
    color: colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalAnswer: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primaryGrey,
    marginBottom: 40,
    textAlign: 'center',
  },
});

export default FAQScreen;
