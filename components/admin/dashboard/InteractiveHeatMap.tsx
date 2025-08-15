"use client";
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import 'leaflet/dist/leaflet.css';
import styles from './InteractiveHeatMap.module.css';
// We will add the heatmap layer import later

// Define the type for our location data points
interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number; // Intensity for the heatmap
}

const generateMockDemandData = (): HeatmapPoint[] => {
  const hotZones = [
    { lat: 32.7767, lng: -96.7970, intensity: 3, radius: 0.1, count: 100 },   // Downtown Dallas (Decreased)
    { lat: 32.9900, lng: -96.8350, intensity: 5, radius: 0.2, count: 180 },  // North Dallas / Addison (Spread Out)
    { lat: 33.1507, lng: -96.8236, intensity: 4, radius: 0.12, count: 90 }, // Frisco (New)
    { lat: 33.0198, lng: -96.6989, intensity: 4, radius: 0.15, count: 120 }, // Plano (Spread out)
    { lat: 32.7357, lng: -97.1081, intensity: 1, radius: 0.1, count: 30 },   // Arlington (Further Decreased)
    { lat: 32.7792, lng: -97.3463, intensity: 1, radius: 0.1, count: 30 },    // Fort Worth (Further Decreased)
  ];

  const points: HeatmapPoint[] = [];
  hotZones.forEach(zone => {
    for (let i = 0; i < zone.count; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * zone.radius;
      points.push({
        lat: zone.lat + distance * Math.cos(angle),
        lng: zone.lng + distance * Math.sin(angle),
        intensity: Math.random() * zone.intensity,
      });
    }
  });

  return points;
};

const InteractiveHeatMap = () => {
  const [data, setData] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const mockData = generateMockDemandData();
    setData(mockData);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading Map...</div>;
  }

  return (
    <div className={styles.mapContainer}>
        <h2 className={styles.title}>User Interest Demand Heatmap</h2>
        <MapContainer 
            center={[32.9537, -96.8903]} // Default to Dallas area
            zoom={9} 
            className={styles.leafletContainer}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {data.length > 0 && (
                <HeatmapLayer
                    points={data}
                    longitudeExtractor={(m: any) => m.lng}
                    latitudeExtractor={(m: any) => m.lat}
                    intensityExtractor={(m: any) => m.intensity}
                    radius={20}
                    blur={20}
                />
            )}
        </MapContainer>
    </div>
  );
};

export default InteractiveHeatMap;