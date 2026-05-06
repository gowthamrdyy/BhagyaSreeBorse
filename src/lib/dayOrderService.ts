/**
 * Day Order Service - Manages day order mappings for attendance prediction
 * Uses static JSON file as source of truth with Calendar API fallback
 */

import { getDayOrder } from '@/data/dayOrderData';

interface CalendarMonth {
  month: string;
  days: Array<{
    date: string;
    dayOrder: string;
    event: string;
  }>;
}

/**
 * Get day order for a specific date from static mapping
 */
export function getDayOrderForDate(date: Date): number | null {
  return getDayOrder(date);
}

/**
 * Fallback: Get day order from Calendar API data
 */
export function getDayOrderFromCalendarData(date: Date, calendarData: CalendarMonth[]): number | null {
  const dateNum = date.getDate();
  const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
  const monthStr = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  
  const monthData = calendarData.find(month => month.month === monthStr);
  if (!monthData) return null;
  
  const dayData = monthData.days.find((day) => {
      const dayDate = parseInt(day.date);
      return dayDate === dateNum;
  });
  
  if (!dayData) return null;
  if (dayData.dayOrder === "-" || dayData.dayOrder === "") return null;
  
  const dayOrder = parseInt(dayData.dayOrder);
  return isNaN(dayOrder) ? null : dayOrder;
}

/**
 * Get day order with fallback mechanism
 * 1. Try static mapping first
 * 2. Fall back to Calendar API data if not found
 */
export async function getDayOrderWithFallback(
  date: Date, 
  calendarData?: CalendarMonth[]
): Promise<number | null> {
  // Try static mapping first
  const staticDayOrder = getDayOrderForDate(date);
  if (staticDayOrder !== null) {
    console.log(`📅 ${date.toISOString().split('T')[0]} -> Day Order ${staticDayOrder} (from static data)`);
    return staticDayOrder;
  }
  
  // Fallback to Calendar API
  if (calendarData && calendarData.length > 0) {
    const apiDayOrder = getDayOrderFromCalendarData(date, calendarData);
    if (apiDayOrder !== null) {
      console.log(`📅 ${date.toISOString().split('T')[0]} -> Day Order ${apiDayOrder} (from Calendar API)`);
      return apiDayOrder;
    }
  }
  
  console.log(`⚠️ No day order found for ${date.toISOString().split('T')[0]}`);
  return null;
}
