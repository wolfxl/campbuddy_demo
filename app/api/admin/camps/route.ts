import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const GET = async (req: NextRequest) => {
  try {
    console.log('Fetching camps for admin dashboard...');

    // Fetch published camps from camps table with organization info
    const { data: publishedCamps, error: publishedError } = await supabase
      .from('camps')
      .select(`
        id,
        camp_name,
        description,
        price,
        start_date,
        end_date,
        created_at,
        updated_at,
        organizations (
          id,
          name
        ),
        camp_sessions (
          id,
          start_date,
          end_date
        )
      `)
      .order('updated_at', { ascending: false });

    if (publishedError) {
      console.error('Error fetching published camps:', publishedError);
    }

    // Fetch pending camps from new_camp table
    const { data: pendingCamps, error: pendingError } = await supabase
      .from('new_camp')
      .select('*')
      .order('created_at', { ascending: false });

    if (pendingError) {
      console.error('Error fetching pending camps:', pendingError);
    }

    // Process published camps
    const processedPublishedCamps = (publishedCamps || []).map(camp => {
      const organization = camp.organizations;
      const sessions = camp.camp_sessions || [];
      
      // Calculate price range from camp price
      let priceRange = 'N/A';
      if (camp.price) {
        priceRange = `${camp.price}`;
      }

      return {
        id: `published_${camp.id}`,
        name: camp.camp_name,
        organization: organization?.name || 'Unknown Organization',
        status: 'Published',
        location: organization ? `${organization.name}` : 'Location TBD',
        sessions: sessions.length,
        priceRange,
        lastUpdated: new Date(camp.updated_at || camp.created_at).toLocaleDateString(),
        type: 'published',
        originalId: camp.id,
        rawData: camp
      };
    });

    // Process pending camps - now handles multiple camps per JSON entry
    const processedPendingCamps = [];
    
    (pendingCamps || []).forEach(camp => {
      try {
        const parsedData = JSON.parse(camp.info_json || '{}');
        
        if (parsedData.data && Array.isArray(parsedData.data) && parsedData.data.length > 0) {
          // Handle extracted data format - process ALL camps in the array
          parsedData.data.forEach((campData, index) => {
            let campInfo = { name: 'Unknown Camp', organization: 'Unknown Organization', location: 'Location TBD', price: 'N/A' };
            let sessionCount = 0;
            
            campInfo.name = campData.camp_info?.name || campInfo.name;
            campInfo.organization = campData.organization_info?.name || campInfo.organization;
            
            if (campData.sessions && Array.isArray(campData.sessions)) {
              sessionCount = campData.sessions.length;
              
              // Set location from first session
              if (campData.sessions[0]?.location_info) {
                const loc = campData.sessions[0].location_info;
                campInfo.location = `${loc.city || ''}, ${loc.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || campInfo.location;
              }
            }
            
            // Get price info
            if (campData.camp_info?.price) {
              campInfo.price = `$${campData.camp_info.price}`;
            } else {
              campInfo.price = campData.camp_info?.price_text || 
                              campData.camp_info?.description?.match(/\$[\d,]+/)?.[0] || 
                              campInfo.price;
            }
            
            processedPendingCamps.push({
              id: `pending_${camp.id}_${index}`, // Add index to make unique IDs for multiple camps
              name: campInfo.name,
              organization: campInfo.organization,
              status: 'Pending',
              location: campInfo.location,
              sessions: sessionCount,
              priceRange: campInfo.price,
              lastUpdated: new Date(camp.created_at).toLocaleDateString(),
              type: 'pending',
              originalId: camp.id,
              campIndex: index, // Track which camp in the JSON array this is
              rawData: camp
            });
          });
        } else {
          // Handle manual form data format
          let campInfo = { name: 'Unknown Camp', organization: 'Unknown Organization', location: 'Location TBD', price: 'N/A' };
          let sessionCount = 0;
          
          campInfo.name = parsedData.campName || campInfo.name;
          campInfo.organization = parsedData.organizationName || campInfo.organization;
          campInfo.location = `${parsedData.campCity || ''}, ${parsedData.campState || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || campInfo.location;
          campInfo.price = parsedData.costPerWeek ? `$${parsedData.costPerWeek}` : campInfo.price;
          
          // For manual entries, assume 1 session if dates are provided
          if (parsedData.startDate && parsedData.endDate) {
            sessionCount = 1;
          }
          
          processedPendingCamps.push({
            id: `pending_${camp.id}`,
            name: campInfo.name,
            organization: campInfo.organization,
            status: 'Pending',
            location: campInfo.location,
            sessions: sessionCount,
            priceRange: campInfo.price,
            lastUpdated: new Date(camp.created_at).toLocaleDateString(),
            type: 'pending',
            originalId: camp.id,
            campIndex: 0,
            rawData: camp
          });
        }
      } catch (error) {
        console.error('Error parsing camp data:', error);
        // Add a fallback entry even if parsing fails
        processedPendingCamps.push({
          id: `pending_${camp.id}_error`,
          name: 'Error parsing camp data',
          organization: 'Unknown Organization',
          status: 'Pending',
          location: 'Location TBD',
          sessions: 0,
          priceRange: 'N/A',
          lastUpdated: new Date(camp.created_at).toLocaleDateString(),
          type: 'pending',
          originalId: camp.id,
          campIndex: 0,
          rawData: camp
        });
      }
    });

    // Combine and sort by last updated
    const allCamps = [...processedPublishedCamps, ...processedPendingCamps]
      .sort((a, b) => new Date(b.rawData.updated_at || b.rawData.created_at).getTime() - new Date(a.rawData.updated_at || a.rawData.created_at).getTime());

    console.log(`Fetched ${processedPublishedCamps.length} published camps and ${processedPendingCamps.length} pending camps`);

    return NextResponse.json({
      success: true,
      data: allCamps,
      stats: {
        total: allCamps.length,
        published: processedPublishedCamps.length,
        pending: processedPendingCamps.length
      }
    });

  } catch (error) {
    console.error('Error fetching camps:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch camps' },
      { status: 500 }
    );
  }
};
