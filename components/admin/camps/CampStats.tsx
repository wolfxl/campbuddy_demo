"use client";
import React from 'react';
import styles from './CampStats.module.css';

const CampStats = () => {
  const stats = [
    {
      title: 'Total Camps',
      value: '1,247',
      change: '+12',
      changeType: 'positive' as const,
      icon: '🏕️'
    },
    {
      title: 'Pending Approval',
      value: '23',
      change: '+5',
      changeType: 'neutral' as const,
      icon: '⏳'
    },
    {
      title: 'Published',
      value: '1,198',
      change: '+18',
      changeType: 'positive' as const,
      icon: '✅'
    },
    {
      title: 'Archived',
      value: '26',
      change: '-2',
      changeType: 'negative' as const,
      icon: '📦'
    }
  ];

  return (
    <div className={styles.campStats}>
      {stats.map((stat, index) => (
        <div key={index} className={styles.statCard}>
          <div className={styles.statIcon}>{stat.icon}</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>{stat.value}</h3>
            <p className={styles.statTitle}>{stat.title}</p>
            <span className={`${styles.statChange} ${styles[stat.changeType]}`}>
              {stat.change} this week
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CampStats;