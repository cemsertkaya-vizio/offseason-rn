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

export const formatPhoneForDisplay = (e164Phone: string): string => {
  if (!e164Phone.startsWith('+')) {
    return e164Phone;
  }

  const phoneWithoutPlus = e164Phone.slice(1);
  
  const countryCodeLengths: Record<string, number> = {
    '1': 1,
    '7': 1,
    '20': 2,
    '27': 2,
    '30': 2,
    '31': 2,
    '32': 2,
    '33': 2,
    '34': 2,
    '36': 2,
    '39': 2,
    '40': 2,
    '41': 2,
    '43': 2,
    '44': 2,
    '45': 2,
    '46': 2,
    '47': 2,
    '48': 2,
    '49': 2,
    '51': 2,
    '52': 2,
    '53': 2,
    '54': 2,
    '55': 2,
    '56': 2,
    '57': 2,
    '58': 2,
    '60': 2,
    '61': 2,
    '62': 2,
    '63': 2,
    '64': 2,
    '65': 2,
    '66': 2,
    '81': 2,
    '82': 2,
    '84': 2,
    '86': 2,
    '90': 2,
    '91': 2,
    '92': 2,
    '93': 2,
    '94': 2,
    '95': 2,
    '98': 2,
    '212': 3,
    '213': 3,
    '216': 3,
    '218': 3,
    '220': 3,
    '221': 3,
    '222': 3,
    '223': 3,
    '224': 3,
    '225': 3,
    '226': 3,
    '227': 3,
    '228': 3,
    '229': 3,
    '230': 3,
    '231': 3,
    '232': 3,
    '233': 3,
    '234': 3,
    '235': 3,
    '236': 3,
    '237': 3,
    '238': 3,
    '239': 3,
    '240': 3,
    '241': 3,
    '242': 3,
    '243': 3,
    '244': 3,
    '245': 3,
    '246': 3,
    '247': 3,
    '248': 3,
    '249': 3,
    '250': 3,
    '251': 3,
    '252': 3,
    '253': 3,
    '254': 3,
    '255': 3,
    '256': 3,
    '257': 3,
    '258': 3,
    '260': 3,
    '261': 3,
    '262': 3,
    '263': 3,
    '264': 3,
    '265': 3,
    '266': 3,
    '267': 3,
    '268': 3,
    '269': 3,
    '290': 3,
    '291': 3,
    '297': 3,
    '298': 3,
    '299': 3,
    '350': 3,
    '351': 3,
    '352': 3,
    '353': 3,
    '354': 3,
    '355': 3,
    '356': 3,
    '357': 3,
    '358': 3,
    '359': 3,
    '370': 3,
    '371': 3,
    '372': 3,
    '373': 3,
    '374': 3,
    '375': 3,
    '376': 3,
    '377': 3,
    '378': 3,
    '380': 3,
    '381': 3,
    '382': 3,
    '383': 3,
    '385': 3,
    '386': 3,
    '387': 3,
    '389': 3,
    '420': 3,
    '421': 3,
    '423': 3,
    '500': 3,
    '501': 3,
    '502': 3,
    '503': 3,
    '504': 3,
    '505': 3,
    '506': 3,
    '507': 3,
    '508': 3,
    '509': 3,
    '590': 3,
    '591': 3,
    '592': 3,
    '593': 3,
    '594': 3,
    '595': 3,
    '596': 3,
    '597': 3,
    '598': 3,
    '599': 3,
    '670': 3,
    '672': 3,
    '673': 3,
    '674': 3,
    '675': 3,
    '676': 3,
    '677': 3,
    '678': 3,
    '679': 3,
    '680': 3,
    '681': 3,
    '682': 3,
    '683': 3,
    '685': 3,
    '686': 3,
    '687': 3,
    '688': 3,
    '689': 3,
    '690': 3,
    '691': 3,
    '692': 3,
    '850': 3,
    '852': 3,
    '853': 3,
    '855': 3,
    '856': 3,
    '880': 3,
    '886': 3,
    '960': 3,
    '961': 3,
    '962': 3,
    '963': 3,
    '964': 3,
    '965': 3,
    '966': 3,
    '967': 3,
    '968': 3,
    '970': 3,
    '971': 3,
    '972': 3,
    '973': 3,
    '974': 3,
    '975': 3,
    '976': 3,
    '977': 3,
    '992': 3,
    '993': 3,
    '994': 3,
    '995': 3,
    '996': 3,
    '998': 3,
  };

  let countryCodeLength = 1;
  for (let len = 3; len >= 1; len--) {
    const potentialCode = phoneWithoutPlus.slice(0, len);
    if (countryCodeLengths[potentialCode] === len) {
      countryCodeLength = len;
      break;
    }
  }

  const countryCode = phoneWithoutPlus.slice(0, countryCodeLength);
  const nationalNumber = phoneWithoutPlus.slice(countryCodeLength);

  if (nationalNumber.length >= 10) {
    const areaCode = nationalNumber.slice(0, 3);
    const rest = nationalNumber.slice(3);
    return `+${countryCode}(${areaCode})${rest}`;
  }

  if (nationalNumber.length >= 7) {
    const areaCode = nationalNumber.slice(0, 3);
    const rest = nationalNumber.slice(3);
    return `+${countryCode}(${areaCode})${rest}`;
  }

  return e164Phone;
};

