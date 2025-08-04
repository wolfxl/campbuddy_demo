"use client";
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import Banner from '@/components/Banner';
import { 
  getGroupedCamps, 
  getCampSessions, 
  getFilteredCamps,
  getCategories,
  subscribeToCampUpdates,
  GroupedCamp, 
  CampSession, 
  CampFilters 
} from '@/lib';

const CampsDirectoryContent = () => {
  const searchParams = useSearchParams();
  
  // State for camps data
  const [camps, setCamps] = useState<GroupedCamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // State for filters
  const [filters, setFilters] = useState<CampFilters>({
    age: '',
    grade: '',
    interests: [],
    dates: '',
    price: '',
    timeOfDay: '',
    distance: 10,
    search: '',
    location: '' // Initialize with empty location
  });

  // State for available categories
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // State for expanded sessions
  const [expandedCamps, setExpandedCamps] = useState<{ [key: number]: CampSession[] }>({});
  const [loadingSessions, setLoadingSessions] = useState<{ [key: number]: boolean }>({});

  // State for favorites
  const [favorites, setFavorites] = useState<number[]>([]);

  // Load initial camps data
  const loadCamps = useCallback(async (resetData = false) => {
    try {
      setLoading(resetData);
      setError(null);
      
      const offset = resetData ? 0 : currentOffset;
      const response = await getGroupedCamps(20, offset);
      
      if (response.error) {
        setError(response.error.message);
        return;
      }

      if (resetData) {
        setCamps(response.data || []);
        setCurrentOffset(20);
      } else {
        setCamps(prev => [...prev, ...(response.data || [])]);
        setCurrentOffset(prev => prev + 20);
      }
      
      setHasMore(response.hasMore || false);
      setTotalCount(response.count || 0);
    } catch (err) {
      setError('Failed to load camps. Please try again.');
      console.error('Error loading camps:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentOffset]);

  // Load more camps (pagination)
  const loadMoreCamps = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await loadCamps(false);
  }, [loadCamps, loadingMore, hasMore]);

  // Apply filters
  const applyFilters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if any filters are applied
      const hasActiveFilters = 
        filters.interests.length > 0 ||
        filters.grade !== '' ||
        filters.price !== '' ||
        (filters.search && filters.search.trim() !== '') ||
        (filters.location && filters.location.trim() !== '');

      let response;
      if (hasActiveFilters) {
        console.log('Applying filters:', filters); // Debug log
        response = await getFilteredCamps(filters, 20, 0);
      } else {
        response = await getGroupedCamps(20, 0);
      }
      
      if (response.error) {
        setError(response.error.message);
        return;
      }

      console.log('Filter results:', response.data?.length, 'camps found'); // Debug log
      setCamps(response.data || []);
      setCurrentOffset(20);
      setHasMore(response.hasMore || false);
      setTotalCount(response.data?.length || 0); // Update count for filtered results
    } catch (err) {
      setError('Failed to filter camps. Please try again.');
      console.error('Error filtering camps:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load camp sessions when expanded
  const loadCampSessions = useCallback(async (campId: number) => {
    if (expandedCamps[campId] || loadingSessions[campId]) return;
    
    setLoadingSessions(prev => ({ ...prev, [campId]: true }));
    
    try {
      const response = await getCampSessions(campId);
      
      if (response.error) {
        console.error('Error loading sessions:', response.error);
        return;
      }

      setExpandedCamps(prev => ({
        ...prev,
        [campId]: response.data || []
      }));
    } catch (err) {
      console.error('Error loading camp sessions:', err);
    } finally {
      setLoadingSessions(prev => ({ ...prev, [campId]: false }));
    }
  }, [expandedCamps, loadingSessions]);

  // Load available categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await getCategories();
      if (response.data) {
        setAvailableCategories(response.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }, []);

  // Initialize data and check for URL parameters
  useEffect(() => {
    // Check for location parameter from URL
    const locationParam = searchParams.get('location');
    if (locationParam) {
      setFilters(prev => ({
        ...prev,
        location: locationParam
      }));
    }
    
    loadCamps(true);
    loadCategories();
  }, []); // Only run on mount

  // Separate effect for handling location parameter changes
  useEffect(() => {
    const locationParam = searchParams.get('location');
    if (locationParam && locationParam !== filters.location) {
      setFilters(prev => ({
        ...prev,
        location: locationParam
      }));
    }
  }, [searchParams]); // Run when URL changes

  // Apply filters when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 500); // Debounce filter changes

    return () => clearTimeout(timeoutId);
  }, [filters.interests, filters.grade, filters.price, filters.search, filters.location]);

  // Real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToCampUpdates((payload) => {
      console.log('Real-time update received:', payload);
      
      // Show notification (you can implement a toast system later)
      if (payload.eventType === 'INSERT') {
        console.log('New camp added!');
        // Optionally reload data or add the new camp to the list
        loadCamps(true);
      }
    });

    return unsubscribe;
  }, [loadCamps]);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle interest selection
  const handleInterestChange = (interest: string) => {
    setFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  // Toggle favorite camp
  const toggleFavorite = (campId: number) => {
    setFavorites(prev =>
      prev.includes(campId)
        ? prev.filter(id => id !== campId)
        : [...prev, campId]
    );
  };

  // Toggle camp sessions view
  const toggleCampSessions = (campId: number) => {
    if (expandedCamps[campId]) {
      // Close sessions
      setExpandedCamps(prev => {
        const newState = { ...prev };
        delete newState[campId];
        return newState;
      });
    } else {
      // Load and show sessions
      loadCampSessions(campId);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      age: '',
      grade: '',
      interests: [],
      dates: '',
      price: '',
      timeOfDay: '',
      distance: 10,
      search: '',
      location: ''
    });
  };

  if (loading && camps.length === 0) {
    return (
      <div className={styles.campsPage}>
        <Banner 
          title="Summer Camps Directory"
          description="Browse and filter through hundreds of summer camps to find the perfect match for your child."
        />
        <div className="container">
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading camps...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && camps.length === 0) {
    return (
      <div className={styles.campsPage}>
        <Banner 
          title="Summer Camps Directory"
          description="Browse and filter through hundreds of summer camps to find the perfect match for your child."
        />
        <div className="container">
          <div className={styles.errorState}>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button 
              onClick={() => loadCamps(true)}
              className={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.campsPage}>
      <Banner 
        title="Summer Camps Directory"
        description="Browse and filter through hundreds of summer camps to find the perfect match for your child."
      />

      <div className="container">
        <div className={styles.campsLayout}>
          {/* Filters Sidebar */}
          <div className={styles.filtersSidebar}>
            <h2 className={styles.filtersTitle}>Filter Camps</h2>
            
            {/* Location Filter Display */}
            {filters.location && (
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Filtered by Location</label>
                <div className={styles.activeLocationFilter}>
                  <span>{filters.location}</span>
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, location: '' }))}
                    className={styles.clearLocationFilter}
                    title="Clear location filter"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            
            {/* Search */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search camps, organizations..."
                className={styles.filterInput}
              />
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Grade Level</label>
              <select 
                name="grade" 
                value={filters.grade} 
                onChange={handleFilterChange}
                className={styles.filterSelect}
              >
                <option value="">All Grades</option>
                <option value="0-2">K-2</option>
                <option value="3-5">3-5</option>
                <option value="6-8">6-8</option>
                <option value="9-12">9-12</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Categories</label>
              <div className={styles.interestsGrid}>
                {availableCategories.map(category => (
                  <div 
                    key={category}
                    className={`${styles.interestChip} ${filters.interests.includes(category) ? styles.selected : ''}`}
                    data-category={category.toLowerCase()}
                    onClick={() => handleInterestChange(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Price Range</label>
              <select 
                name="price" 
                value={filters.price} 
                onChange={handleFilterChange}
                className={styles.filterSelect}
              >
                <option value="">Any Price</option>
                <option value="under-200">Under $200/week</option>
                <option value="200-300">$200-$300/week</option>
                <option value="300-400">$300-$400/week</option>
                <option value="400-plus">$400+/week</option>
              </select>
            </div>

            <button 
              className={styles.resetFilters}
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>

          {/* Camps Grid */}
          <div className={styles.campsGrid}>
            <div className={styles.campsHeader}>
              <div className={styles.campsCount}>
                {totalCount > 0 ? `${totalCount} camps found` : 'No camps found'}
                {camps.length < totalCount && ` (showing ${camps.length})`}
                {/* Debug info */}
                {process.env.NODE_ENV === 'development' && (
                  <div style={{fontSize: '0.8rem', color: '#666', marginTop: '0.25rem'}}>
                    Active filters: {filters.interests.length > 0 && `Categories: ${filters.interests.join(', ')}`}
                    {filters.grade && ` | Grade: ${filters.grade}`}
                    {filters.price && ` | Price: ${filters.price}`}
                    {filters.search && ` | Search: ${filters.search}`}
                    {filters.location && ` | Location: ${filters.location}`}
                  </div>
                )}
              </div>
            </div>

            {camps.length === 0 ? (
              <div className={styles.noCamps}>
                <h3>No camps match your criteria</h3>
                <p>Try adjusting your filters to see more results.</p>
                <button onClick={resetFilters} className={styles.resetButton}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={styles.campsList}>
                {camps.map(camp => (
                  <div key={camp.id} className={styles.campCard}>
                    <div className={styles.campImageContainer}>
                      <div className={styles.campImage}></div>
                      <button 
                        className={`${styles.favoriteButton} ${favorites.includes(camp.id) ? styles.favorited : ''}`}
                        onClick={() => toggleFavorite(camp.id)}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill={favorites.includes(camp.id) ? 'currentColor' : 'none'} xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <div className={styles.campCategories}>
                        {camp.categories && camp.categories.length > 0 ? (
                          <>
                            {camp.categories.slice(0, 3).map((category, index) => (
                              <span 
                                key={`${category}-${index}`}
                                className={styles.campCategory}
                                data-category={category.toLowerCase()}
                              >
                                {category}
                              </span>
                            ))}
                            {camp.categories.length > 3 && (
                              <span 
                                className={styles.campCategory}
                                style={{ background: 'linear-gradient(135deg, #9E9E9E, #757575)' }}
                              >
                                +{camp.categories.length - 3}
                              </span>
                            )}
                          </>
                        ) : (
                          <span 
                            className={styles.campCategory}
                            data-category="general"
                          >
                            General
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.campInfo}>
                      <h3 className={styles.campName}>{camp.name}</h3>
                      <p className={styles.campOrg}>{camp.organization}</p>
                      
                      <div className={styles.campDetails}>
                        <div className={styles.campDetail}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {camp.date_range}
                        </div>
                        
                        <div className={styles.campDetail}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {camp.grade_range}
                        </div>
                        
                        <div className={styles.campDetail}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {camp.locations.join(', ') || 'Multiple locations'}
                        </div>
                        
                        <div className={styles.campDetail}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {camp.price}
                        </div>
                        
                        <div className={styles.campDetail}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 6H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 18H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {camp.session_count} session{camp.session_count !== 1 ? 's' : ''} available
                        </div>
                      </div>
                      
                      <p className={styles.campDescription}>
                        {camp.description.length > 150 
                          ? `${camp.description.substring(0, 150)}...` 
                          : camp.description
                        }
                      </p>
                      
                      <div className={styles.campActions}>
                        <button 
                          className={styles.campDetailsButton}
                          onClick={() => toggleCampSessions(camp.id)}
                          disabled={loadingSessions[camp.id]}
                        >
                          {loadingSessions[camp.id] 
                            ? 'Loading...' 
                            : expandedCamps[camp.id] 
                              ? 'Hide Sessions' 
                              : `View ${camp.session_count} Session${camp.session_count !== 1 ? 's' : ''}`
                          }
                        </button>
                        <button className={styles.campRegisterButton}>
                          Contact Organization
                        </button>
                      </div>

                      {/* Expanded Sessions */}
                      {expandedCamps[camp.id] && (
                        <div className={styles.campSessions}>
                          <h4>Available Sessions:</h4>
                          {expandedCamps[camp.id].map(session => (
                            <div key={session.id} className={styles.sessionCard}>
                              <div className={styles.sessionInfo}>
                                <span className={styles.sessionDates}>{session.dates}</span>
                                <span className={styles.sessionTimes}>{session.times}</span>
                                <span className={styles.sessionDays}>{session.days}</span>
                                <span className={styles.sessionLocation}>{session.location}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className={styles.loadMoreContainer}>
                    <button 
                      onClick={loadMoreCamps}
                      disabled={loadingMore}
                      className={styles.loadMoreButton}
                    >
                      {loadingMore ? 'Loading...' : 'Load More Camps'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// New parent component that includes Suspense
const CampsDirectoryPage = () => {
  return (
    <Suspense fallback={<div>Loading initial page data...</div>}>
      <CampsDirectoryContent />
    </Suspense>
  );
};

export default CampsDirectoryPage;