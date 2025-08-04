/**
 * Shared types for the Planner Results components
 */

// Child in plan state
export interface ChildInPlan {
  id: number;
  name: string;
  grade: string;
  color: string;
}

// Camp in plan state
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

// Week in plan state
export interface WeekInPlan {
  id: number;
  name: string;
  camps: CampInPlan[];
}

// Complete plan state
export interface PlanState {
  children: ChildInPlan[];
  weeks: WeekInPlan[];
  totalCost: number;
  scheduleId: string;
  optimizationFocus: string;
  matchSummary: any; // TODO: Define specific type for matchSummary
}

// Cost calculation results
export interface CostTotals {
  totalCost: number;
  childCosts: Record<string | number, number>;
}

// Match score display configuration
export interface MatchScoreConfig {
  excellent: number; // > 150
  good: number;      // > 100  
  fair: number;      // > 50
  basic: number;     // <= 50
}

export const MATCH_SCORE_THRESHOLDS: MatchScoreConfig = {
  excellent: 150,
  good: 100,
  fair: 50,
  basic: 0
};

// Match score colors
export const MATCH_SCORE_COLORS = {
  excellent: '#4CAF50', // Green
  good: '#8BC34A',      // Light green
  fair: '#FFC107',      // Amber
  basic: '#FF5722'      // Orange
};
