"use client";
import React from 'react';
import FeatureCard from './FeatureCard';
import AnimatedSection from './AnimatedSection';
import styles from './FeaturesSection.module.css';

const FeaturesSection = () => {
  const features = [
    {
      icon: (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="#E6F7FF" />
          <path d="M32 22C38.6274 22 44 27.3726 44 34C44 40.6274 38.6274 46 32 46C25.3726 46 20 40.6274 20 34C20 27.3726 25.3726 22 32 22Z" stroke="#0066CC" strokeWidth="2" />
          <path d="M32 18L32 22" stroke="#0066CC" strokeWidth="2" strokeLinecap="round" />
          <path d="M44 34L40 34" stroke="#0066CC" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 46L32 50" stroke="#0066CC" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 34L16 34" stroke="#0066CC" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 30L32 38L36 36" stroke="#0066CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Flexible Scheduling',
      description: 'Plan your child\'s summer week by week, with options for full-day, half-day, or custom camp schedules.',
    },
    {
      icon: (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="#FFF4E5" />
          <path d="M24 20H40C41.1046 20 42 20.8954 42 22V42C42 43.1046 41.1046 44 40 44H24C22.8954 44 22 43.1046 22 42V22C22 20.8954 22.8954 20 24 20Z" stroke="#FF8800" strokeWidth="2" />
          <path d="M32 38C34.2091 38 36 36.2091 36 34C36 31.7909 34.2091 30 32 30C29.7909 30 28 31.7909 28 34C28 36.2091 29.7909 38 32 38Z" stroke="#FF8800" strokeWidth="2" />
          <path d="M28 26H36" stroke="#FF8800" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      title: 'Budget-Friendly Options',
      description: 'Filter camps by price range and discover special discounts for multi-week registrations or sibling enrollments.',
    },
    {
      icon: (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="#EEFBEE" />
          <path d="M32 22C32 22 34.6667 19 40 19C45.3333 19 48 22 48 22V40C48 40 45.3333 43 40 43C34.6667 43 32 40 32 40" stroke="#00AA55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M32 22C32 22 29.3333 19 24 19C18.6667 19 16 22 16 22V40C16 40 18.6667 43 24 43C29.3333 43 32 40 32 40V22Z" stroke="#00AA55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Educational Enrichment',
      description: 'Browse camps focused on STEM, arts, languages, and more to keep your child learning while having fun.',
    },
  ];

  return (
    <section className={styles.featuresSection}>
      {/* Top wave for transition from Pink Section */}
      <div className={styles.topWave}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#ffffff" fillOpacity="1" d="M0,32L48,58.7C96,85,192,139,288,149.3C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>

      <div className={styles.backgroundAnimation}></div>
      <div className="container">
        <AnimatedSection direction="up">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Find the Perfect Summer Camp Experience</h2>
            <p className={styles.sectionDescription}>
              Discover a wide range of camps that combine fun, learning, and adventure for kids of all ages and interests.
            </p>
          </div>
        </AnimatedSection>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
      
      {/* Bottom wave for transition to CTA section */}
      <div className={styles.bottomWave}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#f1f1f1" fillOpacity="1" d="M0,160L48,144C96,128,192,96,288,90.7C384,85,480,107,576,133.3C672,160,768,192,864,197.3C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default FeaturesSection;