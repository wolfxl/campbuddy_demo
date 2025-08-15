import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  try {
    // Forward the request to the actual API
    const formData = await req.formData();
    
    // Log what we're forwarding
    console.log('Forwarding request to extract-camp-info API');
    
    // Forward the request to the external API
    const response = await fetch('http://191.96.31.93:8001/extract-camp-info', {
      method: 'POST',
      body: formData,
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`External API responded with status: ${response.status}`);
    }

    // Get the response data
    const data = await response.json();

    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
};
