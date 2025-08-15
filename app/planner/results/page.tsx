"use client";
import { usePlannerData } from '@/lib/client/usePlannerData';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { ClientScheduleOptimizer } from '@/lib/client/planner';
import { ScheduleOption } from '@/lib/algorithm/types';
import { GroupedCamp } from '@/lib/types';
import dynamic from 'next/dynamic';
import { CHILD_COLORS, ICODE_MCKINNEY_COORDS } from '@/lib/constants/planner';
import { GeocodingService, type Coordinates, type LocationData } from '@/lib/services/GeocodingService';
import { 
  calculatePlanTotals, 
  getMatchScoreInfo, 
  getMatchScoreProgress,
  extractMinGrade,
  extractMaxGrade,
  formatCurrency
} from '@/lib/utils/plannerUtils';
import {
  PlanState,
  ChildInPlan,
  CampInPlan,
  WeekInPlan,
  CostTotals
} from '@/lib/types/planner';

// Dynamically import ResultsMap to avoid SSR issues with Leaflet
const ResultsMap = dynamic(
  () => import('@/components/Map/ResultsMap'),
  { ssr: false }
);

// Function to convert plan data to map locations format
const convertPlanToMapLocations = async (plan: PlanState) => {
  const locationMap = new Map();
  
  // First, collect all unique location names from the plan
  const locationNames = new Set<string>();
  plan.weeks.forEach(week => {
    week.camps.forEach(camp => {
      locationNames.add(camp.location);
    });
  });
  
  // Fetch actual location data from the database
  const locationData = await GeocodingService.fetchLocationData(Array.from(locationNames));
  console.log('Fetched location data:', locationData);
  
  // Process each week's camps to build location data
  plan.weeks.forEach(week => {
    week.camps.forEach(camp => {
      const child = plan.children.find(c => c.id === camp.childId);
      const locationKey = camp.location;
      
      if (!locationMap.has(locationKey)) {
        // Look up the location in our fetched data
        const locationInfo = locationData.find(loc => loc.name === locationKey);
        
        if (locationInfo) {
          // Use actual database coordinates
          console.log(`Using database coordinates for ${locationKey}:`, locationInfo.latitude, locationInfo.longitude);
          locationMap.set(locationKey, {
            id: locationInfo.id,
            name: locationInfo.name,
            address: locationInfo.formatted_address || locationInfo.address,
            city: locationInfo.city,
            state: locationInfo.state,
            latitude: Number(locationInfo.latitude),
            longitude: Number(locationInfo.longitude),
            camps: []
          });
        } else {
          // Fallback to a default location with a warning
          console.warn(`Location data not found for: ${locationKey}, using fallback coordinates`);
          // Create a new location entry with iCode McKinney's actual coordinates
          const baseLatitude = ICODE_MCKINNEY_COORDS.lat;
          const baseLongitude = ICODE_MCKINNEY_COORDS.lng;
          
          locationMap.set(locationKey, {
            id: `location-${locationMap.size + 1}`,
            name: locationKey,
            address: locationKey,
            city: 'McKinney',
            state: 'TX',
            latitude: baseLatitude,
            longitude: baseLongitude,
            camps: [],
            isPlaceholder: true  // Mark this as a placeholder
          });
        }
      }
      
      // Add camp to location
      const location = locationMap.get(locationKey);
      location.camps.push({
        id: camp.id,
        name: camp.name,
        organization: camp.organization,
        childName: child?.name,
        weekLabel: week.name
      });
    });
  });
  
  return Array.from(locationMap.values());
};

