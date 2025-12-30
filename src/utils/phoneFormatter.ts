export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 0) {
    return '';
  }
  
  if (cleaned.length <= 3) {
    return cleaned;
  }
  
  if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  }
  
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
};

export const formatPhoneNumberToE164 = (phone: string, countryCode: string = '1'): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (phone.startsWith('+')) {
    return phone.replace(/\s/g, '');
  }
  
  if (cleaned.startsWith(countryCode)) {
    return `+${cleaned}`;
  }
  
  return `+${countryCode}${cleaned}`;
};

export const validatePhoneNumber = (phone: string, minLength: number = 7, maxLength: number = 15): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= minLength && cleaned.length <= maxLength;
};

export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

export const getE164PhoneNumber = (phoneNumber: string, countryCallingCode: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (phoneNumber.startsWith('+')) {
    return phoneNumber.replace(/\s/g, '');
  }
  
  return `+${countryCallingCode}${cleaned}`;
};

