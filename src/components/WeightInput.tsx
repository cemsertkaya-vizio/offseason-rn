import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors } from '../constants/colors';

interface WeightInputProps extends Omit<TextInputProps, 'style'> {
  width?: number;
  style?: ViewStyle;
}

export const WeightInput: React.FC<WeightInputProps> = ({
  width = 304,
  style,
  value,
  onChangeText,
  ...props
}) => {
  const handleChangeText = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    onChangeText?.(numericValue);
  };

  const hasValue = value && value.trim() !== '';

  const getSuffixLeftPosition = () => {
    const valueLength = value?.length || 0;
    return valueLength * 13 + 4;
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
      {hasValue && (
        <Text style={[styles.suffix, { left: getSuffixLeftPosition() }]}>lbs</Text>
      )}
      <View style={styles.underline} />
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
    letterSpacing: 0,
  },
  suffix: {
    fontFamily: 'Roboto',
    fontSize: 22,
    fontWeight: '400',
    color: colors.offWhite,
    position: 'absolute',
    top: 23,
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
