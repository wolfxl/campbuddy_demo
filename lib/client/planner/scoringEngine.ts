import { GroupedCamp } from '../../types';
import { CampFilterCriteria } from '../../algorithm/types';
import { parseInterests } from '../../algorithm/utils';
import { 
  checkGradeMatch, 
  checkPriceMatch, 
  checkRequiredActivitiesMatch
} from './matchingUtils';
import { API_CONFIG } from '@/lib/constants/planner';

// Global counter for detailed scoring logs
let detailedScoringLogCount = 0;

/**
 * Score a camp for a specific child with diversity bonus
 */
export function scoreCampForChildWithDiversity(
  camp: GroupedCamp, 
  child: any, 
  optimizationFocus: string, 
  usedCamps: Set<number>,
  filterCriteria: CampFilterCriteria
): number {
  let score = 0;
  const baseScore = 100; 
  let logDetails = false;
  
  if (detailedScoringLogCount < API_CONFIG.MAX_DETAILED_SCORING_LOGS) {
      logDetails = true;
      detailedScoringLogCount++; // Increment here
  }

  const weeklyBudget = filterCriteria.maxWeeklyCost ?? 0;
  const currentPriorityWeights = 
      filterCriteria.priorityWeights || { price: 1, location: 1, activities: 1, schedule: 1 };

  if (logDetails) {
      console.log(`[PlannerLogs]       [Scoring Detail Start - Camp ID: ${camp.id} (${camp.name}) for Child ${child.name}] Budget: ${weeklyBudget}, Priorities: ${JSON.stringify(currentPriorityWeights)}`);
  }

  // Grade Match (Essential)
  if (!checkGradeMatch(camp, child)) {
    if (logDetails) console.log(`[PlannerLogs]         - Grade mismatch. Camp: ${camp.grade_range}, Child: ${child.grade}. Score: 0`);
    return 0; 
  }
  score += baseScore; 
  if (logDetails) console.log(`[PlannerLogs]         + Grade match! Initial score: ${score}`);

  // Price
  const campPrice = camp.price_numeric;
  if (weeklyBudget > 0 && campPrice > weeklyBudget) {
    score -= 50 * (currentPriorityWeights.price || 1); 
    if (logDetails) console.log(`[PlannerLogs]         - Price over budget (${campPrice} > ${weeklyBudget}). Penalty factor: ${(currentPriorityWeights.price || 1)}. Score after price penalty: ${score.toFixed(2)}`);
  } else if (weeklyBudget === 0 || campPrice <= weeklyBudget * 0.75) { 
    score += 20 * (currentPriorityWeights.price || 1);
    if (logDetails) console.log(`[PlannerLogs]         + Price ok (budget ${weeklyBudget === 0 ? 'not set' : 'well within budget'}). Bonus factor: ${(currentPriorityWeights.price || 1)}. Score after price bonus: ${score.toFixed(2)}`);
  }

  // Activity/Category Match with Interest Strength
  const childInterests = parseInterests(child.interests);
  const campCategories = camp.categories.map(c => c.toLowerCase());
  let categoryMatchCount = 0;
  let totalInterestScore = 0;
  
  if (logDetails) {
    console.log(`[PlannerLogs]         Interests for Child ${child.name}: ${JSON.stringify(childInterests.map(i => i.name))}`);
    console.log(`[PlannerLogs]         Categories for Camp ${camp.id} (${camp.name}): ${JSON.stringify(campCategories)}`);
  }
  
  childInterests.forEach(interest => {
    const interestName = interest.name.toLowerCase();
    if (campCategories.includes(interestName)) {
      categoryMatchCount++;
      
      // Apply multiplier based on interest strength
      const strengthMultiplier = 
        interest.strength === 'love' ? 1.5 : 
        interest.strength === 'like' ? 1.2 : 1.0;
      
      totalInterestScore += strengthMultiplier;
      
      if (logDetails) {
        console.log(`[PlannerLogs]         + Match for interest "${interest.name}" with strength "${interest.strength}" (multiplier: ${strengthMultiplier.toFixed(1)})`);
      }
    }
  });
  
  if (categoryMatchCount > 0) {
    const interestBonus = totalInterestScore * 15 * (currentPriorityWeights.activities || 1);
    score += interestBonus;
    if (logDetails) {
      console.log(`[PlannerLogs]         + ${categoryMatchCount} category matches with weighted strength score ${totalInterestScore.toFixed(2)}. Factor: ${(currentPriorityWeights.activities || 1)}. Added ${interestBonus.toFixed(2)} points. Score after categories: ${score.toFixed(2)}`);
    }
  }

  // Required Activities (Essential if specified)
  const requiredActivities = filterCriteria.requiredActivities || [];
  if (requiredActivities.length > 0) {
    const meetsAllRequired = requiredActivities.every(reqActivity => 
      campCategories.includes(reqActivity.toLowerCase())
    );
    if (!meetsAllRequired) {
      if (logDetails) console.log(`[PlannerLogs]         - Did not meet all required activities. Required: ${requiredActivities.join(', ')}. Score: 0`);
      return 0; 
    }
    score += 50; 
    if (logDetails) console.log(`[PlannerLogs]         + Met all required activities! Score after required: ${score.toFixed(2)}`);
  }

  // Diversity Bonus (if not already used and multiple children exist)
  if (!usedCamps.has(camp.id)) {
    score += 25; 
    if (logDetails) console.log(`[PlannerLogs]         + Diversity bonus (camp not used yet). Score after diversity: ${score.toFixed(2)}`);
  }

  // Optimization Focus Adjustments
  if (optimizationFocus === 'Budget-Friendly' && weeklyBudget > 0 && campPrice < (weeklyBudget * 0.8)) {
    score *= 1.2; 
    if (logDetails) console.log(`[PlannerLogs]         * Budget-Friendly focus: cheaper camp boosted. Final Score: ${score.toFixed(2)}`);
  } else if (optimizationFocus === 'Activity-Optimized' && categoryMatchCount > 0) {
    score *= (1 + (0.1 * categoryMatchCount)); 
    if (logDetails) console.log(`[PlannerLogs]         * Activity-Optimized focus: category match boosted. Final Score: ${score.toFixed(2)}`);
  } else if (optimizationFocus === 'Location-Optimized') {
      score *= 1.15;
      if (logDetails) console.log(`[PlannerLogs]         * Location-Optimized focus: location boosted. Final Score: ${score.toFixed(2)}`);
  }

  if (logDetails) {
      console.log(`[PlannerLogs]       [Scoring Detail End - Camp ID: ${camp.id} (${camp.name}) for Child ${child.name}] Final Score: ${score.toFixed(2)}`);
  }
  
  return Math.max(0, score); 
}

