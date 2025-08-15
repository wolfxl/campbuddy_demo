// Script to insert iCode McKinney location into the database
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define the location data for iCode McKinney
const locationData = {
  name: 'iCode mckinney',
  address: '3001 S Hardin Blvd',
  city: 'McKinney',
  state: 'TX',
  zip: '75070',
  latitude: 33.1983,
  longitude: -96.6389,
  formatted_address: '3001 S Hardin Blvd, McKinney, TX 75070'
};

// Function to insert or update the location in the database
async function seedLocation() {
  console.log('Checking if location already exists...');
  
  // Check if the location already exists
  const { data: existingLocation, error: queryError } = await supabase
    .from('locations')
    .select('id')
    .eq('name', locationData.name)
    .maybeSingle();
  
  if (queryError) {
    console.error('Error checking for existing location:', queryError);
    return;
  }
  
  if (existingLocation) {
    // Update existing location
    console.log(`Location '${locationData.name}' already exists with ID ${existingLocation.id}, updating...`);
    
    const { data, error } = await supabase
      .from('locations')
      .update(locationData)
      .eq('id', existingLocation.id)
      .select();
    
    if (error) {
      console.error('Error updating location:', error);
    } else {
      console.log('Location updated successfully:', data[0]);
    }
  } else {
    // Insert new location
    console.log(`Location '${locationData.name}' not found, creating new entry...`);
    
    const { data, error } = await supabase
      .from('locations')
      .insert(locationData)
      .select();
    
    if (error) {
      console.error('Error inserting location:', error);
    } else {
      console.log('Location inserted successfully:', data[0]);
    }
  }
}

// Run the seed function
seedLocation()
  .then(() => console.log('Done!'))
  .catch(err => console.error('Unhandled error:', err));
