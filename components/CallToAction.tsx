"use client";
import React from 'react';
import AnimatedButton from './AnimatedButton';
import AnimatedSection from './AnimatedSection';
import styles from './CallToAction.module.css';

const CallToAction = () => {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.ctaBg}></div>
      <div className={styles.ctaParticles}></div>
      <div className="container">
        <div className={styles.ctaContent}>
          <AnimatedSection direction="up">
            <h2 className={styles.ctaTitle}>Ready to plan your perfect summer?</h2>
            <p className={styles.ctaDescription}>
              Join thousands of families that use CampBuddy to discover, schedule, and manage summer camps for their children.
            </p>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.2}>
            <div className={styles.ctaButtons}>
              <AnimatedButton href="/planner" variant="primary" size="large" withShine={true}>
                Try Smart Planner
              </AnimatedButton>
              <AnimatedButton href="/camps" variant="outline" size="large">
                Browse Camps
              </AnimatedButton>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;