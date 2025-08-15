import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClientScheduleOptimizer } from '@/lib/client/planner';
import { ScheduleOption } from '@/lib/algorithm/types';
import { GroupedCamp, CampSession } from '@/lib/types';

/**
 * Fetch camps from API with interest filtering
 */
async function fetchCampsWithInterests(parsedFormData: any): Promise<GroupedCamp[]> {
  // Extract all interests from all children to filter camps initially
  const allInterests = parsedFormData.children.flatMap((child: any) => 
    child.interests && Array.isArray(child.interests) 
      ? child.interests.map((interest: any) => 
          typeof interest === 'string' ? interest : interest.name
        )
      : []
  );
  
  // Create unique list of interests
  const uniqueInterests = [...new Set(allInterests)];
  
  // Build query string with all interests
  const queryParams = new URLSearchParams();
  uniqueInterests.forEach(interest => {
    queryParams.append('interests', interest);
  });
  
  console.log(`[PlannerLogs] Filtering initial camps by interests: ${uniqueInterests.join(', ')}`);
  
  const campsResponse = await fetch(`/api/camps?${queryParams.toString()}`);
  if (!campsResponse.ok) {
    throw new Error(`Failed to fetch camps: ${campsResponse.status}`);
  }
  
  const apiResponse = await campsResponse.json();
  return apiResponse.data || [];
}

/**
 * PlannerResults component - useEffect implementation
 */
const usePlannerData = () => {
  const [formData, setFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [scheduleOptions, setScheduleOptions] = useState<ScheduleOption[]>([]);
  const [suggestedCamps, setSuggestedCamps] = useState<GroupedCamp[]>([]);
  const [optimizer, setOptimizer] = useState<ClientScheduleOptimizer | null>(null);
  
  useEffect(() => {
    // Prevent double execution
    if (hasLoaded) {
      console.log('[PlannerLogs] Effect already ran, skipping');
      return;
    }
    
    let mounted = true; // Prevent state updates if component unmounts
    
    const loadData = async () => {
      try {
        // Try to get form data from sessionStorage or localStorage
        let savedFormData = sessionStorage.getItem('plannerFormData');
        
        // Fallback to localStorage if not in sessionStorage
        if (!savedFormData) {
          console.log('[PlannerLogs] Form data not found in sessionStorage, trying localStorage');
          savedFormData = localStorage.getItem('plannerFormData');
        }
        
        if (!savedFormData) {
          console.error('[PlannerLogs] No plan data found in any storage');
          if (mounted) {
            setError('No plan data found. Please go back and fill out the planner form.');
            setIsLoading(false);
          }
          return;
        }
        
        console.log('[PlannerLogs] Retrieved form data from storage');
        const parsedFormData = JSON.parse(savedFormData);
        
        // Validate form data has the required structure
        if (!parsedFormData.children || !Array.isArray(parsedFormData.children) || 
            !parsedFormData.weeks || !Array.isArray(parsedFormData.weeks)) {
          console.error('[PlannerLogs] Invalid form data structure:', parsedFormData);
          if (mounted) {
            setError('The saved plan data is invalid. Please go back and try again.');
            setIsLoading(false);
          }
          return;
        }
        
        if (mounted) {
          setFormData(parsedFormData);
          setHasLoaded(true); // Mark as loaded to prevent re-run

          let initialCampsForOptimizer: GroupedCamp[] = [];
          let initialSessionsForOptimizer: { campId: number, sessions: CampSession[] }[] = [];
          const shouldFetchRealData = !parsedFormData.useMockData && !parsedFormData.disableAPICalls;

          if (shouldFetchRealData) {
            console.log('[PlannerLogs] Attempting to fetch initial camp and session data from API...');
            try {
              // Fetch camps with interest filtering
              initialCampsForOptimizer = await fetchCampsWithInterests(parsedFormData);
              
              console.log(`[PlannerLogs] Initial number of camps fetched: ${initialCampsForOptimizer.length}`);
              if (initialCampsForOptimizer.length > 0) {
                console.log(`[PlannerLogs] Example camp data (first camp): ${JSON.stringify(initialCampsForOptimizer[0].name)}`);
              }
              console.log('[PlannerLogs] Note: Session data loading is primarily handled by ClientScheduleOptimizer.');
            } catch (apiError) {
              console.error('[PlannerLogs] Error fetching initial data from API:', apiError);
              if (mounted) {
                setError('Failed to load live camp data. The planner might use fallback or mock data if available.');
              }
            }
          } else {
            console.log('[PlannerLogs] Skipping direct API calls for camps/sessions from results page. ClientScheduleOptimizer will manage data loading.');
          }
          
          const optimizerInstance = new ClientScheduleOptimizer(
            parsedFormData,
            initialCampsForOptimizer, 
            initialSessionsForOptimizer
          );
          setOptimizer(optimizerInstance);
          
          console.log('[PlannerLogs] Generating schedule options with ClientScheduleOptimizer...');
          const opts = await optimizerInstance.generateScheduleOptions();
          console.log('[PlannerLogs] Generated options from optimizer:', opts);
            
          if (!mounted) return; 
            
          if (opts && opts.length > 0) {
            setScheduleOptions(opts);
              
            // Generate additional suggestions
            try {
              console.log('[PlannerLogs] Generating additional camp suggestions...');
              const suggestions = optimizerInstance.getAdditionalSuggestions(6);
              setSuggestedCamps(suggestions);
              console.log(`[PlannerLogs] Generated ${suggestions.length} additional camp suggestions.`);
            } catch (suggestionError) {
              console.error('[PlannerLogs] Error generating additional suggestions:', suggestionError);
            }
          } else if (mounted) {
            console.warn('[PlannerLogs] No schedule options were generated by the optimizer.');
            setError('Could not generate any schedule options with the provided data. Please try adjusting your preferences or check if camps are available.');
          }
        } // End of if (mounted)
        
      } catch (e) {
        console.error('[PlannerLogs] Error in loadData setup:', e);
        if (mounted) {
            if (e instanceof Error) {
                setError(`Error loading plan data: ${e.message}`);
            } else {
                setError('An unknown error occurred while loading plan data.');
            }
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    
    return () => {
      console.log('[PlannerLogs] PlannerResultsPage unmounting, cleanup initiated.');
      mounted = false;
    };
  }, [hasLoaded]); // Effect runs when hasLoaded changes, typically once after initial load.
  
  return {
    formData,
    isLoading,
    error,
    scheduleOptions,
    suggestedCamps,
    optimizer
  };
}

export { usePlannerData, fetchCampsWithInterests };