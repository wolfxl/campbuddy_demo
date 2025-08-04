"use client";
import React from 'react';
import styles from '@/app/planner/page.module.css';

interface WeekSelectionProps {
  summerWeeks: string[];
  formData: {
    weeks: boolean[];
    timePreference: string;
  };
  toggleWeek: (weekIndex: number) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const WeekSelection: React.FC<WeekSelectionProps> = ({
  summerWeeks,
  formData,
  toggleWeek,
  handleInputChange,
  setFormData
}) => {
  return (
    <div className={styles.wizardStep}>
      <h2 className={styles.stepTitle}>When are your children available?</h2>
      <p className={styles.stepDescription}>
        Select which weeks you need camp coverage and any specific time requirements.
      </p>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Select Weeks</label>
        <div className={styles.weekQuickButtons}>
          <button 
            type="button" 
            className={styles.weekQuickButton}
            onClick={() => {
              const newWeeks = [true, true, true, true, true, true, true, true];
              setFormData({
                ...formData,
                weeks: newWeeks
              });
            }}
          >
            All Summer
          </button>
          <button 
            type="button" 
            className={styles.weekQuickButton}
            onClick={() => {
              const newWeeks = [true, true, true, true, false, false, false, false];
              setFormData({
                ...formData,
                weeks: newWeeks
              });
            }}
          >
            June Only
          </button>
          <button 
            type="button" 
            className={styles.weekQuickButton}
            onClick={() => {
              const newWeeks = [false, false, false, false, true, true, true, true];
              setFormData({
                ...formData,
                weeks: newWeeks
              });
            }}
          >
            July Only
          </button>
          <button 
            type="button" 
            className={styles.weekQuickButton}
            onClick={() => {
              const newWeeks = [false, false, false, false, false, false, false, false];
              setFormData({
                ...formData,
                weeks: newWeeks
              });
            }}
          >
            Clear All
          </button>
        </div>
        <div className={styles.weeksGrid}>
          {summerWeeks.map((week, index) => (
            <div 
              key={index}
              className={`${styles.weekChip} ${formData.weeks[index] ? styles.selected : ''}`}
              onClick={() => toggleWeek(index)}
            >
              <div className={styles.weekCheck}>
                {formData.weeks[index] && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span>{week}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Time Preference</label>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input 
              type="radio"
              name="timePreference"
              value="full-day"
              checked={formData.timePreference === 'full-day'}
              onChange={handleInputChange}
            />
            <span>Full Day (9AM-4PM)</span>
          </label>
          <label className={styles.radioLabel}>
            <input 
              type="radio"
              name="timePreference"
              value="morning"
              checked={formData.timePreference === 'morning'}
              onChange={handleInputChange}
            />
            <span>Morning Only (9AM-12PM)</span>
          </label>
          <label className={styles.radioLabel}>
            <input 
              type="radio"
              name="timePreference"
              value="afternoon"
              checked={formData.timePreference === 'afternoon'}
              onChange={handleInputChange}
            />
            <span>Afternoon Only (1PM-4PM)</span>
          </label>
          <label className={styles.radioLabel}>
            <input 
              type="radio"
              name="timePreference"
              value="extended"
              checked={formData.timePreference === 'extended'}
              onChange={handleInputChange}
            />
            <span>Extended Care (8AM-6PM)</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default WeekSelection;