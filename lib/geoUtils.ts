/**
 * Utility functions for geographic calculations
 */

/**
 * Calculate distance between two points using the Haversine formula
 * @param lat1 Latitude of point 1 in degrees
 * @param lon1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lon2 Longitude of point 2 in degrees
 * @returns Distance in miles
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Convert coordinates from degrees to radians
  const toRad = (value: number) => (value * Math.PI) / 180;
  const radLat1 = toRad(lat1);
  const radLon1 = toRad(lon1);
  const radLat2 = toRad(lat2);
  const radLon2 = toRad(lon2);

  // Haversine formula
  const dLat = radLat2 - radLat1;
  const dLon = radLon2 - radLon1;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Earth's radius in miles
  const earthRadius = 3958.8;
  
  // Distance in miles
  return earthRadius * c;
}

/**
 * Geocode a zipcode to get latitude and longitude
 * @param zipcode The zipcode to geocode
 * @returns Promise with geocoding result or null if not found
 */
export async function geocodeZipcode(zipcode: string): Promise<{
  latitude: number;
  longitude: number;
  city: string;
  state: string;
} | null> {
  try {
    // Use our own API endpoint that handles caching and fallbacks
    const response = await fetch(`/api/geocode?zipcode=${zipcode}`);
    
    if (!response.ok) {
      console.error(`Geocoding error: ${response.status} ${response.statusText}`);
      // Check if response still has usable fallback data
      const errorData = await response.json();
      if (errorData.fallback && errorData.fallback.latitude && errorData.fallback.longitude) {
        console.log(`Using fallback geocoding data for ${zipcode}:`, errorData.fallback);
        return {
          latitude: errorData.fallback.latitude,
          longitude: errorData.fallback.longitude,
          city: errorData.fallback.city || 'Unknown',
          state: errorData.fallback.state || 'XX'
        };
      }
      
      // If no fallback in API response, use hardcoded Frisco coordinates
      // This ensures location filtering can still work
      if (zipcode === '75034') {
        console.log(`Using hardcoded coordinates for ${zipcode}`);
        return {
          latitude: 33.1360792,
          longitude: -96.8368919,
          city: 'Frisco',
          state: 'TX'
        };
      }
      return null;
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error(`Geocoding error: ${data.error}`);
      // Check for fallback data
      if (data.fallback) {
        console.log(`Using fallback geocoding data for ${zipcode}:`, data.fallback);
        return {
          latitude: data.fallback.latitude,
          longitude: data.fallback.longitude,
          city: data.fallback.city || 'Unknown',
          state: data.fallback.state || 'XX'
        };
      }
      return null;
    }
    
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      state: data.state
    };
  } catch (error) {
    console.error('Error geocoding zipcode:', error);
    // Last resort fallback
    if (zipcode === '75034') {
      return {
        latitude: 33.1360792,
        longitude: -96.8368919,
        city: 'Frisco',
        state: 'TX'
      };
    }
    return null;
  }
}

/**
 * Check if a location is within the specified radius of a zipcode
 * @param locationLat Location latitude
 * @param locationLon Location longitude
 * @param zipcode Center zipcode
 * @param radiusMiles Radius in miles
 * @returns Promise that resolves to boolean indicating if location is within radius
 */
export async function isLocationWithinRadius(
  locationLat: number,
  locationLon: number,
  zipcode: string,
  radiusMiles: number
): Promise<boolean> {
  try {
    // First geocode the zipcode to get its coordinates
    const geocodeResult = await geocodeZipcode(zipcode);
    
    if (!geocodeResult) {
      console.error(`Could not geocode zipcode: ${zipcode}`);
      return true; // Default to including locations if geocoding fails
    }
    
    // Calculate distance between zipcode and location
    const distance = calculateDistance(
      geocodeResult.latitude,
      geocodeResult.longitude,
      locationLat,
      locationLon
    );
    
    // Check if distance is within radius
    return distance <= radiusMiles;
  } catch (error) {
    console.error('Error checking if location is within radius:', error);
    return true; // Default to including locations if check fails
  }
}

/**
 * Get coordinates for a location name using geocoding
 * @param locationName The location name to geocode
 * @returns Promise with geocoding result or null if not found
 */
export async function geocodeLocationName(locationName: string): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  try {
    // Use Nominatim geocoding (free and no API key required)
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`;
    const nominatimResponse = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'CampPlanner/1.0'  // Required by Nominatim
      }
    });
    
    if (!nominatimResponse.ok) {
      throw new Error('Geocoding API error');
    }
    
    const nominatimData = await nominatimResponse.json();
    
    if (nominatimData && nominatimData.length > 0) {
      const result = nominatimData[0];
      
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding location name:', error);
    return null;
  }
}