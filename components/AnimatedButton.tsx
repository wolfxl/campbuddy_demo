"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './AnimatedButton.module.css';

interface AnimatedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  className?: string;
  disabled?: boolean;
  withShine?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  href,
  type = 'button',
  fullWidth = false,
  onClick,
  className = '',
  disabled = false,
  withShine = false,
}) => {
  const buttonClasses = `
    ${styles.button}
    ${styles[variant]}
    ${styles[size]}
    ${fullWidth ? styles.fullWidth : ''}
    ${disabled ? styles.disabled : ''}
    ${withShine ? styles.shine : ''}
    ${className}
  `;

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
  };

  if (href) {
    return (
      <motion.div
        className={styles.buttonWrapper}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        variants={buttonVariants}
      >
        <Link href={href} className={buttonClasses} onClick={onClick as any}>
          {withShine && <span className={styles.shineEffect}></span>}
          <span className={styles.buttonContent}>{children}</span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.buttonWrapper}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
    >
      <button
        type={type}
        className={buttonClasses}
        onClick={onClick}
        disabled={disabled}
      >
        {withShine && <span className={styles.shineEffect}></span>}
        <span className={styles.buttonContent}>{children}</span>
      </button>
    </motion.div>
  );
};

export default AnimatedButton;