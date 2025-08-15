"use client";
import React, { useState } from 'react';
import styles from './CampFilters.module.css';

const CampFilters = () => {
  const [filters, setFilters] = useState({
    status: '',
    organization: '',
    category: '',
    location: '',
    priceRange: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      organization: '',
      category: '',
      location: '',
      priceRange: ''
    });
  };

  return (
    <div className={styles.campFilters}>
      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <label htmlFor="status" className={styles.label}>Status</label>
          <select 
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.select}
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="pending">Pending Approval</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="organization" className={styles.label}>Organization</label>
          <select 
            id="organization"
            value={filters.organization}
            onChange={(e) => handleFilterChange('organization', e.target.value)}
            className={styles.select}
          >
            <option value="">All Organizations</option>
            <option value="techcamp">TechCamp Inc</option>
            <option value="sportsplus">Sports Plus</option>
            <option value="creative">Creative Arts Studio</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="category" className={styles.label}>Category</label>
          <select 
            id="category"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className={styles.select}
          >
            <option value="">All Categories</option>
            <option value="sports">Sports</option>
            <option value="stem">STEM</option>
            <option value="arts">Arts & Crafts</option>
            <option value="outdoor">Outdoor Adventure</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="location" className={styles.label}>Location</label>
          <select 
            id="location"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className={styles.select}
          >
            <option value="">All Locations</option>
            <option value="sf">San Francisco</option>
            <option value="la">Los Angeles</option>
            <option value="sd">San Diego</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="priceRange" className={styles.label}>Price Range</label>
          <select 
            id="priceRange"
            value={filters.priceRange}
            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            className={styles.select}
          >
            <option value="">All Prices</option>
            <option value="0-200">$0 - $200</option>
            <option value="200-400">$200 - $400</option>
            <option value="400-600">$400 - $600</option>
            <option value="600+">$600+</option>
          </select>
        </div>

        <button 
          onClick={clearFilters}
          className={styles.clearButton}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default CampFilters;