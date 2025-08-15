import { PlanState } from '@/lib/types/planner';
import { GeocodingService } from '@/lib/services/GeocodingService';
import { ICODE_MCKINNEY_COORDS } from '@/lib/constants/planner';

/**
 * Service for processing map location data from plans
 */
export class MapLocationService {
  
  /**
   * Convert plan data to map locations format with coordinates
   */
  static async convertPlanToMapLocations(plan: PlanState): Promise<any[]> {
    const locationMap = new Map();
    
    // First, collect all unique location names from the plan
    const locationNames = new Set<string>();
    plan.weeks.forEach(week => {
      week.camps.forEach(camp => {
        locationNames.add(camp.location);
      });
    });
    
    // Fetch actual location data from the database
    const locationData = await GeocodingService.fetchLocationData(Array.from(locationNames));
    console.log('[MapLocationService] Fetched location data:', locationData);
    
    // Process each week's camps to build location data
    plan.weeks.forEach(week => {
      week.camps.forEach(camp => {
        const child = plan.children.find(c => c.id === camp.childId);
        const locationKey = camp.location;
        
        if (!locationMap.has(locationKey)) {
          const locationInfo = this.findLocationInfo(locationKey, locationData);
          const coordinates = this.getLocationCoordinates(locationKey, locationInfo);
          
          locationMap.set(locationKey, {
            id: locationInfo?.id || `location-${locationMap.size + 1}`,
            name: locationKey,
            address: locationInfo?.formatted_address || locationInfo?.address || locationKey,
            city: locationInfo?.city || 'McKinney',
            state: locationInfo?.state || 'TX',
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            camps: [],
            isPlaceholder: !locationInfo // Mark if using fallback coordinates
          });
        }
        
        // Add camp to location
        const location = locationMap.get(locationKey);
        location.camps.push({
          id: camp.id,
          name: camp.name,
          organization: camp.organization,
          childName: child?.name,
          weekLabel: week.name
        });
      });
    });
    
    return Array.from(locationMap.values());
  }
  
  /**
   * Find location info from database results
   */
  private static findLocationInfo(locationKey: string, locationData: any[]): any | null {
    return locationData.find(loc => loc.name === locationKey) || null;
  }
  
  /**
   * Get coordinates for location with fallback
   */
  private static getLocationCoordinates(locationKey: string, locationInfo: any | null): { latitude: number; longitude: number } {
    if (locationInfo) {
      // Use actual database coordinates
      console.log(`[MapLocationService] Using database coordinates for ${locationKey}:`, locationInfo.latitude, locationInfo.longitude);
      return {
        latitude: Number(locationInfo.latitude),
        longitude: Number(locationInfo.longitude)
      };
    } else {
      // Fallback to default location with warning
      console.warn(`[MapLocationService] Location data not found for: ${locationKey}, using fallback coordinates`);
      return {
        latitude: ICODE_MCKINNEY_COORDS.lat,
        longitude: ICODE_MCKINNEY_COORDS.lng
      };
    }
  }
  
  /**
   * Validate map locations data
   */
  static validateMapLocations(locations: any[]): boolean {
    if (!Array.isArray(locations)) return false;
    
    return locations.every(location => 
      location.latitude && 
      location.longitude && 
      location.name &&
      Array.isArray(location.camps)
    );
  }
  
  /**
   * Get summary of map locations
   */
  static getLocationsSummary(locations: any[]): {
    totalLocations: number;
    totalCamps: number;
    placeholderCount: number;
  } {
    const totalLocations = locations.length;
    const totalCamps = locations.reduce((sum, loc) => sum + loc.camps.length, 0);
    const placeholderCount = locations.filter(loc => loc.isPlaceholder).length;
    
    return {
      totalLocations,
      totalCamps,
      placeholderCount
    };
  }
}