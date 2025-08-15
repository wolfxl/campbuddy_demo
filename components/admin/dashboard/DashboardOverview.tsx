"use client";
import React from 'react';
import MetricsCards from './MetricsCards';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import PlatformStats from './PlatformStats';
import GeographicHeatMap from './GeographicHeatMap';
import TrendAnalytics from './TrendAnalytics';
import InteractiveHeatMap from './InteractiveHeatMap';
import styles from './DashboardOverview.module.css';

const DashboardOverview = () => {
  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <p className={styles.subtitle}>Welcome back! Here's what's happening with your camp platform.</p>
      </div>
      
      <MetricsCards />
      
      <div className={styles.dashboardGrid}>
        <div className={styles.leftColumn}>
          <InteractiveHeatMap />
          <RecentActivity />
          <TrendAnalytics />
        </div>
        <div className={styles.rightColumn}>
          <GeographicHeatMap />
          <PlatformStats />
        </div>
      </div>
      
      <div className={styles.bottomSection}>
        <QuickActions />
      </div>
    </div>
  );
};

export default DashboardOverview;