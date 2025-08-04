"use client";
import React from 'react';
import Card3D from './Card3D';
import AnimatedSection from './AnimatedSection';
import styles from './FeatureCard.module.css';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  index?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className = '',
  index = 0,
}) => {
  return (
    <AnimatedSection direction="up" delay={0.1 * index}>
      <Card3D className={`${styles.featureCard} ${className}`} depth={30}>
        <div className={styles.iconContainer}>
          {icon}
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </Card3D>
    </AnimatedSection>
  );
};

export default FeatureCard;