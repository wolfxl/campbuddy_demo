import Link from 'next/link';
import styles from './ChatHeader.module.css';

interface ChatHeaderProps {
  showBackButton?: boolean;
}

export default function ChatHeader({ showBackButton = true }: ChatHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        {showBackButton && (
          <Link href="/" className={styles.backButton}>
            <span className={styles.backIcon}>←</span>
          </Link>
        )}
        
        <div className={styles.statusSection}>
          <div className={styles.statusIndicator}>
            <span className={styles.statusDot}></span>
            <span className={styles.statusText}>Assistant Online</span>
          </div>
        </div>
        
        <Link href="/full" className={styles.fullViewButton}>
          <span className={styles.fullViewIcon}>🗺️</span>
        </Link>
      </div>
    </div>
  );
}