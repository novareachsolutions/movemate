import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextStyle,
} from 'react-native';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';

interface DropdownProps {
  label: string;
  placeholder: string;
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder,
  options,
  selectedValue,
  onValueChange,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setIsVisible(false);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setIsVisible(true)}>
        <Text
          style={{
            color: selectedValue ? colors.text.primary : colors.text.subText,
          }}>
          {selectedValue || placeholder}
        </Text>
      </TouchableOpacity>
      <Modal visible={isVisible} transparent animationType="slide">
        <View style={styles.modal}>
          <FlatList
            data={options}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => handleSelect(item)}>
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setIsVisible(false)}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 15,
  },
  label: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
    marginBottom: 7,
    color: colors.text.primaryGrey,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 8,
    padding: 12,
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  option: {
    backgroundColor: colors.white,
    padding: 15,
    borderBottomWidth: 1,
    borderColor: colors.border.primary,
  },
  optionText: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
  },
  modalClose: {
    backgroundColor: colors.purple,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    color: colors.white,
    fontSize: typography.fontSize.medium,
  },
});

export default Dropdown;
