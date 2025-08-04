import { supabase } from '../supabase';
import { 
  GroupedCamp, 
  CampSession, 
  LocationWithCamps 
} from '../types';
import { 
  CampMatch, 
  ScheduleOption, 
  WeekSchedule, 
  ChildSchedule,
  PlannerFormData,
  CampFilterCriteria
} from './types';
import {
  gradeToNumber,
  parseDollarAmount,
  calculateDistance,
  datesOverlap,
  generateScheduleId,
  formatDate,
  parseInterests
} from './utils';

// Define a type for a single location object as expected from the join
interface SingleLocationType {
  id: number | string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Main algorithm class for generating optimized camp schedules
 */
export class ScheduleOptimizer {
  private formData: PlannerFormData;
  private filterCriteria: CampFilterCriteria;
  private allCamps: GroupedCamp[] = [];
  private allSessions: Map<number, CampSession[]> = new Map();
  private allLocations: LocationWithCamps[] = [];
  private scheduleOptions: ScheduleOption[] = [];
  
  constructor(formData: PlannerFormData) {
    this.formData = formData;
    this.filterCriteria = this.createFilterCriteria(formData);
  }
  
  /**
   * Create filter criteria from form data
   */
  private createFilterCriteria(formData: PlannerFormData): CampFilterCriteria {
    // Convert grade strings to grade ranges
    const gradeRange = formData.children.map(child => {
      const gradeNum = gradeToNumber(child.grade);
      return { min: gradeNum, max: gradeNum };
    });
    
    // Parse budget values
    const weeklyBudget = parseDollarAmount(formData.weeklyBudget);
    const totalBudget = parseDollarAmount(formData.budget);
    
    // Collect all interests from all children with strength
    const allInterests = formData.children.flatMap(child => 
      parseInterests(child.interests)
    );
    
    // Calculate priority weights based on order
    const priorityWeights = {
      price: 0,
      location: 0,
      activities: 0,
      schedule: 0
    };
    
    // Assign weights based on priority order (higher = more important)
    formData.priorities.forEach((priority, index) => {
      const weight = formData.priorities.length - index;
      if (priority in priorityWeights) {
        priorityWeights[priority as keyof typeof priorityWeights] = weight;
      }
    });
    
    return {
      gradeRange,
      location: formData.location,
      distance: formData.distance,
      maxWeeklyCost: weeklyBudget,
      totalBudget,
      timePreference: formData.timePreference,
      categories: allInterests,
      requiredActivities: formData.requiredActivities,
      priorityWeights,
      transportation: formData.transportation
    };
  }
  
