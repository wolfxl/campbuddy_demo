"use client";
import React, { useState } from 'react';
import ProviderSidebar from './ProviderSidebar';
import ProviderHeader from './ProviderHeader';
import styles from './ProviderLayout.module.css';

interface ProviderLayoutProps {
  children: React.ReactNode;
}

const ProviderLayout: React.FC<ProviderLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={styles.providerLayout}>
      <ProviderHeader 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <div className={styles.providerContainer}>
        <ProviderSidebar isOpen={sidebarOpen} />
        <main className={`${styles.providerMain} ${!sidebarOpen ? styles.sidebarClosed : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default ProviderLayout;