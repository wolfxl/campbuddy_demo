"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './MouseFollower.module.css';

const MouseFollower = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  const followerVariants = {
    visible: {
      opacity: 1,
      scale: 1,
      x: mousePosition.x - 20,
      y: mousePosition.y - 20,
    },
    hidden: {
      opacity: 0,
      scale: 0.5,
    },
  };

  const ringVariants = {
    visible: {
      opacity: 0.3,
      scale: 1,
      x: mousePosition.x - 50,
      y: mousePosition.y - 50,
    },
    hidden: {
      opacity: 0,
      scale: 0.5,
    },
  };

  return (
    <>
      <motion.div
        className={styles.follower}
        variants={followerVariants}
        animate={isVisible ? 'visible' : 'hidden'}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
        }}
      />
      <motion.div
        className={styles.ring}
        variants={ringVariants}
        animate={isVisible ? 'visible' : 'hidden'}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 200,
          delay: 0.05,
        }}
      />
    </>
  );
};

export default MouseFollower;