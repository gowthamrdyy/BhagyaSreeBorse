/**
 * Static Day Order Mapping
 * This file contains all day orders for the academic calendar
 * Generated from Calendar API data
 */

export interface DayOrderData {
  [date: string]: number | null; // YYYY-MM-DD -> Day Order (1-5) or null for holidays
}

// Static day order mappings - Update this when semester changes
export const dayOrderMapping: DayOrderData = {
  // October 2024
  "2024-10-01": 1,
  "2024-10-02": 2,
  "2024-10-03": 3,
  "2024-10-04": 4,
  "2024-10-05": null, // Weekend
  "2024-10-06": null, // Weekend
  "2024-10-07": 5,
  "2024-10-08": 1,
  "2024-10-09": 2,
  "2024-10-10": 3,
  "2024-10-11": 4,
  "2024-10-12": null, // Weekend
  "2024-10-13": null, // Weekend
  "2024-10-14": 5,
  "2024-10-15": 1,
  "2024-10-16": 3, // Correct day order
  "2024-10-17": 4,
  "2024-10-18": 5,
  "2024-10-19": null, // Weekend
  "2024-10-20": null, // Weekend
  "2024-10-21": 1,
  "2024-10-22": 2,
  "2024-10-23": 3,
  "2024-10-24": 4,
  "2024-10-25": 5,
  "2024-10-26": null, // Weekend
  "2024-10-27": null, // Weekend
  "2024-10-28": 1,
  "2024-10-29": 2,
  "2024-10-30": 3,
  "2024-10-31": 4,

  // November 2024
  "2024-11-01": 5,
  "2024-11-02": null, // Weekend
  "2024-11-03": null, // Weekend
  "2024-11-04": 1,
  "2024-11-05": 2,
  "2024-11-06": 3,
  "2024-11-07": 4,
  "2024-11-08": 5,
  "2024-11-09": null, // Weekend
  "2024-11-10": null, // Weekend
  "2024-11-11": 1,
  "2024-11-12": 2,
  "2024-11-13": 3,
  "2024-11-14": 4,
  "2024-11-15": 5,
  "2024-11-16": null, // Weekend
  "2024-11-17": null, // Weekend
  "2024-11-18": 1,
  "2024-11-19": 2,
  "2024-11-20": 3,
  "2024-11-21": 4,
  "2024-11-22": 5,
  "2024-11-23": null, // Weekend
  "2024-11-24": null, // Weekend
  "2024-11-25": 1,
  "2024-11-26": 2,
  "2024-11-27": 3,
  "2024-11-28": 4,
  "2024-11-29": 5,
  "2024-11-30": null, // Weekend

  // December 2024
  "2024-12-01": null, // Weekend
  "2024-12-02": 1,
  "2024-12-03": 2,
  "2024-12-04": 3,
  "2024-12-05": 4,
  "2024-12-06": 5,
  "2024-12-07": null, // Weekend
  "2024-12-08": null, // Weekend
  "2024-12-09": 1,
  "2024-12-10": 2,
  "2024-12-11": 3,
  "2024-12-12": 4,
  "2024-12-13": 5,
  "2024-12-14": null, // Weekend
  "2024-12-15": null, // Weekend
  "2024-12-16": 1,
  "2024-12-17": 2,
  "2024-12-18": 3,
  "2024-12-19": 4,
  "2024-12-20": 5,
  "2024-12-21": null, // Weekend
  "2024-12-22": null, // Weekend
  "2024-12-23": null, // Holiday
  "2024-12-24": null, // Holiday
  "2024-12-25": null, // Holiday
  "2024-12-26": null, // Holiday
  "2024-12-27": null, // Holiday
  "2024-12-28": null, // Weekend
  "2024-12-29": null, // Weekend
  "2024-12-30": null, // Holiday
  "2024-12-31": null, // Holiday

  // January 2025
  "2025-01-01": null, // Holiday
  "2025-01-02": null, // Holiday
  "2025-01-03": null, // Holiday
  "2025-01-04": null, // Weekend
  "2025-01-05": null, // Weekend
  "2025-01-06": 1,
  "2025-01-07": 2,
  "2025-01-08": 3,
  "2025-01-09": 4,
  "2025-01-10": 5,
  "2025-01-11": null, // Weekend
  "2025-01-12": null, // Weekend
  "2025-01-13": 1,
  "2025-01-14": 2,
  "2025-01-15": 3,
  "2025-01-16": 4,
  "2025-01-17": 5,
  "2025-01-18": null, // Weekend
  "2025-01-19": null, // Weekend
  "2025-01-20": 1,
  "2025-01-21": 2,
  "2025-01-22": 3,
  "2025-01-23": 4,
  "2025-01-24": 5,
  "2025-01-25": null, // Weekend
  "2025-01-26": null, // Holiday
  "2025-01-27": 1,
  "2025-01-28": 2,
  "2025-01-29": 3,
  "2025-01-30": 4,
  "2025-01-31": 5,

  // Add more months as needed...
  // You can populate this from the Calendar API by running the setup script
};

/**
 * Get day order for a specific date from the static mapping
 */
export function getDayOrder(date: Date): number | null {
  const dateStr = date.toISOString().split('T')[0];
  const dayOrder = dayOrderMapping[dateStr];
  
  if (dayOrder === undefined) {
    console.warn(`⚠️ No day order found for ${dateStr} - add it to dayOrderData.ts`);
    return null;
  }
  
  return dayOrder;
}

/**
 * Import day orders from Calendar API and generate the mapping
 * This can be run once to populate the mapping from real API data
 */
export function generateDayOrderMapping(calendarData: Array<{ month: string; days: Array<{ date: string; dayOrder: string; event: string }> }>): string {
  let output = 'export const dayOrderMapping: DayOrderData = {\n';
  
  for (const monthData of calendarData) {
    const monthStr = monthData.month;
    output += `  // ${monthStr}\n`;
    
    for (const day of monthData.days) {
      const date = new Date(monthStr);
      const dayNum = parseInt(day.date);
      date.setDate(dayNum);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayOrderStr = day.dayOrder;
      
      if (dayOrderStr === '-' || dayOrderStr === '') {
        const comment = day.event ? ` // ${day.event}` : ' // Holiday/Weekend';
        output += `  "${dateStr}": null,${comment}\n`;
      } else {
        const dayOrder = parseInt(dayOrderStr);
        output += `  "${dateStr}": ${dayOrder},\n`;
      }
    }
    output += '\n';
  }
  
  output += '};\n';
  return output;
}
