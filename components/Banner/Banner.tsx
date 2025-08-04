"use client";
import React from 'react';
import styles from './Banner.module.css';

interface BannerProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const Banner: React.FC<BannerProps> = ({ title, description, children }) => {
  return (
    <div className={styles.banner}>
      <div className={styles.bannerBackground}>
        <div className={styles.bannerWave}></div>
        <div className={styles.bannerGlow}></div>
        <div className={styles.bannerParticles}></div>
      </div>
      <div className="container">
        <div className={styles.bannerContent}>
          <h1 className={styles.bannerTitle}>{title}</h1>
          {description && <p className={styles.bannerDescription}>{description}</p>}
          {children}
        </div>
      </div>
      <div className={styles.bannerBottomWave}>
        <svg viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg">
          <path fill="#ffffff" fillOpacity="1" d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,42.7C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default Banner;