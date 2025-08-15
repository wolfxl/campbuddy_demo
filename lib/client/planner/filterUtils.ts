import { 
  PlannerFormData, 
  CampFilterCriteria 
} from '../../algorithm/types';
import {
  gradeToNumber,
  parseDollarAmount,
  parseInterests
} from '../../algorithm/utils';

/**
 * Create filter criteria from form data
 */
export function createFilterCriteria(formData: PlannerFormData): CampFilterCriteria {
  console.log('[PlannerLogs] Creating filter criteria from form data:', JSON.stringify(formData, null, 2));
  
  const gradeRange = formData.children.map(child => {
    const gradeNum = gradeToNumber(child.grade);
    return { min: gradeNum, max: gradeNum };
  });
  
  const weeklyBudget = parseDollarAmount(formData.weeklyBudget);
  const totalBudget = parseDollarAmount(formData.budget);
  const allInterests = formData.children.flatMap(child => parseInterests(child.interests));
  
  const priorityWeights: { price: number; location: number; activities: number; schedule: number } = {
      price: 0, location: 0, activities: 0, schedule: 0
  };
  
  formData.priorities.forEach((priority, index) => {
    const weight = formData.priorities.length - index;
    if (priority in priorityWeights) {
      priorityWeights[priority as keyof typeof priorityWeights] = weight;
    }
  });
  
  return {
    gradeRange, 
    location: formData.location, 
    distance: parseInt(formData.distance) || 10, // Parse as number with default 10 miles
    maxWeeklyCost: weeklyBudget, 
    totalBudget, 
    timePreference: formData.timePreference,
    categories: allInterests, 
    requiredActivities: formData.requiredActivities,
    priorityWeights, 
    transportation: formData.transportation
  };
}