export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { LocationWithCamps, DatabaseError } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Get search parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get('location');
    const age = searchParams.get('age');
    const interests = searchParams.get('interests');
    const date = searchParams.get('date');

    // Start with base query to get locations
    let query = supabase
      .from('locations')
      .select(`
        id,
        name,
        address,
        city,
        state,
        zip,
        latitude,
        longitude,
        formatted_address
      `)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    // Get the locations
    const { data: locationsData, error: locationsError } = await query;

    if (locationsError) {
      console.error('Error fetching locations:', locationsError);
      return NextResponse.json(
        { error: locationsError.message || 'Failed to fetch locations' },
        { status: 500 }
      );
    }

    if (!locationsData || locationsData.length === 0) {
      return NextResponse.json({ data: [], error: null });
    }

    // Build a query to get filtered camp sessions
    let sessionsQuery = supabase
      .from('camp_sessions')
      .select(`
        id,
        camp_id,
        location_id
      `);

    // Apply date filter if provided
    if (date) {
      const searchDate = new Date(date);
      // Find sessions that include this date
      sessionsQuery = sessionsQuery
        .lte('start_date', date)
        .gte('end_date', date);
    }

    // Get the filtered sessions
    const { data: sessionsData, error: sessionsError } = await sessionsQuery;

    if (sessionsError) {
      console.error('Error fetching camp sessions:', sessionsError);
      return NextResponse.json(
        { error: sessionsError.message || 'Failed to fetch camp sessions' },
        { status: 500 }
      );
    }

    // If no sessions match the criteria, return empty data
    if (!sessionsData || sessionsData.length === 0) {
      return NextResponse.json({ data: [], error: null });
    }

    // Get the unique camp IDs from the sessions
    const campIds = [...new Set(sessionsData.map(session => session.camp_id))];

    // Now filter camps based on age range if provided
    let campsQuery = supabase.from('camps').select('*').in('id', campIds);

    if (age) {
      // Parse age range (format: "5-7")
      const [minAge, maxAge] = age.split('-').map(Number);
      
      // Map ages to approximate grade levels
      // This is a simplified mapping and might need adjustment
      const minGrade = minAge - 5; // e.g., age 5 → kindergarten (K/grade 0)
      const maxGrade = maxAge - 5;
      
      // Filter camps that include any part of this grade range
      campsQuery = campsQuery
        .lte('min_grade', maxGrade) // Camp's min grade is at or below our max
        .gte('max_grade', minGrade); // Camp's max grade is at or above our min
    }

    // Get the filtered camps
    const { data: campsData, error: campsError } = await campsQuery;

    if (campsError) {
      console.error('Error fetching camps:', campsError);
      return NextResponse.json(
        { error: campsError.message || 'Failed to fetch camps' },
        { status: 500 }
      );
    }

    // If no camps match the criteria, return empty data
    if (!campsData || campsData.length === 0) {
      return NextResponse.json({ data: [], error: null });
    }

    // If interests filter is provided, further filter the camps
    let filteredCampIds = campsData.map(camp => camp.id);

    if (interests) {
      // Get camp categories for the interest
      const { data: campCategoriesData, error: categoriesError } = await supabase
        .from('camp_categories')
        .select(`
          camp_id,
          categories!inner(name)
        `)
        .in('camp_id', filteredCampIds)
        .eq('categories.name', interests);

      if (categoriesError) {
        console.error('Error fetching camp categories:', categoriesError);
        // Continue without categories rather than failing completely
      }

      // If we have category data, filter camps by interest
      if (campCategoriesData && campCategoriesData.length > 0) {
        filteredCampIds = campCategoriesData.map(cc => cc.camp_id);
      } else if (interests) {
        // If interest was specified but no camps match, return empty
        return NextResponse.json({ data: [], error: null });
      }
    }

    // Get organizations for these camps
    const { data: orgsData, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name')
      .in('id', campsData.map(camp => camp.organization_id));

    if (orgsError) {
      console.error('Error fetching organizations:', orgsError);
      // Continue without org data rather than failing
    }

    // Create a map of organization_id to name
    const orgNames: { [key: number]: string } = {};
    orgsData?.forEach(org => {
      orgNames[org.id] = org.name;
    });

    // Get categories for these camps
    const { data: campCategoriesData, error: categoriesError } = await supabase
      .from('camp_categories')
      .select(`
        camp_id,
        categories!inner(name)
      `)
      .in('camp_id', filteredCampIds);

    if (categoriesError) {
      console.error('Error fetching camp categories:', categoriesError);
      // Continue without categories rather than failing completely
    }

    // Define an interface for the shape of data in campCategoriesData
    interface CampCategoryEntry {
      camp_id: number;
      categories: { name: string }[] | null; // categories is an array of objects
    }

    // Create a map of camp_id to categories
    const campCategories: { [key: number]: string[] } = {};
    campCategoriesData?.forEach((cc: CampCategoryEntry) => {
      if (!campCategories[cc.camp_id]) {
        campCategories[cc.camp_id] = [];
      }
      if (cc.categories && Array.isArray(cc.categories)) {
        cc.categories.forEach(category => {
          // category here is an object like { name: "Art" }
          if (category && typeof category.name === 'string') {
            campCategories[cc.camp_id].push(category.name);
          }
        });
      }
    });

    // Create a map of location_id to filtered camp_ids
    const locationCamps: { [key: number]: number[] } = {};
    sessionsData?.forEach(session => {
      // Only include sessions for our filtered camps
      if (filteredCampIds.includes(session.camp_id)) {
        if (!locationCamps[session.location_id]) {
          locationCamps[session.location_id] = [];
        }
        if (!locationCamps[session.location_id].includes(session.camp_id)) {
          locationCamps[session.location_id].push(session.camp_id);
        }
      }
    });

    // Apply location filter if provided
    if (location) {
      // Simple ZIP code filter - could be expanded to radius search
      const filteredLocationIds = locationsData
        .filter(loc => loc.zip === location || loc.city?.includes(location) || loc.name?.includes(location))
        .map(loc => loc.id);
      
      // If we have matching locations, filter by them
      if (filteredLocationIds.length > 0) {
        // Only keep location camps that are in our filtered locations
        Object.keys(locationCamps).forEach(locId => {
          if (!filteredLocationIds.includes(Number(locId))) {
            delete locationCamps[Number(locId)];
          }
        });
      }
    }

    // Transform the data into the format needed for the map
    const locationsWithCamps: LocationWithCamps[] = locationsData
      .filter(location => locationCamps[location.id]?.length > 0) // Only include locations with filtered camps
      .map(location => {
        const campIdsAtLocation = locationCamps[location.id] || [];
        const campsAtLocation = campsData
          .filter(camp => campIdsAtLocation.includes(camp.id))
          .map(camp => ({
            id: camp.id,
            name: camp.camp_name,
            organization: orgNames[camp.organization_id] || 'Unknown Organization',
            categories: campCategories[camp.id] || []
          }));
        
        return {
          ...location,
          camp_count: campsAtLocation.length,
          camps: campsAtLocation
        };
      });

    return NextResponse.json({ 
      data: locationsWithCamps, 
      error: null,
      searchApplied: !!(location || age || interests || date),
      totalCamps: filteredCampIds.length,
      totalLocations: locationsWithCamps.length,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Unexpected error in map search API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}