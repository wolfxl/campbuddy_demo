import styles from './CampCard.module.css';

interface CampCardProps {
  name: string;
  location: string;
  price: string;
  ages: string;
  duration?: string;
  schedule?: string;
  benefits: string[];
  activities?: string[];
  isDetailed?: boolean;
}

export default function CampCard({
  name,
  location,
  price,
  ages,
  duration,
  schedule,
  benefits,
  activities,
  isDetailed = false
}: CampCardProps) {
  return (
    <div className={`${styles.campCard} ${isDetailed ? styles.detailed : ''}`}>
      <div className={styles.header}>
        <div className={styles.campIcon}>🏕️</div>
        <h3 className={styles.campName}>{name}</h3>
      </div>
      
      <div className={styles.basicInfo}>
        <div className={styles.infoRow}>
          <span className={styles.icon}>📍</span>
          <span className={styles.text}>{location}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.icon}>💰</span>
          <span className={styles.text}>{price}</span>
          <span className={styles.divider}>|</span>
          <span className={styles.icon}>👥</span>
          <span className={styles.text}>Ages {ages}</span>
        </div>
        {duration && (
          <div className={styles.infoRow}>
            <span className={styles.icon}>📅</span>
            <span className={styles.text}>{duration}</span>
          </div>
        )}
        {schedule && (
          <div className={styles.infoRow}>
            <span className={styles.icon}>⏰</span>
            <span className={styles.text}>{schedule}</span>
          </div>
        )}
      </div>

      {activities && activities.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <span className={styles.icon}>🎯</span>
            <span>What Your Child Will Do:</span>
          </div>
          <ul className={styles.list}>
            {activities.map((activity, index) => (
              <li key={index} className={styles.listItem}>{activity}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span className={styles.icon}>🌟</span>
          <span>{isDetailed ? 'Educational Benefits:' : 'Perfect for:'}</span>
        </div>
        <div className={styles.benefits}>
          {benefits.map((benefit, index) => (
            <span key={index} className={styles.benefitTag}>{benefit}</span>
          ))}
        </div>
      </div>


    </div>
  );
}
