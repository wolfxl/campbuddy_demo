"use client";
import React from 'react';
import styles from '@/app/planner/page.module.css';

interface WizardNavigationProps {
  currentStep: number;
  prevStep: () => void;
  nextStep: () => void | Promise<void>;
  canProceed?: boolean;
  validationMessage?: string;
  isLoading?: boolean;
  loadingMessage?: string;
}

const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStep,
  prevStep,
  nextStep,
  canProceed = true,
  validationMessage,
  isLoading = false,
  loadingMessage = ''
}) => {
  const handleNextClick = async () => {
    if (canProceed) {
      await nextStep();
    }
  };
  return (
    <div className={styles.wizardNavigation}>
      {currentStep > 1 && (
        <button 
          type="button" 
          className={styles.navButton}
          onClick={prevStep}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
      )}
      
      <div className={styles.nextButtonContainer}>
        {validationMessage && !canProceed && (
          <div className={styles.validationMessage}>
            {validationMessage}
          </div>
        )}
        {currentStep < 4 && (
          <button 
            type="button" 
            className={`${styles.navButton} ${styles.nextButton} ${!canProceed ? styles.disabled : ''}`}
            onClick={handleNextClick}
            disabled={!canProceed}
          >
            {isLoading ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                  <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"/>
                </svg>
                {loadingMessage || 'Loading...'}
              </>
            ) : (
              <>
                Continue
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default WizardNavigation;