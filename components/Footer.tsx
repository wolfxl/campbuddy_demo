"use client";
import React from 'react';
import Link from 'next/link';
import Logo from './Logo';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Logo />
            <p className={styles.footerTagline}>
              Effective and powerful way to manage your projects
            </p>
            <div className={styles.socialLinks}>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 4.01C21 4.5 20.02 4.84 19 5C18.2 4.12 17.01 3.6 15.7 3.6C13.14 3.6 11.08 5.65 11.08 8.2C11.08 8.6 11.12 8.98 11.2 9.34C7.82 9.14 4.84 7.34 2.72 4.62C2.28 5.36 2.03 6.23 2.03 7.15C2.03 8.88 2.92 10.39 4.29 11.26C3.58 11.24 2.92 11.04 2.34 10.74V10.79C2.34 13.03 3.93 14.89 6.06 15.36C5.63 15.47 5.19 15.53 4.73 15.53C4.4 15.53 4.09 15.5 3.78 15.44C4.41 17.27 6.14 18.59 8.17 18.62C6.57 19.85 4.55 20.59 2.36 20.59C1.95 20.59 1.55 20.57 1.15 20.52C3.2 21.84 5.64 22.6 8.26 22.6C15.69 22.6 19.73 16.53 19.73 11.3C19.73 11.08 19.73 10.86 19.72 10.64C20.72 9.92 21.58 9.01 22.24 7.96C21.34 8.37 20.37 8.64 19.37 8.77C20.4 8.14 21.17 7.14 21.54 5.96C20.57 6.54 19.49 6.97 18.34 7.21C17.42 6.22 16.11 5.6 14.66 5.6C11.87 5.6 9.62 7.85 9.62 10.64C9.62 11.04 9.66 11.42 9.74 11.78C5.7 11.57 2.1 9.58 -0.29 6.58C-0.69 7.36 -0.89 8.23 -0.89 9.14C-0.89 10.82 -0.07 12.3 1.21 13.18C0.45 13.16 -0.27 12.95 -0.91 12.62V12.67C-0.91 15.09 0.67 17.13 2.76 17.63C2.34 17.74 1.91 17.8 1.46 17.8C1.13 17.8 0.81 17.77 0.5 17.72C1.14 19.73 2.87 21.22 4.91 21.25C3.3 22.65 1.26 23.46 -0.94 23.46C-1.35 23.46 -1.76 23.44 -2.16 23.39C-0.1 24.87 2.35 25.71 4.97 25.71C11.4 25.71 14.94 20.08 14.94 15.23C14.94 15.02 14.94 14.8 14.93 14.59C15.9 13.95 16.74 13.13 17.4 12.17C16.5 12.58 15.53 12.84 14.53 12.97C15.56 12.34 16.33 11.34 16.7 10.16L16.7 10.16Z" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.7 3H4.3C3.58 3 3 3.58 3 4.3V19.7C3 20.42 3.58 21 4.3 21H19.7C20.42 21 21 20.42 21 19.7V4.3C21 3.58 20.42 3 19.7 3ZM8.34 18.4H5.67V9.96H8.34V18.4ZM7 8.75C6.17 8.75 5.5 8.08 5.5 7.25C5.5 6.42 6.17 5.75 7 5.75C7.83 5.75 8.5 6.42 8.5 7.25C8.5 8.08 7.83 8.75 7 8.75ZM18.4 18.4H15.73V14.37C15.73 13.41 15.52 12.74 14.65 12.74C13.97 12.74 13.57 13.2 13.4 13.64C13.33 13.8 13.32 14.03 13.32 14.26V18.4H10.66V9.96H13.32V11.11C13.66 10.61 14.27 9.87 15.5 9.87C17.03 9.87 18.4 10.91 18.4 13.96V18.4Z" />
                </svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1.27C5.97 1.27 1.05 6.19 1.05 12.22C1.05 17.05 4.17 21.1 8.56 22.53C9.12 22.64 9.33 22.29 9.33 21.99C9.33 21.72 9.32 20.97 9.32 20.15C6.33 20.72 5.67 18.89 5.67 18.89C5.15 17.68 4.39 17.34 4.39 17.34C3.36 16.68 4.47 16.69 4.47 16.69C5.61 16.77 6.21 17.81 6.21 17.81C7.22 19.43 8.76 18.94 9.35 18.65C9.45 17.95 9.75 17.46 10.07 17.2C7.67 16.93 5.16 16.02 5.16 11.82C5.16 10.63 5.61 9.65 6.22 8.87C6.11 8.59 5.71 7.48 6.33 6.01C6.33 6.01 7.3 5.71 9.32 7.04C10.17 6.79 11.09 6.67 12 6.67C12.91 6.67 13.83 6.79 14.68 7.04C16.7 5.71 17.66 6.01 17.66 6.01C18.28 7.48 17.89 8.59 17.78 8.87C18.39 9.65 18.84 10.63 18.84 11.82C18.84 16.03 16.32 16.93 13.91 17.19C14.31 17.51 14.67 18.14 14.67 19.13C14.67 20.56 14.66 21.61 14.66 21.99C14.66 22.29 14.86 22.64 15.43 22.53C19.82 21.1 22.94 17.05 22.94 12.22C22.94 6.19 18.03 1.27 12 1.27Z" />
                </svg>
              </a>
            </div>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.linkColumn}>
              <h3 className={styles.linkTitle}>Company</h3>
              <ul className={styles.linkList}>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/careers">Careers</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className={styles.linkColumn}>
              <h3 className={styles.linkTitle}>Product</h3>
              <ul className={styles.linkList}>
                <li><Link href="/product/features">Features</Link></li>
                <li><Link href="/product/solutions">Solutions</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/product/updates">Updates</Link></li>
              </ul>
            </div>
            <div className={styles.linkColumn}>
              <h3 className={styles.linkTitle}>Resources</h3>
              <ul className={styles.linkList}>
                <li><Link href="/resources/documentation">Documentation</Link></li>
                <li><Link href="/resources/tutorials">Tutorials</Link></li>
                <li><Link href="/resources/support">Support</Link></li>
                <li><Link href="/resources/api">API</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            &copy; {currentYear} xldatahub. All rights reserved.
          </p>
          <div className={styles.legalLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;