"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import styles from './Header.module.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.headerContainer}`}>
        <Logo />
        
        <div className={styles.mobileMenuButton} onClick={toggleMenu}>
          <div className={`${styles.menuIcon} ${isMenuOpen ? styles.open : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <nav className={`${styles.nav} ${isMenuOpen ? styles.mobileNavOpen : ''}`}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link 
                href="/camps" 
                className={`${styles.navLink} ${isActive('/camps') ? styles.active : ''}`}
                onClick={closeMenu}
              >
                <span className={styles.navIcon}>🔍</span> Camps Directory
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link 
                href="/planner" 
                className={`${styles.navLink} ${isActive('/planner') ? styles.active : ''}`}
                onClick={closeMenu}
              >
                <span className={styles.navIcon}>🧠</span> Smart Planner
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link 
                href="/chat" 
                className={`${styles.navLink} ${isActive('/chat') ? styles.active : ''}`}
                onClick={closeMenu}
              >
                <span className={styles.navIcon}>💬</span> AI Assistant
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link 
                href="/favorites" 
                className={`${styles.navLink} ${isActive('/favorites') ? styles.active : ''}`}
                onClick={closeMenu}
              >
                <span className={styles.navIcon}>❤️</span> Favorites
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link 
                href="/submit-camp" 
                className={`${styles.navLink} ${isActive('/submit-camp') ? styles.active : ''}`}
                onClick={closeMenu}
              >
                <span className={styles.navIcon}>📤</span> Submit a Camp
              </Link>
            </li>
          </ul>
          <div className={styles.authButtons}>
            <Link href="/login" className={styles.loginButton} onClick={closeMenu}>
              <span className={styles.navIcon}>👤</span> Login / Sign Up
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;