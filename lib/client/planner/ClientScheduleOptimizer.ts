import { 
  CampMatch, 
  ScheduleOption, 
  WeekSchedule, 
  ChildSchedule,
  PlannerFormData,
  CampFilterCriteria
} from '../../algorithm/types';
import {
  generateScheduleId
} from '../../algorithm/utils';
import { GroupedCamp, CampSession } from '../../types';
import { createFilterCriteria } from './filterUtils';
import { scoreCampForChildWithDiversity, generateMatchReasons } from './scoringEngine';
import { findMatchingSession, checkGradeMatch, checkPriceMatch, checkLocationMatch, checkCategoryMatch, checkRequiredActivitiesMatch } from './matchingUtils';

import { SUMMER_WEEKS, API_CONFIG } from '@/lib/constants/planner';

// Static counter for detailed scoring logs
let detailedScoringLogCount = 0;

/**
 * Client-side version of the schedule optimizer
 * Handles filtering and scoring camps based on preferences
 */
export class ClientScheduleOptimizer {
  private formData: PlannerFormData;
  private filterCriteria: CampFilterCriteria;
  private allCamps: GroupedCamp[] = [];
  private allSessions: Map<number, CampSession[]> = new Map();
  private scheduleOptions: ScheduleOption[] = [];
  private isGenerating: boolean = false;
  
  constructor(formData: PlannerFormData, campsData: GroupedCamp[] = [], sessionsData: {campId: number, sessions: CampSession[]}[] = []) {
    this.formData = formData;
    this.filterCriteria = createFilterCriteria(formData);
    this.allCamps = campsData;
    
    // Initialize sessions map
    sessionsData.forEach(item => {
      this.allSessions.set(item.campId, item.sessions);
    });
  }
  
  /**
   * Create fallback sessions for camps without session data
   */
  private createFallbackSessions(camp: GroupedCamp): CampSession[] {
    const location = camp.locations?.[0] || 'Location TBD';
    return [
      { id: camp.id * 100 + 1, dates: 'June 3 - June 9', times: '9:00 AM - 3:00 PM', days: 'Mon-Fri', location, start_date: '2025-06-03', end_date: '2025-06-09' },
      { id: camp.id * 100 + 2, dates: 'June 10 - June 16', times: '9:00 AM - 3:00 PM', days: 'Mon-Fri', location, start_date: '2025-06-10', end_date: '2025-06-16' },
      { id: camp.id * 100 + 3, dates: 'June 17 - June 23', times: '9:00 AM - 3:00 PM', days: 'Mon-Fri', location, start_date: '2025-06-17', end_date: '2025-06-23' }
    ];
  }
  
