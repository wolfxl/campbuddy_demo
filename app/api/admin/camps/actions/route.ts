import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const POST = async (req: NextRequest) => {
  try {
    const { action, campIds, editedData } = await req.json();

    console.log('Camp action requested:', { action, campIds });

    switch (action) {
      case 'approve':
        return await approvePendingCamps(campIds);
      case 'approve_edited':
        return await approveEditedCamp(campIds, editedData);
      case 'save_edits':
        return await saveEditsToJson(campIds, editedData);
      case 'update_camp':
        return await updateCamp(campIds, editedData);
      case 'archive':
        return await archiveCamps(campIds);
      case 'delete':
        return await deleteCamps(campIds);
      case 'view_details':
        return await getCampDetails(campIds[0]);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing camp action:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Action failed' },
      { status: 500 }
    );
  }
};

const approvePendingCamps = async (campIds: string[]) => {
  const results = [];
  
  for (const campId of campIds) {
    if (!campId.startsWith('pending_')) {
      continue; // Skip non-pending camps
    }
    
    // Parse campId to get actualId and campIndex (for multiple camps in one JSON)
    const parts = campId.replace('pending_', '').split('_');
    const actualId = parts[0];
    const campIndex = parts.length > 1 ? parseInt(parts[1]) : 0;
    
    try {
      // Get the pending camp data
      const { data: pendingCamp, error: fetchError } = await supabase
        .from('new_camp')
        .select('*')
        .eq('id', actualId)
        .single();

      if (fetchError || !pendingCamp) {
        results.push({ id: campId, success: false, error: 'Camp not found' });
        continue;
      }

      const parsedData = JSON.parse(pendingCamp.info_json || '{}');
      
      // Convert to published camp format
      let campToCreate, organizationToCreate;
      
      if (parsedData.data && Array.isArray(parsedData.data) && parsedData.data.length > campIndex) {
        // Handle extracted data format - get the specific camp by index
        const campData = parsedData.data[campIndex];
        
        organizationToCreate = {
          name: campData.organization_info?.name || 'Unknown Organization',
          contact_email: campData.organization_info?.email || campData.organization_info?.contact_email,
          contact_phone: campData.organization_info?.contact_phone || campData.organization_info?.contact_details,
          website: campData.organization_info?.website
        };
        
        // Add location info if available from sessions
        if (campData.sessions?.[0]?.location_info) {
          const loc = campData.sessions[0].location_info;
          organizationToCreate.address = loc.address;
          organizationToCreate.city = loc.city;
          organizationToCreate.state = loc.state;
          organizationToCreate.zip_code = loc.zip_code;
          organizationToCreate.latitude = loc.latitude;
          organizationToCreate.longitude = loc.longitude;
        }
        
        campToCreate = {
          name: campData.camp_info?.name || 'Unnamed Camp',
          description: campData.camp_info?.description,
          age_range_min: campData.camp_info?.min_grade || 5,
          age_range_max: campData.camp_info?.max_grade || 12,
          category: campData.categories?.[0] || 'General'
        };
      } else {
        // Handle manual form data format
        organizationToCreate = {
          name: parsedData.organizationName || 'Unknown Organization',
          contact_email: parsedData.contactEmail,
          contact_phone: parsedData.contactPhone,
          website: parsedData.campWebsite,
          address: parsedData.campAddress,
          city: parsedData.campCity,
          state: parsedData.campState,
          zip_code: parsedData.campZip
        };
        
        campToCreate = {
          name: parsedData.campName || 'Unnamed Camp',
          description: parsedData.campDescription,
          age_range_min: parseInt(parsedData.ageRangeMin) || 5,
          age_range_max: parseInt(parsedData.ageRangeMax) || 12,
          category: parsedData.campCategory || 'General',
          price_per_week: parseFloat(parsedData.costPerWeek) || null,
          start_date: parsedData.startDate,
          end_date: parsedData.endDate,
          registration_url: parsedData.registrationUrl
        };
      }
      
      // Insert or find organization
      let organizationId;
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', organizationToCreate.name)
        .single();
      
      if (existingOrg) {
        organizationId = existingOrg.id;
      } else {
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert([organizationToCreate])
          .select('id')
          .single();
        
        if (orgError) {
          console.error('Organization creation error:', orgError);
          results.push({ id: campId, success: false, error: 'Failed to create organization: ' + orgError.message });
          continue;
        }
        organizationId = newOrg.id;
      }
      
      // Insert camp
      const { data: newCamp, error: campError } = await supabase
        .from('camps')
        .insert([{ ...campToCreate, organization_id: organizationId }])
        .select('id')
        .single();
      
      if (campError) {
        console.error('Camp creation error:', campError);
        results.push({ id: campId, success: false, error: 'Failed to create camp: ' + campError.message });
        continue;
      }
      
      // Create sessions if available
      if (parsedData.data?.[campIndex]?.sessions) {
        const sessions = parsedData.data[campIndex].sessions.map((session: any) => {
          // Parse price from camp info
          let sessionPrice = null;
          if (session.price) {
            sessionPrice = parseFloat(session.price.replace(/[^\\d.]/g, ''));
          } else if (parsedData.data[campIndex].camp_info?.price) {
            sessionPrice = parsedData.data[campIndex].camp_info.price;
          } else if (parsedData.data[campIndex].camp_info?.price_text) {
            sessionPrice = parseFloat(parsedData.data[campIndex].camp_info.price_text.replace(/[^\\d.]/g, ''));
          }
          
          return {
            camp_id: newCamp.id,
            start_date: session.start_date,
            end_date: session.end_date,
            start_time: session.start_time,
            end_time: session.end_time,
            price: sessionPrice,
            days_of_week: session.days_of_week_text || null
          };
        });
        
        const { error: sessionError } = await supabase
          .from('camp_sessions')
          .insert(sessions);
          
        if (sessionError) {
          console.error('Session creation error:', sessionError);
          // Continue anyway, camp is created
        }
      }
      
      results.push({ id: campId, success: true, newCampId: newCamp.id });
      
    } catch (error) {
      console.error(`Error approving camp ${campId}:`, error);
      results.push({ id: campId, success: false, error: 'Processing failed: ' + (error instanceof Error ? error.message : 'Unknown error') });
    }
  }
  
  return NextResponse.json({
    success: true,
    message: `Processed ${results.length} camps`,
    results
  });
};

const saveEditsToJson = async (campIds: string[], editedData: any) => {
  if (!campIds[0] || !campIds[0].startsWith('pending_')) {
    return NextResponse.json(
      { error: 'Invalid camp ID for saving edits' },
      { status: 400 }
    );
  }

  // Parse campId to get actualId and campIndex
  const parts = campIds[0].replace('pending_', '').split('_');
  const actualId = parts[0];
  const campIndex = parts.length > 1 ? parseInt(parts[1]) : 0;
  
  try {
    // Get the current camp data
    const { data: currentCamp, error: fetchError } = await supabase
      .from('new_camp')
      .select('*')
      .eq('id', actualId)
      .single();

    if (fetchError || !currentCamp) {
      return NextResponse.json(
        { error: 'Camp not found' },
        { status: 404 }
      );
    }

    // Parse the current JSON
    const parsedData = JSON.parse(currentCamp.info_json || '{}');
    
    // Update the specific camp in the data array
    if (parsedData.data && Array.isArray(parsedData.data) && parsedData.data.length > campIndex) {
      // Convert editedData back to the original JSON format
      const updatedCampData = {
        organization_info: {
          name: editedData.organization?.name || '',
          email: editedData.organization?.email || '',
          contact_details: editedData.organization?.contact || ''
        },
        camp_info: {
          name: editedData.camp?.camp_name || '',
          description: editedData.camp?.description || '',
          price: editedData.camp?.price || 0,
          min_grade: editedData.camp?.min_grade || 1,
          max_grade: editedData.camp?.max_grade || 12
        },
        sessions: editedData.sessions?.map((session: any) => ({
          start_date: session.start_date,
          end_date: session.end_date,
          start_time: session.start_time,
          end_time: session.end_time,
          location_info: {
            name: editedData.location?.name || '',
            address: editedData.location?.address || '',
            city: editedData.location?.city || '',
            state: editedData.location?.state || '',
            zip_code: editedData.location?.zip || '',
            latitude: editedData.location?.latitude || null,
            longitude: editedData.location?.longitude || null,
            geocoding_status: 'SUCCESS'
          }
        })) || [],
        categories: editedData.categories || ['General']
      };
      
      // Update the specific camp in the array
      parsedData.data[campIndex] = updatedCampData;
    } else {
      // Handle single camp format or create new structure
      parsedData.data = [{
        organization_info: {
          name: editedData.organization?.name || '',
          email: editedData.organization?.email || '',
          contact_details: editedData.organization?.contact || ''
        },
        camp_info: {
          name: editedData.camp?.camp_name || '',
          description: editedData.camp?.description || '',
          price: editedData.camp?.price || 0,
          min_grade: editedData.camp?.min_grade || 1,
          max_grade: editedData.camp?.max_grade || 12
        },
        sessions: editedData.sessions?.map((session: any) => ({
          start_date: session.start_date,
          end_date: session.end_date,
          start_time: session.start_time,
          end_time: session.end_time,
          location_info: {
            name: editedData.location?.name || '',
            address: editedData.location?.address || '',
            city: editedData.location?.city || '',
            state: editedData.location?.state || '',
            zip_code: editedData.location?.zip || '',
            latitude: editedData.location?.latitude || null,
            longitude: editedData.location?.longitude || null,
            geocoding_status: 'SUCCESS'
          }
        })) || [],
        categories: editedData.categories || ['General']
      }];
    }
    
    // Update the JSON in the database
    const { error: updateError } = await supabase
      .from('new_camp')
      .update({
        info_json: JSON.stringify(parsedData)
      })
      .eq('id', actualId);
    
    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to save changes: ' + updateError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Changes saved to JSON successfully'
    });
    
  } catch (error) {
    console.error('Error saving edits to JSON:', error);
    return NextResponse.json(
      { error: 'Failed to save changes: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
};

const approveEditedCamp = async (campIds: string[], editedData: any) => {
  if (!campIds[0] || !campIds[0].startsWith('pending_')) {
    return NextResponse.json(
      { error: 'Invalid camp ID for approval' },
      { status: 400 }
    );
  }

  // Parse campId to get actualId and campIndex
  const parts = campIds[0].replace('pending_', '').split('_');
  const actualId = parts[0];
  const campIndex = parts.length > 1 ? parseInt(parts[1]) : 0;
  
  try {
    // Start transaction-like operations
    let organizationId, locationId, campId;
    
    // 1. Find or create organization (by exact name)
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('name', editedData.organization.name)
      .single();
    
    if (existingOrg) {
      organizationId = existingOrg.id;
      // Update existing organization
      await supabase
        .from('organizations')
        .update({
          email: editedData.organization.email,
          contact: editedData.organization.contact,
          updated_at: new Date().toISOString()
        })
        .eq('id', organizationId);
    } else {
      // Create new organization
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert([{
          name: editedData.organization.name,
          email: editedData.organization.email,
          contact: editedData.organization.contact,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id')
        .single();
      
      if (orgError) {
        console.error('Organization creation error:', orgError);
        return NextResponse.json(
          { error: 'Failed to create organization: ' + orgError.message },
          { status: 500 }
        );
      }
      organizationId = newOrg.id;
    }
    
    // 2. Find or create location (by address+city+state+zip)
    const { data: existingLocation } = await supabase
      .from('locations')
      .select('id')
      .eq('address', editedData.location.address)
      .eq('city', editedData.location.city)
      .eq('state', editedData.location.state)
      .eq('zip', editedData.location.zip)
      .single();
    
    if (existingLocation) {
      locationId = existingLocation.id;
      // Update existing location with any new data
      await supabase
        .from('locations')
        .update({
          name: editedData.location.name,
          latitude: editedData.location.latitude,
          longitude: editedData.location.longitude,
          formatted_address: editedData.location.formatted_address || `${editedData.location.address}, ${editedData.location.city}, ${editedData.location.state} ${editedData.location.zip}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', locationId);
    } else {
      // Create new location
      const { data: newLocation, error: locationError } = await supabase
        .from('locations')
        .insert([{
          name: editedData.location.name,
          address: editedData.location.address,
          city: editedData.location.city,
          state: editedData.location.state,
          zip: editedData.location.zip,
          latitude: editedData.location.latitude,
          longitude: editedData.location.longitude,
          formatted_address: editedData.location.formatted_address || `${editedData.location.address}, ${editedData.location.city}, ${editedData.location.state} ${editedData.location.zip}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id')
        .single();
      
      if (locationError) {
        console.error('Location creation error:', locationError);
        return NextResponse.json(
          { error: 'Failed to create location: ' + locationError.message },
          { status: 500 }
        );
      }
      locationId = newLocation.id;
    }
    
    // 3. Create camp
    const { data: newCamp, error: campError } = await supabase
      .from('camps')
      .insert([{
        organization_id: organizationId,
        camp_name: editedData.camp.camp_name,
        description: editedData.camp.description,
        price: editedData.camp.price,
        min_grade: editedData.camp.min_grade,
        max_grade: editedData.camp.max_grade,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('id')
      .single();
    
    if (campError) {
      console.error('Camp creation error:', campError);
      return NextResponse.json(
        { error: 'Failed to create camp: ' + campError.message },
        { status: 500 }
      );
    }
    
    campId = newCamp.id;
    
    // 4. Create camp sessions
    if (editedData.sessions && editedData.sessions.length > 0) {
      const sessions = editedData.sessions.map((session: any) => ({
        camp_id: campId,
        location_id: locationId,
        start_date: session.start_date,
        end_date: session.end_date,
        days: session.days,
        start_time: session.start_time,
        end_time: session.end_time,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      const { error: sessionError } = await supabase
        .from('camp_sessions')
        .insert(sessions);
      
      if (sessionError) {
        console.error('Session creation error:', sessionError);
        return NextResponse.json(
          { error: 'Failed to create sessions: ' + sessionError.message },
          { status: 500 }
        );
      }
    }
    
    // 5. Handle categories
    if (editedData.categories && editedData.categories.length > 0) {
      for (const categoryName of editedData.categories) {
        // Find or create category
        let categoryId;
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .single();
        
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert([{
              name: categoryName,
              created_at: new Date().toISOString()
            }])
            .select('id')
            .single();
          
          if (categoryError) {
            console.error('Category creation error:', categoryError);
            continue; // Skip this category if creation fails
          }
          categoryId = newCategory.id;
        }
        
        // Link camp to category
        const { error: linkError } = await supabase
          .from('camp_categories')
          .insert([{
            camp_id: campId,
            category_id: categoryId
          }]);
        
        if (linkError) {
          console.error('Category linking error:', linkError);
          // Continue anyway, category linking is not critical
        }
      }
    }
    
    // 6. Delete from new_camp table
    const { error: deleteError } = await supabase
      .from('new_camp')
      .delete()
      .eq('id', actualId);
    
    if (deleteError) {
      console.error('Delete error:', deleteError);
      // Continue anyway, camp is published successfully
    }
    
    return NextResponse.json({
      success: true,
      message: 'Camp published successfully',
      campId: campId,
      organizationId: organizationId,
      locationId: locationId
    });
    
  } catch (error) {
    console.error('Error publishing camp:', error);
    return NextResponse.json(
      { error: 'Failed to publish camp: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
};

const updateCamp = async (campIds: string[], editedData: any) => {
  // Implementation for updating existing published camps
  return NextResponse.json({
    success: true,
    message: 'Update functionality not yet implemented',
    campIds
  });
};

const archiveCamps = async (campIds: string[]) => {
  // Implementation for archiving camps
  return NextResponse.json({
    success: true,
    message: 'Archive functionality not yet implemented',
    campIds
  });
};

const deleteCamps = async (campIds: string[]) => {
  const results = [];
  
  for (const campId of campIds) {
    try {
      if (campId.startsWith('pending_')) {
        const actualId = campId.replace('pending_', '').split('_')[0];
        const { error } = await supabase
          .from('new_camp')
          .delete()
          .eq('id', actualId);
        
        results.push({ id: campId, success: !error, error: error?.message });
      } else if (campId.startsWith('published_')) {
        const actualId = campId.replace('published_', '');
        // For published camps, you might want to archive instead of delete
        const { error } = await supabase
          .from('camps')
          .update({ archived: true })
          .eq('id', actualId);
        
        results.push({ id: campId, success: !error, error: error?.message });
      }
    } catch (error) {
      results.push({ id: campId, success: false, error: 'Delete failed' });
    }
  }
  
  return NextResponse.json({
    success: true,
    message: `Processed ${results.length} deletions`,
    results
  });
};

const getCampDetails = async (campId: string) => {
  try {
    if (campId.startsWith('pending_')) {
      // Parse campId to get actualId and campIndex (for multiple camps in one JSON)
      const parts = campId.replace('pending_', '').split('_');
      const actualId = parts[0];
      const campIndex = parts.length > 1 ? parseInt(parts[1]) : 0;
      
      const { data, error } = await supabase
        .from('new_camp')
        .select('*')
        .eq('id', actualId)
        .single();
      
      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch camp details: ' + error.message },
          { status: 500 }
        );
      }
      
      // Parse the JSON and extract the specific camp
      const parsedData = JSON.parse(data.info_json || '{}');
      
      // If we have multiple camps, return the specific one
      if (parsedData.data && Array.isArray(parsedData.data) && parsedData.data.length > campIndex) {
        return NextResponse.json({
          success: true,
          data: {
            ...parsedData,
            data: [parsedData.data[campIndex]] // Return only the specific camp
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        data: parsedData
      });
    } else if (campId.startsWith('published_')) {
      const actualId = campId.replace('published_', '');
      const { data, error } = await supabase
        .from('camps')
        .select(`
          *,
          organizations (*),
          camp_sessions (*)
        `)
        .eq('id', actualId)
        .single();
      
      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch camp details: ' + error.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid camp ID format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching camp details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch camp details' },
      { status: 500 }
    );
  }
};
