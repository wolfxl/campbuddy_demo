"use client";
import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import styles from './AdminLayout.module.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={styles.adminLayout}>
      <AdminHeader 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <div className={styles.adminContainer}>
        <AdminSidebar isOpen={sidebarOpen} />
        <main className={`${styles.adminMain} ${!sidebarOpen ? styles.sidebarClosed : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;