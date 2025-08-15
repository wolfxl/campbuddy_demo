// Script to update locations with proper coordinates
import { createClient } from '@supabase/supabase-js';
import { geocodeLocationName } from '../lib/geoUtils';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to update locations with coordinates
async function updateLocationsCoordinates() {
  try {
    console.log('Fetching locations without coordinates...');
    
    // Get locations that are missing latitude/longitude
    const { data: locationsToUpdate, error: fetchError } = await supabase
      .from('locations')
      .select('*')
      .or('latitude.is.null,longitude.is.null');
    
    if (fetchError) {
      console.error('Error fetching locations:', fetchError);
      return;
    }
    
    console.log(`Found ${locationsToUpdate?.length || 0} locations that need coordinates.`);
    
    if (!locationsToUpdate || locationsToUpdate.length === 0) {
      console.log('No locations need updating. All locations have coordinates.');
      return;
    }
    
    // Process each location
    for (const location of locationsToUpdate) {
      console.log(`Processing location: ${location.name} (ID: ${location.id})`);
      
      // Create a geocoding query string
      let geocodeQuery = location.name;
      if (location.city) {
        geocodeQuery += `, ${location.city}`;
      }
      if (location.state) {
        geocodeQuery += `, ${location.state}`;
      }
      
      console.log(`  Geocoding query: "${geocodeQuery}"`);
      
      // Geocode the location
      const coordinates = await geocodeLocationName(geocodeQuery);
      
      if (coordinates) {
        console.log(`  Got coordinates: (${coordinates.latitude}, ${coordinates.longitude})`);
        
        // Update the location with coordinates
        const { data: updateResult, error: updateError } = await supabase
          .from('locations')
          .update({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            updated_at: new Date().toISOString()
          })
          .eq('id', location.id);
        
        if (updateError) {
          console.error(`  Error updating location ID ${location.id}:`, updateError);
        } else {
          console.log(`  Successfully updated location ID ${location.id}`);
        }
      } else {
        console.log(`  Could not get coordinates for "${geocodeQuery}"`);
      }
      
      // Add a delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Finished updating locations with coordinates.');
  } catch (error) {
    console.error('Unhandled error:', error);
  }
}

// Specific function to update the iCode McKinney location
async function updateICodeMcKinney() {
  try {
    console.log('Looking for iCode McKinney location...');
    
    // Find iCode McKinney location
    const { data: locations, error: fetchError } = await supabase
      .from('locations')
      .select('*')
      .ilike('name', '%icode%mckinney%');
    
    if (fetchError) {
      console.error('Error fetching locations:', fetchError);
      return;
    }
    
    if (!locations || locations.length === 0) {
      console.log('No matching location found for iCode McKinney.');
      return;
    }
    
    console.log(`Found ${locations.length} matching locations:`);
    
    // Update each matching location
    for (const location of locations) {
      console.log(`  Location: ${location.name} (ID: ${location.id})`);
      
      // These are the exact coordinates for iCode McKinney
      const coordinates = {
        latitude: 33.1983,
        longitude: -96.6389
      };
      
      console.log(`  Setting coordinates to: (${coordinates.latitude}, ${coordinates.longitude})`);
      
      // Update the location with coordinates
      const { data: updateResult, error: updateError } = await supabase
        .from('locations')
        .update({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          updated_at: new Date().toISOString()
        })
        .eq('id', location.id);
      
      if (updateError) {
        console.error(`  Error updating location ID ${location.id}:`, updateError);
      } else {
        console.log(`  Successfully updated location ID ${location.id}`);
      }
    }
  } catch (error) {
    console.error('Unhandled error:', error);
  }
}

// Run the update functions
async function main() {
  // First update iCode McKinney with known coordinates
  await updateICodeMcKinney();
  
  // Then update other locations that need coordinates
  await updateLocationsCoordinates();
  
  console.log('All updates complete!');
}

main()
  .then(() => console.log('Done!'))
  .catch(err => console.error('Script failed:', err));
