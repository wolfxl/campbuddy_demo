"use client";
import React from 'react';
import AnimatedSection from './AnimatedSection';
import AnimatedCounter from './AnimatedCounter';
import styles from './StatsSection.module.css';

const StatsSection = () => {
  const stats = [
    {
      value: 10000,
      suffix: '+',
      label: 'Happy Users',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 36.6667C29.2048 36.6667 36.6667 29.2048 36.6667 20C36.6667 10.7953 29.2048 3.33334 20 3.33334C10.7953 3.33334 3.33334 10.7953 3.33334 20C3.33334 29.2048 10.7953 36.6667 20 36.6667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.3333 23.3333C13.3333 23.3333 15.8333 26.6667 20 26.6667C24.1667 26.6667 26.6667 23.3333 26.6667 23.3333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14.1667 14.1667H14.1833" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M25.8333 14.1667H25.85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      value: 5000,
      suffix: '+',
      label: 'Projects Completed',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M33.3333 5H6.66667C5.74619 5 5 5.74619 5 6.66667V33.3333C5 34.2538 5.74619 35 6.66667 35H33.3333C34.2538 35 35 34.2538 35 33.3333V6.66667C35 5.74619 34.2538 5 33.3333 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 16.6667L18.3333 20L25 13.3333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 26.6667H25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      value: 99,
      suffix: '%',
      label: 'Customer Satisfaction',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 25L15 15L20 20L35 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M25 5H35V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 35L15 25L35 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      value: 24,
      suffix: '/7',
      label: 'Support Available',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 36.6667C29.2048 36.6667 36.6667 29.2048 36.6667 20C36.6667 10.7953 29.2048 3.33334 20 3.33334C10.7953 3.33334 3.33334 10.7953 3.33334 20C3.33334 29.2048 10.7953 36.6667 20 36.6667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 10V20L26.6667 23.3333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <section className={styles.statsSection}>
      <div className="container">
        <AnimatedSection direction="up">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Impact in Numbers</h2>
            <p className={styles.sectionDescription}>
              WeDu has helped thousands of teams around the world improve their workflow and boost productivity.
            </p>
          </div>
        </AnimatedSection>
        
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <AnimatedSection key={index} direction="up" delay={index * 0.1}>
              <div className={styles.statCard}>
                <div className={styles.iconContainer}>
                  {stat.icon}
                </div>
                <div className={styles.statValue}>
                  <AnimatedCounter 
                    end={stat.value} 
                    suffix={stat.suffix} 
                  />
                </div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;