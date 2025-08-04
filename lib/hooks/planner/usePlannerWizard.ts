import { useState } from 'react';

/**
 * Hook for managing planner wizard state and navigation
 */
export const usePlannerWizard = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSearchingOrganizations, setIsSearchingOrganizations] = useState<boolean>(false);
  const [isFilteringCamps, setIsFilteringCamps] = useState<boolean>(false);
  const [isApplyingPreferences, setIsApplyingPreferences] = useState<boolean>(false);

  // Derived state
  const isLoading = isSearchingOrganizations || isFilteringCamps || isApplyingPreferences;
  
  const getLoadingMessage = () => {
    if (isSearchingOrganizations) return 'Searching Organizations...';
    if (isFilteringCamps) return 'Filtering Camps...';
    if (isApplyingPreferences) return 'Applying Preferences...';
    return '';
  };

  // Navigation functions
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Loading state setters
  const setSearchingOrganizations = (loading: boolean) => {
    setIsSearchingOrganizations(loading);
  };

  const setFilteringCamps = (loading: boolean) => {
    setIsFilteringCamps(loading);
  };

  const setApplyingPreferences = (loading: boolean) => {
    setIsApplyingPreferences(loading);
  };

  return {
    // State
    currentStep,
    isLoading,
    isSearchingOrganizations,
    isFilteringCamps,
    isApplyingPreferences,
    
    // Computed
    loadingMessage: getLoadingMessage(),
    
    // Actions
    nextStep,
    prevStep,
    goToStep,
    setSearchingOrganizations,
    setFilteringCamps,
    setApplyingPreferences
  };
};