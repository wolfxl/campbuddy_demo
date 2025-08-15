"use client";
import React from 'react';
import styles from './page.module.css';

const SettingsPage = () => {
  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your provider account and preferences</p>
      </div>

      <div className={styles.settingsGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Organization Profile</h3>
          <div className={styles.profileInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Organization:</span>
              <span className={styles.value}>iCode Frisco</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>icode@gmail.com</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Location:</span>
              <span className={styles.value}>1648 FM 423 #400, Frisco, TX 75033</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Account Type:</span>
              <span className={styles.value}>Camp Provider</span>
            </div>
          </div>
          <button className={styles.editButton}>Edit Profile</button>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Notifications</h3>
          <div className={styles.notificationSettings}>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>New Interest Notifications</span>
                <span className={styles.settingDesc}>Get notified when families show interest</span>
              </div>
              <input type="checkbox" className={styles.toggle} defaultChecked />
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>Weekly Reports</span>
                <span className={styles.settingDesc}>Receive weekly analytics via email</span>
              </div>
              <input type="checkbox" className={styles.toggle} defaultChecked />
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>Camp Updates</span>
                <span className={styles.settingDesc}>Platform updates and announcements</span>
              </div>
              <input type="checkbox" className={styles.toggle} />
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Account Actions</h3>
          <div className={styles.actionButtons}>
            <button className={styles.actionButton}>Change Password</button>
            <button className={styles.actionButton}>Download Data</button>
            <button className={styles.actionButton}>Support</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;