import { NextResponse } from 'next/server';
import { getFilteredCamps } from '@/lib/campService';
import { getFilteredCampsWithCoordinates } from '@/lib/enhancedCampService';
import { CampFilters } from '@/lib/types';

// Set revalidation time to 1 hour (3600 seconds)
export const revalidate = 3600;

export async function GET(request: Request) {
  try {
    // Extract URL parameters
    const { searchParams } = new URL(request.url);
    
    // Build filter criteria
    const filters: Partial<CampFilters> = {};
    
    // Handle interests - can be multiple
    const interests = searchParams.getAll('interests');
    if (interests.length > 0) {
      filters.interests = interests;
      console.log('[API/camps] Filtering by interests:', interests);
    } else {
      console.log('[API/camps] No interests specified, returning all camps');
    }
    
    // Handle other potential filters
    const location = searchParams.get('location');
    if (location) filters.location = location;
    
    const grade = searchParams.get('grade');
    if (grade) filters.grade = grade;
    
    const price = searchParams.get('price');
    if (price) filters.price = price;
    
    const search = searchParams.get('search');
    if (search) filters.search = search;
    
    // Get limit and offset parameters for pagination
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    
    const limit = limitParam ? parseInt(limitParam, 10) : 2000; // Very high default limit for planner
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    
    // Check if location coordinates should be included
    const includeCoordinates = searchParams.get('includeCoordinates') === 'true';
    
    console.log('[API/camps] Fetching camps with filters:', filters, 'limit:', limit, 'offset:', offset, 'includeCoordinates:', includeCoordinates);
    
    // Get filtered camps using the appropriate service
    const response = includeCoordinates
      ? await getFilteredCampsWithCoordinates(filters, limit, offset)
      : await getFilteredCamps(filters, limit, offset);
    
    if (response.error) {
      console.error('[API/camps] Error fetching filtered camps:', response.error);
      return NextResponse.json(
        { error: response.error.message || 'Failed to fetch camps' },
        { status: 500 }
      );
    }
    
    console.log('[API/camps] Successfully fetched camps. Count:', response.data?.length || 0, 'Total in DB:', response.count, 'HasMore:', response.hasMore);
    return NextResponse.json(response);
  } catch (error) {
    console.error('[API/camps] Unexpected error in camps API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}