"use client";
import React from 'react';
import styles from '@/app/planner/page.module.css';

type PriorityFactorId = 'price' | 'location' | 'activities' | 'schedule';

interface PreferencesFormProps {
  formData: {
    location: string;
    distance: number;
    budget: string;
    weeklyBudget: string;
    transportation: string;
    priorities: PriorityFactorId[];
  };
  priorityFactors: { id: PriorityFactorId; label: string }[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  movePriority: (id: PriorityFactorId, direction: 'up' | 'down') => void;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({
  formData,
  priorityFactors,
  handleInputChange,
  movePriority
}) => {
  return (
    <div className={styles.wizardStep}>
      <h2 className={styles.stepTitle}>Set your preferences</h2>
      <p className={styles.stepDescription}>
        Tell us about your location, budget, and other requirements to help us find the best camps.
      </p>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>ZIP Code</label>
        <input 
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="e.g., 75034"
          className={styles.formInput}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Distance Willing to Travel</label>
        <div className={styles.sliderContainer}>
          <input 
            type="range"
            name="distance"
            min="1"
            max="50"
            value={formData.distance}
            onChange={handleInputChange}
            className={styles.rangeSlider}
          />
          <div className={styles.sliderValue}>{formData.distance} miles</div>
        </div>
      </div>
      
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Total Budget for Summer</label>
          <div className={styles.inputWithPrefix}>
            <span className={styles.inputPrefix}>$</span>
            <input 
              type="text"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              placeholder="e.g., 3000"
              className={styles.formInput}
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Budget per Week per Child</label>
          <div className={styles.inputWithPrefix}>
            <span className={styles.inputPrefix}>$</span>
            <input 
              type="text"
              name="weeklyBudget"
              value={formData.weeklyBudget}
              onChange={handleInputChange}
              placeholder="e.g., 350"
              className={styles.formInput}
            />
          </div>
        </div>
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Transportation</label>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input 
              type="radio"
              name="transportation"
              value="parent"
              checked={formData.transportation === 'parent'}
              onChange={handleInputChange}
            />
            <span>Parent Drop-off/Pick-up</span>
          </label>
          <label className={styles.radioLabel}>
            <input 
              type="radio"
              name="transportation"
              value="bus"
              checked={formData.transportation === 'bus'}
              onChange={handleInputChange}
            />
            <span>Need Bus/Transportation Service</span>
          </label>
          <label className={styles.radioLabel}>
            <input 
              type="radio"
              name="transportation"
              value="either"
              checked={formData.transportation === 'either'}
              onChange={handleInputChange}
            />
            <span>Either Option Works</span>
          </label>
        </div>
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>What matters most to you?</label>
        <p className={styles.fieldDescription}>Drag to reorder your priorities (most important at the top)</p>
        
        <div className={styles.priorityList}>
          {formData.priorities.map((priorityId, index) => {
            const priority = priorityFactors.find(p => p.id === priorityId);
            if (!priority) return null;
            
            return (
              <div key={priority.id} className={styles.priorityItem}>
                <div className={styles.priorityRank}>{index + 1}</div>
                <div className={styles.priorityLabel}>{priority.label}</div>
                <div className={styles.priorityControls}>
                  <button 
                    type="button"
                    className={styles.priorityButton}
                    disabled={index === 0}
                    onClick={() => movePriority(priority.id, 'up')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button 
                    type="button"
                    className={styles.priorityButton}
                    disabled={index === formData.priorities.length - 1}
                    onClick={() => movePriority(priority.id, 'down')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 12L12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PreferencesForm;