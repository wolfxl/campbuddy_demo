"use client";
import React from 'react';
import AnimatedButton from './AnimatedButton';
import AnimatedSection from './AnimatedSection';
import styles from './YellowBanner.module.css';

const YellowBanner = () => {
  return (
    <section className={styles.yellowBanner}>
      {/* No top wave needed - handled by FeaturesSection */}

      <div className={styles.glowEffect}></div>
      <div className={styles.particles}></div>
      <div className="container">
        <div className={styles.bannerContent}>
          <AnimatedSection direction="left">
            <div className={styles.textContent}>
              <h2 className={styles.bannerTitle}>With the Right Software, Great Things Can Happen</h2>
              <p className={styles.bannerDescription}>
                Empower your team with cutting-edge tools designed to enhance productivity, streamline workflows, and drive meaningful results.
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection direction="right" delay={0.2}>
            <div className={styles.bannerCta}>
              <AnimatedButton href="/get-started" variant="primary" size="large" withShine={true}>
                Get Started
              </AnimatedButton>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Bottom wave - smooth transition to white section */}
      <div className={styles.bottomWave}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#FFFFFF" fillOpacity="1" d="M0,64L48,80C96,96,192,128,288,133.3C384,139,480,117,576,90.7C672,64,768,32,864,26.7C960,21,1056,43,1152,69.3C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default YellowBanner;