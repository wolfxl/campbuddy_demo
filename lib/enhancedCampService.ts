import { supabase } from './supabase'
import { getFilteredCamps } from './campService'; // Direct import
import { 
  GroupedCamp, 
  CampSession, 
  CampFilters, 
  GroupedCampsResponse, 
} from './types'

/**
 * Updated version of getFilteredCamps to include location coordinates
 * This enhances the existing function with location coordinates for distance filtering
 */
export async function getFilteredCampsWithCoordinates(
  filters: Partial<CampFilters>,
  limit: number = 2000,
  offset: number = 0
): Promise<GroupedCampsResponse> {
  try {
    // First get the filtered camps using the existing function
    const response = await getFilteredCamps(filters, limit, offset);
    
    if (response.error || !response.data || response.data.length === 0) {
      return response;
    }
    
    // Extract all unique location names from the camps
    const allLocationNames = new Set<string>();
    response.data.forEach(camp => {
      camp.locations.forEach(location => {
        allLocationNames.add(location);
      });
    });
    
    // Fetch coordinates for all locations
    const { data: locationsData, error: locationsError } = await supabase
      .from('locations')
      .select(`
        id,
        name,
        latitude,
        longitude
      `)
      .in('name', Array.from(allLocationNames));
    
    if (locationsError) {
      console.error('Error fetching location coordinates:', locationsError);
      // Continue without coordinates rather than failing completely
    }
    
    // Create a map of location name to coordinates
    const locationCoords: { [key: string]: { latitude: number; longitude: number } } = {};
    locationsData?.forEach(location => {
      if (location.name && location.latitude && location.longitude) {
        locationCoords[location.name] = {
          latitude: location.latitude,
          longitude: location.longitude
        };
      }
    });
    
    // Add coordinates to each camp
    const enhancedCamps = response.data.map(camp => {
      const location_coords = camp.locations
        .map(locationName => {
          const coords = locationCoords[locationName];
          if (coords) {
            return {
              name: locationName,
              latitude: coords.latitude,
              longitude: coords.longitude
            };
          }
          return null;
        })
        .filter(Boolean);
      
      return {
        ...camp,
        location_coords: location_coords.length > 0 ? location_coords : undefined
      };
    });
    
    return {
      ...response,
      data: enhancedCamps
    };
  } catch (error) {
    console.error('Unexpected error fetching camps with coordinates:', error);
    return { 
      data: null, 
      error: { message: 'Failed to fetch camps with coordinates', details: String(error) } 
    };
  }
}
