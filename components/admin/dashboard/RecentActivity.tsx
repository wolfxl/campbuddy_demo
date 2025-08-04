"use client";
import React from 'react';
import styles from './RecentActivity.module.css';

const RecentActivity = () => {
  const activities = [
    {
      type: 'camp_added',
      message: 'New camp "Summer Science Adventures" added by TechCamp Inc.',
      timestamp: '2 hours ago',
      icon: '🏕️',
      color: 'blue'
    },
    {
      type: 'organization_registered',
      message: 'New organization "Creative Arts Studio" registered',
      timestamp: '4 hours ago',
      icon: '🏢',
      color: 'green'
    },
    {
      type: 'user_signup',
      message: '12 new users registered today',
      timestamp: '6 hours ago',
      icon: '👥',
      color: 'purple'
    },
    {
      type: 'camp_approved',
      message: 'Camp "Basketball Skills Camp" approved and published',
      timestamp: '8 hours ago',
      icon: '✅',
      color: 'green'
    },
    {
      type: 'support_ticket',
      message: 'New support ticket #1247 from parent user',
      timestamp: '1 day ago',
      icon: '🎫',
      color: 'orange'
    },
    {
      type: 'data_import',
      message: 'Bulk import completed: 45 new camps added',
      timestamp: '1 day ago',
      icon: '📥',
      color: 'blue'
    }
  ];

  return (
    <div className={styles.recentActivity}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Activity</h2>
        <button className={styles.viewAllButton}>View All</button>
      </div>
      
      <div className={styles.activityList}>
        {activities.map((activity, index) => (
          <div key={index} className={styles.activityItem}>
            <div className={`${styles.activityIcon} ${styles[activity.color]}`}>
              {activity.icon}
            </div>
            <div className={styles.activityContent}>
              <p className={styles.activityMessage}>{activity.message}</p>
              <span className={styles.activityTime}>{activity.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;