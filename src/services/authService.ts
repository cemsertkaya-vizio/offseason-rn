import { supabase } from '../config/supabase';
import { formatPhoneNumberToE164 } from '../utils/phoneFormatter';
import type { User, Session } from '../types/auth';

export const authService = {
  sendPhoneOTP: async (phoneNumber: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('authService - Sending OTP to phone:', phoneNumber);
      const e164Phone = phoneNumber.startsWith('+') ? phoneNumber : formatPhoneNumberToE164(phoneNumber);
      console.log('authService - Formatted phone (E.164):', e164Phone);

      const { error } = await supabase.auth.signInWithOtp({
        phone: e164Phone,
      });

      if (error) {
        console.log('authService - Error sending OTP:', error.message);
        return { success: false, error: error.message };
      }

      console.log('authService - OTP sent successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('authService - Exception sending OTP:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  verifyPhoneOTP: async (
    phoneNumber: string,
    otp: string
  ): Promise<{ success: boolean; user?: User; session?: Session; error?: string }> => {
    try {
      console.log('authService - Verifying OTP for phone:', phoneNumber);
      const e164Phone = phoneNumber.startsWith('+') ? phoneNumber : formatPhoneNumberToE164(phoneNumber);

      const { data, error } = await supabase.auth.verifyOtp({
        phone: e164Phone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        console.log('authService - Error verifying OTP:', error.message);
        return { success: false, error: error.message };
      }

      if (!data.user || !data.session) {
        console.log('authService - No user or session returned');
        return { success: false, error: 'Authentication failed' };
      }

      console.log('authService - OTP verified successfully, user ID:', data.user.id);
      return { success: true, user: data.user, session: data.session };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('authService - Exception verifying OTP:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  signOut: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('authService - Signing out user');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.log('authService - Error signing out:', error.message);
        return { success: false, error: error.message };
      }

      console.log('authService - Signed out successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('authService - Exception signing out:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.log('authService - Error getting current user:', error);
      return null;
    }
  },

  getSession: async (): Promise<Session | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.log('authService - Error getting session:', error);
      return null;
    }
  },

  refreshSession: async (): Promise<{ success: boolean; session?: Session; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, session: data.session || undefined };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  },
};

