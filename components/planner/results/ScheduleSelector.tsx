import React from 'react';
import { ScheduleOption } from '@/lib/algorithm/types';
import styles from '../results.module.css';

interface ScheduleSelectorProps {
  scheduleOptions: ScheduleOption[];
  selectedScheduleId: string;
  onSelectSchedule: (scheduleId: string) => void;
  onStartOver: () => void;
}

export const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({
  scheduleOptions,
  selectedScheduleId,
  onSelectSchedule,
  onStartOver
}) => {
  return (
    <div className={styles.calendarToolbar}>
      <div className={styles.viewOptions}>
        <button className={`${styles.viewButton} ${styles.active}`}>
          Calendar View
        </button>
        <button className={styles.viewButton}>
          List View
        </button>
      </div>
      
      {scheduleOptions.length > 0 && (
        <div className={styles.scheduleOptions}>
          <label>Schedule Options:</label>
          <div className={styles.optionButtons}>
            {scheduleOptions.map(option => (
              <button
                key={option.scheduleId}
                className={`${styles.optionButton} ${
                  selectedScheduleId === option.scheduleId ? styles.activeOption : ''
                }`}
                onClick={() => onSelectSchedule(option.scheduleId)}
              >
                {option.optimizationFocus}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <button 
        className={styles.regenerateButton}
        onClick={onStartOver}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M23 4V10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.51 9.00008C4.01717 7.56686 4.87913 6.28542 6.01547 5.27549C7.1518 4.26556 8.52547 3.56084 10.0083 3.22419C11.4911 2.88754 13.0348 2.93194 14.4952 3.35405C15.9556 3.77615 17.2853 4.56133 18.36 5.64008L23 10.0001M1 14.0001L5.64 18.3601C6.71475 19.4388 8.04437 20.224 9.50481 20.6461C10.9652 21.0682 12.5089 21.1126 13.9917 20.776C15.4745 20.4393 16.8482 19.7346 17.9845 18.7247C19.1209 17.7147 19.9828 16.4333 20.49 15.0001" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Start Over
      </button>
    </div>
  );
};