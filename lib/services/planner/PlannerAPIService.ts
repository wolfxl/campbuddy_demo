/**
 * Centralized service for all planner API calls
 */
export class PlannerAPIService {
  
  /**
   * Search for organizations based on interests and grade level
   */
  static async searchOrganizationsByInterests(
    interests: string[], 
    gradeLevel: string
  ): Promise<any[]> {
    console.log('[PlannerAPI] Searching organizations for interests:', interests);
    console.log('[PlannerAPI] Grade level filter:', gradeLevel);
    
    const response = await fetch('/api/organizations/by-interests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        interests: interests,
        gradeLevel: gradeLevel 
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('[PlannerAPI] Organizations found:', result);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result.data || [];
  }

  /**
   * Filter camps by organizations and selected weeks
   */
  static async filterCampsByOrganizationsAndWeeks(
    organizationIds: number[],
    selectedWeeks: boolean[],
    interests: string[],
    gradeLevel: string
  ): Promise<any[]> {
    console.log('[PlannerAPI] Filtering camps for organizations:', organizationIds);
    console.log('[PlannerAPI] Selected weeks:', selectedWeeks);
    console.log('[PlannerAPI] Grade level:', gradeLevel);
    
    const response = await fetch('/api/camps/by-organizations-and-weeks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        organizationIds,
        selectedWeeks,
        interests,
        gradeLevel
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('[PlannerAPI] Available camps by week:', result);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result.data || [];
  }

  /**
   * Apply preferences filtering to available camps
   */
  static async applyPreferencesFilter(
    availableCamps: any[],
    zipCode: string,
    maxDistance: number,
    totalBudget: number,
    weeklyBudgetPerChild: number,
    selectedWeeksCount: number,
    childrenCount: number
  ): Promise<any[]> {
    console.log('[PlannerAPI] Applying preference filters...');
    console.log('[PlannerAPI] ZIP Code:', zipCode);
    console.log('[PlannerAPI] Max Distance:', maxDistance, 'miles');
    console.log('[PlannerAPI] Total Budget:', totalBudget);
    console.log('[PlannerAPI] Weekly Budget per Child:', weeklyBudgetPerChild);
    
    const response = await fetch('/api/camps/by-preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        availableCamps,
        zipCode,
        maxDistance,
        totalBudget,
        weeklyBudgetPerChild,
        selectedWeeksCount,
        childrenCount
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('[PlannerAPI] Filtered camps by preferences:', result);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result.data || [];
  }

  /**
   * Fetch categories for interests dropdown
   */
  static async fetchCategories(): Promise<string[]> {
    console.log('[PlannerAPI] Fetching categories from API');
    
    const response = await fetch('/api/categories');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    if (result.data && Array.isArray(result.data)) {
      return result.data;
    } else {
      throw new Error('Invalid response format');
    }
  }

  /**
   * Extract all interests from form data
   */
  static extractInterestsFromFormData(formData: any): string[] {
    const allInterests: string[] = [];
    
    formData.children.forEach((child: any) => {
      if (child.interests && Array.isArray(child.interests)) {
        child.interests.forEach((interest: any) => {
          const interestName = typeof interest === 'string' ? interest : interest.name;
          if (interestName && !allInterests.includes(interestName)) {
            allInterests.push(interestName);
          }
        });
      }
    });
    
    return allInterests;
  }

  /**
   * Extract grade levels from form data
   */
  static extractGradeLevelsFromFormData(formData: any): string[] {
    const gradeValues: string[] = [];
    
    formData.children.forEach((child: any) => {
      if (child.grade && child.grade.trim() && !gradeValues.includes(child.grade)) {
        gradeValues.push(child.grade);
      }
    });
    
    return gradeValues;
  }

  /**
   * Get primary grade level (first child's grade)
   */
  static getPrimaryGradeLevel(formData: any): string {
    const gradeValues = this.extractGradeLevelsFromFormData(formData);
    return gradeValues.length > 0 ? gradeValues[0] : '';
  }

  /**
   * Calculate budget parameters from form data
   */
  static calculateBudgetParameters(formData: any): {
    totalBudget: number;
    weeklyBudgetPerChild: number;
    selectedWeeksCount: number;
    childrenCount: number;
  } {
    const totalBudget = parseFloat(formData.budget) || 0;
    const weeklyBudgetPerChild = parseFloat(formData.weeklyBudget) || 0;
    const selectedWeeksCount = formData.weeks.filter((week: boolean) => week).length;
    const childrenCount = formData.children.length;

    return {
      totalBudget,
      weeklyBudgetPerChild,
      selectedWeeksCount,
      childrenCount
    };
  }
}