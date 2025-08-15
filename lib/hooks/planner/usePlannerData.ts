import { useState, ChangeEvent } from 'react';
import { GRADE_LEVELS, INTEREST_STRENGTHS, PRIORITY_FACTORS, TIME_PREFERENCES, TRANSPORTATION_OPTIONS } from '@/lib/constants/planner';

// Types
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

/**
 * Hook for managing planner form data
 */
export const usePlannerData = () => {
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

  // Handle input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, 
    index: number | null = null, 
    field: keyof Child | null = null
  ) => {
    const { name, value } = e.target;
    
    if (index !== null && field) {
      // Update child data
      const updatedChildren = [...formData.children];
      if (field === 'name' || field === 'grade') {
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
        // Remove if no strength provided
        currentInterests.splice(existingIndex, 1);
      }
    } else if (strength) {
      // Add with strength
      currentInterests.push({ name: interestName, strength });
    } else {
      // Add as string
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

  // Update form data directly
  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    // State
    formData,
    
    // Constants for components
    gradeLevels: GRADE_LEVELS,
    interestStrengths: INTEREST_STRENGTHS,
    priorityFactors: PRIORITY_FACTORS,
    timePreferences: TIME_PREFERENCES,
    transportationOptions: TRANSPORTATION_OPTIONS,
    
    // Actions
    handleInputChange,
    toggleWeek,
    toggleInterest,
    addChild,
    removeChild,
    movePriority,
    toggleRequiredActivity,
    updateFormData,
    setFormData
  };
};