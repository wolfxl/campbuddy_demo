"use client";
import React from 'react';
import styles from '@/app/planner/results/page.module.css';

import { ChildInPlan, WeekInPlan } from './types';

interface SummaryTableProps {
  weeks: WeekInPlan[];
  children: ChildInPlan[];
  matchSummary: {
    grade_match: number;
    price_match: number;
    location_match: number;
    category_match: number;
    required_activities_match: number;
    total_weeks_covered: number;
  };
  totals: {
    totalCost: number;
    childCosts: Record<string | number, number>;
  };
}

const SummaryTable: React.FC<SummaryTableProps> = ({ 
  weeks, 
  children, 
  matchSummary, 
  totals 
}) => {
  return (
    <div className={styles.summaryTable}>
      <h3 className={styles.summaryTitle}>Summer Plan Summary</h3>
      
      {/* Match summary metrics */}
      {matchSummary && (
        <div className={styles.matchSummaryMetrics}>
          <div className={styles.matchMetric}>
            <h4>Grade Match</h4>
            <div className={styles.matchProgressBar}>
              <div 
                className={styles.matchProgressFill}
                style={{ width: `${(matchSummary.grade_match / (weeks.length * children.length)) * 100}%` }}
              ></div>
            </div>
            <span>{matchSummary.grade_match} of {weeks.length * children.length} slots</span>
          </div>
          
          <div className={styles.matchMetric}>
            <h4>Price Match</h4>
            <div className={styles.matchProgressBar}>
              <div 
                className={styles.matchProgressFill}
                style={{ width: `${(matchSummary.price_match / (weeks.length * children.length)) * 100}%` }}
              ></div>
            </div>
            <span>{matchSummary.price_match} of {weeks.length * children.length} slots</span>
          </div>
          
          <div className={styles.matchMetric}>
            <h4>Activity Match</h4>
            <div className={styles.matchProgressBar}>
              <div 
                className={styles.matchProgressFill}
                style={{ width: `${(matchSummary.category_match / (weeks.length * children.length)) * 100}%` }}
              ></div>
            </div>
            <span>{matchSummary.category_match} of {weeks.length * children.length} slots</span>
          </div>
          
          <div className={styles.matchMetric}>
            <h4>Required Activities</h4>
            <div className={styles.matchProgressBar}>
              <div 
                className={styles.matchProgressFill}
                style={{ width: `${(matchSummary.required_activities_match / (weeks.length * children.length)) * 100}%` }}
              ></div>
            </div>
            <span>{matchSummary.required_activities_match} of {weeks.length * children.length} slots</span>
          </div>
        </div>
      )}
      
      <div className={styles.summaryContent}>
        <table className={styles.campsTable}>
          <thead>
            <tr>
              <th>Child</th>
              <th>Camp</th>
              <th>Week</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map(week => (
              week.camps.map(camp => {
                const child = children.find(c => c.id === camp.childId);
                
                if (!child) {
                  return (
                    <tr key={`missing-child-${camp.id}`}>
                      <td colSpan={6}>Child data missing for camp {camp.name}</td>
                    </tr>
                  );
                }
                
                return (
                  <tr key={`${week.id}-${camp.id}`}>
                    <td>
                      <div className={styles.childCell}>
                        <div 
                          className={styles.childColorDot} 
                          style={{ backgroundColor: child.color }}
                        ></div>
                        <span>{child.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.campCell}>
                        <strong>{camp.name}</strong>
                        <span>{camp.organization}</span>
                      </div>
                    </td>
                    <td>{week.name}</td>
                    <td>{camp.price}</td>
                    <td>
                      <span className={styles.statusPending}>Pending</span>
                    </td>
                    <td>
                      <button className={styles.registerButtonSmall}>Register</button>
                    </td>
                  </tr>
                );
              })
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className={styles.totalLabel}>
                Total Cost
              </td>
              <td colSpan={3} className={styles.totalValue}>
                ${totals.totalCost}
              </td>
            </tr>
            {children.map(child => (
              <tr key={`cost-${child.id}`}>
                <td colSpan={3} className={styles.totalLabel}>
                  <div className={styles.childCell}>
                    <div 
                      className={styles.childColorDot} 
                      style={{ backgroundColor: child.color }}
                    ></div>
                    <span>{child.name}'s Camps</span>
                  </div>
                </td>
                <td colSpan={3} className={styles.totalValue}>
                  ${totals.childCosts[child.id] || 0}
                </td>
              </tr>
            ))}
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default SummaryTable;