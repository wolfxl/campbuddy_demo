"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './ProviderHeader.module.css';

interface ProviderHeaderProps {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
}

const ProviderHeader: React.FC<ProviderHeaderProps> = ({ onMenuToggle, sidebarOpen }) => {
  const router = useRouter();

  const handleLogout = () => {
    // Remove auth token/session
    localStorage.removeItem('provider_token');
    router.push('/provider/login');
  };

  return (
    <header className={styles.providerHeader}>
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
        <h1 className={styles.title}>iCode Frisco Provider</h1>
      </div>
      
      <div className={styles.headerCenter}>
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Search my camps..."
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
            <span className={styles.notificationBadge}>2</span>
          </button>
        </div>
        
        <div className={styles.userMenu}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>iCode Provider</span>
            <span className={styles.userRole}>Camp Provider</span>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default ProviderHeader;