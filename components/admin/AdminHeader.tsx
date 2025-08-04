"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminHeader.module.css';

interface AdminHeaderProps {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuToggle, sidebarOpen }) => {
  const router = useRouter();

  const handleLogout = () => {
    // Remove auth token/session
    localStorage.removeItem('admin_token');
    router.push('/login');
  };

  return (
    <header className={styles.adminHeader}>
      <div className={styles.headerLeft}>
        <button 
          className={styles.menuToggle}
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
        </button>
        <h1 className={styles.title}>Camp Buddy Admin</h1>
      </div>
      
      <div className={styles.headerCenter}>
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Search camps, users, organizations..."
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>
            🔍
          </button>
        </div>
      </div>
      
      <div className={styles.headerRight}>
        <div className={styles.notifications}>
          <button className={styles.notificationButton}>
            🔔
            <span className={styles.notificationBadge}>3</span>
          </button>
        </div>
        
        <div className={styles.userMenu}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Admin User</span>
            <span className={styles.userRole}>Super Admin</span>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;