import dynamic from 'next/dynamic';
import { getCampLocationsForMap } from '@/lib/campService';
import { LocationWithCamps } from '@/lib/types';

// Dynamically import the client-side map components to avoid SSR issues with Leaflet
const DynamicCampMap = dynamic(
  () => import('./CampMap'),
  { ssr: false }
);

const DynamicResultsMap = dynamic(
  () => import('./ResultsMap'),
  { ssr: false }
);

// Export the results map component
export const ResultsMap = DynamicResultsMap;

// This server component fetches the map data and passes it to the client component
export default async function CampMapWrapper() {
  try {
    // Fetch the map data on the server with SSR caching
    const { data, error } = await getCampLocationsForMap();
    
    if (error) {
      console.error('Error fetching map data in server component:', error);
      // Pass empty data and let the client component handle the error state
      return <DynamicCampMap initialLocations={[]} />;
    }
    
    // Pass the pre-fetched data to the client component
    return <DynamicCampMap initialLocations={data || []} />;
  } catch (err) {
    console.error('Unexpected error in CampMapWrapper:', err);
    return <DynamicCampMap initialLocations={[]} />;
  }
}