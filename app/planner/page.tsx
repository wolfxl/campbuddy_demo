"use client";
import React, { useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import styles from './page.module.css';
import Banner from '@/components/Banner/Banner';
import {
  WizardProgress,
  AddChildrenStep,
  WeekSelection,
  PreferencesForm,
  PlanReview,
  WizardNavigation
} from '@/components/planner';
import { 
  GRADE_LEVELS, 
  INTEREST_STRENGTHS, 
  PRIORITY_FACTORS, 
  TIME_PREFERENCES, 
  TRANSPORTATION_OPTIONS 
} from '@/lib/constants/planner';

interface Interest {
  name: string;
  strength: string | null;
}

interface Child {
  name: string;
  grade: string;
  interests: (Interest | string)[];
}

type TimePreference = 'full-day' | 'morning' | 'afternoon' | 'extended';
type Transportation = 'parent' | 'bus' | 'either';
type PriorityFactorId = 'price' | 'location' | 'activities' | 'schedule';

interface FormData {
  children: Child[];
  weeks: boolean[];
  timePreference: TimePreference;
  location: string;
  distance: number;
  budget: string;
  weeklyBudget: string;
  transportation: Transportation;
  priorities: PriorityFactorId[];
  requiredActivities: string[];
}

const SmartPlannerPage = () => {
  // State for categories from Supabase
  const [availableInterests, setAvailableInterests] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  
  // State for the current step of the wizard
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSearchingOrganizations, setIsSearchingOrganizations] = useState<boolean>(false);
  const [isFilteringCamps, setIsFilteringCamps] = useState<boolean>(false);
  const [foundOrganizations, setFoundOrganizations] = useState<any[]>([]);
  const [availableCamps, setAvailableCamps] = useState<any[]>([]);
  const [isApplyingPreferences, setIsApplyingPreferences] = useState<boolean>(false);
  const [finalFilteredCamps, setFinalFilteredCamps] = useState<any[]>([]);
  
  // Priority factors from constants
  const priorityFactors = PRIORITY_FACTORS;
  
  // State for form data
  const [formData, setFormData] = useState<FormData>({
    children: [{ name: '', grade: '', interests: [] }],
    weeks: [true, true, true, true, true, true, true, true], // 8 weeks of summer
    timePreference: 'full-day',
    location: '',
    distance: 15,
    budget: '',
    weeklyBudget: '',
    transportation: 'parent',
    priorities: ['price', 'activities', 'location', 'schedule'], // Default order
    requiredActivities: []
  });
  
  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        if (result.data && Array.isArray(result.data)) {
          setAvailableInterests(result.data);
          setCategoriesError(null);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategoriesError(err instanceof Error ? err.message : 'Failed to fetch categories');
        
        // Fallback to predefined categories if API fails
        setAvailableInterests([
          'Sports', 'Arts & Crafts', 'STEM', 'Nature', 'Music', 
          'Theater', 'Dance', 'Languages', 'Cooking', 'Technology'
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };
  
    fetchCategories();
  }, []);
  
  // Apply preferences filtering (Step 3)
  const applyPreferencesFilter = async () => {
    setIsApplyingPreferences(true);
    try {
      if (availableCamps.length === 0) {
        console.log('[Planner] No camps found from Step 2, skipping preferences filtering');
        return;
      }

      // Extract preferences from form data
      const zipCode = formData.location;
      const maxDistance = formData.distance;
      const totalBudget = parseFloat(formData.budget) || 0;
      const weeklyBudgetPerChild = parseFloat(formData.weeklyBudget) || 0;
      
      // Count selected weeks and children
      const selectedWeeksCount = formData.weeks.filter(week => week).length;
      const childrenCount = formData.children.length;

      console.log('[Planner] Applying preference filters...');
      console.log('[Planner] ZIP Code:', zipCode);
      console.log('[Planner] Max Distance:', maxDistance, 'miles');
      console.log('[Planner] Total Budget:', totalBudget ? `${totalBudget}` : 'No limit');
      console.log('[Planner] Weekly Budget per Child:', weeklyBudgetPerChild ? `${weeklyBudgetPerChild}` : 'No limit');
      console.log('[Planner] Selected Weeks:', selectedWeeksCount);
      console.log('[Planner] Children Count:', childrenCount);
      
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
      console.log('[Planner] Filtered camps by preferences:', result);
      
      // Store final filtered camps for plan generation
      setFinalFilteredCamps(result.data || []);
      
    } catch (error) {
      console.error('[Planner] Error applying preferences filter:', error);
    } finally {
      setIsApplyingPreferences(false);
    }
  };
  
  // Filter camps based on organizations and selected weeks
  const filterCampsByWeeks = async () => {
    setIsFilteringCamps(true);
    try {
      if (foundOrganizations.length === 0) {
        console.log('[Planner] No organizations found from Step 1, skipping camp filtering');
        return;
      }

      // Extract organization IDs
      const organizationIds = foundOrganizations.map(org => org.id);
      
      // Get grade level from first child
      const gradeValues: string[] = [];
      formData.children.forEach(child => {
        if (child.grade && child.grade.trim() && !gradeValues.includes(child.grade)) {
          gradeValues.push(child.grade);
        }
      });
      const primaryGradeLevel = gradeValues.length > 0 ? gradeValues[0] : '';

      // Get interests
      const allInterests: string[] = [];
      formData.children.forEach(child => {
        if (child.interests && Array.isArray(child.interests)) {
          child.interests.forEach(interest => {
            const interestName = typeof interest === 'string' ? interest : interest.name;
            if (interestName && !allInterests.includes(interestName)) {
              allInterests.push(interestName);
            }
          });
        }
      });

      console.log('[Planner] Filtering camps for selected weeks...');
      console.log('[Planner] Organizations:', foundOrganizations.map(org => org.name));
      console.log('[Planner] Selected weeks:', formData.weeks.map((selected, index) => selected ? index + 1 : null).filter(Boolean));
      
      const response = await fetch('/api/camps/by-organizations-and-weeks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          organizationIds,
          selectedWeeks: formData.weeks,
          interests: allInterests,
          gradeLevel: primaryGradeLevel
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('[Planner] Available camps by week:', result);
      
      // Store camps for next step
      setAvailableCamps(result.data || []);
      
    } catch (error) {
      console.error('[Planner] Error filtering camps by weeks:', error);
    } finally {
      setIsFilteringCamps(false);
    }
  };
  
  // Interest strength options from constants
  const interestStrengths = INTEREST_STRENGTHS;
  
  // Grade levels from constants
  const gradeLevels = GRADE_LEVELS;
  
  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number | null = null, field: keyof Child | null = null) => {
    const { name, value } = e.target;
    
    if (index !== null && field) {
      // Update child data
      const updatedChildren = [...formData.children];
      // Ensure that the field is a valid key of Child before assignment
      if (field === 'name' || field === 'grade') { // Add other valid fields if necessary
        updatedChildren[index] = {
          ...updatedChildren[index],
          [field]: value,
        };
      }
      
      setFormData({
        ...formData,
        children: updatedChildren,
      });
    } else {
      // Update regular form fields
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  // Toggle week selection
  const toggleWeek = (weekIndex: number) => {
    const updatedWeeks = [...formData.weeks];
    updatedWeeks[weekIndex] = !updatedWeeks[weekIndex];
    
    setFormData({
      ...formData,
      weeks: updatedWeeks,
    });
  };
  
  // Toggle interest selection with strength
  const toggleInterest = (childIndex: number, interestName: string, strength: string | null = null) => {
    const updatedChildren = [...formData.children];
    const currentInterests = updatedChildren[childIndex].interests || [];
    
    // Find if interest already exists
    const existingIndex = currentInterests.findIndex(i => 
      (typeof i === 'object' && i.name === interestName) || (typeof i === 'string' && i === interestName)
    );
    
    if (existingIndex !== -1) {
      const existingInterest = currentInterests[existingIndex];
      // If the same strength is clicked again, remove the interest
      if (typeof existingInterest === 'object' && existingInterest.strength === strength) {
        currentInterests.splice(existingIndex, 1);
      } else if (strength) {
        // Update with new strength or convert string to object
        currentInterests[existingIndex] = { name: interestName, strength };
      } else {
        // Remove if no strength provided (e.g. clicking the chip itself when it was just a string or had a strength)
        currentInterests.splice(existingIndex, 1);
      }
    } else if (strength) {
      // Add with strength
      currentInterests.push({ name: interestName, strength });
    } else {
      // Add as string (or with default/no strength if preferred)
      currentInterests.push(interestName);
    }
    
    updatedChildren[childIndex].interests = currentInterests;
    
    setFormData({
      ...formData,
      children: updatedChildren,
    });
  };
  
  // Add a child
  const addChild = () => {
    setFormData({
      ...formData,
      children: [...formData.children, { name: '', grade: '', interests: [] }],
    });
  };
  
  // Remove a child
  const removeChild = (index: number) => {
    if (formData.children.length > 1) {
      const updatedChildren = [...formData.children];
      updatedChildren.splice(index, 1);
      
      setFormData({
        ...formData,
        children: updatedChildren,
      });
    }
  };
  
  // Validate current step
  const validateCurrentStep = (): { isValid: boolean; message: string } => {
    switch (currentStep) {
      case 1: // Children step
        const missingGrades = formData.children.filter(child => !child.grade.trim());
        if (missingGrades.length > 0) {
          const childNames = missingGrades.map((child, index) => 
            child.name.trim() || `Child ${formData.children.indexOf(child) + 1}`
          ).join(', ');
          return {
            isValid: false,
            message: `Please select a grade level for: ${childNames}`
          };
        }
        return { isValid: true, message: '' };
      
      case 2: // Week selection
        const selectedWeeks = formData.weeks.filter(week => week).length;
        if (selectedWeeks === 0) {
          return {
            isValid: false,
            message: 'Please select at least one week for summer camp'
          };
        }
        return { isValid: true, message: '' };
      
      default:
        return { isValid: true, message: '' };
    }
  };

  // Search for organizations based on interests
  const searchOrganizationsByInterests = async () => {
    setIsSearchingOrganizations(true);
    try {
      // Extract all interests from all children
      const allInterests: string[] = [];
      const gradeValues: string[] = [];
      
      formData.children.forEach(child => {
        if (child.interests && Array.isArray(child.interests)) {
          child.interests.forEach(interest => {
            const interestName = typeof interest === 'string' ? interest : interest.name;
            if (interestName && !allInterests.includes(interestName)) {
              allInterests.push(interestName);
            }
          });
        }
        
        // Collect grade levels
        if (child.grade && child.grade.trim() && !gradeValues.includes(child.grade)) {
          gradeValues.push(child.grade);
        }
      });

      if (allInterests.length === 0) {
        console.log('[Planner] No interests selected, skipping organization search');
        return;
      }

      // For now, use the first child's grade level (can be enhanced later for multiple grades)
      const primaryGradeLevel = gradeValues.length > 0 ? gradeValues[0] : '';
      
      console.log('[Planner] Searching organizations for interests:', allInterests);
      console.log('[Planner] Grade level filter:', primaryGradeLevel);
      
      const response = await fetch('/api/organizations/by-interests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          interests: allInterests,
          gradeLevel: primaryGradeLevel 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('[Planner] Organizations found:', result);
      
      if (result.data && result.data.length > 0) {
        console.log('[Planner] =================================');
        console.log('[Planner] ORGANIZATIONS MATCHING INTERESTS');
        console.log('[Planner] =================================');
        result.data.forEach((org: any, index: number) => {
          console.log(`[Planner] ${index + 1}. ${org.name}`);
          console.log(`[Planner]    - Camps: ${org.camp_count}`);
          console.log(`[Planner]    - Matching Interests: ${org.matching_interests.join(', ')}`);
          if (org.sample_camps.length > 0) {
            console.log(`[Planner]    - Sample Camps: ${org.sample_camps.join(', ')}`);
          }
          console.log('[Planner] ---------------------------------');
        });
        console.log(`[Planner] Total organizations found: ${result.total}`);
        console.log(`[Planner] Categories searched: ${result.categories_found.join(', ')}`);
        if (result.grade_level) {
          console.log(`[Planner] Grade level filter: ${result.grade_level}`);
        }
        
        // Store organizations for next step
        setFoundOrganizations(result.data);
      } else {
        console.log('[Planner] No organizations found for the selected interests');
      }
    } catch (error) {
      console.error('[Planner] Error searching organizations:', error);
    } finally {
      setIsSearchingOrganizations(false);
    }
  };

  // Go to next step
  const nextStep = async () => {
    const validation = validateCurrentStep();
    if (validation.isValid) {
      // If we're on step 1, search for organizations before proceeding
      if (currentStep === 1) {
        await searchOrganizationsByInterests();
      }
      // If we're on step 2, filter camps by selected weeks before proceeding
      else if (currentStep === 2) {
        await filterCampsByWeeks();
      }
      // If we're on step 3, apply preferences filtering before proceeding
      else if (currentStep === 3) {
        await applyPreferencesFilter();
      }
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Go to previous step
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Handle priority reordering
  const movePriority = (id: PriorityFactorId, direction: 'up' | 'down') => {
    const currentPriorities = [...formData.priorities];
    const index = currentPriorities.indexOf(id);
    
    if (index === -1) return;
    
    // Calculate new index
    let newIndex = index;
    if (direction === 'up' && index > 0) {
      newIndex = index - 1;
    } else if (direction === 'down' && index < currentPriorities.length - 1) {
      newIndex = index + 1;
    }
    
    // No change needed
    if (newIndex === index) return;
    
    // Reorder the array
    const reordered = [...currentPriorities];
    const [removed] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, removed);
    
    setFormData({
      ...formData,
      priorities: reordered
    });
  };
  
  // Toggle required activity
  const toggleRequiredActivity = (activity: string) => {
    const currentRequired = [...formData.requiredActivities];
    const index = currentRequired.indexOf(activity);
    
    if (index === -1) {
      // Add the activity
      setFormData({
        ...formData,
        requiredActivities: [...currentRequired, activity]
      });
    } else {
      // Remove the activity
      currentRequired.splice(index, 1);
      setFormData({
        ...formData,
        requiredActivities: currentRequired
      });
    }
  };
  
  // Generate plan
  const generatePlan = () => {
    // Final validation before generating plan
    const missingGrades = formData.children.filter(child => !child.grade.trim());
    if (missingGrades.length > 0) {
      const childNames = missingGrades.map((child, index) => 
        child.name.trim() || `Child ${formData.children.indexOf(child) + 1}`
      ).join(', ');
      alert(`Please select a grade level for: ${childNames}`);
      return;
    }
    
    const selectedWeeks = formData.weeks.filter(week => week).length;
    if (selectedWeeks === 0) {
      alert('Please select at least one week for summer camp.');
      return;
    }
    
    console.log('[Planner] Generating plan with filtered data...');
    console.log('[Planner] Final filtered camps available:', finalFilteredCamps.length, 'weeks of data');
    
    // Store form data and filtered camps in sessionStorage for the results page
    try {
      // Assign IDs to children if they don't have them
      const formDataWithIds = {
        ...formData,
        children: formData.children.map((child, index) => ({
          ...child,
          id: index + 1
        }))
      };
      
      // Create comprehensive planner data
      const plannerData = {
        formData: formDataWithIds,
        filteredCamps: finalFilteredCamps,
        organizationsFound: foundOrganizations,
        availableCampsFromStep2: availableCamps,
        plannerMetadata: {
          timestamp: new Date().toISOString(),
          totalStepsCompleted: 4,
          usePreFilteredData: true
        }
      };
      
      const plannerDataString = JSON.stringify(plannerData);
      console.log('[Planner] Saving comprehensive planner data:', plannerData);
      
      // Use localStorage as a fallback if sessionStorage isn't available
      try {
        sessionStorage.setItem('plannerFormData', JSON.stringify(formDataWithIds)); // Keep original for backward compatibility
        sessionStorage.setItem('plannerFullData', plannerDataString); // New comprehensive data
      } catch (storageError) {
        console.warn('SessionStorage error, using localStorage instead:', storageError);
        localStorage.setItem('plannerFormData', JSON.stringify(formDataWithIds));
        localStorage.setItem('plannerFullData', plannerDataString);
      }
      
      // Navigate to results page
      window.location.href = '/planner/results';
    } catch (error) {
      console.error('Error saving planner data:', error);
      alert('There was an error saving your planner data. Please try again.');
    }
  };
  
  // Summer weeks - just for display purposes
  const summerWeeks: string[] = [
    'June 3 - June 9',
    'June 10 - June 16',
    'June 17 - June 23',
    'June 24 - June 30',
    'July 1 - July 7',
    'July 8 - July 14',
    'July 15 - July 21',
    'July 22 - July 28'
  ];
  
  return (
    <div className={styles.plannerPage}>
      <Banner 
        title="Smart Planner"
        description="Let us build the perfect summer schedule for your kids based on your preferences and their interests."
      />
      
      <div className="container">
        <div className={styles.wizardContainer}>
          {/* Wizard Progress */}
          <WizardProgress currentStep={currentStep} />
          
          {/* Wizard Content */}
          <div className={styles.wizardContent}>
            {/* Step 1: Add Children */}
            {currentStep === 1 && (
              <AddChildrenStep 
                formData={formData}
                availableInterests={availableInterests}
                interestStrengths={interestStrengths}
                gradeLevels={gradeLevels}
                handleInputChange={handleInputChange}
                toggleInterest={toggleInterest}
                removeChild={removeChild}
                addChild={addChild}
                categoriesLoading={categoriesLoading}
                categoriesError={categoriesError}
              />
            )}
            
            {/* Step 2: Set Availability */}
            {currentStep === 2 && (
              <WeekSelection
                summerWeeks={summerWeeks}
                formData={formData}
                toggleWeek={toggleWeek}
                handleInputChange={handleInputChange}
                setFormData={setFormData}
              />
            )}
            
            {/* Step 3: Preferences */}
            {currentStep === 3 && (
              <PreferencesForm
              formData={formData}
              priorityFactors={priorityFactors}
              handleInputChange={handleInputChange}
              movePriority={movePriority}
              />
            )}
            
            {/* Step 4: Review & Generate */}
            {currentStep === 4 && (
              <PlanReview
                formData={formData}
                priorityFactors={priorityFactors}
                interestStrengths={interestStrengths}
                generatePlan={generatePlan}
              />
            )}
          </div>
          
          {/* Wizard Navigation */}
          <WizardNavigation
            currentStep={currentStep}
            prevStep={prevStep}
            nextStep={nextStep}
            canProceed={validateCurrentStep().isValid && !isSearchingOrganizations && !isFilteringCamps && !isApplyingPreferences}
            validationMessage={validateCurrentStep().message}
            isLoading={isSearchingOrganizations || isFilteringCamps || isApplyingPreferences}
            loadingMessage={
              isSearchingOrganizations ? 'Searching Organizations...' : 
              isFilteringCamps ? 'Filtering Camps...' : 
              isApplyingPreferences ? 'Applying Preferences...' : ''
            }
          />
        </div>
      </div>
    </div>
  );
};

export default SmartPlannerPage;