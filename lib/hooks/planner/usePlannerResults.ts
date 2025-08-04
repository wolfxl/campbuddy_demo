import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScheduleOption } from '@/lib/algorithm/types';
import { GroupedCamp } from '@/lib/types';
import { PlanState } from '@/lib/types/planner';
import { Coordinates } from '@/lib/services/GeocodingService';
import { ClientScheduleOptimizer } from '@/lib/client/planner';
import { PlanDataService } from '@/lib/services/planner/PlanDataService';
import { ScheduleConverterService } from '@/lib/services/planner/ScheduleConverterService';
import { MapLocationService } from '@/lib/services/planner/MapLocationService';
import { GeocodingService } from '@/lib/services/GeocodingService';

/**
 * Main hook for planner results page state management
 */
export const usePlannerResults = () => {
  const router = useRouter();
  
  // Core state
  const [formData, setFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  
  // Schedule state
  const [scheduleOptions, setScheduleOptions] = useState<ScheduleOption[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [plan, setPlan] = useState<PlanState | null>(null);
  
  // Additional data
  const [suggestedCamps, setSuggestedCamps] = useState<GroupedCamp[]>([]);
  const [optimizer, setOptimizer] = useState<ClientScheduleOptimizer | null>(null);
  const [mapLocations, setMapLocations] = useState<any[]>([]);
  const [homeLocation, setHomeLocation] = useState<Coordinates | null>(null);
  
  // Load data and generate schedule
  useEffect(() => {
    // Prevent double execution
    if (hasLoaded) {
      console.log('[usePlannerResults] Effect already ran, skipping');
      return;
    }
    
    let mounted = true; // Prevent state updates if component unmounts
    
    const loadData = async () => {
      try {
        // Load planner data using service
        const plannerData = PlanDataService.loadPlannerData();
        
        if (!plannerData) {
          if (mounted) {
            setError('No plan data found. Please go back and fill out the planner form.');
            setIsLoading(false);
          }
          return;
        }
        
        // Validate form data
        const validation = PlanDataService.validateFormData(plannerData.formData);
        if (!validation.isValid) {
          if (mounted) {
            setError(validation.error || 'Invalid plan data. Please try again.');
            setIsLoading(false);
          }
          return;
        }
        
        if (mounted) {
          setFormData(plannerData.formData);
          setHasLoaded(true);
          
          // Set home location
          const homeZip = PlanDataService.extractHomeLocation(plannerData.formData);
          if (homeZip) {
            const coords = await GeocodingService.getZipcodeCoordinates(homeZip);
            if (coords && mounted) {
              setHomeLocation(coords);
              console.log('[usePlannerResults] Home location set:', coords);
            }
          }
        }
        
        // Generate schedules
        await generateSchedules(plannerData, mounted);
        
      } catch (err) {
        console.error('[usePlannerResults] Error loading plan data:', err);
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
          setError(`There was an error generating your plan: ${errorMessage}. Please try again.`);
          setIsLoading(false);
        }
      }
    };
    
    const generateSchedules = async (plannerData: any, mounted: boolean) => {
      try {
        console.log('[usePlannerResults] Creating optimizer with form data');
        
        let initialCampsForOptimizer = [];
        
        if (PlanDataService.shouldUsePreFilteredData(plannerData.preFilteredCamps)) {
          // Use pre-filtered camps from planner steps
          console.log('[usePlannerResults] Using pre-filtered camps from planner steps');
          initialCampsForOptimizer = ScheduleConverterService.convertPreFilteredCampsToOptimizerFormat(
            plannerData.preFilteredCamps
          );
          console.log('[usePlannerResults] Converted to optimizer format:', initialCampsForOptimizer.length, 'total camps');
        } else {
          console.log('[usePlannerResults] No pre-filtered camps available, optimizer will fetch data');
        }
        
        const optimizerInstance = new ClientScheduleOptimizer(
          plannerData.formData,
          initialCampsForOptimizer, 
          []
        );
        
        if (mounted) setOptimizer(optimizerInstance);
        
        console.log('[usePlannerResults] Generating schedule options');
        const options = await optimizerInstance.generateScheduleOptions();
        console.log('[usePlannerResults] Generated options:', options);
        
        if (!mounted) return;
        
        if (options && options.length > 0) {
          setScheduleOptions(options);
          setSelectedScheduleId(options[0].scheduleId);
          
          // Convert first option to display format
          const selectedOption = options[0];
          if (selectedOption && mounted) {
            console.log('[usePlannerResults] Converting first option to display format:', selectedOption);
            const convertedPlan = ScheduleConverterService.convertScheduleToDisplayFormat(
              selectedOption, 
              plannerData.formData
            );
            console.log('[usePlannerResults] Conversion result:', convertedPlan);
            
            if (convertedPlan) {
              setPlan(convertedPlan);
              
              // Update map locations when plan is set
              try {
                const locations = await MapLocationService.convertPlanToMapLocations(convertedPlan);
                if (mounted) {
                  setMapLocations(locations);
                  console.log('[usePlannerResults] Map locations set successfully:', locations);
                }
              } catch (error) {
                console.error('[usePlannerResults] Error setting map locations:', error);
              }
              
              console.log('[usePlannerResults] Plan state set successfully');
              
              // Generate additional suggestions
              try {
                const suggestions = optimizerInstance.getAdditionalSuggestions(6);
                if (mounted) {
                  setSuggestedCamps(suggestions);
                  console.log('[usePlannerResults] Generated camp suggestions:', suggestions.length);
                }
              } catch (suggestionError) {
                console.warn('[usePlannerResults] Could not generate camp suggestions:', suggestionError);
              }
            } else {
              console.error('[usePlannerResults] Failed to convert plan - conversion returned null');
            }
          }
        } else {
          console.warn('[usePlannerResults] No schedule options generated');
          if (mounted) {
            setError('No suitable camps found matching your criteria. Please try different preferences.');
          }
        }
      } catch (algorithmError) {
        console.error('[usePlannerResults] Algorithm error:', algorithmError);
        if (mounted) {
          const errorMessage = algorithmError instanceof Error 
            ? algorithmError.message 
            : 'An unknown error occurred during schedule generation.';
          setError(`Error generating schedule: ${errorMessage}`);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [hasLoaded]); // Only depends on hasLoaded to prevent re-runs
  
  // Change selected schedule
  const selectSchedule = async (scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
    const selected = scheduleOptions.find(option => option.scheduleId === scheduleId);
    
    if (selected && formData) {
      const convertedPlan = ScheduleConverterService.convertScheduleToDisplayFormat(selected, formData);
      if (convertedPlan) {
        setPlan(convertedPlan);
        
        // Update map locations when plan changes
        try {
          const locations = await MapLocationService.convertPlanToMapLocations(convertedPlan);
          setMapLocations(locations);
          console.log('[usePlannerResults] Map locations updated for new schedule:', locations);
        } catch (error) {
          console.error('[usePlannerResults] Error updating map locations for new schedule:', error);
        }
      }
    }
  };
  
  // Toggle camp lock status
  const toggleLock = (weekId: number, campId: string | number) => {
    setPlan(prevPlan => {
      if (!prevPlan) return null;
      
      const updatedWeeks = prevPlan.weeks.map(week => {
        if (week.id === weekId) {
          const updatedCamps = week.camps.map(camp => {
            if (camp.id === campId) {
              return { ...camp, locked: !camp.locked };
            }
            return camp;
          });
          return { ...week, camps: updatedCamps };
        }
        return week;
      });
      
      return { ...prevPlan, weeks: updatedWeeks };
    });
  };
  
  // Navigation helper
  const goBackToPlanner = () => {
    // Clear form data and redirect to planner
    sessionStorage.removeItem('plannerFormData');
    sessionStorage.removeItem('plannerFullData');
    router.push('/planner');
  };
  
  return {
    // State
    formData,
    isLoading,
    error,
    scheduleOptions,
    selectedScheduleId,
    plan,
    suggestedCamps,
    optimizer,
    mapLocations,
    homeLocation,
    
    // Actions
    selectSchedule,
    toggleLock,
    goBackToPlanner
  };
};