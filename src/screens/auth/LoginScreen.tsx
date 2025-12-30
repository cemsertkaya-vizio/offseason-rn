import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PhoneInputComponent from 'react-native-phone-number-input';
import { RootStackParamList } from '../../types/navigation';
import { BackgroundImageSection } from '../../components/BackgroundImageSection';
import { NavigationArrows } from '../../components/NavigationArrows';
import { authService } from '../../services/authService';
import { colors } from '../../constants/colors';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const phoneInputRef = useRef<PhoneInputComponent>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = async () => {
    const isValid = phoneInputRef.current?.isValidNumber(phoneNumber);
    
    if (!isValid) {
      setError('Please enter a valid phone number');
      Alert.alert('Invalid Phone', 'Please enter a valid phone number for the selected country');
      return;
    }

    const e164Phone = formattedPhone || phoneNumber;
    
    setIsSending(true);
    setError('');
    console.log('LoginScreen - Sending OTP to:', e164Phone);

    const result = await authService.sendPhoneOTP(e164Phone);

    setIsSending(false);

    if (result.success) {
      console.log('LoginScreen - OTP sent, navigating to verify screen');
      navigation.navigate('VerifyOTP', { phoneNumber: e164Phone });
    } else {
      console.log('LoginScreen - Error sending OTP:', result.error);
      setError(result.error || 'Failed to send code. Please try again.');
      Alert.alert('Error', result.error || 'Failed to send verification code');
    }
  };

  const isNextDisabled = !phoneNumber.trim() || isSending;

  return (
    <View style={styles.container}>
      <BackgroundImageSection
        source={require('../../assets/coach-background.png')}
      />

      <KeyboardAwareScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.subtitle}>
          Enter your phone number to log in
        </Text>

        <View style={styles.inputsWrapper}>
          <View style={styles.phoneInputContainer}>
            <PhoneInputComponent
              ref={phoneInputRef}
              defaultValue={phoneNumber}
              defaultCode={countryCode as any}
              layout="second"
              withDarkTheme
              withShadow={false}
              autoFocus={false}
              countryPickerProps={{
                countryCodes: ['US', 'CA', 'TR'],
              }}
              onChangeText={(text) => {
                setPhoneNumber(text);
                if (error) setError('');
              }}
              onChangeCountry={(country) => {
                setCountryCode(country.cca2);
              }}
              onChangeFormattedText={(text) => {
                setFormattedPhone(text);
              }}
              disabled={isSending}
              containerStyle={styles.phoneContainer}
              textContainerStyle={styles.textContainer}
              textInputStyle={styles.textInput}
              codeTextStyle={styles.codeText}
              flagButtonStyle={styles.flagButton}
              countryPickerButtonStyle={styles.countryPickerButton}
              renderDropdownImage={<Text style={styles.dropdownArrow}>▼</Text>}
              textInputProps={{
                placeholderTextColor: colors.gray.muted,
                selectionColor: colors.offWhite,
                placeholder: 'Phone Number',
              }}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {isSending && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.offWhite} />
              <Text style={styles.loadingText}>Sending code...</Text>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>

      <NavigationArrows
        onBackPress={handleBack}
        onNextPress={handleNext}
        nextDisabled={isNextDisabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBrown,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 49,
    paddingTop: 80,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Bebas Neue',
    fontSize: 32,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'center',
    lineHeight: 38.78,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputsWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  phoneInputContainer: {
    width: '100%',
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
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryPickerButton: {
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  dropdownArrow: {
    fontSize: 10,
    color: colors.offWhite,
    marginLeft: 5,
  },
  errorText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.offWhite,
    marginLeft: 10,
  },
});

