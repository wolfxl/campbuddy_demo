import React from 'react';
import { PlanState } from '@/lib/types/planner';
import styles from '../results.module.css';

interface ResultsHeaderProps {
  plan: PlanState;
  onExportCalendar?: () => void;
  onSharePlan?: () => void;
  onSavePlan?: () => void;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  plan,
  onExportCalendar,
  onSharePlan,
  onSavePlan
}) => {
  return (
    <div className={styles.pageHeader}>
      <div className="container">
        <h1 className={styles.pageTitle}>Your Summer Plan</h1>
        <p className={styles.pageDescription}>
          Here's the personalized summer schedule we've created for your children.
          <span className={styles.optimizationFocus}>
            Optimization: <strong>{plan.optimizationFocus}</strong>
          </span>
        </p>
      </div>
    </div>
  );
};

interface ResultsToolbarProps {
  plan: PlanState;
  onExportCalendar?: () => void;
  onSharePlan?: () => void;
  onSavePlan?: () => void;
}

export const ResultsToolbar: React.FC<ResultsToolbarProps> = ({
  plan,
  onExportCalendar,
  onSharePlan,
  onSavePlan
}) => {
  return (
    <div className={styles.resultsHeader}>
      <div className={styles.headerLeft}>
        <h2 className={styles.sectionTitle}>Summer 2025 Schedule</h2>
        <div className={styles.childLegend}>
          {plan.children.map(child => (
            <div key={child.id} className={styles.childLegendItem}>
              <div 
                className={styles.childColor} 
                style={{ backgroundColor: child.color }}
              ></div>
              <span>{child.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.headerRight}>
        <button className={styles.actionButton} onClick={onExportCalendar}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export Calendar
        </button>
        <button className={styles.actionButton} onClick={onSharePlan}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Share Plan
        </button>
        <button className={styles.primaryButton} onClick={onSavePlan}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Save Plan
        </button>
      </div>
    </div>
  );
};