import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { interests, gradeLevel } = await request.json();
    
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json(
        { error: 'Interests array is required' },
        { status: 400 }
      );
    }

    console.log('[Organizations API] Searching for organizations with interests:', interests);
    console.log('[Organizations API] Grade level filter:', gradeLevel);

    // Step 1: Get category IDs for the selected interests
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .in('name', interests);

    if (categoryError) {
      console.error('[Organizations API] Error fetching categories:', categoryError);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    if (!categories || categories.length === 0) {
      console.log('[Organizations API] No categories found for interests:', interests);
      return NextResponse.json({
        data: [],
        message: 'No categories found for the selected interests'
      });
    }

    console.log('[Organizations API] Found categories:', categories);
    const categoryIds = categories.map(cat => cat.id);

    // Step 2: Get camps that have these categories
    const { data: campCategories, error: campCategoryError } = await supabase
      .from('camp_categories')
      .select('camp_id')
      .in('category_id', categoryIds);

    if (campCategoryError) {
      console.error('[Organizations API] Error fetching camp categories:', campCategoryError);
      return NextResponse.json(
        { error: 'Failed to fetch camp categories' },
        { status: 500 }
      );
    }

    if (!campCategories || campCategories.length === 0) {
      console.log('[Organizations API] No camps found for categories:', categoryIds);
      return NextResponse.json({
        data: [],
        message: 'No camps found for the selected interests'
      });
    }

    const campIds = [...new Set(campCategories.map(cc => cc.camp_id))];
    console.log('[Organizations API] Found camp IDs:', campIds);

    // Step 3: Get organizations that have these camps, filtered by grade level
    let campsQuery = supabase
      .from('camps')
      .select('organization_id, id, min_grade, max_grade')
      .in('id', campIds);

    // Apply grade level filter if provided
    if (gradeLevel && gradeLevel !== '') {
      // Convert grade level to numeric value
      let numericGrade = 0;
      if (gradeLevel === 'Pre-K') {
        numericGrade = -1;
      } else if (gradeLevel === 'Kindergarten') {
        numericGrade = 0;
      } else {
        // Extract number from grades like "1st Grade", "2nd Grade", etc.
        const gradeMatch = gradeLevel.match(/^(\d+)/);
        if (gradeMatch) {
          numericGrade = parseInt(gradeMatch[1]);
        }
      }
      
      console.log(`[Organizations API] Filtering camps for grade level: ${gradeLevel} (numeric: ${numericGrade})`);
      
      // Filter camps where the grade level falls within the camp's grade range
      campsQuery = campsQuery
        .lte('min_grade', numericGrade)
        .gte('max_grade', numericGrade);
    }

    const { data: camps, error: campsError } = await campsQuery;

    if (campsError) {
      console.error('[Organizations API] Error fetching camps:', campsError);
      return NextResponse.json(
        { error: 'Failed to fetch camps' },
        { status: 500 }
      );
    }

    if (!camps || camps.length === 0) {
      console.log('[Organizations API] No camps found for IDs:', campIds);
      return NextResponse.json({
        data: [],
        message: 'No camps found'
      });
    }

    const organizationIds = [...new Set(camps.map(camp => camp.organization_id))];
    console.log('[Organizations API] Found organization IDs:', organizationIds);
    console.log(`[Organizations API] Grade filtering reduced camps from ${campIds.length} to ${camps.length}`);

    // Step 4: Get organization details
    const { data: organizations, error: organizationsError } = await supabase
      .from('organizations')
      .select('id, name')
      .in('id', organizationIds)
      .order('name');

    if (organizationsError) {
      console.error('[Organizations API] Error fetching organizations:', organizationsError);
      return NextResponse.json(
        { error: 'Failed to fetch organizations' },
        { status: 500 }
      );
    }

    console.log('[Organizations API] Found organizations:', organizations);

    // Step 5: Get additional details - count of camps per organization for these interests and grade level
    const organizationDetails = await Promise.all(
      (organizations || []).map(async (org) => {
        // Get camp count for this organization with the selected interests and grade level
        let orgCampsQuery = supabase
          .from('camps')
          .select(`
            id,
            camp_name,
            min_grade,
            max_grade,
            camp_categories!inner (
              category_id,
              categories!inner (
                name
              )
            )
          `)
          .eq('organization_id', org.id)
          .in('camp_categories.category_id', categoryIds);

        // Apply the same grade level filter
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
          
          orgCampsQuery = orgCampsQuery
            .lte('min_grade', numericGrade)
            .gte('max_grade', numericGrade);
        }

        const { data: orgCamps, error: orgCampsError } = await orgCampsQuery;

        if (orgCampsError) {
          console.error(`[Organizations API] Error fetching camps for org ${org.id}:`, orgCampsError);
          return {
            ...org,
            camp_count: 0,
            matching_interests: [],
            sample_camps: []
          };
        }

        // Extract matching interests and sample camps
        const matchingInterests = new Set<string>();
        const sampleCamps: string[] = [];

        (orgCamps || []).forEach(camp => {
          if (sampleCamps.length < 3) {
            sampleCamps.push(camp.camp_name);
          }
          
          camp.camp_categories?.forEach((cc: any) => {
            if (cc.categories?.name) {
              matchingInterests.add(cc.categories.name);
            }
          });
        });

        return {
          ...org,
          camp_count: orgCamps?.length || 0,
          matching_interests: Array.from(matchingInterests),
          sample_camps: sampleCamps
        };
      })
    );

    console.log('[Organizations API] Organizations with details:', organizationDetails);

    return NextResponse.json({
      data: organizationDetails,
      total: organizationDetails.length,
      interests_searched: interests,
      categories_found: categories.map(cat => cat.name),
      grade_level: gradeLevel
    });

  } catch (error) {
    console.error('[Organizations API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}