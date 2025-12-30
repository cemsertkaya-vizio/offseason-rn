import React, { createContext, useContext, useState } from 'react';
import type { RegistrationData } from '../types/auth';

interface RegistrationContextType {
  registrationData: Partial<RegistrationData>;
  updateRegistrationData: (data: Partial<RegistrationData>) => void;
  clearRegistrationData: () => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registrationData, setRegistrationData] = useState<Partial<RegistrationData>>({});

  const updateRegistrationData = (data: Partial<RegistrationData>) => {
    console.log('RegistrationContext - Updating registration data:', data);
    setRegistrationData((prev) => ({ ...prev, ...data }));
  };

  const clearRegistrationData = () => {
    console.log('RegistrationContext - Clearing registration data');
    setRegistrationData({});
  };

  const value: RegistrationContextType = {
    registrationData,
    updateRegistrationData,
    clearRegistrationData,
  };

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
};

export const useRegistration = (): RegistrationContextType => {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
};

