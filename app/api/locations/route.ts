import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    // Get location names from query parameters
    const searchParams = request.nextUrl.searchParams;
    
    // Case 1: Fetch by names (array of location names)
    if (searchParams.has('names')) {
      const namesParam = searchParams.get('names');
      let names: string[] = [];
      
      try {
        names = JSON.parse(namesParam || '[]');
        if (!Array.isArray(names)) {
          names = [String(names)];
        }
      } catch (e) {
        // If parsing fails, assume it's a single name
        names = [namesParam || ''];
      }
      
      if (names.length === 0) {
        return NextResponse.json({ 
          message: 'No location names provided', 
          locations: [] 
        });
      }
      
      // Query Supabase for locations matching the names
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .in('name', names);
      
      if (error) {
        console.error('Supabase query error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ locations: data || [] });
    }
    
    // Case 2: Fetch by location IDs
    else if (searchParams.has('ids')) {
      const idsParam = searchParams.get('ids');
      let ids: (string | number)[] = [];
      
      try {
        ids = JSON.parse(idsParam || '[]');
        if (!Array.isArray(ids)) {
          ids = [ids];
        }
      } catch (e) {
        // If parsing fails, assume it's a single ID
        ids = [idsParam || ''];
      }
      
      if (ids.length === 0) {
        return NextResponse.json({ 
          message: 'No location IDs provided', 
          locations: [] 
        });
      }
      
      // Query Supabase for locations matching the IDs
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .in('id', ids);
      
      if (error) {
        console.error('Supabase query error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ locations: data || [] });
    }
    
    // Case 3: Fetch a single location by its exact name
    else if (searchParams.has('name')) {
      const name = searchParams.get('name');
      
      // Query Supabase for the location with this exact name
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('name', name)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" error
        console.error('Supabase query error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ location: data || null });
    }
    
    // Case 4: No specific parameters - fetch all locations (with limit)
    else {
      // Get optional pagination parameters
      const limit = parseInt(searchParams.get('limit') || '100', 10);
      const offset = parseInt(searchParams.get('offset') || '0', 10);
      
      // Query Supabase for all locations with pagination
      const { data, error, count } = await supabase
        .from('locations')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('Supabase query error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ 
        locations: data || [], 
        count,
        pagination: {
          limit,
          offset,
          total: count
        }
      });
    }
    
  } catch (error) {
    console.error('Error in locations API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}