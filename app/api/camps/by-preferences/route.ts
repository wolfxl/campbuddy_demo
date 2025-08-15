import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { 
      availableCamps, 
      zipCode, 
      maxDistance, 
      totalBudget, 
      weeklyBudgetPerChild,
      selectedWeeksCount,
      childrenCount 
    } = await request.json();
    
    if (!availableCamps || !Array.isArray(availableCamps)) {
      return NextResponse.json(
        { error: 'Available camps data is required' },
        { status: 400 }
      );
    }

    console.log('[Preferences API] Filtering camps by preferences...');
    console.log('[Preferences API] ZIP Code:', zipCode);
    console.log('[Preferences API] Max Distance:', maxDistance, 'miles');
    console.log('[Preferences API] Total Budget:', totalBudget);
    console.log('[Preferences API] Weekly Budget per Child:', weeklyBudgetPerChild);
    console.log('[Preferences API] Selected Weeks:', selectedWeeksCount);
    console.log('[Preferences API] Children Count:', childrenCount);

    // Helper function to calculate distance between two coordinates
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 3959; // Earth's radius in miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Get coordinates for the ZIP code
    let homeCoords = null;
    if (zipCode) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&postalcode=${zipCode}&limit=1`,
          {
            headers: {
              'User-Agent': 'Camp-Planner-App/1.0'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            homeCoords = {
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon)
            };
            console.log('[Preferences API] Home coordinates:', homeCoords);
          }
        }
      } catch (error) {
        console.error('[Preferences API] Error geocoding ZIP code:', error);
      }
    }

    // Get unique location names from available camps
    const locationNames = new Set<string>();
    availableCamps.forEach((weekData: any) => {
      if (weekData && weekData.camps) {
        weekData.camps.forEach((campData: any) => {
          if (campData.session?.location) {
            locationNames.add(campData.session.location);
          }
        });
      }
    });

    // Fetch location coordinates from database
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('name, latitude, longitude, address, city, state')
      .in('name', Array.from(locationNames))
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (locationsError) {
      console.error('[Preferences API] Error fetching locations:', locationsError);
    }

    // Create location lookup map
    const locationLookup = new Map();
    if (locations) {
      locations.forEach((loc: any) => {
        locationLookup.set(loc.name, {
          lat: parseFloat(loc.latitude),
          lon: parseFloat(loc.longitude),
          address: loc.address,
          city: loc.city,
          state: loc.state
        });
      });
    }

    console.log('[Preferences API] Found coordinates for', locationLookup.size, 'locations');

    // Filter camps by preferences
    const filteredCampsByWeek = availableCamps.map((weekData: any) => {
      if (!weekData || !weekData.camps) return weekData;

      const filteredCamps = weekData.camps.filter((campData: any) => {
        const camp = campData.camp;
        const session = campData.session;

        // Budget filtering
        const campPrice = parseFloat(camp.price) || 0;
        
        // Check weekly budget per child
        if (weeklyBudgetPerChild && weeklyBudgetPerChild > 0) {
          if (campPrice > weeklyBudgetPerChild) {
            console.log(`[Preferences API] Filtered out ${camp.name}: $${campPrice} exceeds weekly budget $${weeklyBudgetPerChild}`);
            return false;
          }
        }

        // Check total budget (estimate: camp price * selected weeks * children)
        if (totalBudget && totalBudget > 0) {
          const estimatedTotalCost = campPrice * selectedWeeksCount * childrenCount;
          if (estimatedTotalCost > totalBudget) {
            console.log(`[Preferences API] Filtered out ${camp.name}: estimated total $${estimatedTotalCost} exceeds total budget $${totalBudget}`);
            return false;
          }
        }

        // Distance filtering
        if (homeCoords && maxDistance && session.location) {
          const locationCoords = locationLookup.get(session.location);
          if (locationCoords) {
            const distance = calculateDistance(
              homeCoords.lat, homeCoords.lon,
              locationCoords.lat, locationCoords.lon
            );
            
            if (distance > maxDistance) {
              console.log(`[Preferences API] Filtered out ${camp.name}: ${distance.toFixed(1)} miles exceeds max distance ${maxDistance} miles`);
              return false;
            }

            // Add distance info to the camp data
            campData.distance = distance;
            campData.location_details = {
              ...campData.location_details,
              coordinates: locationCoords,
              distance_miles: Math.round(distance * 10) / 10
            };
          } else {
            console.log(`[Preferences API] No coordinates found for location: ${session.location}`);
            // If we can't find coordinates and distance is required, filter out
            if (maxDistance < 50) { // Only filter if reasonable distance limit
              return false;
            }
          }
        }

        return true;
      });

      return {
        ...weekData,
        camps: filteredCamps,
        camps_count: filteredCamps.length
      };
    });

    // Calculate summary statistics
    const totalUniqueCamps = new Set();
    const organizationCampCounts: { [key: string]: number } = {};
    const budgetStats = {
      min_price: Infinity,
      max_price: 0,
      avg_price: 0,
      total_estimated_cost: 0
    };

    let totalPriceSum = 0;
    let totalCampCount = 0;

    filteredCampsByWeek.forEach((weekData: any) => {
      if (weekData && weekData.camps) {
        weekData.camps.forEach((campData: any) => {
          const camp = campData.camp;
          const price = parseFloat(camp.price) || 0;
          
          totalUniqueCamps.add(camp.id);
          
          const orgName = camp.organization;
          organizationCampCounts[orgName] = (organizationCampCounts[orgName] || 0) + 1;
          
          // Budget statistics
          if (price > 0) {
            budgetStats.min_price = Math.min(budgetStats.min_price, price);
            budgetStats.max_price = Math.max(budgetStats.max_price, price);
            totalPriceSum += price;
            totalCampCount++;
          }
        });
      }
    });

    if (totalCampCount > 0) {
      budgetStats.avg_price = Math.round(totalPriceSum / totalCampCount);
      budgetStats.total_estimated_cost = totalPriceSum * selectedWeeksCount * childrenCount;
    }

    if (budgetStats.min_price === Infinity) {
      budgetStats.min_price = 0;
    }

    console.log('[Preferences API] =================================');
    console.log('[Preferences API] CAMPS AFTER PREFERENCE FILTERING');
    console.log('[Preferences API] =================================');

    filteredCampsByWeek.forEach((weekData: any, index: number) => {
      if (weekData && weekData.camps.length > 0) {
        console.log(`[Preferences API] ${weekData.week.label}: ${weekData.camps_count} camps remaining`);
        weekData.camps.slice(0, 3).forEach((campData: any, campIndex: number) => {
          const distanceInfo = campData.distance ? ` (${campData.distance.toFixed(1)} miles)` : '';
          console.log(`[Preferences API]   ${campIndex + 1}. ${campData.camp.name} - $${campData.camp.price}${distanceInfo}`);
          console.log(`[Preferences API]      - ${campData.camp.organization} at ${campData.session.location}`);
        });
        if (weekData.camps.length > 3) {
          console.log(`[Preferences API]   ... and ${weekData.camps.length - 3} more camps`);
        }
        console.log('[Preferences API] ---------------------------------');
      }
    });

    console.log(`[Preferences API] Total unique camps after filtering: ${totalUniqueCamps.size}`);
    console.log(`[Preferences API] Price range: $${budgetStats.min_price} - $${budgetStats.max_price}`);
    console.log(`[Preferences API] Average price: $${budgetStats.avg_price}`);
    console.log(`[Preferences API] Estimated total cost: $${budgetStats.total_estimated_cost}`);

    return NextResponse.json({
      data: filteredCampsByWeek,
      summary: {
        total_unique_camps: totalUniqueCamps.size,
        total_organizations: Object.keys(organizationCampCounts).length,
        camps_by_organization: organizationCampCounts,
        budget_stats: budgetStats,
        filtering_applied: {
          zip_code: zipCode,
          max_distance_miles: maxDistance,
          total_budget: totalBudget,
          weekly_budget_per_child: weeklyBudgetPerChild,
          home_coordinates: homeCoords
        }
      }
    });

  } catch (error) {
    console.error('[Preferences API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}