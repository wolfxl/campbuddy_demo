"use client";
import React from 'react';
import styles from '@/app/planner/page.module.css';
import ChildForm from './ChildForm';

interface Interest {
  name: string;
  strength: string | null;
}

interface Child {
  name: string;
  grade: string;
  interests: (Interest | string)[];
}

interface AddChildrenStepProps {
  formData: {
    children: Child[];
  };
  availableInterests: string[];
  interestStrengths: { value: string; label: string }[];
  gradeLevels: string[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number | null, field: keyof Child | null) => void;
  toggleInterest: (childIndex: number, interestName: string, strength: string | null) => void;
  removeChild: (index: number) => void;
  addChild: () => void;
  categoriesLoading?: boolean;
  categoriesError?: string | null;
}

const AddChildrenStep: React.FC<AddChildrenStepProps> = ({
  formData,
  availableInterests,
  interestStrengths,
  gradeLevels,
  handleInputChange,
  toggleInterest,
  removeChild,
  addChild,
  categoriesLoading = false,
  categoriesError = null
}) => {
  return (
    <div className={styles.wizardStep}>
      <h2 className={styles.stepTitle}>Tell us about your children</h2>
      <p className={styles.stepDescription}>
        Add each child who needs summer camp scheduling. We'll use their ages and interests to find suitable camps.
      </p>
      
      {formData.children.map((child, index) => (
        <ChildForm
          key={index}
          child={child}
          index={index}
          availableInterests={availableInterests}
          interestStrengths={interestStrengths}
          gradeLevels={gradeLevels}
          formData={formData}
          handleInputChange={handleInputChange}
          toggleInterest={toggleInterest}
          removeChild={removeChild}
          categoriesLoading={categoriesLoading}
          categoriesError={categoriesError}
        />
      ))}
      
      <button 
        type="button" 
        className={styles.addChildButton}
        onClick={addChild}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Add Another Child
      </button>
    </div>
  );
};

export default AddChildrenStep;