import React from 'react';
import { CampInPlan, ChildInPlan } from '@/lib/types/planner';
import { getMatchScoreInfo, getMatchScoreProgress } from '@/lib/utils/plannerUtils';
import styles from '../results.module.css';

interface CampCardProps {
  camp: CampInPlan;
  child: ChildInPlan;
  onToggleLock: (campId: string | number) => void;
  onSwapCamp?: () => void;
  onViewDetails?: () => void;
  onRegister?: () => void;
}

export const CampCard: React.FC<CampCardProps> = ({
  camp,
  child,
  onToggleLock,
  onSwapCamp,
  onViewDetails,
  onRegister
}) => {
  return (
    <div 
      className={styles.campCard} 
      style={{ borderColor: child.color }}
    >
      <div className={styles.campHeader}>
        <h4 className={styles.campName}>{camp.name}</h4>
        <button 
          className={`${styles.lockButton} ${camp.locked ? styles.locked : ''}`}
          onClick={() => onToggleLock(camp.id)}
        >
          {camp.locked ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
      
      <p className={styles.campOrg}>{camp.organization}</p>
      
      {/* Match score indicator */}
      {camp.matchScore && (
        <div className={styles.matchScoreContainer}>
          <div className={styles.matchScoreBar}>
            <div 
              className={styles.matchProgressFill}
              style={{ 
                width: `${getMatchScoreProgress(camp.matchScore)}%`,
                backgroundColor: getMatchScoreInfo(camp.matchScore).color
              }}
            ></div>
          </div>
          <span className={styles.matchScoreLabel}>
            {getMatchScoreInfo(camp.matchScore).category}
          </span>
        </div>
      )}
      
      <div className={styles.campDetails}>
        <div className={styles.campDetail}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {camp.times}
        </div>
        <div className={styles.campDetail}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {camp.location}
        </div>
        <div className={styles.campPrice}>{camp.price}</div>
      </div>
      
      {/* Match reasons tooltip */}
      {camp.matchReasons && camp.matchReasons.length > 0 && (
        <div className={styles.matchReasons}>
          <button className={styles.matchReasonsToggle} type="button" title="Show match details">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
            Match details
          </button>
          <div className={styles.matchReasonsList}>
            <h5>Why This Camp Matches:</h5>
            <ul>
              {camp.matchReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <div className={styles.campActions}>
        <button className={styles.swapButton} onClick={onSwapCamp}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 1L21 5L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 11V9C3 7.93913 3.42143 6.92172 4.17157 6.17157C4.92172 5.42143 5.93913 5 7 5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 23L3 19L7 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 13V15C21 16.0609 20.5786 17.0783 19.8284 17.8284C19.0783 18.5786 18.0609 19 17 19H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Swap
        </button>
        <button className={styles.detailsButton} onClick={onViewDetails}>
          Details
        </button>
        <button className={styles.registerButton} onClick={onRegister}>
          Register
        </button>
      </div>
    </div>
  );
};

interface EmptyCampSlotProps {
  onAddCamp?: () => void;
}

export const EmptyCampSlot: React.FC<EmptyCampSlotProps> = ({ onAddCamp }) => {
  return (
    <div className={styles.emptyCampSlot}>
      <div className={styles.emptySlotContent}>
        <p>No camp scheduled</p>
        <button className={styles.addCampButton} onClick={onAddCamp}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Add Camp
        </button>
      </div>
    </div>
  );
};