import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Geocode a zipcode using Nominatim (OpenStreetMap) as a fallback
 */
async function geocodeZipcodeWithNominatim(zipcode: string) {
  try {
    // Use Nominatim geocoding (free and no API key required)
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&postalcode=${zipcode}&limit=1`;
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
      
      // Try to extract city from display name
      const displayName = result.display_name;
      const parts = displayName.split(',');
      let city = parts[0].trim();
      
      // Get state from address components
      const stateMatch = displayName.match(/, ([A-Z]{2}),/);
      const state = stateMatch ? stateMatch[1] : '';
      
      console.log(`Geocoded ${zipcode} with Nominatim: ${result.lat}, ${result.lon}, ${city}, ${state}`);
      
      return {
        zipcode,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        city,
        state,
        source: 'nominatim'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error using Nominatim for geocoding:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get zipcode from query parameter
    const searchParams = request.nextUrl.searchParams;
    const zipcode = searchParams.get('zipcode');
    
    if (!zipcode) {
      return NextResponse.json({ 
        error: 'No zipcode provided' 
      }, { status: 400 });
    }
    
    // Try to get zipcode from Supabase first
    try {
      const { data, error } = await supabase
        .from('zipcodes')
        .select('*')
        .eq('zipcode', zipcode)
        .single();
      
      if (!error && data) {
        console.log(`Found zipcode ${zipcode} in database`);
        return NextResponse.json({ 
          zipcode: data.zipcode,
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city,
          state: data.state,
          source: 'database'
        });
      }
    } catch (dbError) {
      console.log(`Database error or table doesn't exist, using Nominatim fallback`);
      // Continue to fallback
    }
    
    // If we get here, either the zipcode wasn't in the database or there was an error
    // Use Nominatim as fallback
    const nominatimResult = await geocodeZipcodeWithNominatim(zipcode);
    
    if (nominatimResult) {
      return NextResponse.json(nominatimResult);
    }
    
    // If all geocoding methods failed
    return NextResponse.json({ 
      error: 'Failed to geocode zipcode',
      // Provide hardcoded coordinates for common zipcodes as a last resort
      fallback: zipcode === '75034' ? {
        zipcode: '75034',
        latitude: 33.1360792,
        longitude: -96.8368919,
        city: 'Frisco',
        state: 'TX',
        source: 'hardcoded'
      } : null
    }, { status: 404 });
    
  } catch (error) {
    console.error('Error in zipcode geocoding API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}