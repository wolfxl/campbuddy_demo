"use client";
import React from 'react';
import styles from '@/app/planner/results/page.module.css';
import { ResultsMap } from '@/components/Map';

interface CampLocation {
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
}

interface ResultsMapViewProps {
  campLocations: CampLocation[];
}

const ResultsMapView: React.FC<ResultsMapViewProps> = ({ campLocations }) => {
  if (campLocations.length === 0) {
    return (
      <div className={styles.mapPlaceholder}>
        <p>No camp locations available to display on the map.</p>
        <p>Try selecting a different schedule option or adding more camps to your plan.</p>
      </div>
    );
  }

  return (
    <div className={styles.mapContainer}>
      <ResultsMap campLocations={campLocations} />
    </div>
  );
};

export default ResultsMapView;