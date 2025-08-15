"use client";
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { usePlannerResults } from '@/lib/hooks/planner/usePlannerResults';
import { calculatePlanTotals } from '@/lib/utils/plannerUtils';
import { 
  ResultsHeader, 
  ResultsToolbar, 
  ScheduleSelector, 
  CalendarGrid, 
  SummaryTable 
} from '@/components/planner/results';
import styles from './page.module.css';

// Dynamically import ResultsMap to avoid SSR issues with Leaflet
const ResultsMap = dynamic(
  () => import('@/components/Map/ResultsMap'),
  { ssr: false }
);

const PlannerResultsPage = () => {
  // Use the main results hook for all state management
  const {
    formData,
    isLoading,
    error,
    scheduleOptions,
    selectedScheduleId,
    plan,
    suggestedCamps,
    mapLocations,
    homeLocation,
    selectSchedule,
    toggleLock,
    goBackToPlanner
  } = usePlannerResults();

  // Memoized calculations
  const totals = useMemo(() => calculatePlanTotals(plan), [plan]);

  // Event handlers
  const handleExportCalendar = () => {
    // TODO: Implement calendar export
    console.log('Export calendar clicked');
  };

  const handleSharePlan = () => {
    // TODO: Implement plan sharing
    console.log('Share plan clicked');
  };

  const handleSavePlan = () => {
    // TODO: Implement plan saving
    console.log('Save plan clicked');
  };

  const handleSwapCamp = (weekId: number, campId: string | number) => {
    // TODO: Implement camp swapping
    console.log('Swap camp:', weekId, campId);
  };

  const handleViewDetails = (weekId: number, campId: string | number) => {
    // TODO: Implement view details
    console.log('View details:', weekId, campId);
  };

  const handleRegister = (weekId: number, campId: string | number) => {
    // TODO: Implement registration
    console.log('Register for camp:', weekId, campId);
  };

  const handleAddCamp = (weekId: number, childId: number) => {
    // TODO: Implement add camp
    console.log('Add camp for:', weekId, childId);
  };

  const handleRegisterAll = () => {
    // TODO: Implement register for all camps
    console.log('Register for all camps');
  };

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
                Based on your children's interests and preferences, here are some other great camps to consider:
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
              onClick={goBackToPlanner}
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
      {/* Results Header */}
      <ResultsHeader 
        plan={plan}
        onExportCalendar={handleExportCalendar}
        onSharePlan={handleSharePlan}
        onSavePlan={handleSavePlan}
      />

      <div className="container">
        <div className={styles.resultsContent}>
          {/* Results Toolbar */}
          <ResultsToolbar 
            plan={plan}
            onExportCalendar={handleExportCalendar}
            onSharePlan={handleSharePlan}
            onSavePlan={handleSavePlan}
          />

          {/* Calendar View */}
          <div className={styles.calendarView}>
            {/* Schedule Selector */}
            <ScheduleSelector
              scheduleOptions={scheduleOptions}
              selectedScheduleId={selectedScheduleId}
              onSelectSchedule={selectSchedule}
              onStartOver={goBackToPlanner}
            />

            {/* Calendar Grid */}
            <CalendarGrid
              plan={plan}
              onToggleLock={toggleLock}
              onSwapCamp={handleSwapCamp}
              onViewDetails={handleViewDetails}
              onRegister={handleRegister}
              onAddCamp={handleAddCamp}
            />
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

          {/* Summary Table */}
          <SummaryTable
            plan={plan}
            totals={totals}
            onRegister={handleRegister}
          />

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button 
              className={styles.secondaryButton}
              onClick={goBackToPlanner}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Planner
            </button>
            <button 
              className={styles.primaryButton}
              onClick={handleRegisterAll}
            >
              Register for All Camps
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannerResultsPage;