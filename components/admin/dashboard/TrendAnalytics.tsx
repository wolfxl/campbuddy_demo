"use client";
import React from 'react';
import styles from './TrendAnalytics.module.css';

const TrendAnalytics = () => {
  const trends = [
    {
      category: 'Category Trends',
      insights: [
        { text: 'STEM camps up 34% this month', trend: 'up', icon: '🔬' },
        { text: 'Sports camps steady demand', trend: 'stable', icon: '⚽' },
        { text: 'Arts camps down 8% from last month', trend: 'down', icon: '🎨' }
      ]
    },
    {
      category: 'Geographic Trends',
      insights: [
        { text: 'Art camps popular in North Dallas', trend: 'up', icon: '📍' },
        { text: 'Tech camps trending in Plano', trend: 'up', icon: '💻' },
        { text: 'Outdoor camps peak in Frisco', trend: 'stable', icon: '🏕️' }
      ]
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendClass = (trend: string) => {
    switch (trend) {
      case 'up': return 'positive';
      case 'down': return 'negative';
      default: return 'stable';
    }
  };

  return (
    <div className={styles.trendAnalytics}>
      <div className={styles.header}>
        <h2 className={styles.title}>Trend Analytics</h2>
        <p className={styles.subtitle}>Latest market insights</p>
      </div>

      <div className={styles.trendsContainer}>
        {trends.map((section, index) => (
          <div key={index} className={styles.trendSection}>
            <h3 className={styles.sectionTitle}>{section.category}</h3>
            <div className={styles.insightsList}>
              {section.insights.map((insight, insightIndex) => (
                <div key={insightIndex} className={styles.insightItem}>
                  <div className={styles.insightIcon}>
                    {insight.icon}
                  </div>
                  <div className={styles.insightContent}>
                    <span className={styles.insightText}>{insight.text}</span>
                    <div className={`${styles.trendIndicator} ${styles[getTrendClass(insight.trend)]}`}>
                      {getTrendIcon(insight.trend)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendAnalytics;