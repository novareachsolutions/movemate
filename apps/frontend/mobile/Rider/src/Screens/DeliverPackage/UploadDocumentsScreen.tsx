import React from 'react';
import DocumentList from '../../components/DocumentList';
import {useNavigation} from '@react-navigation/native';
import {DeliverAPackage} from '../../navigation/ScreenNames';

const DAPUploadDocumentsScreen = () => {
  const navigation = useNavigation();

  const documents = [
    {id: '1', title: 'Police Verification'},
    {id: '2', title: 'Driver’s License'},
    {id: '3', title: 'Australian ID Proof'},
  ];

  const handleCardPress = (title: string) => {
    navigation.navigate(DeliverAPackage.UploadDocumentDetails, {title});
  };

  return (
    <DocumentList
      stepIndicator={{current: 2, total: 4}}
      title="Upload your Official Documents"
      description="Add your details to get started"
      documents={documents}
      onCardPress={handleCardPress}
    />
  );
};

export default DAPUploadDocumentsScreen;
