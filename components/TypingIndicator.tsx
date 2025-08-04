import styles from './TypingIndicator.module.css';

export default function TypingIndicator() {
  return (
    <div className={styles.typingContainer}>
      <div className={styles.typingBubble}>
        <div className={styles.typingDots}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}