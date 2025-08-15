"use client";
import React from 'react';
import styles from '@/app/planner/results/page.module.css';
import { ResultsMap } from '@/components/Map';

interface MapViewProps {
  campLocations: Array<{
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
  }>;
}

const MapView: React.FC<MapViewProps> = ({ campLocations }) => {
  return (
    <div className={styles.mapViewContainer}>
      <ResultsMap campLocations={campLocations} />
    </div>
  );
};

export default MapView;