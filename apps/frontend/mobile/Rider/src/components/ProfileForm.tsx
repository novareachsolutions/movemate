import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardTypeOptions,
} from 'react-native';
import {formStyles} from '../theme/form';
import TitleDescription from './TitleDescription';

type FormFields = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  suburb: string;
  state: string;
  postalCode: string;
};

type Errors = Partial<Record<keyof FormFields, string>>;

interface ProfileFormProps {
  title: string;
  description: string;
  onSubmit: (formData: FormFields) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  title,
  description,
  onSubmit,
}) => {
  const [form, setForm] = useState<FormFields>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    suburb: '',
    state: '',
    postalCode: '',
  });

  const [errors, setErrors] = useState<Errors>({});
  const [focusedField, setFocusedField] = useState<keyof FormFields | null>(
    null,
  );

  const validateForm = () => {
    const newErrors: Errors = {};
    if (!form.firstName) newErrors.firstName = 'First Name is required';
    if (!form.lastName) newErrors.lastName = 'Last Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.address) newErrors.address = 'Street Address is required';
    if (!form.suburb) newErrors.suburb = 'Suburb is required';
    if (!form.state) newErrors.state = 'State is required';
    if (!form.postalCode) {
      newErrors.postalCode = 'Postal Code is required';
    } else if (!/^\d+$/.test(form.postalCode)) {
      newErrors.postalCode = 'Postal Code must be numeric';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(form);
    }
  };

  const handleInputChange = (field: keyof FormFields, value: string) => {
    setForm(prev => ({...prev, [field]: value}));
    setErrors(prev => ({...prev, [field]: ''})); // Clear error for this field
  };

  const inputFields: {
    label: string;
    field: keyof FormFields;
    keyboardType?: KeyboardTypeOptions;
  }[] = [
    {label: 'First Name', field: 'firstName'},
    {label: 'Last Name', field: 'lastName'},
    {label: 'Email Address', field: 'email', keyboardType: 'email-address'},
    {label: 'Street Address', field: 'address'},
    {label: 'Suburb', field: 'suburb'},
    {label: 'State', field: 'state'},
    {label: 'Postal Code', field: 'postalCode', keyboardType: 'numeric'},
  ];

  return (
    <ScrollView>
      <TitleDescription title={title} description={description} />

      {inputFields.map((input, index) => (
        <View key={index} style={formStyles.inputWrapper}>
          <Text style={formStyles.inputLabel}>{input.label}</Text>
          <TextInput
            placeholder={`Enter your ${input.label.toLowerCase()}`}
            style={[
              formStyles.input,
              focusedField === input.field && formStyles.focusedInput,
              errors[input.field] && formStyles.errorInput,
            ]}
            onFocus={() => setFocusedField(input.field)}
            onBlur={() => setFocusedField(null)}
            keyboardType={input.keyboardType || 'default'}
            value={form[input.field]}
            onChangeText={text => handleInputChange(input.field, text)}
          />
          {errors[input.field] && (
            <Text style={formStyles.errorText}>{errors[input.field]}</Text>
          )}
        </View>
      ))}

      <TouchableOpacity
        style={[
          formStyles.button,
          Object.values(form).every(value => value) && formStyles.buttonEnabled,
        ]}
        onPress={handleSubmit}
        disabled={!Object.values(form).every(value => value)}>
        <Text
          style={[
            formStyles.buttonText,
            Object.values(form).every(value => value) &&
              formStyles.buttonTextEnabled,
          ]}>
          Continue
        </Text>
      </TouchableOpacity>

      <View style={formStyles.footer}>
        <Text style={formStyles.footerText}>
          By continuing you accept our{' '}
          <Text style={formStyles.link}>Terms of Service</Text> and{' '}
          <Text style={formStyles.link}>Privacy Policy</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

export default ProfileForm;
