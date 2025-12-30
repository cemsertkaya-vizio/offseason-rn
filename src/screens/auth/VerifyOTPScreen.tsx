import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { BackgroundImageSection } from '../../components/BackgroundImageSection';
import { NavigationArrows } from '../../components/NavigationArrows';
import { authService } from '../../services/authService';
import { profileService } from '../../services/profileService';
import { useRegistration } from '../../contexts/RegistrationContext';
import { colors } from '../../constants/colors';

type VerifyOTPScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'VerifyOTP'
>;

type VerifyOTPScreenRouteProp = RouteProp<RootStackParamList, 'VerifyOTP'>;

interface VerifyOTPScreenProps {
  navigation: VerifyOTPScreenNavigationProp;
  route: VerifyOTPScreenRouteProp;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export const VerifyOTPScreen: React.FC<VerifyOTPScreenProps> = ({
  navigation,
  route,
}) => {
  const { phoneNumber } = route.params;
  const { registrationData, clearRegistrationData } = useRegistration();
  
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (otp.length === OTP_LENGTH) {
      handleVerify();
    }
  }, [otp]);

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');
    console.log('VerifyOTPScreen - Verifying OTP');

    const result = await authService.verifyPhoneOTP(phoneNumber, otp);

    if (result.success && result.user) {
      console.log('VerifyOTPScreen - OTP verified successfully, user ID:', result.user.id);
      
      if (registrationData.firstName && registrationData.lastName && registrationData.phoneNumber) {
        console.log('VerifyOTPScreen - Creating initial profile');
        const profileResult = await profileService.createInitialProfile(
          result.user.id,
          {
            firstName: registrationData.firstName,
            lastName: registrationData.lastName,
            phoneNumber: registrationData.phoneNumber,
          }
        );

        if (profileResult.success) {
          console.log('VerifyOTPScreen - Initial profile created, continuing to physical info');
          navigation.navigate('RegisterPhysicalInfo');
        } else {
          console.log('VerifyOTPScreen - Error creating initial profile:', profileResult.error);
          Alert.alert(
            'Profile Error',
            'Could not create your profile. Please try again.',
            [{ text: 'OK' }]
          );
          setIsVerifying(false);
        }
      } else {
        console.log('VerifyOTPScreen - Missing registration data, continuing anyway');
        navigation.navigate('RegisterPhysicalInfo');
      }
    } else {
      console.log('VerifyOTPScreen - Error verifying OTP:', result.error);
      setError(result.error || 'Invalid code. Please try again.');
      setOtp('');
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) {
      return;
    }

    setIsResending(true);
    setError('');
    console.log('VerifyOTPScreen - Resending OTP');

    const result = await authService.sendPhoneOTP(phoneNumber);

    setIsResending(false);

    if (result.success) {
      setResendCooldown(RESEND_COOLDOWN);
      Alert.alert('Code Sent', 'A new verification code has been sent to your phone.');
    } else {
      setError(result.error || 'Failed to resend code. Please try again.');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleOtpChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= OTP_LENGTH) {
      setOtp(cleaned);
      setError('');
    }
  };

  const maskedPhone = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');

  return (
    <View style={styles.container}>
      <BackgroundImageSection
        source={require('../../assets/coach-background.png')}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          {maskedPhone}
        </Text>

        <View style={styles.otpContainer}>
          <TextInput
            ref={inputRef}
            style={styles.otpInput}
            value={otp}
            onChangeText={handleOtpChange}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            autoFocus
            placeholder="000000"
            placeholderTextColor={colors.gray.muted}
            editable={!isVerifying}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {isVerifying && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.offWhite} />
            <Text style={styles.loadingText}>Verifying...</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendCode}
          disabled={resendCooldown > 0 || isResending}
          activeOpacity={0.7}
        >
          {isResending ? (
            <ActivityIndicator size="small" color={colors.offWhite} />
          ) : (
            <Text style={[
              styles.resendText,
              resendCooldown > 0 && styles.resendTextDisabled
            ]}>
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : 'Resend code'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <NavigationArrows
        onBackPress={handleBack}
        onNextPress={handleVerify}
        nextDisabled={otp.length !== OTP_LENGTH || isVerifying}
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
    marginBottom: 20,
  },
  subtitle: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  otpContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  otpInput: {
    width: '100%',
    maxWidth: 280,
    height: 60,
    borderWidth: 2,
    borderColor: colors.offWhite,
    borderRadius: 12,
    fontSize: 32,
    fontWeight: '600',
    color: colors.offWhite,
    textAlign: 'center',
    letterSpacing: 8,
    fontFamily: 'Roboto',
  },
  errorText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: colors.offWhite,
    marginTop: 10,
  },
  resendButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  resendText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '500',
    color: colors.offWhite,
    textAlign: 'center',
  },
  resendTextDisabled: {
    color: colors.gray.muted,
  },
});