  /**
   * Fetch all necessary data for scheduling
   */
  public async fetchData(): Promise<void> {
    try {
      // Fetch all camps
      const { data: camps, error: campsError } = await supabase
        .from('camps')
        .select(`
          *,
          organizations!inner(name),
          camp_categories!left(
            categories!inner(name)
          )
        `);
      
      if (campsError) throw campsError;
      
      // Fetch all camp sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('camp_sessions')
        .select(`
          id,
          camp_id,
          location_id,
          start_date,
          end_date,
          days,
          start_time,
          end_time,
          locations!inner(
            id,
            name,
            address,
            city,
            state,
            zip,
            latitude,
            longitude
          )
        `);
      
      if (sessionsError) throw sessionsError;
      
      // Process camps data into GroupedCamp format
      this.allCamps = camps.map(camp => {
        const categories = camp.camp_categories?.map((cc: any) => cc.categories.name) || [];
        
        return {
          id: camp.id,
          name: camp.camp_name,
          organization: camp.organizations?.name || 'Unknown Organization',
          description: camp.description || '',
          price: camp.price.toString(),
          price_numeric: camp.price,
          grade_range: `Grades ${camp.min_grade}-${camp.max_grade}`,
          min_grade: camp.min_grade,
          max_grade: camp.max_grade,
          categories,
          session_count: 0,
          date_range: '',
          earliest_date: '',
          latest_date: '',
          locations: []
        };
      });
      
      // Group sessions by camp_id
      sessions.forEach(session => {
        if (!this.allSessions.has(session.camp_id)) {
          this.allSessions.set(session.camp_id, []);
        }
        
        const campSessions = this.allSessions.get(session.camp_id)!;
        
        campSessions.push({
          id: session.id,
          dates: `${session.start_date} to ${session.end_date}`,
          times: `${session.start_time} to ${session.end_time}`,
          days: session.days || 'Mon-Fri',
          // session.locations is an array, take the name from the first element
          location: session.locations?.[0]?.name || 'Unknown Location',
          start_date: session.start_date,
          end_date: session.end_date,
        });
      });
      
      // Create a map of locations
      const locationMap = new Map<number | string, LocationWithCamps>(); // Typed the Map
      sessions.forEach(session => {
        const locationsArray = session.locations; // This is { id: any; name: any; ... }[]
        if (locationsArray && locationsArray.length > 0) {
          const location = locationsArray[0]; // Take the first location from the array
          // Ensure location and location.id are not null/undefined before using
          if (location && location.id != null && !locationMap.has(location.id)) {
            locationMap.set(location.id, {
              id: location.id,
              name: location.name,
              address: location.address || '',
              city: location.city || '',
              state: location.state || '',
              zip: location.zip || '',
              latitude: location.latitude,
              longitude: location.longitude,
              formatted_address: `${location.address || ''}, ${location.city || ''}, ${location.state || ''} ${location.zip || ''}`.trim(),
              camp_count: 0, // This will be updated later if necessary
              camps: []      // This will be updated later if necessary
            });
          }
        }
      });
      
      this.allLocations = Array.from(locationMap.values());
      
    } catch (error) {
      console.error('Error fetching data for scheduling algorithm:', error);
      throw error;
    }
  }
  
  /**
   * Score a camp session match based on filter criteria
   */
  private scoreMatch(
    camp: GroupedCamp, 
    session: CampSession, 
    childIndex: number,
    weekIndex: number
  ): CampMatch | null {
    const child = this.formData.children[childIndex];
    const childGrade = gradeToNumber(child.grade);
    
    // Basic validation - check if grade is in range
    const gradeMatch = childGrade >= camp.min_grade && childGrade <= camp.max_grade;
    if (!gradeMatch) return null;
    
    // Check if dates overlap with the selected week
    const weekDates = this.getWeekDates(weekIndex);
    const dateMatch = datesOverlap(
      weekDates.startDate, 
      weekDates.endDate, 
      session.start_date, 
      session.end_date
    );
    if (!dateMatch) return null;
    
    // Calculate match scores for different criteria
    const matchReasons: string[] = [];
    let totalScore = 0;
    
    // 1. Grade match (binary)
    if (gradeMatch) {
      matchReasons.push(`Appropriate for ${child.grade}`);
      totalScore += 20 * this.filterCriteria.priorityWeights.schedule;
    }
    
    // 2. Price match
    let priceMatch = true;
    if (this.filterCriteria.maxWeeklyCost !== null) {
      priceMatch = camp.price_numeric <= this.filterCriteria.maxWeeklyCost;
      if (priceMatch) {
        matchReasons.push(`Within weekly budget of $${this.filterCriteria.maxWeeklyCost}`);
        totalScore += 15 * this.filterCriteria.priorityWeights.price;
      }
    }
    
    // 3. Location match
    let locationMatch = true;
    let locationScore = 0;
    
    if (this.filterCriteria.location) {
      // Find the location of this session
      const sessionLocation = this.allLocations.find(
        loc => loc.name === session.location
      );
      
      if (sessionLocation && sessionLocation.latitude && sessionLocation.longitude) {
        // TODO: Implement geocoding for the user's location
        // For now, use a dummy location based on the zipcode
        const userLat = 32.9537; // Dummy lat for Frisco, TX
        const userLng = -96.8903; // Dummy lng for Frisco, TX
        
        const distance = calculateDistance(
          userLat, 
          userLng, 
          sessionLocation.latitude, 
          sessionLocation.longitude
        );
        
        locationMatch = distance <= this.filterCriteria.distance;
        
        if (locationMatch) {
          // Score is higher for closer locations
          locationScore = 20 * (1 - distance / this.filterCriteria.distance);
          matchReasons.push(`${Math.round(distance)} miles away (within ${this.filterCriteria.distance} mile radius)`);
          totalScore += locationScore * this.filterCriteria.priorityWeights.location;
        }
      }
    }
    
    // 4. Category match
    const childInterests = parseInterests(child.interests);
    const categoryMatches = camp.categories.filter(
      category => childInterests.some(
        interest => interest.name.toLowerCase() === category.toLowerCase()
      )
    );
    
    const categoryMatch = categoryMatches.length > 0;
    if (categoryMatch) {
      const matchRate = categoryMatches.length / childInterests.length;
      const categoryScore = 25 * matchRate;
      
      matchReasons.push(`Matches ${categoryMatches.length} interests`);
      totalScore += categoryScore * this.filterCriteria.priorityWeights.activities;
      
      // Bonus for strength matches
      childInterests.forEach(interest => {
        if (categoryMatches.includes(interest.name) && interest.strength === 'love') {
          matchReasons.push(`Matches a favorite activity: ${interest.name}`);
          totalScore += 10 * this.filterCriteria.priorityWeights.activities;
        }
      });
    }
    
    // 5. Required activities match
    const requiredActivityMatches = this.filterCriteria.requiredActivities.filter(
      activity => camp.categories.some(
        category => category.toLowerCase() === activity.toLowerCase()
      )
    );
    
    const requiredActivitiesMatch = 
      this.filterCriteria.requiredActivities.length === 0 || 
      requiredActivityMatches.length > 0;
    
    if (requiredActivitiesMatch && this.filterCriteria.requiredActivities.length > 0) {
      matchReasons.push(`Includes required activities: ${requiredActivityMatches.join(', ')}`);
      totalScore += 30; // High priority for required activities
    }
    
    // Return null if any required criteria is not met
    if (!gradeMatch || !dateMatch || !priceMatch || !locationMatch || !requiredActivitiesMatch) {
      return null;
    }
    
    return {
      camp,
      session,
      score: totalScore,
      matchReasons,
      grade_match: gradeMatch,
      price_match: priceMatch,
      location_match: locationMatch,
      date_match: dateMatch,
      category_match: categoryMatch,
      required_activities_match: requiredActivitiesMatch
    };
  }
  
  /**
   * Get date range for a specific week
   */
  private getWeekDates(weekIndex: number): { startDate: string; endDate: string } {
    // Hard-coded dates based on the summer weeks
    const summerWeekDates = [
      { startDate: '2025-06-03', endDate: '2025-06-09' },
      { startDate: '2025-06-10', endDate: '2025-06-16' },
      { startDate: '2025-06-17', endDate: '2025-06-23' },
      { startDate: '2025-06-24', endDate: '2025-06-30' },
      { startDate: '2025-07-01', endDate: '2025-07-07' },
      { startDate: '2025-07-08', endDate: '2025-07-14' },
      { startDate: '2025-07-15', endDate: '2025-07-21' },
      { startDate: '2025-07-22', endDate: '2025-07-28' }
    ];
    
    return summerWeekDates[weekIndex];
  }
  
  /**
   * Generate all possible matches for all children and weeks
   */
  private generateAllMatches(): Map<number, Map<number, CampMatch[]>> {
    // Structure: Map<weekIndex, Map<childIndex, CampMatch[]>>
    const allMatches = new Map<number, Map<number, CampMatch[]>>();
    
    // Loop through each selected week
    this.formData.weeks.forEach((weekSelected, weekIndex) => {
      if (!weekSelected) return;
      
      const weekMatches = new Map<number, CampMatch[]>();
      allMatches.set(weekIndex, weekMatches);
      
      // Loop through each child
      this.formData.children.forEach((child, childIndex) => {
        const childMatches: CampMatch[] = [];
        
        // Check each camp and its sessions
        this.allCamps.forEach(camp => {
          const sessions = this.allSessions.get(camp.id) || [];
          
          sessions.forEach(session => {
            const match = this.scoreMatch(camp, session, childIndex, weekIndex);
            if (match) {
              childMatches.push(match);
            }
          });
        });
        
        // Sort matches by score (descending)
        childMatches.sort((a, b) => b.score - a.score);
        weekMatches.set(childIndex, childMatches);
      });
    });
    
    return allMatches;
  }
  
  /**
   * Generate schedule options based on different optimization strategies
   */
  public async generateScheduleOptions(): Promise<ScheduleOption[]> {
    if (this.allCamps.length === 0) {
      await this.fetchData();
    }
    
    const allMatches = this.generateAllMatches();
    
    // Generate schedule options with different optimization strategies
    this.scheduleOptions = [
      this.generateBalancedSchedule(allMatches),
      this.generateBudgetSchedule(allMatches),
      this.generatePreferenceSchedule(allMatches)
    ];
    
    return this.scheduleOptions;
  }
  
  /**
   * Generate a balanced schedule option
   */
  private generateBalancedSchedule(
    allMatches: Map<number, Map<number, CampMatch[]>>
  ): ScheduleOption {
    const weekSchedules: WeekSchedule[] = [];
    let totalCost = 0;
    let totalScore = 0;
    
    // Summary counters
    const matchSummary = {
      grade_match: 0,
      price_match: 0,
      location_match: 0,
      category_match: 0,
      required_activities_match: 0,
      total_weeks_covered: 0
    };
    
    // Process each week
    this.formData.weeks.forEach((weekSelected, weekIndex) => {
      if (!weekSelected) return;
      
      const weekDates = this.getWeekDates(weekIndex);
      const weekMatches = allMatches.get(weekIndex);
      
      if (!weekMatches) return;
      
      const childSchedules: ChildSchedule[] = [];
      let weekCovered = false;
      
      // Process each child
      this.formData.children.forEach((child, childIndex) => {
        const childName = child.name || `Child ${childIndex + 1}`;
        const matches = weekMatches.get(childIndex) || [];
        
        // Take the best match for this child and week
        const bestMatch = matches.length > 0 ? matches[0] : null;
        
        if (bestMatch) {
          weekCovered = true;
          totalCost += bestMatch.camp.price_numeric;
          totalScore += bestMatch.score;
          
          // Update match summary
          if (bestMatch.grade_match) matchSummary.grade_match++;
          if (bestMatch.price_match) matchSummary.price_match++;
          if (bestMatch.location_match) matchSummary.location_match++;
          if (bestMatch.category_match) matchSummary.category_match++;
          if (bestMatch.required_activities_match) matchSummary.required_activities_match++;
        }
        
        childSchedules.push({
          childId: childIndex,
          childName,
          grade: child.grade,
          campMatch: bestMatch
        });
      });
      
      if (weekCovered) {
        matchSummary.total_weeks_covered++;
      }
      
      weekSchedules.push({
        weekId: weekIndex,
        weekLabel: `Week ${weekIndex + 1}`,
        startDate: weekDates.startDate,
        endDate: weekDates.endDate,
        children: childSchedules
      });
    });
    
    return {
      scheduleId: generateScheduleId(),
      optimizationFocus: 'Balanced',
      totalScore,
      totalCost,
      weekSchedule: weekSchedules,
      matchSummary
    };
  }
  
