// Modified loadData function to fetch initial camps with interest filtering
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

      // Extract and set home location from form data
      if (parsedFormData.location) {
        getZipcodeCoordinates(parsedFormData.location).then(coords => {
          if (coords && mounted) {
            setHomeLocation(coords);
            console.log('[PlannerLogs] Home location set:', coords);
          }
        });
      }

      let initialCampsForOptimizer: GroupedCamp[] = [];
      let initialSessionsForOptimizer: { campId: number, sessions: CampSession[] }[] = [];
      const shouldFetchRealData = !parsedFormData.useMockData && !parsedFormData.disableAPICalls;

      if (shouldFetchRealData) {
        console.log('[PlannerLogs] Attempting to fetch initial camp and session data from API...');
        try {
          // Extract all interests from all children to filter camps initially
          const allInterests = parsedFormData.children.flatMap(child => 
            child.interests && Array.isArray(child.interests) 
              ? child.interests.map(interest => 
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
          initialCampsForOptimizer = apiResponse.data || [];
          
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
        initialSessionsForOptimizer,
        shouldFetchRealData
      );
      setOptimizer(optimizerInstance);
      
      console.log('[PlannerLogs] Generating schedule options with ClientScheduleOptimizer...');
      const opts = await optimizerInstance.generateScheduleOptions();
      console.log('[PlannerLogs] Generated options from optimizer:', opts);
        
      if (!mounted) return; 
        
      if (opts && opts.length > 0) {
        setScheduleOptions(opts);
        setSelectedScheduleId(opts[0].scheduleId);
          
        const selectedOption = opts[0];
        if (selectedOption && mounted) {
          console.log('[PlannerLogs] Converting first option to display format:', selectedOption);
          const convertedPlan = convertScheduleToDisplayFormat(selectedOption, parsedFormData);
          // console.log('[PlannerLogs] Conversion result:', convertedPlan); // This can be verbose
          if (convertedPlan) {
            setPlan(convertedPlan);
             // Update map locations after plan is set
            const newMapLocations = convertPlanToMapLocations(convertedPlan);
            setMapLocations(newMapLocations);
            console.log('[PlannerLogs] Map locations updated after plan conversion.');
          } else {
            console.error('[PlannerLogs] Failed to convert plan - conversion returned null');
            setError('There was an issue preparing the plan for display.');
          }

          // Generate additional suggestions
          try {
            console.log('[PlannerLogs] Generating additional camp suggestions...');
            const suggestions = optimizerInstance.getAdditionalSuggestions(6);
            setSuggestedCamps(suggestions);
            console.log(`[PlannerLogs] Generated ${suggestions.length} additional camp suggestions.`);
          } catch (suggestionError) {
            console.error('[PlannerLogs] Error generating additional suggestions:', suggestionError);
          }
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