import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import { authService } from '../services/authService';
import type { AuthContextType, User, Session } from '../types/auth';

const USER_ID_KEY = '@offseason_user_id';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext - Initializing auth state');
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('AuthContext - Step 1: Checking AsyncStorage for user ID...');
        const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
        console.log('AuthContext - Stored user ID:', storedUserId);
        
        if (storedUserId) {
          console.log('AuthContext - Step 2: User ID found, validating with Supabase...');
          const { data: { session: storedSession }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.log('AuthContext - Error getting session from Supabase:', error.message);
            console.log('AuthContext - Clearing invalid session from AsyncStorage');
            await AsyncStorage.removeItem(USER_ID_KEY);
            if (mounted) {
              setSession(null);
              setUser(null);
              setIsLoading(false);
            }
            return;
          }
          
          if (storedSession && storedSession.user) {
            console.log('AuthContext - Session valid! User:', storedSession.user.id);
            if (mounted) {
              setSession(storedSession);
              setUser(storedSession.user);
              setIsLoading(false);
            }
          } else {
            console.log('AuthContext - No valid session found, clearing AsyncStorage');
            await AsyncStorage.removeItem(USER_ID_KEY);
            if (mounted) {
              setSession(null);
              setUser(null);
              setIsLoading(false);
            }
          }
        } else {
          console.log('AuthContext - No stored user ID, user not logged in');
          if (mounted) {
            setSession(null);
            setUser(null);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.log('AuthContext - Exception during init:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('AuthContext - Auth state changed:', event);
        console.log('AuthContext - Session exists:', !!currentSession);
        console.log('AuthContext - User in session:', currentSession?.user?.id);
        
        if (!mounted) return;
        
        if (currentSession && currentSession.user) {
          console.log('AuthContext - Saving user ID to AsyncStorage');
          await AsyncStorage.setItem(USER_ID_KEY, currentSession.user.id);
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          console.log('AuthContext - No session, clearing AsyncStorage');
          await AsyncStorage.removeItem(USER_ID_KEY);
          setSession(null);
          setUser(null);
        }
      }
    );

    return () => {
      console.log('AuthContext - Cleaning up');
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async (): Promise<void> => {
    console.log('AuthContext - Signing out');
    await authService.signOut();
    await AsyncStorage.removeItem(USER_ID_KEY);
    setUser(null);
    setSession(null);
  };

  const refreshSession = async (): Promise<void> => {
    console.log('AuthContext - Refreshing session');
    const result = await authService.refreshSession();
    if (result.success && result.session) {
      setSession(result.session);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    }
  };

  const isAuthenticated = !!user && !!session;

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

