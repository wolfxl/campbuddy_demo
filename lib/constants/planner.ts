/**
 * Planner Configuration Constants
 * Centralizes all hardcoded values for easy maintenance
 */

// Child color mapping for UI consistency
export const CHILD_COLORS = [
  '#4CAF50', // Green
  '#2196F3', // Blue  
  '#FF5722', // Orange
  '#9C27B0', // Purple
  '#FFC107', // Amber
  '#795548'  // Brown
];

// Default fallback coordinates (Dallas area)
export const DEFAULT_COORDINATES = {
  lat: 32.7767,
  lng: -96.7970,
  city: 'Dallas Area'
};

// iCode McKinney coordinates (for fallback)
export const ICODE_MCKINNEY_COORDS = {
  lat: 33.1983,
  lng: -96.6389,
  city: 'McKinney'
};

// Summer weeks configuration
export const SUMMER_WEEKS = [
  { id: 0, label: 'June 3 - June 9', start: '2025-06-03', end: '2025-06-09' },
  { id: 1, label: 'June 10 - June 16', start: '2025-06-10', end: '2025-06-16' },
  { id: 2, label: 'June 17 - June 23', start: '2025-06-17', end: '2025-06-23' },
  { id: 3, label: 'June 24 - June 30', start: '2025-06-24', end: '2025-06-30' },
  { id: 4, label: 'July 1 - July 7', start: '2025-07-01', end: '2025-07-07' },
  { id: 5, label: 'July 8 - July 14', start: '2025-07-08', end: '2025-07-14' },
  { id: 6, label: 'July 15 - July 21', start: '2025-07-15', end: '2025-07-21' },
  { id: 7, label: 'July 22 - July 28', start: '2025-07-22', end: '2025-07-28' }
];

// API configuration
export const API_CONFIG = {
  GEOCODING_USER_AGENT: 'Camp-Planner-App/1.0',
  LOCATION_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_CAMP_SUGGESTIONS: 6,
  MAX_DETAILED_SCORING_LOGS: 10
};

// Grade levels for forms
export const GRADE_LEVELS = [
  'Pre-K', 'Kindergarten',
  '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
  '6th Grade', '7th Grade', '8th Grade',
  '9th Grade', '10th Grade', '11th Grade', '12th Grade'
];

// Interest strength options
export const INTEREST_STRENGTHS = [
  { value: 'love', label: 'Loves' },
  { value: 'like', label: 'Likes' },
  { value: 'try', label: 'Wants to Try' }
];

// Priority factors
export const PRIORITY_FACTORS = [
  { id: 'price' as const, label: 'Price' },
  { id: 'location' as const, label: 'Location' },
  { id: 'activities' as const, label: 'Activities/Content' },
  { id: 'schedule' as const, label: 'Schedule' }
];

// Time preferences
export const TIME_PREFERENCES = [
  { value: 'full-day' as const, label: 'Full Day (9AM-4PM)' },
  { value: 'morning' as const, label: 'Morning Only' },
  { value: 'afternoon' as const, label: 'Afternoon Only' },
  { value: 'extended' as const, label: 'Extended Day' }
];

// Transportation options
export const TRANSPORTATION_OPTIONS = [
  { value: 'parent' as const, label: 'Parent Drop-off/Pick-up' },
  { value: 'bus' as const, label: 'Bus Transportation' },
  { value: 'either' as const, label: 'Either Option' }
];
