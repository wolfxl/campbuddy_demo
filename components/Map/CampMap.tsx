"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationWithCamps } from '@/lib/types';
import styles from './CampMap.module.css';

// Custom Marker Icon type fix for TypeScript
declare module 'leaflet' {
  interface IconOptions {
    shadowUrl?: string;
    iconRetinaUrl?: string;
    iconUrl: string;
    shadowSize?: Point;
    shadowAnchor?: Point;
    iconSize?: Point;
    iconAnchor?: Point;
  }
}

interface CampMapProps {
  initialLocations?: LocationWithCamps[];
}

const CampMap: React.FC<CampMapProps> = ({ initialLocations = [] }) => {
  const searchParams = useSearchParams();
  const [mapData, setMapData] = useState<LocationWithCamps[]>(initialLocations);
  const [loading, setLoading] = useState<boolean>(!initialLocations.length);
  const [error, setError] = useState<string | null>(null);
  const [searchApplied, setSearchApplied] = useState<boolean>(false);
  const [searchStats, setSearchStats] = useState<{
    totalCamps: number;
    totalLocations: number;
  }>({ totalCamps: 0, totalLocations: 0 });
  
  // Function to fetch filtered map data
  const fetchFilteredMapData = useCallback(async (params: Record<string, string>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query string from params
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const queryString = queryParams.toString();
      const url = queryString 
        ? `/api/map/search?${queryString}` 
        : '/api/map';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch map data');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setMapData(data.data || []);
      setSearchApplied(data.searchApplied || false);
      setSearchStats({
        totalCamps: data.totalCamps || 0,
        totalLocations: data.totalLocations || 0
      });
    } catch (err) {
      console.error('Error fetching filtered map data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fix for Leaflet marker icons in Next.js
  useEffect(() => {
    // This is needed for Leaflet to work properly in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
      iconUrl: '/images/leaflet/marker-icon.png',
      shadowUrl: '/images/leaflet/marker-shadow.png',
    });
  }, []);
  
  // Listen for search events from the search form
  useEffect(() => {
    const handleSearchEvent = (event: CustomEvent) => {
      const searchCriteria = event.detail;
      fetchFilteredMapData(searchCriteria);
    };

    // Add event listener
    window.addEventListener('campSearch', handleSearchEvent as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('campSearch', handleSearchEvent as EventListener);
    };
  }, [fetchFilteredMapData]);

  // Handle URL search parameters
  useEffect(() => {
    // Check if we have any search parameters in the URL
    const location = searchParams.get('location');
    const age = searchParams.get('age');
    const interests = searchParams.get('interests');
    const date = searchParams.get('date');
    
    const hasSearchParams = !!(location || age || interests || date);
    
    // If there are search parameters, fetch filtered data
    if (hasSearchParams) {
      fetchFilteredMapData({
        location: location || '',
        age: age || '',
        interests: interests || '',
        date: date || ''
      });
    } else if (initialLocations.length > 0) {
      // If we already have initial data from server and no search params, use that
      setMapData(initialLocations);
      setLoading(false);
    } else {
      // Otherwise fetch all locations
      const fetchMapData = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/map');
          
          if (!response.ok) {
            throw new Error('Failed to fetch map data');
          }
          
          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          setMapData(data.data || []);
        } catch (err) {
          console.error('Error fetching map data:', err);
          setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
          setLoading(false);
        }
      };
      
      fetchMapData();
    }
  }, [initialLocations, searchParams, fetchFilteredMapData]);
  
  // Default to Carrollton, TX
  const defaultCenter: [number, number] = [32.9537, -96.8903]; // Carrollton, TX
  
  // If we have locations, calculate the center
  const calculateCenter = (): [number, number] => {
    if (mapData.length === 0) return defaultCenter;
    
    // Calculate the center from all locations
    const lats = mapData.map(loc => loc.latitude);
    const lngs = mapData.map(loc => loc.longitude);
    
    const avgLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;
    const avgLng = lngs.reduce((sum, lng) => sum + lng, 0) / lngs.length;
    
    return [avgLat, avgLng];
  };
  
  // Reference to the map instance
  const mapRef = React.useRef<L.Map | null>(null);
  
  // Update map view when data changes
  useEffect(() => {
    if (mapRef.current && mapData.length > 0) {
      // If we have search results, fit the map to show all markers
      if (searchApplied) {
        const bounds = L.latLngBounds(mapData.map(loc => [
          Number(loc.latitude),
          Number(loc.longitude)
        ]));
        
        // Add some padding around the bounds
        mapRef.current.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 12
        });
      }
    }
  }, [mapData, searchApplied]);
  
  // Custom marker icon based on camp count
  const createMarkerIcon = (campCount: number, isSearchResult: boolean = false) => {
    const size = Math.min(30 + campCount * 3, 60); // Size between 30-60px based on count
    const backgroundColor = isSearchResult ? '#ff5722' : '#3498db'; // Orange for search results, blue for regular
    
    return new L.DivIcon({
      html: `<div class="${styles.markerIcon}" style="width:${size}px;height:${size}px;background-color:${backgroundColor};">
               <span>${campCount}</span>
             </div>`,
      className: styles.customMarker,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };
  
  if (loading) {
    return (
      <div className={styles.mapContainer}>
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>Loading camp locations...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.mapContainer}>
        <div className={styles.errorOverlay}>
          <p>Error loading map: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (mapData.length === 0) {
    return (
      <div className={styles.mapContainer}>
        <div className={styles.noDataOverlay}>
          <p>No camp locations available to display</p>
        </div>
      </div>
    );
  }
  
  return (
    <div id="camp-map-section" className={styles.mapWrapper}>
      <h2 className={styles.mapTitle}>Explore Our Camp Locations</h2>
      
      {searchApplied ? (
        <div className={styles.searchResults}>
          <p className={styles.mapDescription}>
            Found <strong>{searchStats.totalCamps} camps</strong> at <strong>{searchStats.totalLocations} locations</strong> matching your search criteria.
            {searchStats.totalCamps === 0 && (
              <span> Try adjusting your search parameters for more results.</span>
            )}
          </p>
          <button 
            onClick={() => window.location.href = '/#camp-map-section'}
            className={styles.resetButton}
          >
            Reset Search
          </button>
        </div>
      ) : (
        <p className={styles.mapDescription}>
          Discover the variety of camps available across different locations.
          Click on a marker to see details about camps at that location.
        </p>
      )}
      
      <div className={styles.mapContainer}>
        <MapContainer
          center={calculateCenter()}
          zoom={10}
          scrollWheelZoom={false}
          className={styles.leafletContainer}
          ref={(map) => { mapRef.current = map; }}
        >
          {/* Using CartoDB Positron (Light theme) tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          
          {mapData.map((location) => (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={createMarkerIcon(location.camp_count, searchApplied)}
            >
              <Popup className={styles.mapPopup}>
                <div className={styles.popupContent}>
                  <h3 className={styles.locationName}>{location.name}</h3>
                  <p className={styles.locationAddress}>{location.formatted_address || `${location.city}, ${location.state}`}</p>
                  <p className={styles.campCount}>
                    {location.camp_count} camp{location.camp_count !== 1 ? 's' : ''} at this location
                    {searchApplied && <span className={styles.matchBadge}>Matches your search</span>}
                  </p>
                  
                  <div className={styles.campsList}>
                    {location.camps.map(camp => (
                      <div key={camp.id} className={styles.campItem}>
                        <h4 className={styles.campName}>{camp.name}</h4>
                        <p className={styles.campOrg}>{camp.organization}</p>
                        <div className={styles.campCategories}>
                          {camp.categories.slice(0, 3).map((category, index) => (
                            <span 
                              key={`${category}-${index}`}
                              className={`${styles.campCategory} ${searchApplied && searchParams.get('interests') === category ? styles.matchedCategory : ''}`}
                            >
                              {category}
                            </span>
                          ))}
                          {camp.categories.length > 3 && (
                            <span className={styles.moreCategoriesBadge}>
                              +{camp.categories.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <a 
                    href={`/camps?location=${encodeURIComponent(location.name)}`}
                    className={styles.viewAllLink}
                  >
                    View all camps at this location
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default CampMap;