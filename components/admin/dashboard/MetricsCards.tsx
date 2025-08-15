"use client";
import React from 'react';
import styles from './MetricsCards.module.css';

const MetricsCards = () => {
  const metrics = [
    {
      title: 'Total Camps',
      value: '1,247',
      change: '+12%',
      changeType: 'positive',
      icon: '🏕️'
    },
    {
      title: 'Active Organizations',
      value: '156',
      change: '+5%',
      changeType: 'positive',
      icon: '🏢'
    },
    {
      title: 'Total Users',
      value: '125',
      change: '+18%',
      changeType: 'positive',
      icon: '👥'
    },
    {
      title: 'Monthly Registrations',
      value: '28',
      change: '-3%',
      changeType: 'negative',
      icon: '📝'
    },
    {
      title: 'Parent Searches Today',
      value: '347',
      change: '+22%',
      changeType: 'positive',
      icon: '🔍'
    },
    {
      title: 'Camp Submissions',
      value: '12',
      change: '+8%',
      changeType: 'positive',
      icon: '📋'
    }
  ];

  return (
    <div className={styles.metricsGrid}>
      {metrics.map((metric, index) => (
        <div key={index} className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>{metric.icon}</span>
            <div className={styles.metricChange}>
              <span className={`${styles.changeValue} ${styles[metric.changeType]}`}>
                {metric.change}
              </span>
            </div>
          </div>
          <div className={styles.metricContent}>
            <h3 className={styles.metricValue}>{metric.value}</h3>
            <p className={styles.metricTitle}>{metric.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;