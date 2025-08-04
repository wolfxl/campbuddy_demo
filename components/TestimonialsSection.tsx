"use client";
import React from 'react';
import Card3D from './Card3D';
import AnimatedSection from './AnimatedSection';
import styles from './TestimonialsSection.module.css';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      quote: "CampBuddy made planning our summer so much easier! The Smart Planner found amazing camps that matched my kids' interests, and I could see all their schedules in one place.",
      author: "Jessica M.",
      position: "Mother of 3",
      avatar: "/images/avatar-1.jpg",
    },
    {
      id: 2,
      quote: "As a working parent, I needed to find camps that matched my work schedule. CampBuddy's filtering options and calendar view saved me hours of research!",
      author: "David T.",
      position: "Father of 2",
      avatar: "/images/avatar-2.jpg",
    },
    {
      id: 3,
      quote: "The AI Assistant helped me fill in gaps in our schedule and found camps I would have never discovered on my own. My daughter had the best summer ever!",
      author: "Sophia K.",
      position: "Mother of 1",
      avatar: "/images/avatar-3.jpg",
    },
  ];

  return (
    <section className={styles.testimonials}>
      {/* Top wave */}
      <div className={styles.topWave}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#FFFFFF" fillOpacity="1" d="M0,160L48,144C96,128,192,96,288,90.7C384,85,480,107,576,133.3C672,160,768,192,864,197.3C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>
      
      <div className={styles.shapesContainer}>
        <div className={`${styles.shape} ${styles.shape1}`}></div>
        <div className={`${styles.shape} ${styles.shape2}`}></div>
        <div className={`${styles.shape} ${styles.shape3}`}></div>
      </div>
      <div className="container">
        <AnimatedSection direction="up">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Happy Parents, Happy Kids</h2>
            <p className={styles.sectionDescription}>
              See what families have to say about how CampBuddy has transformed their summer planning experience.
            </p>
          </div>
        </AnimatedSection>
        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <AnimatedSection key={testimonial.id} direction="up" delay={0.1 * index}>
              <Card3D className={styles.testimonialCard} depth={30}>
                <div className={styles.quoteIcon}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.6667 14.6667H8V21.3333H14.6667V14.6667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M24 14.6667H17.3333V21.3333H24V14.6667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 21.3333C8 23.5425 8.87797 25.6611 10.4408 27.2239C12.0036 28.7868 14.1221 29.6667 16.3333 29.6667C18.5445 29.6667 20.6631 28.7868 22.2259 27.2239C23.7887 25.6611 24.6667 23.5425 24.6667 21.3333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 14.6667C8 12.4554 8.87797 10.3369 10.4408 8.77411C12.0036 7.21129 14.1221 6.33331 16.3333 6.33331C18.5445 6.33331 20.6631 7.21129 22.2259 8.77411C23.7887 10.3369 24.6667 12.4554 24.6667 14.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className={styles.quote}>"{testimonial.quote}"</p>
                <div className={styles.author}>
                  <div className={styles.avatarWrapper}>
                    <div className={styles.avatarPlaceholder}></div>
                  </div>
                  <div className={styles.authorInfo}>
                    <h4 className={styles.authorName}>{testimonial.author}</h4>
                    <p className={styles.authorPosition}>{testimonial.position}</p>
                  </div>
                </div>
              </Card3D>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;