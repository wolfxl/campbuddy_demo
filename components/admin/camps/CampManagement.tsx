"use client";
import React, { useState } from 'react';
import CampFilters from './CampFilters';
import CampTable from './CampTable';
import CampStats from './CampStats';
import styles from './CampManagement.module.css';

const CampManagement = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedCamps, setSelectedCamps] = useState<string[]>([]);

  return (
    <div className={styles.campManagement}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Camp Management</h1>
          <p className={styles.subtitle}>Manage all camps and their details</p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.addButton}>
            + Add New Camp
          </button>
          <button className={styles.importButton}>
            📥 Import Camps
          </button>
        </div>
      </div>

      <CampStats />
      
      <div className={styles.controls}>
        <CampFilters />
        <div className={styles.viewControls}>
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.viewButton} ${viewMode === 'table' ? styles.active : ''}`}
              onClick={() => setViewMode('table')}
            >
              📋 Table
            </button>
            <button 
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
            >
              🗂️ Grid
            </button>
          </div>
        </div>
      </div>

      <CampTable 
        viewMode={viewMode}
        selectedCamps={selectedCamps}
        onSelectionChange={setSelectedCamps}
      />
    </div>
  );
};

export default CampManagement;