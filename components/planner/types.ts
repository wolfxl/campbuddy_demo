// Type definitions for planner results components

export interface ChildInPlan {
  id: number;
  name: string;
  grade: string;
  color: string;
}

export interface CampInPlan {
  id: number | string;
  childId: number;
  name: string;
  organization: string;
  location: string;
  times: string;
  price: string;
  locked: boolean;
  matchScore: number;
  matchReasons: string[];
}

export interface WeekInPlan {
  id: number;
  name: string;
  camps: CampInPlan[];
}

export interface PlanState {
  children: ChildInPlan[];
  weeks: WeekInPlan[];
  totalCost: number;
  scheduleId: string;
  optimizationFocus: string;
  matchSummary: {
    grade_match: number;
    price_match: number;
    location_match: number;
    category_match: number;
    required_activities_match: number;
    total_weeks_covered: number;
  };
}

export interface CampLocation {
  id: number | string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
  camps: {
    id: number | string;
    name: string;
    organization: string;
    childName?: string;
    weekLabel?: string;
  }[];
}