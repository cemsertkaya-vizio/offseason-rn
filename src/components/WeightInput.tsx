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

  return (
    <View style={[styles.container, { width }, style]}>
      <View style={styles.inputContainer}>
        <RNTextInput
          style={styles.textInput}
          placeholderTextColor="rgba(248, 249, 250, 0.5)"
          value={value}
          onChangeText={handleChangeText}
          keyboardType="numeric"
          {...props}
        />
        {hasValue && <Text style={styles.suffix}>lbs</Text>}
      </View>
      <View style={[styles.underline, { width }]} />
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    height: 65,
    paddingBottom: 15,
  },
  textInput: {
    fontFamily: 'Roboto',
    fontSize: 22,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'left',
    paddingHorizontal: 0,
    paddingVertical: 0,
    flex: 1,
  },
  suffix: {
    fontFamily: 'Roboto',
    fontSize: 22,
    fontWeight: '400',
    color: colors.offWhite,
    marginLeft: 8,
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
