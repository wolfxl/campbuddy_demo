"use client";
import React from 'react';
import styles from './PlatformStats.module.css';

const PlatformStats = () => {
  const stats = [
    {
      category: 'Top Categories',
      items: [
        { name: 'Sports', count: 324, percentage: 26 },
        { name: 'STEM', count: 298, percentage: 24 },
        { name: 'Arts & Crafts', count: 267, percentage: 21 },
        { name: 'Outdoor Adventure', count: 201, percentage: 16 },
        { name: 'Music', count: 157, percentage: 13 }
      ]
    },
    {
      category: 'Popular Locations',
      items: [
        { name: 'San Francisco Bay Area', count: 89, percentage: 35 },
        { name: 'Los Angeles County', count: 76, percentage: 30 },
        { name: 'Orange County', count: 45, percentage: 18 },
        { name: 'San Diego County', count: 32, percentage: 13 },
        { name: 'Sacramento Area', count: 12, percentage: 4 }
      ]
    }
  ];

  const systemHealth = [
    { metric: 'API Response Time', value: '245ms', status: 'good' },
    { metric: 'Database Performance', value: '98.2%', status: 'good' },
    { metric: 'Search Accuracy', value: '94.7%', status: 'good' },
    { metric: 'User Satisfaction', value: '4.6/5', status: 'excellent' }
  ];

  return (
    <div className={styles.platformStats}>
      <div className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>Platform Statistics</h2>
        
        {stats.map((stat, index) => (
          <div key={index} className={styles.statGroup}>
            <h3 className={styles.statTitle}>{stat.category}</h3>
            <div className={styles.statItems}>
              {stat.items.map((item, itemIndex) => (
                <div key={itemIndex} className={styles.statItem}>
                  <div className={styles.statInfo}>
                    <span className={styles.statName}>{item.name}</span>
                    <span className={styles.statCount}>{item.count}</span>
                  </div>
                  <div className={styles.statBar}>
                    <div 
                      className={styles.statProgress}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className={styles.statPercentage}>{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.healthSection}>
        <h2 className={styles.sectionTitle}>System Health</h2>
        <div className={styles.healthItems}>
          {systemHealth.map((health, index) => (
            <div key={index} className={styles.healthItem}>
              <div className={styles.healthInfo}>
                <span className={styles.healthMetric}>{health.metric}</span>
                <span className={styles.healthValue}>{health.value}</span>
              </div>
              <div className={`${styles.healthStatus} ${styles[health.status]}`}>
                {health.status === 'excellent' ? '🟢' : '🟢'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformStats;