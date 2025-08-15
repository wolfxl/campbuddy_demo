import Hero from '@/components/Hero';
import FeaturesSection from '@/components/FeaturesSection';
import YellowSection from '@/components/YellowSection';
import PinkSection from '@/components/PinkSection';
import CallToAction from '@/components/CallToAction';
import CampMap from '@/components/Map';
import styles from '../page.module.css';

export default function FullExperience() {
  return (
    <div className={styles.homePage}>
      <Hero />
      <CampMap />
      <YellowSection />
      <PinkSection />
      <FeaturesSection />
      <CallToAction />
    </div>
  );
}