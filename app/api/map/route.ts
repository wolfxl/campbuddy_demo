import { NextResponse } from 'next/server';
import { getCampLocationsForMap } from '@/lib/campService';

// Set revalidation time to 1 hour (3600 seconds)
export const revalidate = 3600;

export async function GET() {
  try {
    const response = await getCampLocationsForMap();
    
    if (response.error) {
      console.error('Error fetching map data:', response.error);
      return NextResponse.json(
        { error: response.error.message || 'Failed to fetch map data' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in map API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}