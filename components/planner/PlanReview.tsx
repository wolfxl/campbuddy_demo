"use client";
import React from 'react';
import styles from '@/app/planner/page.module.css';

type PriorityFactorId = 'price' | 'location' | 'activities' | 'schedule';

interface FormData {
  children: {
    name: string;
    grade: string;
    interests: (string | { name: string; strength: string | null })[];
  }[];
  weeks: boolean[];
  timePreference: string;
  location: string;
  distance: number;
  budget: string;
  weeklyBudget: string;
  transportation: string;
  priorities: PriorityFactorId[];
  requiredActivities: string[];
}

interface PlanReviewProps {
  formData: FormData;
  priorityFactors: { id: PriorityFactorId; label: string }[];
  interestStrengths: { value: string; label: string }[];
  generatePlan: () => void;
}

const PlanReview: React.FC<PlanReviewProps> = ({
  formData,
  priorityFactors,
  interestStrengths,
  generatePlan
}) => {
  return (
    <div className={styles.wizardStep}>
      <h2 className={styles.stepTitle}>Ready to generate your summer plan!</h2>
      <p className={styles.stepDescription}>
        Our smart algorithm will analyze your preferences and create a customized summer schedule for your children.
      </p>
      
      <div className={styles.reviewContainer}>
        <h3 className={styles.reviewTitle}>Summary of Preferences:</h3>
        
        <div className={styles.reviewSection}>
          <h4 className={styles.reviewSectionTitle}>Children:</h4>
          <ul className={styles.reviewList}>
            {formData.children.map((child, index) => (
              <li key={index}>
                {child.name ? child.name : `Child ${index + 1}`} - {child.grade || 'No grade specified'} - 
                {child.interests && child.interests.length > 0 
                  ? ` Interested in ${child.interests.map(interest => {
                      if (typeof interest === 'object' && interest.strength) {
                        const strengthLabel = interestStrengths.find(s => s.value === interest.strength)?.label || '';
                        return `${interest.name} (${strengthLabel})`;
                      }
                      return interest;
                    }).join(', ')}`
                  : ' No interests specified'}
              </li>
            ))}
          </ul>
        </div>
        
        <div className={styles.reviewSection}>
          <h4 className={styles.reviewSectionTitle}>Schedule:</h4>
          <p>
            <strong>Weeks selected:</strong> {formData.weeks.filter(w => w).length} out of 8 weeks
          </p>
          <p>
            <strong>Time preference:</strong> {
              formData.timePreference === 'full-day' ? 'Full Day (9AM-4PM)' :
              formData.timePreference === 'morning' ? 'Morning Only (9AM-12PM)' :
              formData.timePreference === 'afternoon' ? 'Afternoon Only (1PM-4PM)' :
              'Extended Care (8AM-6PM)'
            }
          </p>
        </div>
        
        <div className={styles.reviewSection}>
          <h4 className={styles.reviewSectionTitle}>Preferences:</h4>
          <p>
            <strong>Location:</strong> {formData.location ? `${formData.location} (${formData.distance} mile radius)` : 'Not specified'}
          </p>
          <p>
            <strong>Budget:</strong> {formData.budget ? `${formData.budget} total` : 'Not specified'}{formData.weeklyBudget ? `, ${formData.weeklyBudget} per week per child` : ''}
          </p>
          <p>
            <strong>Transportation:</strong> {formData.transportation === 'parent' ? 'Parent Drop-off/Pick-up' : formData.transportation === 'bus' ? 'Need Bus/Transportation Service' : 'Either Option Works'}
          </p>
          <p>
            <strong>Priorities:</strong> {formData.priorities.map((priorityId, index) => {
              const priority = priorityFactors.find(p => p.id === priorityId);
              return priority ? `${index + 1}. ${priority.label}` : null;
            }).filter(Boolean).join(', ')}
          </p>
          {formData.requiredActivities.length > 0 && (
            <p>
              <strong>Must-Have Activities:</strong> {formData.requiredActivities.join(', ')}
            </p>
          )}
        </div>
      </div>
      
      <div className={styles.generatingInfo}>
        <svg className={styles.infoIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p>
          ✅ We've already filtered camps based on your interests, grade level, availability, location, and budget. 
          Our AI will now create an optimized schedule using only the camps that match your criteria!
        </p>
      </div>
      
      <button 
        type="button"
        className={styles.generateButton}
        onClick={generatePlan}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 8V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Smart Plan My Summer!
      </button>
    </div>
  );
};

export default PlanReview;