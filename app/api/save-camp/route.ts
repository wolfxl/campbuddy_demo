import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const POST = async (req: NextRequest) => {
  try {
    const { campData, source = 'manual' } = await req.json();

    if (!campData) {
      return NextResponse.json(
        { error: 'Camp data is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to save camp data:', { source, hasData: !!campData });

    // Insert the camp data into the new_camp table
    const { data, error } = await supabase
      .from('new_camp')
      .insert([
        {
          info_json: JSON.stringify({
            ...campData,
            source, // Track whether this came from manual entry or file upload
            submitted_at: new Date().toISOString(),
          }),
        },
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save camp data to database', details: error.message },
        { status: 500 }
      );
    }

    console.log('Camp data saved successfully:', data);
    return NextResponse.json({
      success: true,
      message: 'Camp data saved successfully',
      data: data[0],
    });
  } catch (error) {
    console.error('Error saving camp data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
};
