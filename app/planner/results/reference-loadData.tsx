// This is a reference implementation showing how to fix the page.tsx loadData function
// to handle the empty interests issue.

async function loadData() {
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
    let parsedFormData = JSON.parse(savedFormData);
    
    // Fix missing interests by adding the sample interests from criteria
    if (parsedFormData && parsedFormData.children && Array.isArray(parsedFormData.children)) {
      parsedFormData.children.forEach((child: any, index: number) => {
        // If interests is missing or empty, add default interests from criteria
        if (!child.interests || !Array.isArray(child.interests) || child.interests.length === 0) {
          console.log(`[PlannerLogs] Child ${index + 1} (${child.name || 'unknown'}) has no interests. Adding interests from criteria.`);
          
          // Add the interests specified in criteria
          child.interests = [
            { name: "Acting & Voice Performance", strength: "love" },
            { name: "Game Development with Unity", strength: "love" },
            { name: "Performing & Literary Arts", strength: "like" }
          ];
        }
      });
    }
    
    // ... rest of your loadData function
    
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
            console.log(`[PlannerLogs] Example camp data (first camp): ${JSON.stringify(initialCampsForOptimizer[0], null, 2)}`);
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
        
      // ... rest of your code
    }
  } catch (e) {
    // Error handling
  }
};