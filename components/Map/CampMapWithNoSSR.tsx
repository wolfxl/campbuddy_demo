"use client";
import { LocationWithCamps } from '@/lib/types';
import dynamic from 'next/dynamic';

// Dynamically import the CampMap component with no SSR
// This is necessary because Leaflet requires browser APIs
const CampMapNoSSR = dynamic(
  () => import('./CampMap'),
  { ssr: false }
);

interface CampMapWithNoSSRProps {
  initialLocations: LocationWithCamps[];
}

const CampMapWithNoSSR = ({ initialLocations }: CampMapWithNoSSRProps) => {
  return <CampMapNoSSR initialLocations={initialLocations} />;
};

export default CampMapWithNoSSR;