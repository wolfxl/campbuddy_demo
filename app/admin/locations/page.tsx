"use client";
import React from 'react';
import styles from './page.module.css';

const LocationsPage = () => {
  return (
    <div className={styles.locationsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Locations Management</h1>
        <p className={styles.subtitle}>Manage camp locations and geographic data</p>
        <button className={styles.addButton}>+ Add New Location</button>
      </div>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📍</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>342</h3>
            <p className={styles.statTitle}>Total Locations</p>
            <span className={styles.statChange}>+12 this month</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🗺️</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>98.5%</h3>
            <p className={styles.statTitle}>Geocoded</p>
            <span className={styles.statChange}>5 need coordinates</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>15</h3>
            <p className={styles.statTitle}>Top Regions</p>
            <span className={styles.statChange}>Bay Area leads</span>
          </div>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.placeholder}>
          <h3>Locations Management Interface</h3>
          <p>Location listing, mapping, and geographic tools will be implemented here.</p>
          <ul>
            <li>Interactive map view of all locations</li>
            <li>Geocoding and address validation tools</li>
            <li>Location clustering and density analysis</li>
            <li>Coverage gap identification</li>
            <li>Bulk location import/export</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LocationsPage;