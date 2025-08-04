/**
 * Service for form validation logic
 */
export class ValidationService {
  
  /**
   * Validate current step
   */
  static validateCurrentStep(currentStep: number, formData: any): { isValid: boolean; message: string } {
    switch (currentStep) {
      case 1: // Children step
        return this.validateChildrenStep(formData);
      
      case 2: // Week selection
        return this.validateWeekSelectionStep(formData);
      
      case 3: // Preferences
        return this.validatePreferencesStep(formData);
      
      case 4: // Review
        return this.validateReviewStep(formData);
      
      default:
        return { isValid: true, message: '' };
    }
  }

  /**
   * Validate Step 1: Children and interests
   */
  static validateChildrenStep(formData: any): { isValid: boolean; message: string } {
    const missingGrades = formData.children.filter((child: any) => !child.grade.trim());
    
    if (missingGrades.length > 0) {
      const childNames = missingGrades.map((child: any, index: number) => 
        child.name.trim() || `Child ${formData.children.indexOf(child) + 1}`
      ).join(', ');
      
      return {
        isValid: false,
        message: `Please select a grade level for: ${childNames}`
      };
    }
    
    return { isValid: true, message: '' };
  }

  /**
   * Validate Step 2: Week selection
   */
  static validateWeekSelectionStep(formData: any): { isValid: boolean; message: string } {
    const selectedWeeks = formData.weeks.filter((week: boolean) => week).length;
    
    if (selectedWeeks === 0) {
      return {
        isValid: false,
        message: 'Please select at least one week for summer camp'
      };
    }
    
    return { isValid: true, message: '' };
  }

  /**
   * Validate Step 3: Preferences
   */
  static validatePreferencesStep(formData: any): { isValid: boolean; message: string } {
    // Basic validation - can be expanded
    if (formData.location && formData.location.trim().length < 5) {
      return {
        isValid: false,
        message: 'Please enter a valid ZIP code'
      };
    }
    
    if (formData.distance < 1 || formData.distance > 100) {
      return {
        isValid: false,
        message: 'Distance must be between 1 and 100 miles'
      };
    }
    
    return { isValid: true, message: '' };
  }

  /**
   * Validate Step 4: Review (final validation)
   */
  static validateReviewStep(formData: any): { isValid: boolean; message: string } {
    // Run all previous validations
    const step1Validation = this.validateChildrenStep(formData);
    if (!step1Validation.isValid) return step1Validation;
    
    const step2Validation = this.validateWeekSelectionStep(formData);
    if (!step2Validation.isValid) return step2Validation;
    
    const step3Validation = this.validatePreferencesStep(formData);
    if (!step3Validation.isValid) return step3Validation;
    
    return { isValid: true, message: '' };
  }

  /**
   * Validate individual child data
   */
  static validateChild(child: any): { isValid: boolean; message: string } {
    if (!child.grade || !child.grade.trim()) {
      return {
        isValid: false,
        message: 'Grade level is required'
      };
    }
    
    return { isValid: true, message: '' };
  }

  /**
   * Validate ZIP code format
   */
  static validateZipCode(zipCode: string): { isValid: boolean; message: string } {
    const cleanZip = zipCode.replace(/\D/g, '');
    
    if (cleanZip.length !== 5) {
      return {
        isValid: false,
        message: 'ZIP code must be 5 digits'
      };
    }
    
    return { isValid: true, message: '' };
  }

  /**
   * Validate budget values
   */
  static validateBudget(budget: string, weeklyBudget: string): { isValid: boolean; message: string } {
    const totalBudget = parseFloat(budget);
    const weeklyBudgetPerChild = parseFloat(weeklyBudget);
    
    if (budget && (isNaN(totalBudget) || totalBudget < 0)) {
      return {
        isValid: false,
        message: 'Total budget must be a valid positive number'
      };
    }
    
    if (weeklyBudget && (isNaN(weeklyBudgetPerChild) || weeklyBudgetPerChild < 0)) {
      return {
        isValid: false,
        message: 'Weekly budget must be a valid positive number'
      };
    }
    
    return { isValid: true, message: '' };
  }

  /**
   * Check if form data has minimum required information
   */
  static hasMinimumRequiredData(formData: any): boolean {
    return (
      formData.children.length > 0 &&
      formData.children.some((child: any) => child.grade.trim()) &&
      formData.weeks.some((week: boolean) => week)
    );
  }

  /**
   * Get completion percentage of the form
   */
  static getFormCompletionPercentage(formData: any): number {
    let completedFields = 0;
    let totalFields = 0;
    
    // Children fields
    totalFields += formData.children.length * 2; // name and grade
    completedFields += formData.children.filter((child: any) => child.name.trim()).length;
    completedFields += formData.children.filter((child: any) => child.grade.trim()).length;
    
    // Week selection
    totalFields += 1;
    if (formData.weeks.some((week: boolean) => week)) {
      completedFields += 1;
    }
    
    // Preferences
    totalFields += 4; // location, distance, budget, transportation
    if (formData.location.trim()) completedFields += 1;
    if (formData.distance > 0) completedFields += 1;
    if (formData.budget.trim() || formData.weeklyBudget.trim()) completedFields += 1;
    if (formData.transportation) completedFields += 1;
    
    return Math.round((completedFields / totalFields) * 100);
  }
}