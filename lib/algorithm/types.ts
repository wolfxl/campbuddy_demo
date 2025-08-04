import { GroupedCamp, CampSession, LocationWithCamps } from '../types';

// Types for the scheduling algorithm
export interface CampMatch {
  camp: GroupedCamp;
  session: CampSession;
  score: number;
  matchReasons: string[];
  grade_match: boolean;
  price_match: boolean;
  location_match: boolean;
  date_match: boolean;
  category_match: boolean;
  required_activities_match: boolean;
}

export interface ScheduleOption {
  scheduleId: string;
  optimizationFocus: string;
  totalScore: number;
  totalCost: number;
  weekSchedule: WeekSchedule[];
  matchSummary: {
    grade_match: number;
    price_match: number;
    location_match: number;
    category_match: number;
    required_activities_match: number;
    total_weeks_covered: number;
  };
}

export interface WeekSchedule {
  weekId: number;
  weekLabel: string;
  startDate: string;
  endDate: string;
  children: ChildSchedule[];
}

export interface ChildSchedule {
  childId: number;
  childName: string;
  grade: string;
  campMatch: CampMatch | null;
}

export interface PlannerFormData {
  children: {
    id?: number;
    name: string;
    grade: string;
    interests: Array<string | { name: string; strength: string }>;
  }[];
  weeks: boolean[];
  timePreference: string;
  location: string;
  distance: number;
  budget: string;
  weeklyBudget: string;
  transportation: string;
  priorities: string[];
  requiredActivities: string[];
}

export interface CampFilterCriteria {
  gradeRange: { min: number; max: number }[];
  location: string;
  distance: number;
  maxWeeklyCost: number | null;
  totalBudget: number | null;
  timePreference: string;
  categories: Array<{ name: string; strength: string }>;
  requiredActivities: string[];
  priorityWeights: {
    price: number;
    location: number;
    activities: number;
    schedule: number;
  };
  transportation: string;
}
