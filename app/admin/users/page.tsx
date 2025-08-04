"use client";
import React from 'react';
import styles from './page.module.css';

const UsersPage = () => {
  return (
    <div className={styles.usersPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Users Management</h1>
        <p className={styles.subtitle}>Manage user accounts and support</p>
      </div>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>8,932</h3>
            <p className={styles.statTitle}>Total Users</p>
            <span className={styles.statChange}>+18% this month</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📱</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>2,145</h3>
            <p className={styles.statTitle}>Active This Week</p>
            <span className={styles.statChange}>24% engagement</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📝</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>1,567</h3>
            <p className={styles.statTitle}>Plans Created</p>
            <span className={styles.statChange}>+12% conversion</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎫</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>23</h3>
            <p className={styles.statTitle}>Support Tickets</p>
            <span className={styles.statChange}>5 pending</span>
          </div>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.placeholder}>
          <h3>Users Management Interface</h3>
          <p>User account management and support tools will be implemented here.</p>
          <ul>
            <li>User directory with search and filters</li>
            <li>Account status management</li>
            <li>User activity and engagement analytics</li>
            <li>Support ticket management</li>
            <li>Communication tools</li>
            <li>Data export for compliance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;