  /**
   * Generate a budget-optimized schedule option
   */
  private generateBudgetSchedule(
    allMatches: Map<number, Map<number, CampMatch[]>>
  ): ScheduleOption {
    const weekSchedules: WeekSchedule[] = [];
    let totalCost = 0;
    let totalScore = 0;
    
    // Summary counters
    const matchSummary = {
      grade_match: 0,
      price_match: 0,
      location_match: 0,
      category_match: 0,
      required_activities_match: 0,
      total_weeks_covered: 0
    };
    
    // Process each week
    this.formData.weeks.forEach((weekSelected, weekIndex) => {
      if (!weekSelected) return;
      
      const weekDates = this.getWeekDates(weekIndex);
      const weekMatches = allMatches.get(weekIndex);
      
      if (!weekMatches) return;
      
      const childSchedules: ChildSchedule[] = [];
      let weekCovered = false;
      
      // Process each child
      this.formData.children.forEach((child, childIndex) => {
        const childName = child.name || `Child ${childIndex + 1}`;
        const matches = weekMatches.get(childIndex) || [];
        
        // Sort by price (ascending) and take the cheapest that meets requirements
        const budgetMatches = [...matches].sort((a, b) => 
          a.camp.price_numeric - b.camp.price_numeric
        );
        
        const bestMatch = budgetMatches.length > 0 ? budgetMatches[0] : null;
        
        if (bestMatch) {
          weekCovered = true;
          totalCost += bestMatch.camp.price_numeric;
          totalScore += bestMatch.score;
          
          // Update match summary
          if (bestMatch.grade_match) matchSummary.grade_match++;
          if (bestMatch.price_match) matchSummary.price_match++;
          if (bestMatch.location_match) matchSummary.location_match++;
          if (bestMatch.category_match) matchSummary.category_match++;
          if (bestMatch.required_activities_match) matchSummary.required_activities_match++;
        }
        
        childSchedules.push({
          childId: childIndex,
          childName,
          grade: child.grade,
          campMatch: bestMatch
        });
      });
      
      if (weekCovered) {
        matchSummary.total_weeks_covered++;
      }
      
      weekSchedules.push({
        weekId: weekIndex,
        weekLabel: `Week ${weekIndex + 1}`,
        startDate: weekDates.startDate,
        endDate: weekDates.endDate,
        children: childSchedules
      });
    });
    
    return {
      scheduleId: generateScheduleId(),
      optimizationFocus: 'Budget-Friendly',
      totalScore,
      totalCost,
      weekSchedule: weekSchedules,
      matchSummary
    };
  }
  
  /**
   * Generate a preference-optimized schedule option
   */
  private generatePreferenceSchedule(
    allMatches: Map<number, Map<number, CampMatch[]>>
  ): ScheduleOption {
    const weekSchedules: WeekSchedule[] = [];
    let totalCost = 0;
    let totalScore = 0;
    
    // Summary counters
    const matchSummary = {
      grade_match: 0,
      price_match: 0,
      location_match: 0,
      category_match: 0,
      required_activities_match: 0,
      total_weeks_covered: 0
    };
    
    // Get top priority
    const topPriority = this.formData.priorities[0];
    
    // Process each week
    this.formData.weeks.forEach((weekSelected, weekIndex) => {
      if (!weekSelected) return;
      
      const weekDates = this.getWeekDates(weekIndex);
      const weekMatches = allMatches.get(weekIndex);
      
      if (!weekMatches) return;
      
      const childSchedules: ChildSchedule[] = [];
      let weekCovered = false;
      
      // Process each child
      this.formData.children.forEach((child, childIndex) => {
        const childName = child.name || `Child ${childIndex + 1}`;
        const matches = weekMatches.get(childIndex) || [];
        
        let bestMatch: CampMatch | null = null;
        
        // Sort matches based on top priority
        if (topPriority === 'price') {
          // Sort by price (ascending)
          const sortedMatches = [...matches].sort((a, b) => 
            a.camp.price_numeric - b.camp.price_numeric
          );
          bestMatch = sortedMatches.length > 0 ? sortedMatches[0] : null;
        } 
        else if (topPriority === 'location') {
          // Filter matches by location match and sort by score
          const locationMatches = matches.filter(m => m.location_match);
          bestMatch = locationMatches.length > 0 ? locationMatches[0] : null;
        }
        else if (topPriority === 'activities') {
          // Filter matches by category and sort by number of matches
          const activityMatches = matches.filter(m => m.category_match);
          bestMatch = activityMatches.length > 0 ? activityMatches[0] : null;
        }
        else {
          // Default to best score
          bestMatch = matches.length > 0 ? matches[0] : null;
        }
        
        if (bestMatch) {
          weekCovered = true;
          totalCost += bestMatch.camp.price_numeric;
          totalScore += bestMatch.score;
          
          // Update match summary
          if (bestMatch.grade_match) matchSummary.grade_match++;
          if (bestMatch.price_match) matchSummary.price_match++;
          if (bestMatch.location_match) matchSummary.location_match++;
          if (bestMatch.category_match) matchSummary.category_match++;
          if (bestMatch.required_activities_match) matchSummary.required_activities_match++;
        }
        
        childSchedules.push({
          childId: childIndex,
          childName,
          grade: child.grade,
          campMatch: bestMatch
        });
      });
      
      if (weekCovered) {
        matchSummary.total_weeks_covered++;
      }
      
      weekSchedules.push({
        weekId: weekIndex,
        weekLabel: `Week ${weekIndex + 1}`,
        startDate: weekDates.startDate,
        endDate: weekDates.endDate,
        children: childSchedules
      });
    });
    
    return {
      scheduleId: generateScheduleId(),
      optimizationFocus: `${this.getTopPriorityLabel(topPriority)}-Optimized`,
      totalScore,
      totalCost,
      weekSchedule: weekSchedules,
      matchSummary
    };
  }
  
  /**
   * Get user-friendly label for a priority
   */
  private getTopPriorityLabel(priority: string): string {
    const priorityLabels: { [key: string]: string } = {
      'price': 'Budget',
      'location': 'Location',
      'activities': 'Activity',
      'schedule': 'Schedule'
    };
    
    return priorityLabels[priority] || 'Custom';
  }
  
  /**
   * Get a specific schedule option by ID
   */
  public getScheduleById(scheduleId: string): ScheduleOption | undefined {
    return this.scheduleOptions.find(option => option.scheduleId === scheduleId);
  }
  
  /**
   * Swap a camp in a schedule
   */
  public swapCamp(
    scheduleId: string,
    weekId: number,
    childId: number,
    newCampId: number
  ): ScheduleOption | null {
    const schedule = this.getScheduleById(scheduleId);
    if (!schedule) return null;
    
    const allMatches = this.generateAllMatches();
    const weekMatches = allMatches.get(weekId);
    if (!weekMatches) return null;
    
    const childMatches = weekMatches.get(childId);
    if (!childMatches) return null;
    
    // Find the match for the new camp
    const newMatch = childMatches.find(m => m.camp.id === newCampId);
    if (!newMatch) return null;
    
    // Create a copy of the schedule
    const newSchedule: ScheduleOption = JSON.parse(JSON.stringify(schedule));
    
    // Find the week and child
    const week = newSchedule.weekSchedule.find(w => w.weekId === weekId);
    if (!week) return null;
    
    const child = week.children.find(c => c.childId === childId);
    if (!child) return null;
    
    // Get the old match if it exists
    const oldMatch = child.campMatch;
    
    // Update cost and score
    if (oldMatch) {
      newSchedule.totalCost -= oldMatch.camp.price_numeric;
      newSchedule.totalScore -= oldMatch.score;
      
      // Update match summary
      if (oldMatch.grade_match) newSchedule.matchSummary.grade_match--;
      if (oldMatch.price_match) newSchedule.matchSummary.price_match--;
      if (oldMatch.location_match) newSchedule.matchSummary.location_match--;
      if (oldMatch.category_match) newSchedule.matchSummary.category_match--;
      if (oldMatch.required_activities_match) newSchedule.matchSummary.required_activities_match--;
    }
    
    // Add new match stats
    newSchedule.totalCost += newMatch.camp.price_numeric;
    newSchedule.totalScore += newMatch.score;
    
    // Update match summary
    if (newMatch.grade_match) newSchedule.matchSummary.grade_match++;
    if (newMatch.price_match) newSchedule.matchSummary.price_match++;
    if (newMatch.location_match) newSchedule.matchSummary.location_match++;
    if (newMatch.category_match) newSchedule.matchSummary.category_match++;
    if (newMatch.required_activities_match) newSchedule.matchSummary.required_activities_match++;
    
    // Update the child's camp match
    child.campMatch = newMatch;
    
    return newSchedule;
  }
  
  /**
   * Find alternative camps for a specific week and child
   */
  public findAlternatives(
    weekId: number,
    childId: number,
    limit: number = 5
  ): CampMatch[] {
    const allMatches = this.generateAllMatches();
    const weekMatches = allMatches.get(weekId);
    if (!weekMatches) return [];
    
    const childMatches = weekMatches.get(childId);
    if (!childMatches) return [];
    
    // Return top matches limited by the specified limit
    return childMatches.slice(0, limit);
  }
}
