"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/planner/results/page.module.css';

const ActionButtons: React.FC = () => {
  const router = useRouter();
  
  return (
    <div className={styles.actionButtons}>
      <button 
        className={styles.secondaryButton}
        onClick={() => router.push('/planner')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Planner
      </button>
      <button className={styles.primaryButton}>
        Register for All Camps
      </button>
    </div>
  );
};

export default ActionButtons;