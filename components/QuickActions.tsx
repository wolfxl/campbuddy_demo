import styles from './QuickActions.module.css';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (actionId: string) => void;
  disabled?: boolean;
}

export default function QuickActions({ actions, onActionClick, disabled = false }: QuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.actionsGrid}>
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.id)}
            disabled={disabled}
            className={styles.actionButton}
          >
            <span className={styles.actionIcon}>{action.icon}</span>
            <span className={styles.actionLabel}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}