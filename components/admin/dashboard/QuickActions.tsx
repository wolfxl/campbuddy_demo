"use client";
import React from 'react';
import Link from 'next/link';
import styles from './QuickActions.module.css';

const QuickActions = () => {
  const actions = [
    {
      title: 'Add New Camp',
      description: 'Create a new camp listing',
      icon: '➕',
      href: '/admin/camps/new',
      color: 'blue'
    },
    {
      title: 'Create Organization',
      description: 'Register a new camp provider',
      icon: '🏢',
      href: '/admin/organizations/new',
      color: 'green'
    },
    {
      title: 'Import Camp Data',
      description: 'Bulk import camps from CSV',
      icon: '📥',
      href: '/admin/camps/import',
      color: 'purple'
    },
    {
      title: 'Generate Report',
      description: 'Create platform analytics report',
      icon: '📊',
      href: '/admin/analytics/reports',
      color: 'orange'
    }
  ];

  return (
    <div className={styles.quickActions}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quick Actions</h2>
        <p className={styles.description}>Common administrative tasks</p>
      </div>
      
      <div className={styles.actionsGrid}>
        {actions.map((action, index) => (
          <Link key={index} href={action.href} className={styles.actionCard}>
            <div className={`${styles.actionIcon} ${styles[action.color]}`}>
              {action.icon}
            </div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>{action.title}</h3>
              <p className={styles.actionDescription}>{action.description}</p>
            </div>
            <div className={styles.actionArrow}>→</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;