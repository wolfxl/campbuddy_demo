import { PlanState, CostTotals, MATCH_SCORE_THRESHOLDS, MATCH_SCORE_COLORS } from '@/lib/types/planner';

/**
 * Utility functions for planner calculations and formatting
 */

/**
 * Calculate total costs for the plan
 */
export function calculatePlanTotals(plan: PlanState | null): CostTotals {
  if (!plan) return { totalCost: 0, childCosts: {} };
  
  let totalCost = 0;
  const childCosts: Record<string | number, number> = {};
  
  // Initialize child costs
  plan.children.forEach(child => {
    childCosts[child.id] = 0;
  });
  
  // Calculate costs from camps
  plan.weeks.forEach(week => {
    week.camps.forEach(camp => {
      const priceString = String(camp.price);
      const price = parseFloat(priceString.replace(/[^0-9.]/g, ''));
      
      if (!isNaN(price)) {
        totalCost += price;
        if (childCosts[camp.childId] !== undefined) {
          childCosts[camp.childId] += price;
        }
      }
    });
  });
  
  return { totalCost, childCosts };
}

/**
 * Get match score category and color
 */
export function getMatchScoreInfo(score: number): { category: string; color: string } {
  if (score > MATCH_SCORE_THRESHOLDS.excellent) {
    return { category: 'Excellent match', color: MATCH_SCORE_COLORS.excellent };
  } else if (score > MATCH_SCORE_THRESHOLDS.good) {
    return { category: 'Good match', color: MATCH_SCORE_COLORS.good };
  } else if (score > MATCH_SCORE_THRESHOLDS.fair) {
    return { category: 'Fair match', color: MATCH_SCORE_COLORS.fair };
  } else {
    return { category: 'Basic match', color: MATCH_SCORE_COLORS.basic };
  }
}

/**
 * Get match score progress percentage (capped at 100%)
 */
export function getMatchScoreProgress(score: number): number {
  return Math.min(100, score / 2);
}

/**
 * Extract grade information from grade range string
 */
export function extractMinGrade(gradeRange: string): number {
  if (!gradeRange) return 0;
  const match = gradeRange.match(/^(\d+|Pre-K|K)/);
  if (!match) return 0;
  const grade = match[1];
  if (grade === 'Pre-K') return -1;
  if (grade === 'K') return 0;
  return parseInt(grade) || 0;
}

/**
 * Extract maximum grade from grade range string
 */
export function extractMaxGrade(gradeRange: string): number {
  if (!gradeRange) return 12;
  const match = gradeRange.match(/(\d+|K)\s*$/);
  if (!match) return 12;
  const grade = match[1];
  if (grade === 'K') return 0;
  return parseInt(grade) || 12;
}

/**
 * Format price for display
 */
export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;
  if (isNaN(numPrice)) return '$0';
  return `$${numPrice.toLocaleString()}`;
}

/**
 * Format price for display with proper currency formatting
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Debounce function for search inputs and API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

/**
 * Generate unique ID for components
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safe array access with fallback
 */
export function safeArrayAccess<T>(array: T[] | undefined, index: number, fallback: T): T {
  return array && array[index] !== undefined ? array[index] : fallback;
}

/**
 * Check if a value is not null/undefined
 */
export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Group array items by a key function
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}
