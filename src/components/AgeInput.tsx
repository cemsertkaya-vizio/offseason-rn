import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors } from '../constants/colors';

interface AgeInputProps extends Omit<TextInputProps, 'onChangeText' | 'style'> {
  width?: number;
  style?: ViewStyle;
  onChangeText?: (text: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const AgeInput: React.FC<AgeInputProps> = ({
  width = 304,
  style,
  value,
  onChangeText,
  onValidationChange,
  ...props
}) => {
  const [error, setError] = useState<string>('');

  const handleChangeText = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    
    if (numericValue === '') {
      setError('');
      onChangeText?.(numericValue);
      onValidationChange?.(false);
      return;
    }

    const age = parseInt(numericValue, 10);
    
    if (age < 14) {
      setError('Age must be at least 14');
      onValidationChange?.(false);
    } else if (age > 99) {
      setError('Age must be at most 99');
      onValidationChange?.(false);
    } else {
      setError('');
      onValidationChange?.(true);
    }

    onChangeText?.(numericValue);
  };

  return (
    <View style={[styles.container, { width }, style]}>
      <RNTextInput
        style={[styles.textInput, { width }]}
        placeholderTextColor="rgba(248, 249, 250, 0.5)"
        value={value}
        onChangeText={handleChangeText}
        keyboardType="numeric"
        {...props}
      />
      <View style={[styles.underline, { width }]} />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    height: 65,
    justifyContent: 'flex-start',
    position: 'relative',
  },
  textInput: {
    fontFamily: 'Roboto',
    fontSize: 22,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'left',
    paddingTop: 23,
    paddingBottom: 15,
    paddingHorizontal: 0,
    width: '100%',
    height: 65,
  },
  errorText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: '400',
    color: '#FF6B6B',
    position: 'absolute',
    bottom: -18,
    left: 0,
  },
  underline: {
    height: 1,
    backgroundColor: 'rgba(248, 249, 250, 0.5)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
