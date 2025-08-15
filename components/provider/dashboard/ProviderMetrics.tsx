"use client";
import React from 'react';
import styles from './ProviderMetrics.module.css';

const ProviderMetrics = () => {
  const metrics = [
    {
      title: 'My Camps',
      value: '12',
      change: '+2 new',
      changeType: 'positive',
      icon: '🏕️'
    },
    {
      title: 'Total Views',
      value: '1,247',
      change: '+18%',
      changeType: 'positive',
      icon: '👀'
    },
    {
      title: 'Interest Clicks',
      value: '89',
      change: '+12%',
      changeType: 'positive',
      icon: '❤️'
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

export default ProviderMetrics;