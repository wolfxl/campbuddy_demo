import CallToAction from '@/components/CallToAction';
import styles from './page.module.css';

export default function Product() {
  return (
    <div className={styles.productPage}>
      <section className={styles.productHero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Our Product</h1>
            <p className={styles.heroDescription}>
              Discover how WeDu can help your team collaborate more effectively, streamline workflows, and achieve better results.
            </p>
          </div>
        </div>
      </section>
      
      <section className={styles.productFeatures}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Key Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <h3>Project Management</h3>
              <p>Organize tasks, track progress, and hit your deadlines with powerful project management tools.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Team Collaboration</h3>
              <p>Work together seamlessly with real-time editing, commenting, and file sharing capabilities.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Workflow Automation</h3>
              <p>Automate repetitive tasks and focus on what matters with intelligent workflow tools.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Data Insights</h3>
              <p>Make informed decisions with comprehensive analytics and reporting features.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Integrations</h3>
              <p>Connect with your favorite tools and services for a seamless workflow experience.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Mobile Access</h3>
              <p>Stay productive on the go with our responsive mobile applications for iOS and Android.</p>
            </div>
          </div>
        </div>
      </section>
      
      <CallToAction />
    </div>
  );
}