// Function to convert pre-filtered camps to optimizer format
const convertPreFilteredCampsToOptimizerFormat = (preFilteredCamps: any[]): any[] => {
  const allCamps: any[] = [];
  
  preFilteredCamps.forEach((weekData) => {
    if (weekData && weekData.camps && Array.isArray(weekData.camps)) {
      weekData.camps.forEach((campWithSession: any) => {
        const camp = campWithSession.camp;
        const session = campWithSession.session;
        
        // Create a camp object in the format expected by the optimizer
        const optimizerCamp = {
          id: camp.id,
          name: camp.name,
          organization: camp.organization,
          description: camp.description || '',
          price: parseFloat(camp.price) || 0,
          price_numeric: parseFloat(camp.price) || 0,
          categories: camp.categories || [],
          grade_range: camp.grade_range || '',
          min_grade: extractMinGrade(camp.grade_range),
          max_grade: extractMaxGrade(camp.grade_range),
          // Fix: Add locations array that the optimizer expects
          locations: [session.location], // Array of location names
          sessions: [{
            id: session.id,
            start_date: session.start_date,
            end_date: session.end_date,
            start_time: session.start_time,
            end_time: session.end_time,
            days: session.days,
            location: session.location,
            location_details: session.location_details
          }],
          // Add distance info if available
          distance_miles: campWithSession.distance_miles || null,
          location_coordinates: campWithSession.location_details?.coordinates || null,
          // Add location coordinates if available (for matching utils)
          location_coords: campWithSession.location_details?.coordinates ? [{
            name: session.location,
            latitude: campWithSession.location_details.coordinates.lat,
            longitude: campWithSession.location_details.coordinates.lon
          }] : []
        };
        
        // Check if this camp already exists in the array (might have multiple sessions)
        const existingCampIndex = allCamps.findIndex(c => c.id === camp.id);
        if (existingCampIndex >= 0) {
          // Add session to existing camp and merge locations
          allCamps[existingCampIndex].sessions.push(optimizerCamp.sessions[0]);
          // Add location if not already present
          if (!allCamps[existingCampIndex].locations.includes(session.location)) {
            allCamps[existingCampIndex].locations.push(session.location);
          }
          // Merge location coordinates
          if (optimizerCamp.location_coords.length > 0) {
            const existingCoord = allCamps[existingCampIndex].location_coords.find(
              (coord: any) => coord.name === session.location
            );
            if (!existingCoord) {
              allCamps[existingCampIndex].location_coords.push(...optimizerCamp.location_coords);
            }
          }
        } else {
          // Add new camp
          allCamps.push(optimizerCamp);
        }
      });
    }
  });
  
  console.log('[Results] Converted camp sample:', allCamps[0]); // Debug log to see the structure
  return allCamps;
};

// Helper functions are now imported from @/lib/utils/plannerUtils

