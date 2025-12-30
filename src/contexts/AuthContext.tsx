import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { authService } from '../services/authService';
import type { AuthContextType, User, Session } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext - Initializing auth state');
    
    authService.getSession().then((currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        authService.getCurrentUser().then((currentUser) => {
          setUser(currentUser);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('AuthContext - Auth state changed:', event);
        setSession(currentSession);
        
        if (currentSession) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async (): Promise<void> => {
    console.log('AuthContext - Signing out');
    await authService.signOut();
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