  /**
   * Generate schedule options
   */
  public async generateScheduleOptions(): Promise<ScheduleOption[]> {
    try {
      if (this.isGenerating) {
        console.log('[PlannerLogs] Schedule generation already in progress');
        return this.scheduleOptions;
      }
      
      this.isGenerating = true;
      
      if (this.allCamps.length === 0) {
        console.warn('[PlannerLogs] No camps available from initial data. Attempting to load all camps as fallback...');
        try {
          // If no interests were specified or no camps matched interests, fetch all camps
          const fallbackResponse = await fetch('/api/camps?limit=9999'); // Get all camps for planner
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            this.allCamps = fallbackData.data || [];
            console.log(`[PlannerLogs] Fallback loaded ${this.allCamps.length} camps`);
          }
        } catch (fallbackError) {
          console.error('[PlannerLogs] Fallback camp loading failed:', fallbackError);
        }
        
        if (this.allCamps.length === 0) {
          console.error('[PlannerLogs] No camps available for scheduling. Please check your API connection.');
          this.isGenerating = false;
          return [];
        }
      }
      
      console.log(`[PlannerLogs] ClientScheduleOptimizer: Initialized with ${this.allCamps.length} camps to consider.`);
      if (this.allCamps.length > 0) {
        const exampleCamps = this.allCamps.slice(0, 3).map(camp => `${camp.name} (ID: ${camp.id})`).join('; ');
        console.log(`[PlannerLogs]   Example initial camps: ${exampleCamps || 'N/A'}`);
      }
      
      const balanced = await this.generateOptimizedSchedule('Balanced');
      const budgetFriendly = await this.generateOptimizedSchedule('Budget-Friendly');
      const activityOptimized = await this.generateOptimizedSchedule('Activity-Optimized');
      
      const options = [balanced, budgetFriendly, activityOptimized].filter(option => option !== null);
      
      this.scheduleOptions = options;
      console.log(`[PlannerLogs] Successfully generated ${this.scheduleOptions.length} schedule options.`);
      this.isGenerating = false;
      return this.scheduleOptions;
    } catch (error) {
      console.error('[PlannerLogs] Error generating schedule options:', error);
      this.isGenerating = false;
      return [];
    }
  }
  

  
  /**
   * Generate an optimized schedule
   */
  private async generateOptimizedSchedule(optimizationFocus: string): Promise<ScheduleOption | null> {
    try {
      console.log(`[PlannerLogs] Generating ${optimizationFocus} schedule. Number of camps available: ${this.allCamps.length}`);
      
      const weekSchedules: WeekSchedule[] = [];
      let totalCost = 0;
      const usedCamps = new Set<number>(); // Track camps already assigned to ensure diversity
      
      const summerWeeks = SUMMER_WEEKS;
      
      const matchSummary = {
        grade_match: 0, price_match: 0, location_match: 0,
        category_match: 0, required_activities_match: 0, total_weeks_covered: 0
      };
      
      for (let weekIndex = 0; weekIndex < this.formData.weeks.length; weekIndex++) {
        const weekSelected = this.formData.weeks[weekIndex];
        if (!weekSelected || weekIndex >= summerWeeks.length) continue;
        
        const weekInfo = summerWeeks[weekIndex];
        const childSchedules: ChildSchedule[] = [];
        
        for (let childIndex = 0; childIndex < this.formData.children.length; childIndex++) {
          const child = this.formData.children[childIndex];
          const childName = child.name || `Child ${childIndex + 1}`;
          console.log(`[PlannerLogs] Finding camp for Child ${childIndex + 1} (${childName}), Week ${weekIndex + 1} (${weekInfo.label})`);
          const bestMatch = await this.findBestCampMatchWithDiversity(child, childIndex, weekIndex, weekInfo, optimizationFocus, usedCamps);
          
          if (bestMatch) {
            console.log(`[PlannerLogs]   Child ${childIndex + 1} (${childName}), Week ${weekIndex + 1}: Assigned ${bestMatch.camp.name} (ID: ${bestMatch.camp.id}), Score: ${bestMatch.score.toFixed(2)}, Reasons: ${bestMatch.matchReasons.join(', ')}`);
            totalCost += bestMatch.camp.price_numeric;
            usedCamps.add(bestMatch.camp.id); // Track used camps for diversity
            matchSummary.grade_match++;
            matchSummary.price_match++;
            matchSummary.location_match++;
            if (bestMatch.category_match) matchSummary.category_match++;
            matchSummary.required_activities_match++;
          }
          
          childSchedules.push({
            childId: childIndex, childName, grade: child.grade, campMatch: bestMatch
          });
        }
        
        matchSummary.total_weeks_covered++;
        weekSchedules.push({
          weekId: weekInfo.id, weekLabel: weekInfo.label,
          startDate: weekInfo.start, endDate: weekInfo.end, children: childSchedules
        });
      }
      
      return {
        scheduleId: generateScheduleId(), optimizationFocus,
        totalScore: 100 * matchSummary.total_weeks_covered, totalCost,
        weekSchedule: weekSchedules, matchSummary
      };
    } catch (error) {
      console.error(`[PlannerLogs] Error generating ${optimizationFocus} schedule:`, error);
      return null;
    }
  }
  
  /**
   * Find the best camp match for a child with diversity consideration
   */
  private async findBestCampMatchWithDiversity(child: any, childIndex: number, weekIndex: number, weekInfo: any, optimizationFocus: string, usedCamps: Set<number>): Promise<CampMatch | null> {
    console.log(`[PlannerLogs]   findBestCampMatchWithDiversity for Child ${childIndex + 1} (${child.name}), Week ${weekIndex + 1}`);
    
    // Filter camps for the current week based on session availability
    const availableCampsThisWeek = this.allCamps.filter(camp => {
      const sessions = this.allSessions.get(camp.id) || this.createFallbackSessions(camp);
      return findMatchingSession(sessions, weekInfo) !== null;
    });
    
    console.log(`[PlannerLogs]     Initially ${this.allCamps.length} total camps. After checking session availability for week ${weekIndex + 1} (${weekInfo.label}), ${availableCampsThisWeek.length} camps remain.`);

    if (availableCampsThisWeek.length === 0) {
        console.log(`[PlannerLogs]     No camps have available sessions for Child ${childIndex + 1} in week ${weekIndex + 1}.`);
        return null;
    }

    const scoredCamps: (CampMatch & { rawScore: number })[] = [];

    availableCampsThisWeek.forEach(camp => {
      if (usedCamps.has(camp.id)) { 
        // Skip already used camps to ensure diversity
        return; 
      }

      const score = scoreCampForChildWithDiversity(camp, child, optimizationFocus, usedCamps, this.filterCriteria);
      const matchReasons = generateMatchReasons(camp, child, optimizationFocus, usedCamps);
      
      if (detailedScoringLogCount < API_CONFIG.MAX_DETAILED_SCORING_LOGS) {
          console.log(`[PlannerLogs]     [Detailed Scoring #${detailedScoringLogCount + 1}] Camp ID ${camp.id} (${camp.name}) for Child ${child.name} (ChildIdx: ${childIndex}, WeekIdx: ${weekIndex}): Score = ${score.toFixed(2)}, Reasons: ${matchReasons.join(', ')}`);
      }

      if (score > 0) { // Only consider camps with a positive score
        const sessions = this.allSessions.get(camp.id) || this.createFallbackSessions(camp);
        const matchingSession = findMatchingSession(sessions, weekInfo);
        
        if (matchingSession) {
          scoredCamps.push({ 
            camp, 
            score, 
            matchReasons, 
            rawScore: score,
            session: matchingSession,
            grade_match: checkGradeMatch(camp, child),
            price_match: checkPriceMatch(camp, this.filterCriteria),
            location_match: true, // We'll check this properly later in a separate step
            date_match: true,
            category_match: checkCategoryMatch(camp, child),
            required_activities_match: checkRequiredActivitiesMatch(camp, this.filterCriteria)
          } as CampMatch & { rawScore: number });
        }
      }
    });

    if (scoredCamps.length === 0) {
      console.log(`[PlannerLogs]     No suitable camps found for Child ${childIndex + 1} (${child.name}) in Week ${weekIndex + 1} after scoring.`);
      // If no camps available due to diversity constraint, try again without the constraint as fallback
      console.log(`[PlannerLogs]     Attempting fallback: scoring all camps including previously used ones...`);
      
      availableCampsThisWeek.forEach(camp => {
        const score = scoreCampForChildWithDiversity(camp, child, optimizationFocus, new Set(), this.filterCriteria); // Empty usedCamps set
        const matchReasons = generateMatchReasons(camp, child, optimizationFocus, new Set());
        
        if (score > 0) {
          const sessions = this.allSessions.get(camp.id) || this.createFallbackSessions(camp);
          const matchingSession = findMatchingSession(sessions, weekInfo);
          
          if (matchingSession) {
            scoredCamps.push({ 
              camp, 
              score: score * 0.8, // Apply penalty for reusing camps
              matchReasons: [...matchReasons, 'Fallback selection - limited camp diversity available'], 
              rawScore: score * 0.8,
              session: matchingSession,
              grade_match: checkGradeMatch(camp, child),
              price_match: checkPriceMatch(camp, this.filterCriteria),
              location_match: true,
              date_match: true,
              category_match: checkCategoryMatch(camp, child),
              required_activities_match: checkRequiredActivitiesMatch(camp, this.filterCriteria)
            } as CampMatch & { rawScore: number });
          }
        }
      });
      
      if (scoredCamps.length === 0) {
        console.log(`[PlannerLogs]     Even fallback scoring found no suitable camps for Child ${childIndex + 1} (${child.name}) in Week ${weekIndex + 1}.`);
        return null;
      }
      
      console.log(`[PlannerLogs]     Fallback found ${scoredCamps.length} potential camps for Child ${childIndex + 1} (${child.name}) in Week ${weekIndex + 1}.`);
    }

    // Sort camps by initial score
    scoredCamps.sort((a, b) => b.rawScore - a.rawScore);

    // Take top N camps for location filtering (for performance reasons)
    const topCampsToCheck = scoredCamps.slice(0, 10); // Check top 10 camps for location
    console.log(`[PlannerLogs]     Checking location filter for top ${topCampsToCheck.length} camps...`);
    
    // Now check location for top camps
    const locationFilteredCamps: (CampMatch & { rawScore: number })[] = [];
    
    for (const campMatch of topCampsToCheck) {
      // Check location match
      console.log(`[PlannerLogs]     Checking location for camp: ${campMatch.camp.name} (ID: ${campMatch.camp.id})`);
      const locationMatch = await checkLocationMatch(campMatch.camp, this.formData);
      
      if (locationMatch) {
        // Update the location_match property
        campMatch.location_match = true;
        locationFilteredCamps.push(campMatch);
        console.log(`[PlannerLogs]     Camp ${campMatch.camp.name} (ID: ${campMatch.camp.id}) PASSED location filter check`);
      } else {
        console.log(`[PlannerLogs]     Camp ${campMatch.camp.name} (ID: ${campMatch.camp.id}) failed location filter check - outside radius`);
        // If location priority is low, still include but with penalty
        if ((this.filterCriteria.priorityWeights?.location || 0) < 2) {
          campMatch.location_match = false;
          campMatch.score = campMatch.score * 0.6; // 40% penalty
          campMatch.matchReasons = campMatch.matchReasons.filter(r => !r.includes('location'));
          campMatch.matchReasons.push('Outside preferred location radius but otherwise good match');
          locationFilteredCamps.push(campMatch);
          console.log(`[PlannerLogs]     However, keeping camp with 40% score penalty due to low location priority`);
        }
      }
    }

    if (locationFilteredCamps.length === 0) {
      console.log(`[PlannerLogs]     No camps passed location filtering for Child ${childIndex + 1} (${child.name}) in Week ${weekIndex + 1}.`);
      // Fall back to original top camps if location filter eliminated all
      if (this.filterCriteria.priorityWeights?.location === 0) {
        locationFilteredCamps.push(scoredCamps[0]);
        console.log(`[PlannerLogs]     Location priority is zero, falling back to top scoring camp without location filter.`);
      } else {
        return null;
      }
    }

    // Final sort by adjusted score
    locationFilteredCamps.sort((a, b) => b.score - a.score);

    console.log(`[PlannerLogs]     Top 3 scored camps for Child ${childIndex + 1} (${child.name}), Week ${weekIndex + 1}:`);
    locationFilteredCamps.slice(0, 3).forEach(match => {
      console.log(`[PlannerLogs]       - Camp: ${match.camp.name} (ID: ${match.camp.id}), Score: ${match.score.toFixed(2)}, Reasons: ${match.matchReasons.join(', ')}`);
    });

    const bestCamp = locationFilteredCamps[0];
    
    // Increment detailed scoring log count AFTER processing all camps for this child/week slot if a camp was scored.
    if (availableCampsThisWeek.length > 0 && locationFilteredCamps.length > 0) { // only increment if some scoring happened
        detailedScoringLogCount++;
    }

    return bestCamp;
  }
  
  /**
   * Get additional camp suggestions for "might be interested" section
   */
  public getAdditionalSuggestions(numberOfSuggestions: number = API_CONFIG.MAX_CAMP_SUGGESTIONS): GroupedCamp[] {
    try {
      // Get camps that weren't selected in the main schedule
      const selectedCampIds = new Set<number>();
      this.scheduleOptions.forEach(option => {
        option.weekSchedule.forEach(week => {
          week.children.forEach(child => {
            if (child.campMatch) {
              selectedCampIds.add(child.campMatch.camp.id);
            }
          });
        });
      });
      
      // Score remaining camps for suggestions
      const suggestions = this.allCamps
        .filter(camp => !selectedCampIds.has(camp.id))
        .map(camp => {
          // Calculate average score across all children
          const totalScore = this.formData.children.reduce((sum, child) => {
            return sum + scoreCampForChildWithDiversity(camp, child, 'Balanced', selectedCampIds, this.filterCriteria);
          }, 0);
          const avgScore = totalScore / this.formData.children.length;
          
          return { camp, score: avgScore };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, numberOfSuggestions)
        .map(item => item.camp);
      
      console.log(`[PlannerLogs] Generated ${suggestions.length} additional camp suggestions`);
      return suggestions;
    } catch (error) {
      console.error('[PlannerLogs] Error generating additional suggestions:', error);
      return [];
    }
  }
}