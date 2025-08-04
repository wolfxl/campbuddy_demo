"use client";
import React from 'react';
import styles from './PinkSection.module.css';
import AnimatedSection from './AnimatedSection';

const PinkSection = () => {
  return (
    <section className={styles.pinkSection}>
      {/* Top wave for transition */}
      <div className={styles.topWave}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#ffffff" fillOpacity="1" d="M0,160L48,144C96,128,192,96,288,90.7C384,85,480,107,576,133.3C672,160,768,192,864,197.3C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>

      <div className={styles.particles}></div>

      <div className="container">
        <div className={styles.sectionContent}>
          <AnimatedSection direction="up">
            <h2 className={styles.sectionTitle}>Happy Parents, Happy Kids</h2>
            <p className={styles.sectionDescription}>
              See what families have to say about how CampBuddy has transformed their summer planning experience.
            </p>
          </AnimatedSection>
          
          <div className={styles.testimonialsGrid}>
            <AnimatedSection direction="up" delay={0.1}>
              <div className={styles.testimonialCard}>
                <div className={styles.quoteIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.6667 14.6667H8V21.3333H14.6667V14.6667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M24 14.6667H17.3333V21.3333H24V14.6667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 21.3333C8 23.5425 8.87797 25.6611 10.4408 27.2239C12.0036 28.7868 14.1221 29.6667 16.3333 29.6667C18.5445 29.6667 20.6631 28.7868 22.2259 27.2239C23.7887 25.6611 24.6667 23.5425 24.6667 21.3333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 14.6667C8 12.4554 8.87797 10.3369 10.4408 8.77411C12.0036 7.21129 14.1221 6.33331 16.3333 6.33331C18.5445 6.33331 20.6631 7.21129 22.2259 8.77411C23.7887 10.3369 24.6667 12.4554 24.6667 14.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className={styles.quote}>"CampBuddy made planning our summer so much easier! The Smart Planner found amazing camps that matched my kids' interests, and I could see all their schedules in one place."</p>
                <div className={styles.author}>
                  <div className={styles.authorInfo}>
                    <h4 className={styles.authorName}>Jessica M.</h4>
                    <p className={styles.authorPosition}>Mother of 3</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
            
            <AnimatedSection direction="up" delay={0.2}>
              <div className={styles.testimonialCard}>
                <div className={styles.quoteIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.6667 14.6667H8V21.3333H14.6667V14.6667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M24 14.6667H17.3333V21.3333H24V14.6667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 21.3333C8 23.5425 8.87797 25.6611 10.4408 27.2239C12.0036 28.7868 14.1221 29.6667 16.3333 29.6667C18.5445 29.6667 20.6631 28.7868 22.2259 27.2239C23.7887 25.6611 24.6667 23.5425 24.6667 21.3333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 14.6667C8 12.4554 8.87797 10.3369 10.4408 8.77411C12.0036 7.21129 14.1221 6.33331 16.3333 6.33331C18.5445 6.33331 20.6631 7.21129 22.2259 8.77411C23.7887 10.3369 24.6667 12.4554 24.6667 14.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className={styles.quote}>"As a working parent, I needed to find camps that matched my work schedule. CampBuddy's filtering options and calendar view saved me hours of research!"</p>
                <div className={styles.author}>
                  <div className={styles.authorInfo}>
                    <h4 className={styles.authorName}>David T.</h4>
                    <p className={styles.authorPosition}>Father of 2</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
            
            <AnimatedSection direction="up" delay={0.3}>
              <div className={styles.testimonialCard}>
                <div className={styles.quoteIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.6667 14.6667H8V21.3333H14.6667V14.6667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M24 14.6667H17.3333V21.3333H24V14.6667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 21.3333C8 23.5425 8.87797 25.6611 10.4408 27.2239C12.0036 28.7868 14.1221 29.6667 16.3333 29.6667C18.5445 29.6667 20.6631 28.7868 22.2259 27.2239C23.7887 25.6611 24.6667 23.5425 24.6667 21.3333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 14.6667C8 12.4554 8.87797 10.3369 10.4408 8.77411C12.0036 7.21129 14.1221 6.33331 16.3333 6.33331C18.5445 6.33331 20.6631 7.21129 22.2259 8.77411C23.7887 10.3369 24.6667 12.4554 24.6667 14.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className={styles.quote}>"The AI Assistant helped me fill in gaps in our schedule and found camps I would have never discovered on my own. My daughter had the best summer ever!"</p>
                <div className={styles.author}>
                  <div className={styles.authorInfo}>
                    <h4 className={styles.authorName}>Sophia K.</h4>
                    <p className={styles.authorPosition}>Mother of 1</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>

      {/* Bottom wave for transition */}
      <div className={styles.bottomWave}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#ffffff" fillOpacity="1" d="M0,32L48,58.7C96,85,192,139,288,149.3C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default PinkSection;