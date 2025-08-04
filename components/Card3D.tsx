"use client";
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './Card3D.module.css';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  depth?: number;
  borderRadius?: number;
  backgroundColor?: string;
}

const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  depth = 20,
  borderRadius = 8,
  backgroundColor = 'white',
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate cursor position from the center of the card (in percentage)
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = event.clientX - centerX;
    const mouseY = event.clientY - centerY;
    
    // Calculate rotation angles based on cursor position
    // Divide by larger values to reduce the effect
    const rotateYValue = mouseX / (rect.width / 10);
    const rotateXValue = -mouseY / (rect.height / 10);
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseEnter = () => {
    setScale(1.05);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`${styles.card} ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
        backgroundColor,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      animate={{
        rotateX,
        rotateY,
        scale,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.cardContent}>
        {children}
      </div>
      <div
        className={styles.cardShadow}
        style={{
          boxShadow: `0 ${depth}px ${depth * 2}px rgba(0, 0, 0, 0.1)`,
          borderRadius: `${borderRadius}px`,
        }}
      />
    </motion.div>
  );
};

export default Card3D;