import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Image,
} from 'react-native';
import StepIndicator from './StepIndicator';
import TitleDescription from './TitleDescription';
import {colors} from '../theme/colors';
import {formStyles} from '../theme/form';
import {typography} from '../theme/typography';
import {images} from '../assets/images/images';
import {DeliverAPackage} from '../navigation/ScreenNames';
import {useNavigation} from '@react-navigation/native';

interface Document {
  id: string;
  title: string;
}

interface DocumentListProps {
  stepIndicator: {current: number; total: number};
  title: string;
  description: string;
  documents: Document[];
  onCardPress: (title: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  stepIndicator,
  title,
  description,
  documents,
  onCardPress,
}) => {
  const navigation = useNavigation();

  const renderItem = ({item}: {item: Document}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onCardPress(item.title)}>
      <Text style={styles.cardText}>{item.title}</Text>
      <Image source={images.arrow} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <View style={styles.container}>
        <StepIndicator
          current={stepIndicator.current}
          total={stepIndicator.total}
        />
        <TitleDescription title={title} description={description} />
        <FlatList
          data={documents}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(DeliverAPackage.EnterVehicleDetails)
          }
          style={[formStyles.button, formStyles.buttonEnabled]}>
          <Text style={[formStyles.buttonText, formStyles.buttonTextEnabled]}>
            Continue
          </Text>
        </TouchableOpacity>
        <Text style={formStyles.footerText}>
          By continuing you accept our{' '}
          <Text style={formStyles.link}>Terms of Service</Text> and{' '}
          <Text style={formStyles.link}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.white,
  },
  list: {},
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.lightButtonBackground,
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderRadius: 8,
    marginVertical: 10,
    borderColor: colors.border.primary,
    borderWidth: 1,
  },
  cardText: {
    fontSize: typography.fontSize.semiMedium,
    fontWeight: '500',
    color: colors.text.primary,
  },
  arrow: {
    fontSize: 20,
    color: colors.text.primary,
  },
});

export default DocumentList;
