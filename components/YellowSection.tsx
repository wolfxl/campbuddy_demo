"use client";
import React from 'react';
import styles from './YellowSection.module.css';
import AnimatedSection from './AnimatedSection';

const YellowSection = () => {
  return (
    <section className={styles.yellowSection}>
      {/* Top wave for transition */}
      <div className={styles.topWave}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#ffffff" fillOpacity="1" d="M0,32L48,58.7C96,85,192,139,288,149.3C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>

      <div className={styles.glowEffect}></div>
      <div className={styles.particles}></div>
      <div className="container">
        <div className={styles.sectionContent}>
          <AnimatedSection direction="up">
            <h2 className={styles.sectionTitle}>Why Parents Choose CampBuddy</h2>
          </AnimatedSection>
          
          <div className={styles.highlightsGrid}>
            <AnimatedSection direction="up" delay={0.1}>
              <div className={styles.highlightCard}>
                <div className={styles.highlightIcon}>🧠</div>
                <h3>Smart Planning</h3>
                <p>Our AI helps find and schedule the perfect camps based on your child's interests and your schedule.</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection direction="up" delay={0.2}>
              <div className={styles.highlightCard}>
                <div className={styles.highlightIcon}>🤖</div>
                <h3>AI Assistant</h3>
                <p>Get personalized help finding camps, adjusting schedules, and planning your summer.</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection direction="up" delay={0.3}>
              <div className={styles.highlightCard}>
                <div className={styles.highlightIcon}>✅</div>
                <h3>Verified Providers</h3>
                <p>All our camp listings are verified for safety and accurate information.</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection direction="up" delay={0.4}>
              <div className={styles.highlightCard}>
                <div className={styles.highlightIcon}>💾</div>
                <h3>Save & Share</h3>
                <p>Easily save, export, and share your summer schedules with family and caregivers.</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>

      {/* Bottom wave for transition */}
      <div className={styles.bottomWave}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#ffffff" fillOpacity="1" d="M0,64L48,80C96,96,192,128,288,133.3C384,139,480,117,576,90.7C672,64,768,32,864,26.7C960,21,1056,43,1152,69.3C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default YellowSection;