/**
 * Generate match reasons for display with diversity info
 */
export function generateMatchReasons(camp: GroupedCamp, child: any, optimizationFocus: string, usedCamps?: Set<number>): string[] {
  const reasons: string[] = [];
  
  if (checkGradeMatch(camp, child)) {
    reasons.push(`Perfect grade match (${camp.grade_range})`);
  }
  
  const interests = parseInterests(child.interests);
  
  // Separate category matches by strength
  const lovedMatches: string[] = [];
  const likedMatches: string[] = [];
  const wantToTryMatches: string[] = [];
  
  camp.categories.forEach(category => {
    const matchingInterest = interests.find(interest => 
      interest.name.toLowerCase() === category.toLowerCase()
    );
    
    if (matchingInterest) {
      if (matchingInterest.strength === 'love') {
        lovedMatches.push(category);
      } else if (matchingInterest.strength === 'like') {
        likedMatches.push(category);
      } else {
        wantToTryMatches.push(category);
      }
    }
  });
  
  // Create descriptive match reasons based on strength
  if (lovedMatches.length > 0) {
    reasons.push(`Matches ${lovedMatches.length} LOVED interests: ${lovedMatches.join(', ')}`);
  }
  
  if (likedMatches.length > 0) {
    reasons.push(`Matches ${likedMatches.length} liked interests: ${likedMatches.join(', ')}`);
  }
  
  if (wantToTryMatches.length > 0) {
    reasons.push(`Opportunity to try ${wantToTryMatches.length} new interests: ${wantToTryMatches.join(', ')}`);
  }
  
  if (usedCamps && !usedCamps.has(camp.id)) {
    reasons.push('New experience - adds variety to summer');
  }
  
  if (optimizationFocus === 'Budget-Friendly' && camp.price_numeric < 350) {
    reasons.push('Great value for money');
  }
  
  if (reasons.length === 0) {
    reasons.push(`${optimizationFocus} match`);
  }
  
  return reasons;
}