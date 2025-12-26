import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Button, TextInput, SocialButton } from '../../components';
import { colors } from '../../constants/colors';

export const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleGoogleSignIn = () => {
    console.log('RegisterScreen - Google sign in pressed');
  };

  const handleEmailContinue = () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    setEmailError('');
    console.log('RegisterScreen - Continue with email:', email);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.card}>
              <Text style={styles.title}>
                Want to check out this file? Sign up or Log in
              </Text>

              <SocialButton
                title="Continue with Google"
                onPress={handleGoogleSignIn}
                icon={
                  <View style={styles.googleIcon}>
                    <Text style={styles.googleIconText}>G</Text>
                  </View>
                }
                style={styles.googleButton}
              />

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              <TextInput
                label="EMAIL"
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError('');
                }}
                error={emailError}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Button
                title="Continue with email"
                onPress={handleEmailContinue}
                variant="primary"
                style={styles.continueButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 600,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 36,
  },
  googleButton: {
    marginBottom: 24,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4285F4',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray.medium,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  continueButton: {
    marginTop: 24,
  },
});

