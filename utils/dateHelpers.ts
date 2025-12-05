export const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const diffInDays = (d1: Date, d2: Date): number => {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor((utc2 - utc1) / MS_PER_DAY);
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatDatePTBR = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};

export const formatDaysToYearsAndDays = (totalDays: number) => {
  const years = Math.floor(totalDays / 365);
  const remainingDays = totalDays % 365;
  return { years, days: remainingDays, totalDays };
};

// Check if date is strictly before reference
export const isBefore = (date: Date, reference: Date): boolean => {
  return date.getTime() < reference.getTime();
};

// Check if date is strictly after reference
export const isAfter = (date: Date, reference: Date): boolean => {
  return date.getTime() > reference.getTime();
};

// Check if date is equal or after
export const isSameOrAfter = (date: Date, reference: Date): boolean => {
  return date.getTime() >= reference.getTime();
};

// Check if date is equal or before
export const isSameOrBefore = (date: Date, reference: Date): boolean => {
  return date.getTime() <= reference.getTime();
};