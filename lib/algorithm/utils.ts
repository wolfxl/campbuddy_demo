/**
 * Utility functions for the scheduling algorithm
 */

// Map grade string to a grade level number
export function gradeToNumber(grade: string): number {
  if (!grade) return -1;
  
  const gradeMap: { [key: string]: number } = {
    'Pre-K': -1,
    'Kindergarten': 0,
    '1st Grade': 1,
    '2nd Grade': 2,
    '3rd Grade': 3,
    '4th Grade': 4,
    '5th Grade': 5,
    '6th Grade': 6,
    '7th Grade': 7,
    '8th Grade': 8,
    '9th Grade': 9,
    '10th Grade': 10,
    '11th Grade': 11,
    '12th Grade': 12
  };
  
  return gradeMap[grade] ?? -1;
}

// Parse dollar amount string to number
export function parseDollarAmount(amount: string): number | null {
  if (!amount) return null;
  
  // Remove any non-numeric characters except decimal point
  const numericString = amount.replace(/[^0-9.]/g, '');
  const parsedValue = parseFloat(numericString);
  
  return isNaN(parsedValue) ? null : parsedValue;
}

// Calculate the haversine distance between two coordinates (in miles)
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Check if a date range overlaps with another date range
export function datesOverlap(
  start1: string, 
  end1: string, 
  start2: string, 
  end2: string
): boolean {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);
  
  return s1 <= e2 && s2 <= e1;
}

// Generate a unique ID for schedules
export function generateScheduleId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Format a date as YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Parse interests array to get categories with strengths
export function parseInterests(
  interests: Array<string | { name: string; strength: string }>
): Array<{ name: string; strength: string }> {
  return interests.map(interest => {
    if (typeof interest === 'string') {
      return { name: interest, strength: 'like' };
    }
    return interest;
  });
}