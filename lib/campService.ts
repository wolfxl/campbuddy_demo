import { supabase } from './supabase'
import { 
  GroupedCamp, 
  CampSession, 
  CampFilters, 
  GroupedCampsResponse, 
  CampSessionsResponse,
  CampDetailsResponse,
  CampWithDetails,
  SessionWithDetails,
  RealtimePayload,
  CampSubscriptionCallback,
  CampMapResponse,
  LocationWithCamps
} from './types'
import { 
  formatDateRange, 
  formatTimeRange, 
  formatGradeRange, 
  formatPrice, 
  getUniqueValues 
} from './utils'

/**
 * Fetch grouped camps with summary information
 */
export async function getGroupedCamps(
  limit: number = 50, 
  offset: number = 0
): Promise<GroupedCampsResponse> {
  try {
    // First, get the total count
    const { count } = await supabase
      .from('camps')
      .select('*', { count: 'exact', head: true })

    // Define a more specific type for the raw camp data
    type RawCampData = {
      id: number;
      camp_name: string;
      description: string | null;
      price: number;
      min_grade: number;
      max_grade: number;
      organizations: { name: string } | null; // Assuming organizations!inner results in an object or null
      camp_sessions: {
        id: number;
        start_date: string;
        end_date: string;
        start_time: string;
        end_time: string;
        days: string | null;
        locations: { name: string } | null; // Assuming locations!inner results in an object or null
      }[] | null;
      // Add other properties from the 'camps' table as needed
    };

    // Fetch camps with related data
    const { data: rawData, error } = await supabase
      .from('camps')
      .select(`
        *,
        organizations!inner(name),
        camp_sessions!left(
          id,
          start_date,
          end_date,
          start_time,
          end_time,
          days,
          locations!inner(name)
        )
      `)
      .range(offset, offset + limit - 1)
      .order('camp_name');

    if (error) {
      console.error('Error fetching grouped camps:', error)
      return { data: null, error }
    }

    if (!rawData) {
      return { data: [], error: null, count: 0, hasMore: false }
    }

    // Get categories for all camps
    const campIds = rawData.map(camp => camp.id);
    const { data: campCategoriesData, error: categoryFetchError } = await supabase
      .from('camp_categories') // Junction table
      .select(`
        camp_id,
        category_info:category_id ( name ) // Changed alias to category_info
      `)
      .in('camp_id', campIds);

    if (categoryFetchError) {
      console.error('[campService.ts getGroupedCamps] Error fetching camp category details:', categoryFetchError);
    }
    
    // ---- START DIAGNOSTIC LOGGING ----
    console.log('[campService.ts getGroupedCamps] Raw campCategoriesData from Supabase (alias changed):', JSON.stringify(campCategoriesData, null, 2));
    if (campCategoriesData && campCategoriesData.length > 0) {
      console.log('[campService.ts getGroupedCamps] Sample entry from campCategoriesData (first item):', JSON.stringify(campCategoriesData[0], null, 2));
      if (campCategoriesData[0] && (campCategoriesData[0] as any).category_info) {
        console.log('[campService.ts getGroupedCamps] Type of category_info in first item:', typeof (campCategoriesData[0] as any).category_info, 'Is Array:', Array.isArray((campCategoriesData[0] as any).category_info));
      }
    }
    // ---- END DIAGNOSTIC LOGGING ----

    // Group categories by camp_id
    const categoriesBycamp: { [key: number]: string[] } = {};
    let processedCategoryCount = 0; // For logging for getGroupedCamps

    campCategoriesData?.forEach((cc: any) => { // Added :any to cc temporarily
      const currentCampId = cc.camp_id;
      const categoryInfo = cc.category_info;

      if (!categoriesBycamp[currentCampId]) {
        categoriesBycamp[currentCampId] = [];
      }

      // ---- START DETAILED CATEGORY PROCESSING LOGGING ----
      if (processedCategoryCount < 3) { // Log details for the first 3 processed category entries for getGroupedCamps
        console.log(`[campService.ts getGroupedCamps] Processing cc for camp_id ${currentCampId}:`, JSON.stringify(cc, null, 2));
      }
      // ---- END DETAILED CATEGORY PROCESSING LOGGING ----

      if (categoryInfo && typeof categoryInfo.name === 'string') {
        categoriesBycamp[currentCampId].push(categoryInfo.name);
        // ---- START DETAILED CATEGORY PROCESSING LOGGING ----
        if (processedCategoryCount < 3 && categoriesBycamp[currentCampId].length <= 2) { // Log first few added categories
             console.log(`[campService.ts getGroupedCamps]   Added category '${categoryInfo.name}' for camp_id ${currentCampId}. Current categories: ${JSON.stringify(categoriesBycamp[currentCampId])}`);
        }
        // ---- END DETAILED CATEGORY PROCESSING LOGGING ----
      } else if (processedCategoryCount < 3) {
        console.log(`[campService.ts getGroupedCamps]   Skipping category for camp_id ${currentCampId} due to missing category_info.name or non-string name. category_info:`, JSON.stringify(categoryInfo, null, 2));
      }
      if (processedCategoryCount < 3) processedCategoryCount++;
    });

    // ---- START DIAGNOSTIC LOGGING ----
    console.log('[campService.ts getGroupedCamps] First 3 entries of categoriesBycamp map:', JSON.stringify(Object.fromEntries(Object.entries(categoriesBycamp).slice(0,3)), null, 2));
    const campIdsWithEmptyCategories = rawData.filter(camp => !categoriesBycamp[camp.id] || categoriesBycamp[camp.id].length === 0).map(camp => camp.id);
    if (campIdsWithEmptyCategories.length > 0 && processedCategoryCount <3) { // also limit this log
        console.log(`[campService.ts getGroupedCamps] ${campIdsWithEmptyCategories.length} camps (out of ${rawData.length}) ended up with empty categories. First 5 IDs: ${campIdsWithEmptyCategories.slice(0,5).join(', ')}`);
    } else if (processedCategoryCount <3) {
        console.log('[campService.ts getGroupedCamps] All/Remaining camps have categories assigned or logging limit reached.');
    }
    // ---- END DIAGNOSTIC LOGGING ----

    // Transform the data to grouped camps format
    const groupedCamps: GroupedCamp[] = (rawData as RawCampData[]).map((camp) => {
      const sessions = camp.camp_sessions || [];
      const categories = categoriesBycamp[camp.id] || [];
      
      // Define a more specific type for session 's'
      type SessionType = {
        id: number;
        start_date: string;
        end_date: string;
        locations: { name: string } | null;
        // add other session properties if used
      };

      const locations: string[] = getUniqueValues(
        sessions.map((s: SessionType) => s.locations?.name).filter(Boolean)
      ) as string[]; // Assuming getUniqueValues might return any[] or unknown[]

      // Calculate date range from all sessions
      type SessionDate = { start: string; end: string };
      const sessionDates: SessionDate[] = sessions.map((s: SessionType) => ({
        start: s.start_date,
        end: s.end_date
      })).filter((d): d is SessionDate => !!(d.start && d.end)); // Type guard for filter

      const earliestDate = sessionDates.length > 0
        ? sessionDates.reduce((earliest: SessionDate, current: SessionDate) =>
            new Date(current.start) < new Date(earliest.start) ? current : earliest
          ).start
        : null;

      const latestDate = sessionDates.length > 0
        ? sessionDates.reduce((latest: SessionDate, current: SessionDate) =>
            new Date(current.end) > new Date(latest.end) ? current : latest
          ).end
        : null;

      return {
        id: camp.id,
        name: camp.camp_name,
        organization: camp.organizations?.name || 'Unknown Organization',
        description: camp.description || '',
        price: formatPrice(camp.price),
        price_numeric: camp.price,
        grade_range: formatGradeRange(camp.min_grade, camp.max_grade),
        min_grade: camp.min_grade,
        max_grade: camp.max_grade,
        categories,
        session_count: sessions.length,
        date_range: earliestDate && latestDate
          ? formatDateRange(earliestDate, latestDate)
          : 'Dates TBD',
        earliest_date: earliestDate || '',
        latest_date: latestDate || '',
        locations,
        featured: false // Assuming featured is part of GroupedCamp and defaults to false
      };
    });

    const hasMore = count ? offset + limit < count : false

    return {
      data: groupedCamps,
      error: null,
      count: count || 0,
      hasMore
    }
  } catch (error) {
    console.error('Unexpected error fetching grouped camps:', error)
    return { 
      data: null, 
      error: { message: 'Failed to fetch camps', details: String(error) } 
    }
  }
}

/**
 * Fetch sessions for a specific camp
 */
export async function getCampSessions(campId: number): Promise<CampSessionsResponse> {
  try {
    const { data: rawSessions, error } = await supabase
      .from('camp_sessions')
      .select(`
        *,
        locations!inner(name)
      `)
      .eq('camp_id', campId)
      .order('start_date')

    if (error) {
      console.error('Error fetching camp sessions:', error)
      return { data: null, error }
    }

    if (!rawSessions) {
      return { data: [], error: null }
    }

    // Transform sessions for UI
    const sessions: CampSession[] = rawSessions.map((session: any) => ({
      id: session.id,
      dates: formatDateRange(session.start_date, session.end_date),
      times: formatTimeRange(session.start_time, session.end_time),
      days: session.days || 'Mon-Fri',
      location: session.locations?.name || 'Location TBD',
      start_date: session.start_date,
      end_date: session.end_date
    }))

    return { data: sessions, error: null }
  } catch (error) {
    console.error('Unexpected error fetching camp sessions:', error)
    return { 
      data: null, 
      error: { message: 'Failed to fetch camp sessions', details: String(error) } 
    }
  }
}

/**
 * Get detailed information for a single camp
 */
export async function getCampDetails(campId: number): Promise<CampDetailsResponse> {
  try {
    const { data: rawCamp, error } = await supabase
      .from('camps')
      .select(`
        *,
        organizations!inner(name),
        camp_sessions!left(
          id,
          start_date,
          end_date,
          start_time,
          end_time,
          days,
          locations!inner(name)
        ),
        camp_categories!left(
          categories!inner(name)
        )
      `)
      .eq('id', campId)
      .single()

    if (error) {
      console.error('Error fetching camp details:', error)
      return { data: null, error }
    }

    if (!rawCamp) {
      return { data: null, error: { message: 'Camp not found' } }
    }

    // Get formatted sessions
    const { data: sessions } = await getCampSessions(campId)

    // Transform to GroupedCamp format (similar to getGroupedCamps)
    const sessions_raw = rawCamp.camp_sessions || []
    const categories = rawCamp.camp_categories?.map((cc: any) => cc.categories.name) || []
    const locations: string[] = getUniqueValues(
      sessions_raw.map((s: any) => s.locations?.name).filter(Boolean)
    )

    const sessionDates: { start: string; end: string }[] = sessions_raw.map((s: any) => ({
      start: s.start_date,
      end: s.end_date
    })).filter((d: any) => d.start && d.end)

    const earliestDate = sessionDates.length > 0 
      ? sessionDates.reduce((earliest: { start: string; end: string }, current: { start: string; end: string }) => 
          new Date(current.start) < new Date(earliest.start) ? current : earliest
        ).start
      : null

    const latestDate = sessionDates.length > 0
      ? sessionDates.reduce((latest: { start: string; end: string }, current: { start: string; end: string }) => 
          new Date(current.end) > new Date(latest.end) ? current : latest
        ).end
      : null

    const campDetails: GroupedCamp = {
      id: rawCamp.id,
      name: rawCamp.camp_name,
      organization: rawCamp.organizations?.name || 'Unknown Organization',
      description: rawCamp.description || '',
      price: formatPrice(rawCamp.price),
      price_numeric: rawCamp.price,
      grade_range: formatGradeRange(rawCamp.min_grade, rawCamp.max_grade),
      min_grade: rawCamp.min_grade,
      max_grade: rawCamp.max_grade,
      categories,
      session_count: sessions_raw.length,
      date_range: earliestDate && latestDate 
        ? formatDateRange(earliestDate, latestDate) 
        : 'Dates TBD',
      earliest_date: earliestDate || '',
      latest_date: latestDate || '',
      locations,
      sessions: sessions || [],
      featured: false
    }

    return { data: campDetails, error: null }
  } catch (error) {
    console.error('Unexpected error fetching camp details:', error)
    return { 
      data: null, 
      error: { message: 'Failed to fetch camp details', details: String(error) } 
    }
  }
}

/**
 * Search camps with filters
 */
export async function getFilteredCamps(
  filters: Partial<CampFilters>,
  limit: number = 2000,
  offset: number = 0
): Promise<GroupedCampsResponse> {
  try {
    // Start with base query
    let query = supabase
      .from('camps')
      .select(`
        *,
        organizations!inner(name),
        camp_sessions!left(
          id,
          start_date,
          end_date,
          start_time,
          end_time,
          days,
          locations!inner(name)
        )
      `)

    // Apply category filter using EXISTS subquery
    if (filters.interests && filters.interests.length > 0) {
      console.log('Filtering by categories:', filters.interests); // Debug log
      // We need to use a different approach for category filtering
      const { data: campsWithCategories, error: categoryError } = await supabase
        .from('camp_categories')
        .select(`
          camp_id,
          categories!inner(name)
        `)
        .in('categories.name', filters.interests)
      
      console.log('Found camps with categories:', campsWithCategories?.length); // Debug log
      
      if (categoryError) {
        console.error('Error fetching camps by category:', categoryError)
        return { data: null, error: categoryError }
      }

      const campIds = campsWithCategories?.map(cc => cc.camp_id) || []
      console.log('Camp IDs with matching categories:', campIds); // Debug log
      
      if (campIds.length === 0) {
        return { data: [], error: null, count: 0, hasMore: false }
      }
      
      query = query.in('id', campIds)
    }

    // Apply grade filter
    if (filters.grade) {
      const gradeRange = filters.grade.split('-')
      if (gradeRange.length === 2) {
        let minGrade = parseInt(gradeRange[0])
        let maxGrade = parseInt(gradeRange[1])
        
        // Handle K as grade 0
        if (gradeRange[0] === 'K') minGrade = 0
        if (gradeRange[1] === 'K') maxGrade = 0
        
        query = query.lte('min_grade', maxGrade).gte('max_grade', minGrade)
      }
    }

    // Apply price filter
    if (filters.price) {
      switch (filters.price) {
        case 'under-200':
          query = query.lt('price', 200)
          break
        case '200-300':
          query = query.gte('price', 200).lte('price', 300)
          break
        case '300-400':
          query = query.gte('price', 300).lte('price', 400)
          break
        case '400-plus':
          query = query.gte('price', 400)
          break
      }
    }

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim()
      query = query.or(`camp_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }

    // Apply location filter
    if (filters.location && filters.location.trim()) {
      const locationName = filters.location.trim()
      console.log('Filtering by location:', locationName); // Debug log
      
      // First get location IDs that match the location name
      const { data: matchingLocations, error: locationError } = await supabase
        .from('locations')
        .select('id')
        .ilike('name', `%${locationName}%`)
      
      if (locationError) {
        console.error('Error fetching locations:', locationError)
        return { data: null, error: locationError }
      }
      
      const locationIds = matchingLocations?.map(loc => loc.id) || []
      console.log('Found location IDs:', locationIds); // Debug log
      
      if (locationIds.length === 0) {
        return { data: [], error: null, count: 0, hasMore: false }
      }
      
      // Get camp IDs that have sessions at these locations
      const { data: sessionsWithLocation, error: sessionError } = await supabase
        .from('camp_sessions')
        .select('camp_id')
        .in('location_id', locationIds)
      
      if (sessionError) {
        console.error('Error fetching sessions by location:', sessionError)
        return { data: null, error: sessionError }
      }
      
      const campIdsWithLocation = [...new Set(sessionsWithLocation?.map(s => s.camp_id) || [])]
      console.log('Camp IDs at location:', campIdsWithLocation); // Debug log
      
      if (campIdsWithLocation.length === 0) {
        return { data: [], error: null, count: 0, hasMore: false }
      }
      
      query = query.in('id', campIdsWithLocation)
    }

    const { data: rawData, error } = await query
      .range(offset, offset + limit - 1)
      .order('camp_name')

    if (error) {
      console.error('Error fetching filtered camps:', error)
      return { data: null, error }
    }

    if (!rawData || rawData.length === 0) {
      return { data: [], error: null, count: 0, hasMore: false }
    }

    // Now we need to get categories for each camp
    const campIds = rawData.map(camp => camp.id);
    const { data: campCategoriesData, error: categoryFetchError } = await supabase
      .from('camp_categories') // Junction table
      .select(`
        camp_id,
        category_info:category_id ( name )
      `)
      .in('camp_id', campIds);

    if (categoryFetchError) {
      console.error('[campService.ts getFilteredCamps] Error fetching camp category details:', categoryFetchError);
    }

    // ---- START DIAGNOSTIC LOGGING ----
    console.log('[campService.ts getFilteredCamps] Raw campCategoriesData from Supabase (alias changed):', JSON.stringify(campCategoriesData, null, 2));
    if (campCategoriesData && campCategoriesData.length > 0) {
      console.log('[campService.ts getFilteredCamps] Sample entry from campCategoriesData (first item):', JSON.stringify(campCategoriesData[0], null, 2));
      if (campCategoriesData[0] && (campCategoriesData[0] as any).category_info) {
        console.log('[campService.ts getFilteredCamps] Type of category_info in first item:', typeof (campCategoriesData[0] as any).category_info, 'Is Array:', Array.isArray((campCategoriesData[0] as any).category_info));
      }
    }
    // ---- END DIAGNOSTIC LOGGING ----

    // Group categories by camp_id
    const categoriesBycamp: { [key: number]: string[] } = {};
    let processedCategoryCount = 0; // For logging
    campCategoriesData?.forEach(cc => {
      const currentCampId = (cc as any).camp_id;
      const categoryInfo = (cc as any).category_info;

      if (!categoriesBycamp[currentCampId]) {
        categoriesBycamp[currentCampId] = [];
      }
      // ---- START DETAILED CATEGORY PROCESSING LOGGING ----
      if (processedCategoryCount < 5) { // Log details for the first 5 processed category entries
        console.log(`[campService.ts getFilteredCamps] Processing cc for camp_id ${currentCampId}:`, JSON.stringify(cc, null, 2));
      }
      // ---- END DETAILED CATEGORY PROCESSING LOGGING ----

      if (categoryInfo && typeof categoryInfo.name === 'string') {
        categoriesBycamp[currentCampId].push(categoryInfo.name);
        // ---- START DETAILED CATEGORY PROCESSING LOGGING ----
        if (processedCategoryCount < 5 && categoriesBycamp[currentCampId].length <= 3) { // Log first few added categories
             console.log(`[campService.ts getFilteredCamps]   Added category '${categoryInfo.name}' for camp_id ${currentCampId}. Current categories: ${JSON.stringify(categoriesBycamp[currentCampId])}`);
        }
        // ---- END DETAILED CATEGORY PROCESSING LOGGING ----
      } else if (processedCategoryCount < 5) {
        console.log(`[campService.ts getFilteredCamps]   Skipping category for camp_id ${currentCampId} due to missing category_info.name or non-string name. category_info:`, JSON.stringify(categoryInfo, null, 2));
      }
      if (processedCategoryCount < 5) processedCategoryCount++;
    });

    // ---- START DIAGNOSTIC LOGGING ----
    console.log('[campService.ts getFilteredCamps] First 5 entries of categoriesBycamp map:', JSON.stringify(Object.fromEntries(Object.entries(categoriesBycamp).slice(0,5)), null, 2));
    const campIdsWithEmptyCategories = rawData.filter(camp => !categoriesBycamp[camp.id] || categoriesBycamp[camp.id].length === 0).map(camp => camp.id);
    if (campIdsWithEmptyCategories.length > 0) {
        console.log(`[campService.ts getFilteredCamps] ${campIdsWithEmptyCategories.length} camps (out of ${rawData.length}) ended up with empty categories. First 10 IDs: ${campIdsWithEmptyCategories.slice(0,10).join(', ')}`);
    } else {
        console.log('[campService.ts getFilteredCamps] All camps have categories assigned.');
    }
    // ---- END DIAGNOSTIC LOGGING ----

    // Transform to GroupedCamp format
    const groupedCamps: GroupedCamp[] = rawData.map((camp: any) => {
      const sessions = camp.camp_sessions || []
      const categories = categoriesBycamp[camp.id] || []
      const locations: string[] = getUniqueValues(
        sessions.map((s: any) => s.locations?.name).filter(Boolean)
      )

      const sessionDates: { start: string; end: string }[] = sessions.map((s: any) => ({
        start: s.start_date,
        end: s.end_date
      })).filter((d: any) => d.start && d.end)

      const earliestDate = sessionDates.length > 0 
        ? sessionDates.reduce((earliest: { start: string; end: string }, current: { start: string; end: string }) => 
            new Date(current.start) < new Date(earliest.start) ? current : earliest
          ).start
        : null

      const latestDate = sessionDates.length > 0
        ? sessionDates.reduce((latest: { start: string; end: string }, current: { start: string; end: string }) => 
            new Date(current.end) > new Date(latest.end) ? current : latest
          ).end
        : null

      return {
        id: camp.id,
        name: camp.camp_name,
        organization: camp.organizations?.name || 'Unknown Organization',
        description: camp.description || '',
        price: formatPrice(camp.price),
        price_numeric: camp.price,
        grade_range: formatGradeRange(camp.min_grade, camp.max_grade),
        min_grade: camp.min_grade,
        max_grade: camp.max_grade,
        categories,
        session_count: sessions.length,
        date_range: earliestDate && latestDate 
          ? formatDateRange(earliestDate, latestDate) 
          : 'Dates TBD',
        earliest_date: earliestDate || '',
        latest_date: latestDate || '',
        locations,
        featured: false
      }
    })

    return { 
      data: groupedCamps, 
      error: null, 
      count: rawData.length, 
      hasMore: rawData.length === limit 
    }
  } catch (error) {
    console.error('Unexpected error fetching filtered camps:', error)
    return { 
      data: null, 
      error: { message: 'Failed to fetch filtered camps', details: String(error) } 
    }
  }
}

/**
 * Subscribe to real-time updates for camps
 */
export function subscribeToCampUpdates(callback: CampSubscriptionCallback) {
  const channel = supabase
    .channel('camps-realtime')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'camps' 
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new,
          old: payload.old,
          table: 'camps'
        })
      }
    )
    .subscribe()

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Get all available categories for filtering
 */
export async function getCategories(): Promise<{ data: string[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return { data: null, error }
    }

    return { data: data?.map(cat => cat.name) || [], error: null }
  } catch (error) {
    console.error('Unexpected error fetching categories:', error)
    return { data: null, error: { message: 'Failed to fetch categories' } }
  }
}

/**
 * Fetch camp locations for the map with aggregated camp data
 * This function uses server-side caching via Next.js data fetching
 */
export async function getCampLocationsForMap(): Promise<CampMapResponse> {
  try {
    // Get locations that have camps associated with them via camp_sessions
    const { data: locationsData, error: locationsError } = await supabase
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
      .not('longitude', 'is', null)
      .order('name')

    if (locationsError) {
      console.error('Error fetching locations:', locationsError)
      return { data: null, error: locationsError }
    }

    if (!locationsData || locationsData.length === 0) {
      return { data: [], error: null, lastUpdated: Date.now() }
    }

    // Get the camp_sessions for these locations
    const locationIds = locationsData.map(loc => loc.id)
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('camp_sessions')
      .select(`
        id,
        camp_id,
        location_id
      `)
      .in('location_id', locationIds)

    if (sessionsError) {
      console.error('Error fetching camp sessions:', sessionsError)
      return { data: null, error: sessionsError }
    }

    // Get unique camp IDs from the sessions
    const campIds = [...new Set(sessionsData?.map(session => session.camp_id) || [])]

    // If no camps found, return empty locations
    if (campIds.length === 0) {
      return { data: [], error: null, lastUpdated: Date.now() }
    }

    // Get camp details
    const { data: campsData, error: campsError } = await supabase
      .from('camps')
      .select(`
        id,
        camp_name,
        organizations!inner(name)
      `)
      .in('id', campIds)

    if (campsError) {
      console.error('Error fetching camps:', campsError)
      return { data: null, error: campsError }
    }

    // Get categories for these camps
    const { data: campCategoriesData, error: categoriesError } = await supabase
      .from('camp_categories')
      .select(`
        camp_id,
        categories!inner(name)
      `)
      .in('camp_id', campIds)

    if (categoriesError) {
      console.error('Error fetching camp categories:', categoriesError)
      // Continue without categories rather than failing completely
    }

    // Create a map of camp_id to categories
    const campCategories: { [key: number]: string[] } = {}
    campCategoriesData?.forEach(cc => {
      if (!campCategories[cc.camp_id]) {
        campCategories[cc.camp_id] = []
      }
      if (cc.categories && Array.isArray(cc.categories)) {
        cc.categories.forEach(category => {
          if (category && typeof category.name === 'string') {
            campCategories[cc.camp_id].push(category.name);
          }
        });
      }
    })

    // Create a map of location_id to camp_ids
    const locationCamps: { [key: number]: number[] } = {}
    sessionsData?.forEach(session => {
      if (!locationCamps[session.location_id]) {
        locationCamps[session.location_id] = []
      }
      if (!locationCamps[session.location_id].includes(session.camp_id)) {
        locationCamps[session.location_id].push(session.camp_id)
      }
    })

    // Transform the data into the format needed for the map
    const locationsWithCamps: LocationWithCamps[] = locationsData.map(location => {
      const campIdsAtLocation = locationCamps[location.id] || []
      const campsAtLocation = campsData?.filter(camp => campIdsAtLocation.includes(camp.id)) || []
      
      return {
        ...location,
        camp_count: campsAtLocation.length,
        camps: campsAtLocation.map(camp => ({
          id: camp.id,
          name: camp.camp_name,
          organization: camp.organizations?.[0]?.name || 'Unknown Organization',
          categories: campCategories[camp.id] || []
        }))
      }
    }).filter(location => location.camp_count > 0) // Only include locations that have camps

    return { 
      data: locationsWithCamps, 
      error: null,
      lastUpdated: Date.now()
    }
  } catch (error) {
    console.error('Unexpected error fetching camp locations:', error)
    return { 
      data: null, 
      error: { message: 'Failed to fetch camp locations', details: String(error) } 
    }
  }
}