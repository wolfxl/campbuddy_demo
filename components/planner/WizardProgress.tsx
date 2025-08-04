"use client";
import React from 'react';
import styles from '@/app/planner/page.module.css';

interface WizardProgressProps {
  currentStep: number;
}

const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep }) => {
  return (
    <div className={styles.wizardProgress}>
      <div className={`${styles.progressStep} ${currentStep >= 1 ? styles.active : ''}`}>
        <div className={styles.stepNumber}>1</div>
        <div className={styles.stepLabel}>Add Children</div>
      </div>
      <div className={styles.progressLine}></div>
      <div className={`${styles.progressStep} ${currentStep >= 2 ? styles.active : ''}`}>
        <div className={styles.stepNumber}>2</div>
        <div className={styles.stepLabel}>Set Availability</div>
      </div>
      <div className={styles.progressLine}></div>
      <div className={`${styles.progressStep} ${currentStep >= 3 ? styles.active : ''}`}>
        <div className={styles.stepNumber}>3</div>
        <div className={styles.stepLabel}>Preferences</div>
      </div>
      <div className={styles.progressLine}></div>
      <div className={`${styles.progressStep} ${currentStep >= 4 ? styles.active : ''}`}>
        <div className={styles.stepNumber}>4</div>
        <div className={styles.stepLabel}>Generate Plan</div>
      </div>
    </div>
  );
};

export default WizardProgress;