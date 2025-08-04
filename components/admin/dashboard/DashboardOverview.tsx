"use client";
import React from 'react';
import MetricsCards from './MetricsCards';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import PlatformStats from './PlatformStats';
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
          <QuickActions />
          <RecentActivity />
        </div>
        <div className={styles.rightColumn}>
          <PlatformStats />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;