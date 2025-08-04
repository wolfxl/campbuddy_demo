import React from 'react';
import { PlanState, CostTotals } from '@/lib/types/planner';
import { formatCurrency } from '@/lib/utils/plannerUtils';
import styles from '../results.module.css';

interface SummaryTableProps {
  plan: PlanState;
  totals: CostTotals;
  onRegister?: (campId: string | number) => void;
}

export const SummaryTable: React.FC<SummaryTableProps> = ({
  plan,
  totals,
  onRegister
}) => {
  return (
    <div className={styles.summaryTable}>
      <h3 className={styles.summaryTitle}>Summer Plan Summary</h3>
      
      {/* Match summary metrics */}
      {plan.matchSummary && (
        <div className={styles.matchSummaryMetrics}>
          <div className={styles.matchMetric}>
            <h4>Grade Match</h4>
            <div className={styles.matchProgressBar}>
              <div 
                className={styles.matchProgressFill}
                style={{ width: `${(plan.matchSummary.grade_match / (plan.weeks.length * plan.children.length)) * 100}%` }}
              ></div>
            </div>
            <span>{plan.matchSummary.grade_match} of {plan.weeks.length * plan.children.length} slots</span>
          </div>
          
          <div className={styles.matchMetric}>
            <h4>Price Match</h4>
            <div className={styles.matchProgressBar}>
              <div 
                className={styles.matchProgressFill}
                style={{ width: `${(plan.matchSummary.price_match / (plan.weeks.length * plan.children.length)) * 100}%` }}
              ></div>
            </div>
            <span>{plan.matchSummary.price_match} of {plan.weeks.length * plan.children.length} slots</span>
          </div>
          
          <div className={styles.matchMetric}>
            <h4>Activity Match</h4>
            <div className={styles.matchProgressBar}>
              <div 
                className={styles.matchProgressFill}
                style={{ width: `${(plan.matchSummary.category_match / (plan.weeks.length * plan.children.length)) * 100}%` }}
              ></div>
            </div>
            <span>{plan.matchSummary.category_match} of {plan.weeks.length * plan.children.length} slots</span>
          </div>
          
          <div className={styles.matchMetric}>
            <h4>Required Activities</h4>
            <div className={styles.matchProgressBar}>
              <div 
                className={styles.matchProgressFill}
                style={{ width: `${(plan.matchSummary.required_activities_match / (plan.weeks.length * plan.children.length)) * 100}%` }}
              ></div>
            </div>
            <span>{plan.matchSummary.required_activities_match} of {plan.weeks.length * plan.children.length} slots</span>
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
            {plan.weeks.map(week => (
              week.camps.map(camp => {
                const child = plan.children.find(c => c.id === camp.childId);
                
                if (!child) {
                  return (
                    <tr key={`missing-child-${camp.id}`}>
                      <td colSpan={6}>Child data missing for camp {camp.name}</td>
                    </tr>
                  );
                }
                
                return (
                  <tr key={camp.id}>
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
                      <button 
                        className={styles.registerButtonSmall}
                        onClick={() => onRegister?.(camp.id)}
                      >
                        Register
                      </button>
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
                {formatCurrency(totals.totalCost)}
              </td>
            </tr>
            {plan.children.map(child => (
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
                  {formatCurrency(totals.childCosts[child.id] || 0)}
                </td>
              </tr>
            ))}
          </tfoot>
        </table>
      </div>
    </div>
  );
};