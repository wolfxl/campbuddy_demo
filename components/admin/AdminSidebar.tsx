"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdminSidebar.module.css';

interface AdminSidebarProps {
  isOpen: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen }) => {
  const pathname = usePathname();
  
  const menuItems = [
    {
      icon: '📊',
      label: 'Dashboard',
      href: '/admin',
      active: pathname === '/admin'
    },
    {
      icon: '🏕️',
      label: 'Camp Management',
      href: '/admin/camps',
      active: pathname.startsWith('/admin/camps')
    },
    {
      icon: '🏢',
      label: 'Organizations',
      href: '/admin/organizations',
      active: pathname.startsWith('/admin/organizations')
    },
    {
      icon: '📍',
      label: 'Locations',
      href: '/admin/locations',
      active: pathname.startsWith('/admin/locations')
    },
    {
      icon: '👥',
      label: 'Users',
      href: '/admin/users',
      active: pathname.startsWith('/admin/users')
    },
    {
      icon: '📊',
      label: 'Analytics & Reports',
      href: '/admin/analytics',
      active: pathname.startsWith('/admin/analytics')
    }
  ];

  return (
    <aside className={`${styles.sidebar} ${!isOpen ? styles.collapsed : ''}`}>
      <nav className={styles.navigation}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.href} className={styles.menuItem}>
              <Link 
                href={item.href}
                className={`${styles.menuLink} ${item.active ? styles.active : ''}`}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                {isOpen && <span className={styles.menuLabel}>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;