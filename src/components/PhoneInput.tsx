import React, { useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PhoneInputComponent from 'react-native-phone-number-input';
import { colors } from '../constants/colors';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onChangeCountryCode?: (code: string) => void;
  onChangeFormattedText?: (text: string) => void;
  defaultCode?: string;
  style?: any;
  editable?: boolean;
  error?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  onChangeCountryCode,
  onChangeFormattedText,
  defaultCode = 'US',
  style,
  editable = true,
  error,
}) => {
  const phoneInput = useRef<PhoneInputComponent>(null);

  return (
    <View style={[styles.container, style]}>
      <PhoneInputComponent
        ref={phoneInput}
        defaultValue={value}
        defaultCode={defaultCode as any}
        layout="first"
        onChangeText={onChangeText}
        onChangeCountry={(country) => {
          if (onChangeCountryCode) {
            onChangeCountryCode(country.cca2);
          }
        }}
        onChangeFormattedText={onChangeFormattedText}
        disabled={!editable}
        containerStyle={styles.phoneContainer}
        textContainerStyle={styles.textContainer}
        textInputStyle={styles.textInput}
        codeTextStyle={styles.codeText}
        flagButtonStyle={styles.flagButton}
        countryPickerButtonStyle={styles.countryPickerButton}
        textInputProps={{
          placeholderTextColor: colors.gray.muted,
          selectionColor: colors.offWhite,
        }}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  phoneContainer: {
    backgroundColor: 'transparent',
    width: '100%',
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.offWhite,
    paddingHorizontal: 0,
  },
  textContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  textInput: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    backgroundColor: 'transparent',
    height: 56,
    paddingVertical: 0,
  },
  codeText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
  },
  flagButton: {
    width: 50,
  },
  countryPickerButton: {
    paddingHorizontal: 0,
  },
  errorText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
});

