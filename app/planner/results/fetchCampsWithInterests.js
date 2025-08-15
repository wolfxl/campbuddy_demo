// This file contains the function to apply interest-based filtering
// when loading camps data from the API. Use this in the useEffect of
// the planner results page to filter camps by interests.

/**
 * Fetch camps with interest filtering
 */
export async function fetchCampsWithInterests(formData: any) {
  try {
    // Extract all interests from all children
    const allInterests = formData.children.flatMap(child => 
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
    console.log(`[PlannerLogs] API returned ${apiResponse.data?.length || 0} camps matching interests`);
    
    return apiResponse.data || [];
  } catch (error) {
    console.error('[PlannerLogs] Error fetching camps with interests:', error);
    throw error; // Re-throw to handle in the calling function
  }
}

/**
 * This function can be used in the PlannerResultsPage component like this:
 * 
 * // Inside the loadData function of useEffect
 * if (shouldFetchRealData) {
 *   console.log('[PlannerLogs] Attempting to fetch initial camp and session data from API...');
 *   try {
 *     // Fetch camps with interest filtering
 *     initialCampsForOptimizer = await fetchCampsWithInterests(parsedFormData);
 *     
 *     console.log(`[PlannerLogs] Initial number of camps fetched: ${initialCampsForOptimizer.length}`);
 *     // Rest of the code...
 *   } catch (apiError) {
 *     console.error('[PlannerLogs] Error fetching initial data from API:', apiError);
 *     // Error handling...
 *   }
 * }