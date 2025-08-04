"use client";
import React, { ChangeEvent, MouseEvent } from 'react';
import styles from '@/app/planner/page.module.css';

interface Interest {
  name: string;
  strength: string | null;
}

interface Child {
  name: string;
  grade: string;
  interests: (Interest | string)[];
}

interface ChildFormProps {
  child: Child;
  index: number;
  availableInterests: string[];
  interestStrengths: { value: string; label: string }[];
  gradeLevels: string[];
  formData: any;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number | null, field: keyof Child | null) => void;
  toggleInterest: (childIndex: number, interestName: string, strength: string | null) => void;
  removeChild: (index: number) => void;
  categoriesLoading?: boolean;
  categoriesError?: string | null;
}

const ChildForm: React.FC<ChildFormProps> = ({
  child,
  index,
  availableInterests,
  interestStrengths,
  gradeLevels,
  formData,
  handleInputChange,
  toggleInterest,
  removeChild,
  categoriesLoading = false,
  categoriesError = null
}) => {
  return (
    <div className={styles.childCard}>
      <div className={styles.childHeader}>
        <h3 className={styles.childTitle}>Child {index + 1}</h3>
        {formData.children.length > 1 && (
          <button 
            type="button" 
            className={styles.removeChildButton}
            onClick={() => removeChild(index)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Name or Nickname (optional)</label>
          <input 
            type="text"
            value={child.name}
            onChange={(e) => handleInputChange(e, index, 'name')}
            placeholder="e.g., Sam"
            className={styles.formInput}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Grade Level <span className={styles.required}>*</span></label>
          <select 
            value={child.grade}
            onChange={(e) => handleInputChange(e, index, 'grade')}
            className={`${styles.formSelect} ${!child.grade ? styles.required : ''}`}
            required
          >
            <option value="">Select Grade *</option>
            {gradeLevels.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
          {!child.grade && (
            <div className={styles.requiredMessage}>
              Please select a grade level to continue
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Interests (select all that apply)</label>
        {categoriesLoading && (
          <div className={styles.loadingMessage}>
            Loading interests from database...
          </div>
        )}
        {categoriesError && (
          <div className={styles.errorMessage}>
            {categoriesError} (Using fallback categories)
          </div>
        )}
        <div className={styles.interestsGrid}>
          {availableInterests.map(interestName => {
            // Check if interest exists and get its strength
            const interestObj = child.interests?.find(i => 
              (typeof i === 'object' && i.name === interestName) || (typeof i === 'string' && i === interestName)
            ) as Interest | string | undefined;
            const selected = !!interestObj;
            const strength = (typeof interestObj === 'object' && interestObj.strength) ? interestObj.strength : null;
            
            return (
              <div key={interestName} className={styles.interestContainer}>
                <div 
                  className={`${styles.interestChip} ${selected ? styles.selected : ''} ${strength ? styles[strength] : ''}`}
                  onClick={() => toggleInterest(index, interestName)}
                >
                  {interestName}
                </div>
                {selected && (
                  <div className={styles.strengthButtons}>
                    {interestStrengths.map(s => (
                      <button
                        key={s.value}
                        type="button"
                        className={`${styles.strengthButton} ${strength === s.value ? styles.activeStrength : ''}`}
                        onClick={(e: MouseEvent<HTMLButtonElement>) => {
                          e.preventDefault();
                          toggleInterest(index, interestName, s.value);
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChildForm;