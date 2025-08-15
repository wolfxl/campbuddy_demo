import { GroupedCamp, CampSession } from '../../types';

/**
 * Fetch camps from API with interest filtering
 * With enhanced location coordinates for distance filtering
 */
export async function fetchFilteredCamps(interests: string[]): Promise<GroupedCamp[]> {
  try {
    // Create unique list of interests
    const uniqueInterests = [...new Set(interests)];
    
    // Build query string with all interests
    const queryParams = new URLSearchParams();
    uniqueInterests.forEach(interest => {
      queryParams.append('interests', interest);
    });
    
    // Add a flag to include location coordinates
    queryParams.append('includeCoordinates', 'true');
    
    console.log(`[PlannerLogs] Filtering camps by interests: ${uniqueInterests.join(', ')} with location coordinates`);
    
    const campsResponse = await fetch(`/api/camps?${queryParams.toString()}`);
    if (!campsResponse.ok) {
      throw new Error(`Failed to fetch camps: ${campsResponse.status}`);
    }
    
    const apiResponse = await campsResponse.json();
    console.log(`[PlannerLogs] API returned ${apiResponse.data?.length || 0} camps matching interests`);
    return apiResponse.data || [];
  } catch (error) {
    console.error('[PlannerLogs] Error fetching filtered camps:', error);
    return [];
  }
}