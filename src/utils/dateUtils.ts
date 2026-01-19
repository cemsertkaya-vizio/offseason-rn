const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const getCurrentWeekRange = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  const monthName = MONTH_NAMES[monday.getMonth()];
  const startDay = monday.getDate();
  const endDay = sunday.getDate();
  
  if (monday.getMonth() === sunday.getMonth()) {
    return `${monthName} ${startDay} - ${endDay}`;
  }
  
  const endMonthName = MONTH_NAMES[sunday.getMonth()];
  return `${monthName} ${startDay} - ${endMonthName} ${endDay}`;
};

export const getMonthsUntilDate = (month: string, year: number): number => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  const targetMonthIndex = FULL_MONTH_NAMES.findIndex(
    (m) => m.toLowerCase() === month.toLowerCase()
  );
  
  if (targetMonthIndex === -1) {
    return 0;
  }
  
  const totalMonthsDiff = (year - currentYear) * 12 + (targetMonthIndex - currentMonth);
  
  return Math.max(0, totalMonthsDiff);
};
