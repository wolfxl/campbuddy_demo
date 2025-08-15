"use client";
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './CampMap.module.css';

// Define types for our component
interface ResultsMapProps {
  campLocations: {
    id: number | string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    latitude: number;
    longitude: number;
    camps: {
      id: number | string;
      name: string;
      organization: string;
      childName?: string;
      weekLabel?: string;
    }[];
  }[];
  homeLocation?: {
    lat: number;
    lng: number;
    city: string;
  } | null;
}

const ResultsMap: React.FC<ResultsMapProps> = ({ campLocations, homeLocation }) => {
  // Reference to the map instance
  const mapRef = React.useRef<L.Map | null>(null);
  
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

  // Update map view when data changes
  useEffect(() => {
    if (mapRef.current && (campLocations.length > 0 || homeLocation)) {
      const locations = [...campLocations];
      
      // Add home location to bounds calculation if available
      if (homeLocation) {
        locations.push({
          latitude: homeLocation.lat,
          longitude: homeLocation.lng
        } as any);
      }
      
      if (locations.length > 0) {
        const bounds = L.latLngBounds(locations.map(loc => [
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
  }, [campLocations, homeLocation]);

  // Default to Frisco, TX
  const defaultCenter: [number, number] = [33.1507, -96.8236]; // Frisco, TX
  
  // Calculate center if we have locations
  const calculateCenter = (): [number, number] => {
    if (homeLocation) {
      return [homeLocation.lat, homeLocation.lng];
    }
    
    if (campLocations.length === 0) return defaultCenter;
    
    // Calculate the center from all locations
    const lats = campLocations.map(loc => Number(loc.latitude));
    const lngs = campLocations.map(loc => Number(loc.longitude));
    
    // Log coordinates for debugging
    console.log('Map coordinates being used:', campLocations.map(loc => ({ 
      name: loc.name, 
      lat: Number(loc.latitude), 
      lng: Number(loc.longitude) 
    })));
    
    const avgLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;
    const avgLng = lngs.reduce((sum, lng) => sum + lng, 0) / lngs.length;
    
    console.log('Calculated map center:', [avgLat, avgLng]);
    return [avgLat, avgLng];
  };

  // Custom marker icon
  const createMarkerIcon = (campCount: number) => {
    const size = Math.min(30 + campCount * 3, 60); // Size between 30-60px based on count
    const backgroundColor = '#ff5722'; // Orange for results
    
    return new L.DivIcon({
      html: `<div class="${styles.markerIcon}" style="width:${size}px;height:${size}px;background-color:${backgroundColor};">
               <span>${campCount}</span>
             </div>`,
      className: styles.customMarker,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  // Home marker icon
  const createHomeMarkerIcon = () => {
    return new L.DivIcon({
      html: `<div class="${styles.homeMarkerIcon}" style="width:40px;height:40px;background-color:#4CAF50;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
               <span style="color:white;font-size:18px;font-weight:bold;">🏠</span>
             </div>`,
      className: styles.customHomeMarker,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  if (campLocations.length === 0 && !homeLocation) {
    return (
      <div className={styles.mapContainer}>
        <div className={styles.noDataOverlay}>
          <p>No camp locations available to display</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.mapWrapper}>
      <h2 className={styles.mapTitle}>Your Selected Camp Locations</h2>
      <p className={styles.mapDescription}>
        {homeLocation && campLocations.length > 0 
          ? `View the locations of all camps in your summer plan relative to your home in ${homeLocation.city}.`
          : homeLocation 
            ? `Your home location in ${homeLocation.city} - camps will appear here once your plan is generated.`
            : 'View the locations of all camps in your summer plan.'
        }
      </p>
      
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
          
          {/* Home location marker */}
          {homeLocation && (
            <Marker
              position={[homeLocation.lat, homeLocation.lng]}
              icon={createHomeMarkerIcon()}
            >
              <Popup className={styles.mapPopup}>
                <div className={styles.popupContent}>
                  <h3 className={styles.locationName}>🏠 Your Location</h3>
                  <p className={styles.locationAddress}>{homeLocation.city}</p>
                  <p className={styles.campCount}>
                    This is your home base for planning summer camps
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {campLocations.map((location) => (
            <Marker
              key={location.id}
              position={[Number(location.latitude), Number(location.longitude)]}
              icon={createMarkerIcon(location.camps.length)}
            >
              <Popup className={styles.mapPopup}>
                <div className={styles.popupContent}>
                  <h3 className={styles.locationName}>{location.name}</h3>
                  <p className={styles.locationAddress}>{location.address || `${location.city}, ${location.state}`}</p>
                  <p className={styles.campCount}>
                    {location.camps.length} camp{location.camps.length !== 1 ? 's' : ''} at this location
                  </p>
                  
                  <div className={styles.campsList}>
                    {location.camps.map(camp => (
                      <div key={camp.id} className={styles.campItem}>
                        <h4 className={styles.campName}>{camp.name}</h4>
                        <p className={styles.campOrg}>{camp.organization}</p>
                        {camp.childName && camp.weekLabel && (
                          <div className={styles.campDetail}>
                            <span className={styles.campDetailLabel}>Assigned to:</span> 
                            <span className={styles.campDetailValue}>{camp.childName} ({camp.weekLabel})</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default ResultsMap;