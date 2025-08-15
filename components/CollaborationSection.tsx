"use client";
import React from 'react';
import AnimatedSection from './AnimatedSection';
import styles from './CollaborationSection.module.css';

const CollaborationSection = () => {
  return (
    <section className={styles.collaborationSection}>
      {/* Top wave connecting to yellow banner - remove this since YellowBanner handles it */}

      <div className={styles.animatedBackground}></div>
      <div className="container">
        <div className={styles.sectionContent}>
          <div className={styles.illustrationContainer}>
            <AnimatedSection direction="left">
              <div className={styles.illustration}>
                <div className={styles.wireframe}>
                  <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Animated wireframe illustration */}
                    <rect x="50" y="50" width="300" height="200" rx="10" stroke="#333" strokeWidth="2" fill="none" className={styles.animatedRect} />
                    <circle cx="85" cy="120" r="30" fill="#E0E0E0" className={styles.animatedCircle1} />
                    <circle cx="200" cy="120" r="30" fill="#F5F5F5" className={styles.animatedCircle2} />
                    <circle cx="315" cy="120" r="30" fill="#FFBF00" className={styles.animatedCircle3} />
                    <line x1="85" y1="180" x2="85" y2="220" stroke="#333" strokeWidth="2" className={styles.animatedLine} />
                    <line x1="200" y1="180" x2="200" y2="220" stroke="#333" strokeWidth="2" className={styles.animatedLine} />
                    <line x1="315" y1="180" x2="315" y2="220" stroke="#333" strokeWidth="2" className={styles.animatedLine} />
                    <line x1="85" y1="220" x2="315" y2="220" stroke="#333" strokeWidth="2" className={styles.animatedLine} />
                    <line x1="85" y1="160" x2="200" y2="160" stroke="#333" strokeWidth="2" className={styles.animatedLine} />
                    <line x1="200" y1="160" x2="315" y2="160" stroke="#333" strokeWidth="2" className={styles.animatedLine} />
                  </svg>
                </div>
              </div>
            </AnimatedSection>
          </div>
          <div className={styles.textContent}>
            <AnimatedSection direction="right">
              <h2 className={styles.sectionTitle}>Designed by Creatives</h2>
              <p className={styles.sectionDescription}>
                Our platform was built by creative professionals who understand your workflow needs. We've focused on creating intuitive tools that enhance your creative process rather than getting in the way.
              </p>
            </AnimatedSection>
            <AnimatedSection direction="right" delay={0.1}>
              <div className={styles.featureList}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="12" fill="#F5F5F5" />
                      <path d="M16.5 10.5L10.5 16.5L7.5 13.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className={styles.featureText}>All-In-One Toolkit</span>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="12" fill="#F5F5F5" />
                      <path d="M16.5 10.5L10.5 16.5L7.5 13.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className={styles.featureText}>Integrated File Sharing</span>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="12" fill="#F5F5F5" />
                      <path d="M16.5 10.5L10.5 16.5L7.5 13.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className={styles.featureText}>Total Design Freedom</span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollaborationSection;