import React from 'react';
import DocumentUpload from '../../components/DocumentUpload';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AppScreens} from '../../navigation/ScreenNames';

const DAPUploadDocumentDetailsScreen = () => {
  const route = useRoute();
  const {title} = route.params as {title: string};
  const navigation = useNavigation();

  const handleUpload = () => {
    const uploadedImage =
      'https://t4.ftcdn.net/jpg/04/06/03/39/360_F_406033996_qxQiHLN1gbQ14mHopBDojK7PmsgpI6Ny.jpg'; // Replace with actual uploaded image URI
    navigation.navigate(AppScreens.DocumentReview, {title, uploadedImage});
  };

  return (
    <DocumentUpload
      stepIndicator={{current: 2, total: 4}}
      title={title}
      guidelines={[
        'Accepted: Passport, Medicare card, or government-issued ID card.',
        'Validity: Must be current and not expired.',
        'File Types: PDF, JPEG, PNG (max 5MB).',
        'Confidentiality: Your document will be securely stored and used only for verification.',
      ]}
      uploadInstructions={[
        'Scan or photograph your ID proof.',
        'Ensure all details are clearly visible.',
        'Click "Upload" to submit your document.',
      ]}
      onUpload={handleUpload}
    />
  );
};

export default DAPUploadDocumentDetailsScreen;
