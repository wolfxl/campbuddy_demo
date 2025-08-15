"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Logo.module.css';

const Logo = () => {
  return (
    <Link href="/" className={styles.logoLink}>
      <div className={styles.logoContainer}>
        <div className={styles.logoBox}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#4CAF50" />
            <path d="M7 12.5C7 10.1 9 8 12 8C15 8 17 10.1 17 12.5C17 16 14 18 12 20C10 18 7 16 7 12.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10Z" fill="white" />
          </svg>
        </div>
        <div className={styles.logoText}>
          <span className={styles.logoName}>CampBuddy</span>
          <span className={styles.logoTagline}>Plan Your Perfect Summer</span>
        </div>
      </div>
    </Link>
  );
};

export default Logo;