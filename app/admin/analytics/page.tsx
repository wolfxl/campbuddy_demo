"use client";
import React from 'react';
import styles from './page.module.css';

const AnalyticsPage = () => {
  return (
    <div className={styles.analyticsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Analytics & Reports</h1>
        <p className={styles.subtitle}>Platform insights and performance metrics</p>
        <button className={styles.generateButton}>📊 Generate Report</button>
      </div>
      
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3>Platform Usage</h3>
            <span className={styles.metricPeriod}>Last 30 days</span>
          </div>
          <div className={styles.metricValue}>
            <span className={styles.bigNumber}>2.4M</span>
            <span className={styles.metricLabel}>Page Views</span>
          </div>
          <div className={styles.metricChange}>+15.3% from last month</div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3>Search Activity</h3>
            <span className={styles.metricPeriod}>Last 30 days</span>
          </div>
          <div className={styles.metricValue}>
            <span className={styles.bigNumber}>45.2K</span>
            <span className={styles.metricLabel}>Searches</span>
          </div>
          <div className={styles.metricChange}>+22.1% from last month</div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3>User Engagement</h3>
            <span className={styles.metricPeriod}>Last 30 days</span>
          </div>
          <div className={styles.metricValue}>
            <span className={styles.bigNumber}>3.2</span>
            <span className={styles.metricLabel}>Avg Session Duration</span>
          </div>
          <div className={styles.metricChange}>+8.5% from last month</div>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.placeholder}>
          <h3>Analytics Dashboard</h3>
          <p>Comprehensive analytics and reporting tools will be implemented here.</p>
          <ul>
            <li>Interactive charts and graphs</li>
            <li>Custom report builder</li>
            <li>Real-time analytics</li>
            <li>Export capabilities (PDF, CSV, Excel)</li>
            <li>Scheduled reports</li>
            <li>Performance benchmarking</li>
            <li>User behavior analysis</li>
            <li>Business intelligence insights</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;