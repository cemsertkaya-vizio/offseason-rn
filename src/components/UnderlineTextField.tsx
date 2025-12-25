import React from 'react';
import {
  View,
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps,
} from 'react-native';
import { colors } from '../constants/colors';

interface UnderlineTextFieldProps extends TextInputProps {
  width?: number;
}

export const UnderlineTextField: React.FC<UnderlineTextFieldProps> = ({
  width = 304,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, { width }]}>
      <RNTextInput
        style={[styles.textInput, { width }, style]}
        placeholderTextColor="rgba(248, 249, 250, 0.5)"
        {...props}
      />
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
  textInput: {
    fontFamily: 'Roboto',
    fontSize: 27,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'left',
    paddingTop: 23,
    paddingBottom: 15,
    paddingHorizontal: 0,
    width: '100%',
    height: 65,
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

