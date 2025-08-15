import React from 'react';
import { PlanState } from '@/lib/types/planner';
import { CampCard, EmptyCampSlot } from './CampCard';
import styles from '../results.module.css';

interface CalendarGridProps {
  plan: PlanState;
  onToggleLock: (weekId: number, campId: string | number) => void;
  onSwapCamp?: (weekId: number, campId: string | number) => void;
  onViewDetails?: (weekId: number, campId: string | number) => void;
  onRegister?: (weekId: number, campId: string | number) => void;
  onAddCamp?: (weekId: number, childId: number) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  plan,
  onToggleLock,
  onSwapCamp,
  onViewDetails,
  onRegister,
  onAddCamp
}) => {
  return (
    <div className={styles.calendar}>
      {plan.weeks.map(week => (
        <div key={week.id} className={styles.weekRow}>
          <div className={styles.weekHeader}>
            <h3 className={styles.weekName}>{week.name}</h3>
          </div>
          <div className={styles.weekCamps}>
            {plan.children.map(child => {
              const childCamp = week.camps.find(camp => Number(camp.childId) === Number(child.id));
              
              console.log(`Rendering week ${week.name} for child ${child.id} (${child.name}): found camp = ${childCamp ? childCamp.name : 'none'}`);
              
              return (
                <div 
                  key={`${week.id}-${child.id}`} 
                  className={styles.campSlot}
                >
                  {childCamp ? (
                    <CampCard
                      camp={childCamp}
                      child={child}
                      onToggleLock={(campId) => onToggleLock(week.id, campId)}
                      onSwapCamp={() => onSwapCamp?.(week.id, childCamp.id)}
                      onViewDetails={() => onViewDetails?.(week.id, childCamp.id)}
                      onRegister={() => onRegister?.(week.id, childCamp.id)}
                    />
                  ) : (
                    <EmptyCampSlot
                      onAddCamp={() => onAddCamp?.(week.id, child.id)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};