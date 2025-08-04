export { ClientScheduleOptimizer } from './ClientScheduleOptimizer';
export { createFilterCriteria } from './filterUtils';
export { 
  findMatchingSession, 
  checkGradeMatch, 
  checkPriceMatch, 
  checkLocationMatch, 
  checkCategoryMatch, 
  checkRequiredActivitiesMatch,
  datesOverlap
} from './matchingUtils';
export { scoreCampForChildWithDiversity, generateMatchReasons } from './scoringEngine';