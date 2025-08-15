"use client";
import React, { useState, useEffect } from 'react';
import styles from './GeographicHeatMap.module.css';

interface AreaData {
  name: string;
  supply: number;
  demand: number;
  ratio: number;
}

const GeographicHeatMap = () => {
  const [areaData, setAreaData] = useState<AreaData[]>(getMockAreaData());
  const [loading, setLoading] = useState(true);

  // Define mock data function at component level
  function getMockAreaData(): AreaData[] {
    return [
      { name: 'Plano', supply: 25, demand: 120, ratio: 4.8 },
      { name: 'Frisco', supply: 18, demand: 98, ratio: 5.4 },
      { name: 'Richardson', supply: 12, demand: 75, ratio: 6.3 },
      { name: 'Carrollton', supply: 8, demand: 65, ratio: 8.1 },
      { name: 'Allen', supply: 6, demand: 55, ratio: 9.2 },
      { name: 'McKinney', supply: 5, demand: 45, ratio: 9.0 },
      { name: 'Garland', supply: 4, demand: 35, ratio: 8.8 },
      { name: 'Irving', supply: 7, demand: 40, ratio: 5.7 }
    ];
  }

  useEffect(() => {
    const fetchCampData = async () => {
      try {
        const response = await fetch('/api/camps?includeCoordinates=true&limit=1000');
        const data = await response.json();
        
        if (data.data) {
          const areas = processLocationData(data.data);
          setAreaData(areas);
        }
      } catch (error) {
        console.error('Error fetching camp data:', error);
        // Keep using mock data
      } finally {
        setLoading(false);
      }
    };

    fetchCampData();
  }, []);

  const processLocationData = (camps: any[]) => {
    const areaMap = new Map();
    
    // Define area boundaries (simplified)
    camps.forEach(camp => {
      if (camp.latitude && camp.longitude) {
        const area = determineArea(camp.latitude, camp.longitude, camp.formatted_address);
        if (area) {
          areaMap.set(area, (areaMap.get(area) || 0) + 1);
        }
      }
    });

    // Mock demand data and calculate ratios
    const mockDemand = { 
      Plano: 120, Frisco: 98, Richardson: 75, Carrollton: 65, 
      Allen: 55, McKinney: 45, Garland: 35, Irving: 40 
    };
    
    return Array.from(areaMap.entries()).map(([name, supply]) => ({
      name,
      supply,
      demand: mockDemand[name as keyof typeof mockDemand] || 50,
      ratio: (mockDemand[name as keyof typeof mockDemand] || 50) / supply
    }));
  };

  const determineArea = (lat: number, lng: number, address: string) => {
    if (address?.includes('Plano')) return 'Plano';
    if (address?.includes('Frisco')) return 'Frisco';
    if (address?.includes('Richardson')) return 'Richardson';
    if (address?.includes('Carrollton')) return 'Carrollton';
    if (address?.includes('Allen')) return 'Allen';
    if (address?.includes('McKinney')) return 'McKinney';
    if (address?.includes('Garland')) return 'Garland';
    if (address?.includes('Irving')) return 'Irving';
    return null;
  };



  const getHeatColor = (ratio: number) => {
    if (ratio > 8) return 'high';
    if (ratio > 6) return 'medium';
    return 'low';
  };

  return (
    <div className={styles.heatMap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Geographic Heat Map</h2>
        <p className={styles.subtitle}>Demand vs Supply by Area</p>
      </div>
      
      <div className={styles.statsGrid}>
        {areaData.map((area) => (
          <div 
            key={area.name} 
            className={`${styles.areaCard} ${styles[getHeatColor(area.ratio)]}`}
          >
            <h3 className={styles.areaName}>{area.name}</h3>
            <div className={styles.areaStats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Supply</span>
                <span className={styles.statValue}>{area.supply}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Demand</span>
                <span className={styles.statValue}>{area.demand}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Ratio</span>
                <span className={styles.statValue}>{area.ratio.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeographicHeatMap;