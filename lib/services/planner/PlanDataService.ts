/**
 * Service for loading and validating planner data from storage
 */
export class PlanDataService {
  
  /**
   * Load comprehensive planner data from storage
   */
  static loadPlannerData(): {
    formData: any;
    preFilteredCamps: any[];
    organizationsFound: any[];
    availableCamps: any[];
    metadata: any;
  } | null {
    try {
      // Try to get comprehensive planner data first
      let savedPlannerData = this.getFromStorage('plannerFullData');
      
      if (savedPlannerData) {
        console.log('[PlanDataService] Found comprehensive planner data');
        const parsedData = JSON.parse(savedPlannerData);
        
        return {
          formData: parsedData.formData,
          preFilteredCamps: parsedData.filteredCamps || [],
          organizationsFound: parsedData.organizationsFound || [],
          availableCamps: parsedData.availableCampsFromStep2 || [],
          metadata: parsedData.plannerMetadata || {}
        };
      }
      
      // Fallback to form data only
      console.log('[PlanDataService] No comprehensive data, falling back to form data only');
      const savedFormData = this.getFromStorage('plannerFormData');
      
      if (savedFormData) {
        return {
          formData: JSON.parse(savedFormData),
          preFilteredCamps: [],
          organizationsFound: [],
          availableCamps: [],
          metadata: {}
        };
      }
      
      return null;
    } catch (error) {
      console.error('[PlanDataService] Error loading planner data:', error);
      return null;
    }
  }
  
  /**
   * Validate form data structure
   */
  static validateFormData(formData: any): { isValid: boolean; error?: string } {
    if (!formData) {
      return { isValid: false, error: 'No form data provided' };
    }
    
    if (!formData.children || !Array.isArray(formData.children) || formData.children.length === 0) {
      return { isValid: false, error: 'Invalid or missing children data' };
    }
    
    if (!formData.weeks || !Array.isArray(formData.weeks)) {
      return { isValid: false, error: 'Invalid or missing weeks data' };
    }
    
    // Validate children structure
    for (const child of formData.children) {
      if (!child.grade || typeof child.grade !== 'string') {
        return { isValid: false, error: 'All children must have a valid grade level' };
      }
    }
    
    return { isValid: true };
  }
  
  /**
   * Get data from storage with fallback
   */
  private static getFromStorage(key: string): string | null {
    try {
      // Try sessionStorage first
      let data = sessionStorage.getItem(key);
      if (data) return data;
      
      // Fallback to localStorage
      console.log(`[PlanDataService] ${key} not found in sessionStorage, trying localStorage`);
      data = localStorage.getItem(key);
      return data;
    } catch (error) {
      console.error(`[PlanDataService] Error accessing storage for key ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Extract home location from form data
   */
  static extractHomeLocation(formData: any): string | null {
    return formData?.location || null;
  }
  
  /**
   * Check if should use pre-filtered data
   */
  static shouldUsePreFilteredData(preFilteredCamps: any[]): boolean {
    return preFilteredCamps && preFilteredCamps.length > 0;
  }
}