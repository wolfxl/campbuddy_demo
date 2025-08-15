import { ScheduleOption } from '@/lib/algorithm/types';
import { PlanState, ChildInPlan, CampInPlan, WeekInPlan } from '@/lib/types/planner';
import { CHILD_COLORS } from '@/lib/constants/planner';

/**
 * Service for converting between algorithm schedules and display formats
 */
export class ScheduleConverterService {
  
  /**
   * Convert algorithm schedule to display format
   */
  static convertScheduleToDisplayFormat(
    schedule: ScheduleOption, 
    formData: any
  ): PlanState | null {
    console.log('[ScheduleConverter] Converting schedule to display format');
    console.log('[ScheduleConverter] Schedule input:', schedule);
    console.log('[ScheduleConverter] Form data input:', formData);
    
    if (!schedule || !formData) {
      console.error('[ScheduleConverter] Missing schedule or form data for conversion');
      return null;
    }
    
    try {
      // Convert children with colors
      const childrenWithColors = this.convertChildrenWithColors(formData.children);
      
      // Convert week schedules
      const weeksData = this.convertWeekSchedules(schedule.weekSchedule, childrenWithColors);
      
      const newPlan: PlanState = {
        children: childrenWithColors,
        weeks: weeksData,
        totalCost: schedule.totalCost,
        scheduleId: schedule.scheduleId,
        optimizationFocus: schedule.optimizationFocus,
        matchSummary: schedule.matchSummary
      };
      
      console.log('[ScheduleConverter] Conversion successful:', newPlan);
      return newPlan;
    } catch (err) {
      console.error('[ScheduleConverter] Error converting schedule to display format:', err);
      return null;
    }
  }
  
  /**
   * Convert children data with assigned colors
   */
  private static convertChildrenWithColors(children: any[]): ChildInPlan[] {
    return children.map((child: any, index: number) => ({
      id: index, // Use index directly to match the childId from algorithm
      name: child.name || `Child ${index + 1}`,
      grade: String(child.grade),
      color: CHILD_COLORS[index % CHILD_COLORS.length]
    }));
  }
  
  /**
   * Convert week schedules from algorithm format
   */
  private static convertWeekSchedules(
    weekSchedules: any[], 
    children: ChildInPlan[]
  ): WeekInPlan[] {
    return weekSchedules.map(week => {
      console.log('[ScheduleConverter] Processing week:', week.weekLabel, 'with', week.children.length, 'children');
      
      const campsList = this.convertWeekCamps(week.children);
      
      console.log(`[ScheduleConverter] Week ${week.weekLabel} will have ${campsList.length} camps displayed`);
      
      return {
        id: typeof week.weekId === 'number' 
          ? week.weekId 
          : parseInt(String(week.weekId).replace('week', ''), 10) + 1,
        name: week.weekLabel,
        camps: campsList
      };
    });
  }
  
  /**
   * Convert week camps from algorithm format
   */
  private static convertWeekCamps(weekChildren: any[]): CampInPlan[] {
    return weekChildren
      .filter(childWeekInfo => {
        const hasMatch = childWeekInfo.campMatch !== null;
        console.log(`[ScheduleConverter]   Child ${childWeekInfo.childId} (${childWeekInfo.childName}): has camp match = ${hasMatch}`);
        if (hasMatch && childWeekInfo.campMatch) {
          console.log(`[ScheduleConverter]     Camp: ${childWeekInfo.campMatch.camp.name}`);
        }
        return hasMatch;
      })
      .map(childWeekInfo => {
        const match = childWeekInfo.campMatch!;
        const campData: CampInPlan = {
          id: String(match.camp.id),
          childId: childWeekInfo.childId, // Keep as number to match child.id
          name: match.camp.name,
          organization: match.camp.organization,
          location: match.session.location,
          times: match.session.times,
          price: String(match.camp.price),
          locked: false,
          matchScore: match.score,
          matchReasons: match.matchReasons || []
        };
        console.log('[ScheduleConverter]     Created camp data for display:', campData);
        return campData;
      });
  }
  
  /**
   * Convert pre-filtered camps to optimizer format
   */
  static convertPreFilteredCampsToOptimizerFormat(preFilteredCamps: any[]): any[] {
    const allCamps: any[] = [];
    
    preFilteredCamps.forEach((weekData) => {
      if (weekData && weekData.camps && Array.isArray(weekData.camps)) {
        weekData.camps.forEach((campWithSession: any) => {
          const camp = campWithSession.camp;
          const session = campWithSession.session;
          
          // Create a camp object in the format expected by the optimizer
          const optimizerCamp = {
            id: camp.id,
            name: camp.name,
            organization: camp.organization,
            description: camp.description || '',
            price: parseFloat(camp.price) || 0,
            price_numeric: parseFloat(camp.price) || 0,
            categories: camp.categories || [],
            grade_range: camp.grade_range || '',
            min_grade: this.extractMinGrade(camp.grade_range),
            max_grade: this.extractMaxGrade(camp.grade_range),
            locations: [session.location], // Array of location names
            sessions: [{
              id: session.id,
              start_date: session.start_date,
              end_date: session.end_date,
              start_time: session.start_time,
              end_time: session.end_time,
              days: session.days,
              location: session.location,
              location_details: session.location_details
            }],
            distance_miles: campWithSession.distance_miles || null,
            location_coordinates: campWithSession.location_details?.coordinates || null,
            location_coords: campWithSession.location_details?.coordinates ? [{
              name: session.location,
              latitude: campWithSession.location_details.coordinates.lat,
              longitude: campWithSession.location_details.coordinates.lon
            }] : []
          };
          
          // Check if this camp already exists in the array (might have multiple sessions)
          const existingCampIndex = allCamps.findIndex(c => c.id === camp.id);
          if (existingCampIndex >= 0) {
            // Add session to existing camp and merge locations
            allCamps[existingCampIndex].sessions.push(optimizerCamp.sessions[0]);
            // Add location if not already present
            if (!allCamps[existingCampIndex].locations.includes(session.location)) {
              allCamps[existingCampIndex].locations.push(session.location);
            }
            // Merge location coordinates
            if (optimizerCamp.location_coords.length > 0) {
              const existingCoord = allCamps[existingCampIndex].location_coords.find(
                (coord: any) => coord.name === session.location
              );
              if (!existingCoord) {
                allCamps[existingCampIndex].location_coords.push(...optimizerCamp.location_coords);
              }
            }
          } else {
            // Add new camp
            allCamps.push(optimizerCamp);
          }
        });
      }
    });
    
    console.log('[ScheduleConverter] Converted camp sample:', allCamps[0]); // Debug log
    return allCamps;
  }
  
  /**
   * Extract minimum grade from grade range string
   */
  private static extractMinGrade(gradeRange: string): number {
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
  private static extractMaxGrade(gradeRange: string): number {
    if (!gradeRange) return 12;
    const match = gradeRange.match(/(\d+|K)\s*$/);
    if (!match) return 12;
    const grade = match[1];
    if (grade === 'K') return 0;
    return parseInt(grade) || 12;
  }
}