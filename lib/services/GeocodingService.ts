import { DEFAULT_COORDINATES, API_CONFIG } from '@/lib/constants/planner';

// Simple in-memory cache for geocoding results
const geocodingCache = new Map<string, any>();

export interface Coordinates {
  lat: number;
  lng: number;
  city: string;
}

export interface LocationData {
  id: string | number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
  camps?: any[];
  isPlaceholder?: boolean;
}

/**
 * Unified geocoding service with caching
 */
export class GeocodingService {
  
  /**
   * Get coordinates for a zipcode using geocoding API
   */
  static async getZipcodeCoordinates(zipcode: string): Promise<Coordinates | null> {
    const cacheKey = `zipcode_${zipcode}`;
    
    // Check cache first
    if (geocodingCache.has(cacheKey)) {
      console.log('Using cached coordinates for zipcode:', zipcode);
      return geocodingCache.get(cacheKey);
    }
    
    try {
      // Clean the zipcode - remove any non-numeric characters and ensure it's 5 digits
      const cleanZipcode = zipcode.replace(/\D/g, '').slice(0, 5);
      
      if (cleanZipcode.length !== 5) {
        console.warn('Invalid zipcode format:', zipcode);
        return DEFAULT_COORDINATES;
      }
      
      console.log('Geocoding zipcode:', cleanZipcode);
      
      // Use OpenStreetMap Nominatim API for geocoding (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&postalcode=${cleanZipcode}&limit=1`,
        {
          headers: {
            'User-Agent': API_CONFIG.GEOCODING_USER_AGENT
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const coordinates = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          city: this.extractCityFromDisplayName(result.display_name)
        };
        
        // Cache the result
        geocodingCache.set(cacheKey, coordinates);
        console.log('Geocoding successful:', coordinates);
        return coordinates;
      } else {
        console.warn('No results found for zipcode:', cleanZipcode);
        
        // Cache the fallback result too
        geocodingCache.set(cacheKey, DEFAULT_COORDINATES);
        return DEFAULT_COORDINATES;
      }
    } catch (error) {
      console.error('Error geocoding zipcode:', error);
      
      // Cache the fallback result
      geocodingCache.set(cacheKey, DEFAULT_COORDINATES);
      return DEFAULT_COORDINATES;
    }
  }
  
  /**
   * Helper function to extract city name from Nominatim display_name
   */
  private static extractCityFromDisplayName(displayName: string): string {
    try {
      // Nominatim returns format like: "City, County, State, Country"
      const parts = displayName.split(',');
      
      if (parts.length >= 2) {
        // Try to get the city (first part) or township/county if city is not clear
        let city = parts[0].trim();
        
        // If first part seems to be a street or number, try the second part
        if (/^\d/.test(city) || city.toLowerCase().includes('township')) {
          city = parts[1] ? parts[1].trim() : city;
        }
        
        // Clean up common suffixes
        city = city.replace(/\s+(Township|County|City)$/i, '');
        
        return city;
      }
      
      return displayName.split(',')[0].trim();
    } catch (error) {
      console.error('Error parsing city name:', error);
      return 'Unknown Location';
    }
  }
  
  /**
   * Fetch location data from the API with caching
   */
  static async fetchLocationData(locationNames: string[]): Promise<LocationData[]> {
    const cacheKey = `locations_${locationNames.sort().join(',')}`;
    
    // Check cache first
    if (geocodingCache.has(cacheKey)) {
      console.log('Using cached location data for:', locationNames.length, 'locations');
      return geocodingCache.get(cacheKey);
    }
    
    try {
      if (!locationNames || locationNames.length === 0) return [];
      
      // Build a query string with all location names
      const queryString = new URLSearchParams({
        names: JSON.stringify(locationNames)
      }).toString();
      
      const response = await fetch(`/api/locations?${queryString}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch location data: ${response.status}`);
      }
      
      const data = await response.json();
      const locations = data.locations || [];
      
      // Cache the result
      geocodingCache.set(cacheKey, locations);
      
      return locations;
    } catch (error) {
      console.error('Error fetching location data:', error);
      return []; // Return empty array on error
    }
  }
  
  /**
   * Clear the cache (useful for testing or memory management)
   */
  static clearCache(): void {
    geocodingCache.clear();
    console.log('Geocoding cache cleared');
  }
  
  /**
   * Get cache stats for debugging
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: geocodingCache.size,
      keys: Array.from(geocodingCache.keys())
    };
  }
}
