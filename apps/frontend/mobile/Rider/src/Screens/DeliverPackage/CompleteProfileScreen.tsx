import React from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import ProfileForm from '../../components/ProfileForm';
import StepIndicator from '../../components/StepIndicator';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../theme/colors';
import {DeliverAPackage} from '../../navigation/ScreenNames';

const DAPCompleteProfileScreen = () => {
  const navigation = useNavigation();

  const handleFormSubmit = (formData: any) => {
    console.log('Form submitted:', formData);
    navigation.navigate(DeliverAPackage.UploadDocuments);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <View style={styles.container}>
        <StepIndicator current={1} total={4} />
        <ProfileForm
          title="Complete your Profile"
          description="Add your details to get started"
          onSubmit={handleFormSubmit}
        />
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
});

export default DAPCompleteProfileScreen;