const PlannerResultsPage = () => {
  const router = useRouter();
  // State for generated schedule options
  const [scheduleOptions, setScheduleOptions] = useState<ScheduleOption[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [formData, setFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [suggestedCamps, setSuggestedCamps] = useState<GroupedCamp[]>([]);
  const [optimizer, setOptimizer] = useState<ClientScheduleOptimizer | null>(null);
  const [mapLocations, setMapLocations] = useState<any[]>([]);
  const [homeLocation, setHomeLocation] = useState<Coordinates | null>(null);
  
  // Child color mapping from constants
  const childColors = CHILD_COLORS;
  
  // Convert schedule option to display format
  const [plan, setPlan] = useState<PlanState | null>(null);
  
  // Memoized calculations
  const totals = useMemo(() => calculatePlanTotals(plan), [plan]);
  
  // Load form data and generate schedule
  useEffect(() => {
    // Prevent double execution
    if (hasLoaded) {
      console.log('Effect already ran, skipping');
      return;
    }
    
    let mounted = true; // Prevent state updates if component unmounts
    
    const loadData = async () => {
      try {
        // Try to get comprehensive planner data first
        let savedPlannerData = sessionStorage.getItem('plannerFullData');
        
        // Fallback to localStorage if not in sessionStorage
        if (!savedPlannerData) {
          console.log('Comprehensive data not found in sessionStorage, trying localStorage');
          savedPlannerData = localStorage.getItem('plannerFullData');
        }
        
        let parsedPlannerData = null;
        let parsedFormData = null;
        let preFilteredCamps = null;
        
        if (savedPlannerData) {
          // Use comprehensive data with pre-filtered camps
          console.log('[Results] Found comprehensive planner data with pre-filtered camps');
          parsedPlannerData = JSON.parse(savedPlannerData);
          parsedFormData = parsedPlannerData.formData;
          preFilteredCamps = parsedPlannerData.filteredCamps;
          
          console.log('[Results] Pre-filtered camps data:', preFilteredCamps?.length, 'weeks available');
          console.log('[Results] Using pre-filtered data, skipping API calls');
        } else {
          // Fallback: use old method with form data only
          console.log('[Results] No comprehensive data found, falling back to form data only');
          let savedFormData = sessionStorage.getItem('plannerFormData');
          
          if (!savedFormData) {
            console.log('Data not found in sessionStorage, trying localStorage');
            savedFormData = localStorage.getItem('plannerFormData');
          }
          
          if (!savedFormData) {
            console.error('No plan data found in any storage');
            if (mounted) {
              setError('No plan data found. Please go back and fill out the planner form.');
              setIsLoading(false);
            }
            return;
          }
          
          parsedFormData = JSON.parse(savedFormData);
        }
        
        // Validate form data has the required structure
        if (!parsedFormData.children || !Array.isArray(parsedFormData.children) || 
            !parsedFormData.weeks || !Array.isArray(parsedFormData.weeks)) {
          console.error('Invalid form data structure:', parsedFormData);
          if (mounted) {
            setError('The saved plan data is invalid. Please go back and try again.');
            setIsLoading(false);
          }
          return;
        }
        
        if (mounted) {
          setFormData(parsedFormData);
          setHasLoaded(true); // Mark as loaded to prevent re-run
          
          // Extract and set home location from form data
          if (parsedFormData.location) {
            GeocodingService.getZipcodeCoordinates(parsedFormData.location).then(coords => {
              if (coords && mounted) {
                setHomeLocation(coords);
                console.log('Home location set:', coords);
              }
            });
          }
        }
        
        try {
          // Generate schedules using the optimizer with better error logging
          console.log('[Results] Creating optimizer with form data');
          
          let initialCampsForOptimizer = [];
          
          if (preFilteredCamps && preFilteredCamps.length > 0) {
            // Use pre-filtered camps from planner steps
            console.log('[Results] Using pre-filtered camps from planner steps');
            console.log('[Results] Pre-filtered camps contain', preFilteredCamps.length, 'weeks of data');
            
            // Convert pre-filtered camps to the format expected by the optimizer
            initialCampsForOptimizer = convertPreFilteredCampsToOptimizerFormat(preFilteredCamps);
            console.log('[Results] Converted to optimizer format:', initialCampsForOptimizer.length, 'total camps');
          } else {
            // Fallback: fetch data from API (old method)
            console.log('[Results] No pre-filtered camps available, fetching from API...');
            // The existing fetchCampsWithInterests logic would go here
            // For now, we'll use empty array and let optimizer handle it
            console.warn('[Results] Using empty camps array - optimizer will need to fetch data');
          }
          
          const optimizer = new ClientScheduleOptimizer(parsedFormData, initialCampsForOptimizer, [], true);
          setOptimizer(optimizer);
          console.log('Generating schedule options');
          const options = await optimizer.generateScheduleOptions(); // Now async
          console.log('Generated options:', options);
          
          if (!mounted) return; // Exit if component unmounted
          
          if (options && options.length > 0) {
            setScheduleOptions(options);
            setSelectedScheduleId(options[0].scheduleId);
            
            // Convert first option to display format
            const selectedOption = options[0];
            if (selectedOption && mounted) {
            console.log('Converting first option to display format:', selectedOption);
            const convertedPlan = convertScheduleToDisplayFormat(selectedOption, parsedFormData);
            console.log('Conversion result:', convertedPlan);
              if (convertedPlan) {
              setPlan(convertedPlan);
              
              // Update map locations when plan is set (now async)
              convertPlanToMapLocations(convertedPlan).then(locations => {
                if (mounted) {
                  setMapLocations(locations);
                  console.log('Map locations set successfully:', locations);
                }
            }).catch(error => {
              console.error('Error setting map locations:', error);
            });
              
            console.log('Plan state set successfully');
              
                // Generate additional suggestions
              try {
                  const suggestions = optimizer.getAdditionalSuggestions(6);
                  setSuggestedCamps(suggestions);
                    console.log('Generated camp suggestions:', suggestions.length);
                  } catch (suggestionError) {
                    console.warn('Could not generate camp suggestions:', suggestionError);
                  }
                } else {
                  console.error('Failed to convert plan - conversion returned null');
                }
              }
          } else {
            console.warn('No schedule options generated');
            if (mounted) {
              setError('No suitable camps found matching your criteria. Please try different preferences.');
            }
          }
        } catch (algorithmError) {
          console.error('Algorithm error:', algorithmError);
          if (mounted) {
            if (algorithmError instanceof Error) {
              setError(`Error generating schedule: ${algorithmError.message}`);
            } else {
              setError('An unknown error occurred during schedule generation.');
            }
          }
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading plan data:', err);
        if (mounted) {
          if (err instanceof Error) {
            setError(`There was an error generating your plan: ${err.message}. Please try again.`);
          } else {
            setError('An unknown error occurred while loading plan data. Please try again.');
          }
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array is correct here since we only want this to run once
  
  // Convert algorithm schedule to display format
  const convertScheduleToDisplayFormat = (schedule: ScheduleOption, formDataToUse: any): PlanState | null => {
    console.log('=== Converting schedule to display format ===');
    console.log('Schedule input:', schedule);
    console.log('Form data input:', formDataToUse);
    
    if (!schedule || !formDataToUse) {
      console.error('Missing schedule or form data for conversion');
      return null;
    }
    
    try {
      const childrenWithColors: ChildInPlan[] = formDataToUse.children.map((child: any, index: number) => ({
        id: index, // Use index directly to match the childId from algorithm
        name: child.name || `Child ${index + 1}`,
        grade: String(child.grade),
        color: childColors[index % childColors.length]
      }));
      
      console.log('Children with colors:', childrenWithColors);
      
      const weeksData: WeekInPlan[] = schedule.weekSchedule.map(week => {
        console.log('Processing week for display:', week.weekLabel, 'with', week.children.length, 'children');
        
        const campsList: CampInPlan[] = week.children
          .filter(childWeekInfo => {
            const hasMatch = childWeekInfo.campMatch !== null;
            console.log(`  Child ${childWeekInfo.childId} (${childWeekInfo.childName}): has camp match = ${hasMatch}`);
            if (hasMatch && childWeekInfo.campMatch) {
              console.log(`    Camp: ${childWeekInfo.campMatch.camp.name}`);
            }
            return hasMatch;
          })
          .map(childWeekInfo => {
            const match = childWeekInfo.campMatch!;
            const campData = {
              id: String(match.camp.id),
              childId: childWeekInfo.childId, // Keep as number to match child.id
              name: match.camp.name,
              organization: match.camp.organization,
              location: match.session.location,
              times: match.session.times,
              price: String(match.camp.price),
              locked: false,
              matchScore: match.score,
              matchReasons: match.matchReasons || []
            };
            console.log('    Created camp data for display:', campData);
            return campData;
          });
        
        console.log(`  Week ${week.weekLabel} will have ${campsList.length} camps displayed`);
        
        return {
          id: typeof week.weekId === 'number' ? week.weekId : parseInt(String(week.weekId).replace('week', ''), 10) + 1,
          name: week.weekLabel,
          camps: campsList
        };
      });
      
      console.log('Final weeks data for display:', weeksData);
      
      const newPlan: PlanState = {
        children: childrenWithColors,
        weeks: weeksData,
        totalCost: schedule.totalCost,
        scheduleId: schedule.scheduleId,
        optimizationFocus: schedule.optimizationFocus,
        matchSummary: schedule.matchSummary
      };
      
      console.log('Final plan state:', newPlan);
      return newPlan;
    } catch (err) {
      console.error('Error converting schedule to display format:', err);
      return null;
    }
  };
  
  // Change selected schedule
  const selectSchedule = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
    const selected = scheduleOptions.find(option => option.scheduleId === scheduleId);
    if (selected && formData) {
      const convertedPlan = convertScheduleToDisplayFormat(selected, formData);
      if (convertedPlan) {
        setPlan(convertedPlan);
        // Update map locations when plan changes (now async)
        convertPlanToMapLocations(convertedPlan).then(locations => {
          setMapLocations(locations);
          console.log('Map locations updated for new schedule:', locations);
        }).catch(error => {
          console.error('Error updating map locations for new schedule:', error);
        });
      }
    }
  };
  
  // Toggle camp lock status
  const toggleLock = (weekId: number, campId: string | number) => {
    setPlan(prevPlan => {
      if (!prevPlan) return null;
      const updatedWeeks = prevPlan.weeks.map(week => {
        if (week.id === weekId) {
          const updatedCamps = week.camps.map(camp => {
            if (camp.id === campId) {
              return { ...camp, locked: !camp.locked };
            }
            return camp;
          });
          return { ...week, camps: updatedCamps };
        }
        return week;
      });
      return { ...prevPlan, weeks: updatedWeeks };
    });
  };
  
  // Totals are calculated using the memoized utility function at the top of the component
  
  // Show loading state
  if (isLoading) {
    return (
      <div className={styles.resultsPage}>
        <div className={styles.pageHeader}>
          <div className="container">
            <h1 className={styles.pageTitle}>Generating Your Summer Plan</h1>
            <p className={styles.pageDescription}>
              Please wait while we create the perfect summer schedule for your children...
            </p>
          </div>
          
          {/* Camps You Might Be Interested In Section */}
          {suggestedCamps.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-4">Camps You Might Be Interested In</h3>
              <p className="text-gray-600 mb-6">
                Based on {plan.children.map(c => c.name).join(' and ')}'s interests and preferences, here are some other great camps to consider:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedCamps.map(camp => (
                  <div key={camp.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-lg leading-tight">{camp.name}</h4>
                      <span className="text-blue-600 font-bold text-lg">{camp.price}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{camp.organization}</p>
                    <p className="text-gray-800 text-sm mb-4 line-clamp-2">{camp.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {camp.grade_range}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                          <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {camp.locations.slice(0, 2).join(', ')}
                        {camp.locations.length > 2 && ` +${camp.locations.length - 2} more`}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {camp.categories.slice(0, 3).map(category => (
                        <span key={category} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{category}</span>
                      ))}
                      {camp.categories.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">+{camp.categories.length - 3} more</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                        Add to Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="container">
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Analyzing camp options and optimizing your schedule...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error || !plan) {
    return (
      <div className={styles.resultsPage}>
        <div className={styles.pageHeader}>
          <div className="container">
            <h1 className={styles.pageTitle}>Something Went Wrong</h1>
            <p className={styles.pageDescription}>
              {error || 'There was an error generating your plan. Please try again.'}
            </p>
          </div>
        </div>
        
        <div className="container">
          <div className={styles.errorContainer}>
            <button 
              className={styles.primaryButton}
              onClick={() => router.push('/planner')}
            >
              Back to Planner
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.resultsPage}>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.pageTitle}>Your Summer Plan</h1>
          <p className={styles.pageDescription}>
            Here's the personalized summer schedule we've created for your children.
            <span className={styles.optimizationFocus}>Optimization: <strong>{plan.optimizationFocus}</strong></span>
          </p>
        </div>
      </div>
      
      <div className="container">
        <div className={styles.resultsContent}>
          <div className={styles.resultsHeader}>
            <div className={styles.headerLeft}>
              <h2 className={styles.sectionTitle}>Summer 2025 Schedule</h2>
              <div className={styles.childLegend}>
                {plan.children.map(child => (
                  <div key={child.id} className={styles.childLegendItem}>
                    <div 
                      className={styles.childColor} 
                      style={{ backgroundColor: child.color }}
                    ></div>
                    <span>{child.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.headerRight}>
              <button className={styles.actionButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Export Calendar
              </button>
              <button className={styles.actionButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Share Plan
              </button>
              <button className={styles.primaryButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Save Plan
              </button>
            </div>
          </div>
          
          <div className={styles.calendarView}>
            <div className={styles.calendarToolbar}>
            <div className={styles.viewOptions}>
            <button className={`${styles.viewButton} ${styles.active}`}>Calendar View</button>
            <button className={styles.viewButton}>List View</button>
            </div>
            
            {scheduleOptions.length > 0 && (
            <div className={styles.scheduleOptions}>
            <label>Schedule Options:</label>
            <div className={styles.optionButtons}>
                {scheduleOptions.map(option => (
                  <button
                      key={option.scheduleId}
                        className={`${styles.optionButton} ${selectedScheduleId === option.scheduleId ? styles.activeOption : ''}`}
                      onClick={() => selectSchedule(option.scheduleId)}
                    >
                      {option.optimizationFocus}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <button 
              className={styles.regenerateButton}
              onClick={() => {
                // Clear form data and redirect to planner
                sessionStorage.removeItem('plannerFormData');
                router.push('/planner');
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23 4V10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.51 9.00008C4.01717 7.56686 4.87913 6.28542 6.01547 5.27549C7.1518 4.26556 8.52547 3.56084 10.0083 3.22419C11.4911 2.88754 13.0348 2.93194 14.4952 3.35405C15.9556 3.77615 17.2853 4.56133 18.36 5.64008L23 10.0001M1 14.0001L5.64 18.3601C6.71475 19.4388 8.04437 20.224 9.50481 20.6461C10.9652 21.0682 12.5089 21.1126 13.9917 20.776C15.4745 20.4393 16.8482 19.7346 17.9845 18.7247C19.1209 17.7147 19.9828 16.4333 20.49 15.0001" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Start Over
            </button>
          </div>
            
            <div className={styles.calendar}>
              {plan.weeks.map(week => (
                <div key={week.id} className={styles.weekRow}>
                  <div className={styles.weekHeader}>
                    <h3 className={styles.weekName}>{week.name}</h3>
                  </div>
                  <div className={styles.weekCamps}>
                    {plan.children.map(child => {
                      const childCamp = week.camps.find(camp => Number(camp.childId) === Number(child.id));
                      
                      console.log(`Rendering week ${week.name} for child ${child.id} (${child.name}): found camp = ${childCamp ? childCamp.name : 'none'}`);
                      
                      return (
                        <div 
                          key={`${week.id}-${child.id}`} 
                          className={styles.campSlot}
                        >
                          {childCamp ? (
                            <div 
                              className={styles.campCard} 
                              style={{ borderColor: child.color }}
                            >
                              <div className={styles.campHeader}>
                                <h4 className={styles.campName}>{childCamp.name}</h4>
                                <button 
                                  className={`${styles.lockButton} ${childCamp.locked ? styles.locked : ''}`}
                                  onClick={() => toggleLock(week.id, childCamp.id)}
                                >
                                  {childCamp.locked ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </button>
                              </div>
                              <p className={styles.campOrg}>{childCamp.organization}</p>
                              
                              {/* Match score indicator */}
                              {childCamp.matchScore && (
                                <div className={styles.matchScoreContainer}>
                                  <div className={styles.matchScoreBar}>
                                    <div 
                                      className={styles.matchProgressFill}
                                      style={{ 
                                        width: `${getMatchScoreProgress(childCamp.matchScore)}%`,
                                        backgroundColor: getMatchScoreInfo(childCamp.matchScore).color
                                      }}
                                    ></div>
                                  </div>
                                  <span className={styles.matchScoreLabel}>
                                    {getMatchScoreInfo(childCamp.matchScore).category}
                                  </span>
                                </div>
                              )}
                              <div className={styles.campDetails}>
                                <div className={styles.campDetail}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  {childCamp.times}
                                </div>
                                <div className={styles.campDetail}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  {childCamp.location}
                                </div>
                                <div className={styles.campPrice}>{childCamp.price}</div>
                              </div>
                              
                              {/* Match reasons tooltip */}
                              {childCamp.matchReasons && childCamp.matchReasons.length > 0 && (
                                <div className={styles.matchReasons}>
                                  <button className={styles.matchReasonsToggle} type="button" title="Show match details">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                      <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                      <circle cx="12" cy="16" r="1" fill="currentColor" />
                                    </svg>
                                    Match details
                                  </button>
                                  <div className={styles.matchReasonsList}>
                                    <h5>Why This Camp Matches:</h5>
                                    <ul>
                                      {childCamp.matchReasons.map((reason, idx) => (
                                        <li key={idx}>{reason}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}
                              <div className={styles.campActions}>
                                <button className={styles.swapButton}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17 1L21 5L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M3 11V9C3 7.93913 3.42143 6.92172 4.17157 6.17157C4.92172 5.42143 5.93913 5 7 5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 23L3 19L7 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M21 13V15C21 16.0609 20.5786 17.0783 19.8284 17.8284C19.0783 18.5786 18.0609 19 17 19H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Swap
                                </button>
                                <button className={styles.detailsButton}>Details</button>
                                <button className={styles.registerButton}>Register</button>
                              </div>
                            </div>
                          ) : (
                            <div className={styles.emptyCampSlot}>
                              <div className={styles.emptySlotContent}>
                                <p>No camp scheduled</p>
                                <button className={styles.addCampButton}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Add Camp
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Map View Section */}
          {(mapLocations.length > 0 || homeLocation) && (
            <div className={styles.mapSection}>
              <ResultsMap 
                campLocations={mapLocations} 
                homeLocation={homeLocation}
              />
            </div>
          )}
          
          <div className={styles.summaryTable}>
            <h3 className={styles.summaryTitle}>Summer Plan Summary</h3>
            
            {/* Match summary metrics */}
            {plan.matchSummary && (
              <div className={styles.matchSummaryMetrics}>
                <div className={styles.matchMetric}>
                  <h4>Grade Match</h4>
                  <div className={styles.matchProgressBar}>
                    <div 
                      className={styles.matchProgressFill}
                      style={{ width: `${(plan.matchSummary.grade_match / (plan.weeks.length * plan.children.length)) * 100}%` }}
                    ></div>
                  </div>
                  <span>{plan.matchSummary.grade_match} of {plan.weeks.length * plan.children.length} slots</span>
                </div>
                
                <div className={styles.matchMetric}>
                  <h4>Price Match</h4>
                  <div className={styles.matchProgressBar}>
                    <div 
                      className={styles.matchProgressFill}
                      style={{ width: `${(plan.matchSummary.price_match / (plan.weeks.length * plan.children.length)) * 100}%` }}
                    ></div>
                  </div>
                  <span>{plan.matchSummary.price_match} of {plan.weeks.length * plan.children.length} slots</span>
                </div>
                
                <div className={styles.matchMetric}>
                  <h4>Activity Match</h4>
                  <div className={styles.matchProgressBar}>
                    <div 
                      className={styles.matchProgressFill}
                      style={{ width: `${(plan.matchSummary.category_match / (plan.weeks.length * plan.children.length)) * 100}%` }}
                    ></div>
                  </div>
                  <span>{plan.matchSummary.category_match} of {plan.weeks.length * plan.children.length} slots</span>
                </div>
                
                <div className={styles.matchMetric}>
                  <h4>Required Activities</h4>
                  <div className={styles.matchProgressBar}>
                    <div 
                      className={styles.matchProgressFill}
                      style={{ width: `${(plan.matchSummary.required_activities_match / (plan.weeks.length * plan.children.length)) * 100}%` }}
                    ></div>
                  </div>
                  <span>{plan.matchSummary.required_activities_match} of {plan.weeks.length * plan.children.length} slots</span>
                </div>
              </div>
            )}
            
            <div className={styles.summaryContent}>
              <table className={styles.campsTable}>
                <thead>
                  <tr>
                    <th>Child</th>
                    <th>Camp</th>
                    <th>Week</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.weeks.map(week => (
                    week.camps.map(camp => {
                      const child = plan.children.find(c => c.id === camp.childId);
                      
                      if (!child) {
                        return (
                          <tr key={`missing-child-${camp.id}`}>
                            <td colSpan={6}>Child data missing for camp {camp.name}</td>
                          </tr>
                        );
                      }
                      
                      return (
                        <tr key={camp.id}>
                          <td>
                            <div className={styles.childCell}>
                              <div 
                                className={styles.childColorDot} 
                                style={{ backgroundColor: child.color }}
                              ></div>
                              <span>{child.name}</span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.campCell}>
                              <strong>{camp.name}</strong>
                              <span>{camp.organization}</span>
                            </div>
                          </td>
                          <td>{week.name}</td>
                          <td>{camp.price}</td>
                          <td>
                            <span className={styles.statusPending}>Pending</span>
                          </td>
                          <td>
                            <button className={styles.registerButtonSmall}>Register</button>
                          </td>
                        </tr>
                      );
                    })
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className={styles.totalLabel}>
                      Total Cost
                    </td>
                    <td colSpan={3} className={styles.totalValue}>
                      {formatCurrency(totals.totalCost)}
                    </td>
                  </tr>
                  {plan.children.map(child => (
                    <tr key={`cost-${child.id}`}>
                      <td colSpan={3} className={styles.totalLabel}>
                        <div className={styles.childCell}>
                          <div 
                            className={styles.childColorDot} 
                            style={{ backgroundColor: child.color }}
                          ></div>
                          <span>{child.name}'s Camps</span>
                        </div>
                      </td>
                      <td colSpan={3} className={styles.totalValue}>
                        {formatCurrency(totals.childCosts[child.id] || 0)}
                      </td>
                    </tr>
                  ))}
                </tfoot>
              </table>
            </div>
          </div>
          
          <div className={styles.actionButtons}>
            <button 
              className={styles.secondaryButton}
              onClick={() => router.push('/planner')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Planner
            </button>
            <button className={styles.primaryButton}>
              Register for All Camps
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannerResultsPage;