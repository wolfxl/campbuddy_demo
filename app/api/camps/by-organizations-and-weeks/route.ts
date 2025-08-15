import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { organizationIds, selectedWeeks, interests, gradeLevel } = await request.json();
    
    if (!organizationIds || !Array.isArray(organizationIds) || organizationIds.length === 0) {
      return NextResponse.json(
        { error: 'Organization IDs array is required' },
        { status: 400 }
      );
    }

    if (!selectedWeeks || !Array.isArray(selectedWeeks)) {
      return NextResponse.json(
        { error: 'Selected weeks array is required' },
        { status: 400 }
      );
    }

    console.log('[Camps API] Filtering camps for organizations:', organizationIds);
    console.log('[Camps API] Selected weeks:', selectedWeeks);
    console.log('[Camps API] Grade level:', gradeLevel);

    // Define summer 2025 week date ranges (matching the planner UI)
    const summerWeekRanges = [
      { label: 'June 3 - June 9', start: '2025-06-03', end: '2025-06-09' },
      { label: 'June 10 - June 16', start: '2025-06-10', end: '2025-06-16' },
      { label: 'June 17 - June 23', start: '2025-06-17', end: '2025-06-23' },
      { label: 'June 24 - June 30', start: '2025-06-24', end: '2025-06-30' },
      { label: 'July 1 - July 7', start: '2025-07-01', end: '2025-07-07' },
      { label: 'July 8 - July 14', start: '2025-07-08', end: '2025-07-14' },
      { label: 'July 15 - July 21', start: '2025-07-15', end: '2025-07-21' },
      { label: 'July 22 - July 28', start: '2025-07-22', end: '2025-07-28' }
    ];

    // Get the selected week date ranges
    const selectedWeekRanges = selectedWeeks
      .map((isSelected: boolean, index: number) => isSelected ? summerWeekRanges[index] : null)
      .filter(Boolean);

    console.log('[Camps API] Selected week ranges:', selectedWeekRanges.map(w => w?.label));

    // Step 1: Get camps from the specified organizations
    let campsQuery = supabase
      .from('camps')
      .select(`
        id,
        camp_name,
        description,
        price,
        min_grade,
        max_grade,
        organization_id,
        organizations!inner(name)
      `)
      .in('organization_id', organizationIds);

    // Apply grade level filter if provided
    if (gradeLevel && gradeLevel !== '') {
      let numericGrade = 0;
      if (gradeLevel === 'Pre-K') {
        numericGrade = -1;
      } else if (gradeLevel === 'Kindergarten') {
        numericGrade = 0;
      } else {
        const gradeMatch = gradeLevel.match(/^(\d+)/);
        if (gradeMatch) {
          numericGrade = parseInt(gradeMatch[1]);
        }
      }
      
      console.log(`[Camps API] Filtering camps for grade level: ${gradeLevel} (numeric: ${numericGrade})`);
      
      campsQuery = campsQuery
        .lte('min_grade', numericGrade)
        .gte('max_grade', numericGrade);
    }

    const { data: camps, error: campsError } = await campsQuery;

    if (campsError) {
      console.error('[Camps API] Error fetching camps:', campsError);
      return NextResponse.json(
        { error: 'Failed to fetch camps' },
        { status: 500 }
      );
    }

    if (!camps || camps.length === 0) {
      console.log('[Camps API] No camps found for organizations');
      return NextResponse.json({
        data: [],
        message: 'No camps found for the specified organizations'
      });
    }

    console.log(`[Camps API] Found ${camps.length} camps from organizations`);

    // Step 2: Get sessions for these camps and filter by selected weeks
    const campIds = camps.map(camp => camp.id);
    const sessionsPromises = selectedWeekRanges.map(async (weekRange) => {
      if (!weekRange) return { weekRange: null, sessions: [] };

      const { data: sessions, error: sessionsError } = await supabase
        .from('camp_sessions')
        .select(`
          id,
          camp_id,
          start_date,
          end_date,
          start_time,
          end_time,
          days,
          location_id,
          locations!inner(name, address, city, state)
        `)
        .in('camp_id', campIds)
        .lte('start_date', weekRange.end)
        .gte('end_date', weekRange.start);

      if (sessionsError) {
        console.error(`[Camps API] Error fetching sessions for week ${weekRange.label}:`, sessionsError);
        return { weekRange, sessions: [] };
      }

      return { weekRange, sessions: sessions || [] };
    });

    const weekSessionsResults = await Promise.all(sessionsPromises);
    
    // Step 3: Get categories for the camps to include in results
    const { data: campCategories, error: categoriesError } = await supabase
      .from('camp_categories')
      .select(`
        camp_id,
        categories!inner(name)
      `)
      .in('camp_id', campIds);

    if (categoriesError) {
      console.error('[Camps API] Error fetching camp categories:', categoriesError);
    }

    // Group categories by camp
    const categoriesBycamp: { [key: number]: string[] } = {};
    campCategories?.forEach((cc: any) => {
      if (!categoriesBycamp[cc.camp_id]) {
        categoriesBycamp[cc.camp_id] = [];
      }
      if (cc.categories?.name) {
        categoriesBycamp[cc.camp_id].push(cc.categories.name);
      }
    });

    // Step 4: Process and format results
    const availableCampsByWeek = weekSessionsResults.map(({ weekRange, sessions }) => {
      if (!weekRange) return null;

      const campsWithSessions = sessions.map((session: any) => {
        const camp = camps.find(c => c.id === session.camp_id);
        if (!camp) return null;

        return {
          camp: {
            id: camp.id,
            name: camp.camp_name,
            description: camp.description,
            price: camp.price,
            organization: camp.organizations?.name || 'Unknown',
            categories: categoriesBycamp[camp.id] || [],
            grade_range: `${camp.min_grade === -1 ? 'Pre-K' : camp.min_grade === 0 ? 'K' : `${camp.min_grade}`} - ${camp.max_grade === 0 ? 'K' : `${camp.max_grade}`}`
          },
          session: {
            id: session.id,
            start_date: session.start_date,
            end_date: session.end_date,
            start_time: session.start_time,
            end_time: session.end_time,
            days: session.days,
            location: session.locations?.name || 'TBD',
            location_details: {
              address: session.locations?.address,
              city: session.locations?.city,
              state: session.locations?.state
            }
          }
        };
      }).filter(Boolean);

      // Remove duplicates (same camp might have multiple sessions in the same week)
      const uniqueCamps = campsWithSessions.reduce((acc: any[], current: any) => {
        const existing = acc.find(item => item.camp.id === current.camp.id);
        if (!existing) {
          acc.push(current);
        }
        return acc;
      }, []);

      return {
        week: weekRange,
        camps_count: uniqueCamps.length,
        camps: uniqueCamps
      };
    }).filter(Boolean);

    // Step 5: Create summary
    const totalUniqueCamps = new Set();
    const organizationCampCounts: { [key: string]: number } = {};

    availableCampsByWeek.forEach(weekData => {
      weekData?.camps.forEach((campWithSession: any) => {
        totalUniqueCamps.add(campWithSession.camp.id);
        const orgName = campWithSession.camp.organization;
        organizationCampCounts[orgName] = (organizationCampCounts[orgName] || 0) + 1;
      });
    });

    console.log('[Camps API] =================================');
    console.log('[Camps API] CAMPS AVAILABLE IN SELECTED WEEKS');
    console.log('[Camps API] =================================');

    availableCampsByWeek.forEach((weekData, index) => {
      if (weekData) {
        console.log(`[Camps API] ${weekData.week.label}: ${weekData.camps_count} camps available`);
        weekData.camps.forEach((campWithSession: any, campIndex: number) => {
          console.log(`[Camps API]   ${campIndex + 1}. ${campWithSession.camp.name} (${campWithSession.camp.organization})`);
          console.log(`[Camps API]      - Price: $${campWithSession.camp.price}`);
          console.log(`[Camps API]      - Location: ${campWithSession.session.location}`);
          console.log(`[Camps API]      - Time: ${campWithSession.session.start_time || 'TBD'} - ${campWithSession.session.end_time || 'TBD'}`);
          console.log(`[Camps API]      - Categories: ${campWithSession.camp.categories.join(', ') || 'None'}`);
        });
        console.log('[Camps API] ---------------------------------');
      }
    });

    console.log(`[Camps API] Total unique camps available: ${totalUniqueCamps.size}`);
    console.log('[Camps API] Camps by organization:', organizationCampCounts);

    return NextResponse.json({
      data: availableCampsByWeek,
      summary: {
        total_unique_camps: totalUniqueCamps.size,
        total_organizations: Object.keys(organizationCampCounts).length,
        camps_by_organization: organizationCampCounts,
        weeks_checked: selectedWeekRanges.length,
        interests_considered: interests,
        grade_level: gradeLevel
      }
    });

  } catch (error) {
    console.error('[Camps API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}