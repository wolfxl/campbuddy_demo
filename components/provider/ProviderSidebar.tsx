"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './ProviderSidebar.module.css';

interface ProviderSidebarProps {
  isOpen: boolean;
}

const ProviderSidebar: React.FC<ProviderSidebarProps> = ({ isOpen }) => {
  const pathname = usePathname();
  
  const menuItems = [
    {
      icon: '📊',
      label: 'Dashboard',
      href: '/provider',
      active: pathname === '/provider'
    },
    {
      icon: '🏕️',
      label: 'My Camps',
      href: '/provider/camps',
      active: pathname.startsWith('/provider/camps')
    },
    {
      icon: '❤️',
      label: 'Interest',
      href: '/provider/interest',
      active: pathname.startsWith('/provider/interest')
    },
    {
      icon: '⚙️',
      label: 'Settings',
      href: '/provider/settings',
      active: pathname.startsWith('/provider/settings')
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

export default ProviderSidebar;