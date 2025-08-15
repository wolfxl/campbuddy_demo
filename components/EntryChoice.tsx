'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './EntryChoice.module.css';

interface ChoiceCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  className?: string;
  delay?: number;
}

function ChoiceCard({ title, description, href, icon, className = '', delay = 0 }: ChoiceCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) * 0.1;
      const deltaY = (e.clientY - centerY) * 0.1;
      
      card.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.02)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'translate(0px, 0px) scale(1)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <Link 
      ref={cardRef}
      href={href} 
      className={`${styles.choiceCard} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={styles.cardIcon}>
        <span>{icon}</span>
      </div>
      <div className={styles.cardContent}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className={styles.cardArrow}>→</div>
    </Link>
  );
}

export default function EntryChoice() {
  return (
    <div className={styles.container}>
      {/* Morphing background shapes */}
      <div className={styles.backgroundShapes}>
        <div className={`${styles.shape} ${styles.shape1}`}></div>
        <div className={`${styles.shape} ${styles.shape2}`}></div>
        <div className={`${styles.shape} ${styles.shape3}`}></div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome to CampBuddy</h1>
          <p className={styles.subtitle}>Choose your experience</p>
        </div>
        
        <div className={styles.choices}>
          <ChoiceCard
            title="Quick Chat"
            description="Find your perfect camp through a simple conversation"
            href="/chat"
            icon="💬"
            className={styles.chatChoice}
            delay={200}
          />
          
          <ChoiceCard
            title="Full Experience"
            description="Explore all features, maps, and detailed information"
            href="/full"
            icon="🗺️"
            className={styles.fullChoice}
            delay={400}
          />
        </div>
      </div>
    </div>
  );
}