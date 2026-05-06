// Common utility functions

/**
 * Safely formats a number to specified decimal places
 */
export const safeNumber = (value: number, decimals: number = 1): number => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return 0;
  }
  return Number(value.toFixed(decimals));
};

/**
 * Formats a date to a readable string
 */
export const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Formats time to a readable string
 */
export const formatTime = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
};

/**
 * Calculates time difference between two dates
 */
export const getTimeDifference = (targetDate: string | Date, currentDate: Date = new Date()) => {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const diff = target.getTime() - currentDate.getTime();
  
  if (diff < 0) return null; // Past date
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes, totalMs: diff };
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Generate a unique key for components
 */
export const generateKey = (prefix: string = 'key'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value: unknown): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length === 0;
  return false;
};

/**
 * Clamp a number between min and max values
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Get attendance status color based on percentage
 * @param percentage - The attendance percentage (0-100)
 * @returns Tailwind CSS color class string
 */
export const getAttendanceStatusColor = (percentage: number): string => {
  if (percentage >= 85) return 'text-green-400';
  if (percentage >= 75) return 'text-yellow-400';
  return 'text-muted-foreground';
};

/**
 * Get attendance status text based on percentage
 * @param percentage - The attendance percentage (0-100)
 * @returns Human-readable status string
 */
export const getAttendanceStatusText = (percentage: number): string => {
  if (percentage >= 85) return 'Excellent';
  if (percentage >= 75) return 'Good';
  if (percentage >= 65) return 'Warning';
  return 'Critical';
};

/**
 * Calculate grade based on percentage
 * @param percentage - The marks percentage (0-100)
 * @returns Grade string (A+, A, B+, etc.)
 */
export const calculateGrade = (percentage: number): string => {
  if (percentage >= 95) return 'A+';
  if (percentage >= 90) return 'A';
  if (percentage >= 85) return 'B+';
  if (percentage >= 80) return 'B';
  if (percentage >= 75) return 'C+';
  if (percentage >= 70) return 'C';
  if (percentage >= 65) return 'D+';
  if (percentage >= 60) return 'D';
  return 'F';
};
