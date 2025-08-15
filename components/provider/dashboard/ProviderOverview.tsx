"use client";
import React from 'react';
import ProviderMetrics from './ProviderMetrics';
import styles from './ProviderOverview.module.css';

const ProviderOverview = () => {
  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.title}>Provider Dashboard</h1>
        <p className={styles.subtitle}>Welcome back! Here's how your camps are performing.</p>
      </div>
      
      <ProviderMetrics />
      
      <div className={styles.dashboardGrid}>
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Recent Interest</h3>
            <div className={styles.interestList}>
              <div className={styles.interestItem}>
                <span className={styles.interestIcon}>👤</span>
                <div className={styles.interestInfo}>
                  <p className={styles.interestName}>Sarah M.</p>
                  <p className={styles.interestCamp}>Animation Creation Camp</p>
                </div>
                <span className={styles.interestTime}>2h ago</span>
              </div>
              <div className={styles.interestItem}>
                <span className={styles.interestIcon}>👤</span>
                <div className={styles.interestInfo}>
                  <p className={styles.interestName}>John D.</p>
                  <p className={styles.interestCamp}>Content Creator Camp</p>
                </div>
                <span className={styles.interestTime}>5h ago</span>
              </div>
              <div className={styles.interestItem}>
                <span className={styles.interestIcon}>👤</span>
                <div className={styles.interestInfo}>
                  <p className={styles.interestName}>Lisa K.</p>
                  <p className={styles.interestCamp}>3D Printing & Design</p>
                </div>
                <span className={styles.interestTime}>1d ago</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.rightColumn}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Popular Camps</h3>
            <div className={styles.popularList}>
              <div className={styles.popularItem}>
                <span className={styles.popularRank}>1</span>
                <div className={styles.popularInfo}>
                  <p className={styles.popularName}>Animation Creation</p>
                  <p className={styles.popularViews}>247 views</p>
                </div>
              </div>
              <div className={styles.popularItem}>
                <span className={styles.popularRank}>2</span>
                <div className={styles.popularInfo}>
                  <p className={styles.popularName}>Content Creator</p>
                  <p className={styles.popularViews}>189 views</p>
                </div>
              </div>
              <div className={styles.popularItem}>
                <span className={styles.popularRank}>3</span>
                <div className={styles.popularInfo}>
                  <p className={styles.popularName}>3D Printing</p>
                  <p className={styles.popularViews}>156 views</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderOverview;