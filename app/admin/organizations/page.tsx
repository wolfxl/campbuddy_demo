"use client";
import React from 'react';
import styles from './page.module.css';

const OrganizationsPage = () => {
  return (
    <div className={styles.organizationsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Organizations Management</h1>
        <p className={styles.subtitle}>Manage camp providers and their details</p>
        <button className={styles.addButton}>+ Add New Organization</button>
      </div>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏢</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>156</h3>
            <p className={styles.statTitle}>Total Organizations</p>
            <span className={styles.statChange}>+5 this month</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>142</h3>
            <p className={styles.statTitle}>Verified</p>
            <span className={styles.statChange}>91% verified</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>8</h3>
            <p className={styles.statTitle}>Pending Review</p>
            <span className={styles.statChange}>Needs attention</span>
          </div>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.placeholder}>
          <h3>Organizations Management Interface</h3>
          <p>Organization listing, verification, and management tools will be implemented here.</p>
          <ul>
            <li>Organization directory with search and filters</li>
            <li>Verification status and document review</li>
            <li>Performance metrics and analytics</li>
            <li>Communication tools</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrganizationsPage;