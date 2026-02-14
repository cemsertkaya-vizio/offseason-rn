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

export const getWeekRangeForOffset = (offset: number): string => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday + offset * 7);

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

export const getCurrentWeekDateRange = (): { monday: Date; sunday: Date } => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
};

export const getWeekDateRangeForOffset = (offset: number): { monday: Date; sunday: Date } => {
  const { monday } = getCurrentWeekDateRange();
  const weekMonday = new Date(monday);
  weekMonday.setDate(monday.getDate() + offset * 7);
  const weekSunday = new Date(weekMonday);
  weekSunday.setDate(weekMonday.getDate() + 6);
  weekSunday.setHours(23, 59, 59, 999);
  return { monday: weekMonday, sunday: weekSunday };
};

export const isDateOnOrAfterToday = (isoDateKey: string): boolean => {
  const parts = isoDateKey.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return false;
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date >= today;
};

export const isDateStringInWeek = (dateKey: string, weekOffset: number): boolean => {
  const parsed = new Date(dateKey + 'T12:00:00');
  if (isNaN(parsed.getTime())) {
    return false;
  }
  const { monday, sunday } = getWeekDateRangeForOffset(weekOffset);
  return parsed >= monday && parsed <= sunday;
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
