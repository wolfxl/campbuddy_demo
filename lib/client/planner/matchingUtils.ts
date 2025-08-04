import { GroupedCamp, CampSession } from '../../types';
import { CampFilterCriteria, PlannerFormData } from '../../algorithm/types';
import { gradeToNumber, parseInterests } from '../../algorithm/utils';
import { isLocationWithinRadius, geocodeLocationName } from '../../geoUtils';

// Cache for location radius checks to avoid repeated API calls
const locationRadiusCache: Record<string, boolean> = {};

/**
 * Find a session that matches the given week
 */
export function findMatchingSession(sessions: CampSession[], weekInfo: any): CampSession | null {
  return sessions.find(session => 
    datesOverlap(session.start_date, session.end_date, weekInfo.start, weekInfo.end)
  ) || sessions[0] || null;
}

/**
 * Check if date ranges overlap
 */
export function datesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  try {
    const s1 = new Date(start1), e1 = new Date(end1);
    const s2 = new Date(start2), e2 = new Date(end2);
    return !isNaN(s1.getTime()) && !isNaN(e1.getTime()) && !isNaN(s2.getTime()) && !isNaN(e2.getTime()) && s1 <= e2 && s2 <= e1;
  } catch {
    return true;
  }
}

/**
 * Check if a camp's grade range matches a child's grade
 */
export function checkGradeMatch(camp: GroupedCamp, child: any): boolean {
  const childGrade = gradeToNumber(child.grade);
  return childGrade >= camp.min_grade && childGrade <= camp.max_grade;
}

/**
 * Check if a camp's price matches the budget
 */
export function checkPriceMatch(camp: GroupedCamp, filterCriteria: CampFilterCriteria): boolean {
  return !filterCriteria.maxWeeklyCost || filterCriteria.maxWeeklyCost <= 0 || 
         camp.price_numeric <= filterCriteria.maxWeeklyCost;
}

/**
 * Check if a camp's location matches the location preference
 */
export async function checkLocationMatch(camp: GroupedCamp, formData: PlannerFormData): Promise<boolean> {
  // If no location specified, all locations match
  if (!formData.location?.trim()) return true;
  
  const preferredLocation = formData.location.toLowerCase().trim();
  const radiusMiles = parseInt(formData.distance) || 10; // Parse as number with default 10 miles
  
  console.log(`[LOCATION FILTER] Checking camp ${camp.name} against location ${preferredLocation} with ${radiusMiles} mile radius`);
  
  // First do a quick text-based match (backward compatibility)
  const textMatch = camp.locations.some(location => 
    location.toLowerCase().includes(preferredLocation)
  );
  
  // If there's a text match, or we're not using radius filtering, return true
  if (textMatch) {
    console.log(`[LOCATION FILTER] Camp ${camp.name} matches location by text: ${preferredLocation}`);
    return true;
  }
  
  if (radiusMiles <= 0) {
    console.log(`[LOCATION FILTER] Radius filtering disabled (${radiusMiles} miles)`);
    return true;
  }
  
  // If user entered a zipcode (5 digits), check the distance
  const isZipcode = /^\d{5}$/.test(preferredLocation);
  if (!isZipcode) {
    console.log(`[LOCATION FILTER] Not a zipcode: ${preferredLocation}, skipping radius check`);
    return true; // Can't do radius check for non-zipcodes
  }
  
  console.log(`[LOCATION FILTER] Checking ${camp.locations.length} locations for camp ${camp.name} against zipcode ${preferredLocation} (${radiusMiles} miles)`);
  
  // Check each location in the database associated with the camp
  // The locations should already have lat/lon in the database
  for (const locationName of camp.locations) {
    // Check cache first to avoid repeated API calls
    const cacheKey = `${locationName}-${preferredLocation}-${radiusMiles}`;
    if (locationRadiusCache[cacheKey] !== undefined) {
      if (locationRadiusCache[cacheKey]) {
        console.log(`[LOCATION FILTER] MATCH (cached): ${locationName} to ${preferredLocation} (${radiusMiles} miles)`);
        return true;
      }
      console.log(`[LOCATION FILTER] NO MATCH (cached): ${locationName} to ${preferredLocation} (${radiusMiles} miles)`);
      continue; // Check next location if this one doesn't match
    }
    
    try {
      // Get latitude and longitude from the camp's location record
      // First check if it's available in the camp data
      const locationCoords = camp.location_coords?.find(loc => loc.name === locationName);
      
      if (locationCoords && locationCoords.latitude && locationCoords.longitude) {
        // Use the coordinates from the camp data
        console.log(`[LOCATION FILTER] Using coordinates for ${locationName}: ${locationCoords.latitude}, ${locationCoords.longitude}`);
        
        // Check if location is within radius
        const isWithinRadius = await isLocationWithinRadius(
          locationCoords.latitude, 
          locationCoords.longitude, 
          preferredLocation, 
          radiusMiles
        );
        
        console.log(`[LOCATION FILTER] ${isWithinRadius ? 'MATCH' : 'NO MATCH'}: ${locationName} to ${preferredLocation} (${radiusMiles} miles)`);
        
        // Cache the result
        locationRadiusCache[cacheKey] = isWithinRadius;
        
        if (isWithinRadius) return true;
      } else {
        // If no coordinates in camp data, try to geocode the location
        console.log(`[LOCATION FILTER] No stored coordinates for ${locationName}, geocoding...`);
        
        const geocodedCoords = await geocodeLocationName(locationName);
        if (geocodedCoords) {
          console.log(`[LOCATION FILTER] Geocoded ${locationName}: ${geocodedCoords.latitude}, ${geocodedCoords.longitude}`);
          
          const isWithinRadius = await isLocationWithinRadius(
            geocodedCoords.latitude, 
            geocodedCoords.longitude, 
            preferredLocation, 
            radiusMiles
          );
          
          console.log(`[LOCATION FILTER] ${isWithinRadius ? 'MATCH' : 'NO MATCH'}: ${locationName} to ${preferredLocation} (${radiusMiles} miles)`);
          
          // Cache the result
          locationRadiusCache[cacheKey] = isWithinRadius;
          
          if (isWithinRadius) return true;
        } else {
          // Fallback: Mark location as outside radius if coordinates aren't available
          console.log(`[LOCATION FILTER] Could not geocode ${locationName}, marking as outside radius`);
          locationRadiusCache[cacheKey] = false;
        }
      }
    } catch (error) {
      console.error(`[LOCATION FILTER] Error checking location distance for ${locationName}:`, error);
      continue; // Try next location instead of defaulting to true
    }
  }
  
  // None of the locations are within radius
  console.log(`[LOCATION FILTER] Camp ${camp.name} FAILED location filter - all locations outside ${radiusMiles} mile radius of ${preferredLocation}`);
  return false;
}

/**
 * Check if a camp's categories match any of the child's interests
 */
export function checkCategoryMatch(camp: GroupedCamp, child: any): boolean {
  const interests = parseInterests(child.interests);
  return camp.categories.some(category => 
    interests.some(interest => interest.name.toLowerCase() === category.toLowerCase())
  );
}

/**
 * Check if a camp meets all required activities
 */
export function checkRequiredActivitiesMatch(camp: GroupedCamp, filterCriteria: CampFilterCriteria): boolean {
  if (!filterCriteria.requiredActivities?.length) return true;
  return filterCriteria.requiredActivities.every(required => 
    camp.categories.some(category => category.toLowerCase().includes(required.toLowerCase()))
  );
}