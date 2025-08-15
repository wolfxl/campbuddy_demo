"use client";
import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import styles from './AnimatedCounter.module.css';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  duration = 2,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 0,
}) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      let startTime: number | null = null;
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setCount(end);
        }
      };

      window.requestAnimationFrame(step);
    }
  }, [inView, end, duration]);

  const formatCount = () => {
    if (decimals === 0) {
      return count;
    }
    return count.toFixed(decimals);
  };

  return (
    <div ref={ref} className={`${styles.counter} ${className}`}>
      <span className={styles.value}>
        {prefix}
        {formatCount()}
        {suffix}
      </span>
    </div>
  );
};

export default AnimatedCounter;