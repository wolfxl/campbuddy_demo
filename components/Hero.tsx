"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedButton from './AnimatedButton';
import AnimatedSection from './AnimatedSection';
import ParticleBackground from './ParticleBackground';
import styles from './Hero.module.css';

const Hero = () => {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    location: '',
    age: '',
    interests: '',
    date: ''
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (data.data && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    // Build query string from form values
    const queryParams = new URLSearchParams();
    
    if (searchParams.location) queryParams.append('location', searchParams.location);
    if (searchParams.age) queryParams.append('age', searchParams.age);
    if (searchParams.interests) queryParams.append('interests', searchParams.interests);
    if (searchParams.date) queryParams.append('date', searchParams.date);
    
    // Scroll to map section
    const mapSection = document.querySelector('#camp-map-section');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Update URL with search params (optional)
    const queryString = queryParams.toString();
    if (queryString) {
      router.push(`/?${queryString}#camp-map-section`);
    }
    
    // Dispatch custom event for the map to listen to
    const searchEvent = new CustomEvent('campSearch', {
      detail: searchParams
    });
    window.dispatchEvent(searchEvent);
    
    // Reset form submitting state after a short delay
    setTimeout(() => {
      setFormSubmitting(false);
    }, 1000);
  };

  return (
    <section className={styles.hero}>
      <ParticleBackground 
        particleCount={70} 
        color="#FFBF00" 
        opacity={0.3} 
        speed={0.3} 
      />
      <div className={`container ${styles.heroContainer}`}>
        <div className={styles.heroContent}>
          <AnimatedSection direction="up">
            <h1 className={styles.heroTitle}>
              Plan Your Child's<br />
              Perfect Summer
            </h1>
          </AnimatedSection>
          
          <AnimatedSection direction="up" delay={0.1}>
            <p className={styles.heroDescription}>
              Search camps, build weekly schedules, and relax — we've got you.
            </p>
          </AnimatedSection>
          
          <AnimatedSection direction="up" delay={0.2}>
            <div className={styles.heroCta}>
              <AnimatedButton href="/planner" variant="primary" size="large" withShine={true}>
                Start Smart Planner
              </AnimatedButton>
              <AnimatedButton href="/camps" variant="secondary" size="large">
                Browse All Camps
              </AnimatedButton>
            </div>
          </AnimatedSection>
          
          <AnimatedSection direction="up" delay={0.3}>
            <div className={styles.quickSearchBox}>
              <h3 className={styles.quickSearchTitle}>Find the Perfect Camp</h3>
              <form onSubmit={handleSearchSubmit} className={styles.quickSearchForm}>
                <div className={styles.quickSearchField}>
                  <label htmlFor="location">Zipcode</label>
                  <input 
                    type="text" 
                    id="location"
                    name="location"
                    placeholder="Enter ZIP Code" 
                    value={searchParams.location}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.quickSearchField}>
                  <label htmlFor="age">Age</label>
                  <select 
                    id="age"
                    name="age"
                    value={searchParams.age}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Age</option>
                    <option value="5-7">5-7 years</option>
                    <option value="8-10">8-10 years</option>
                    <option value="11-13">11-13 years</option>
                    <option value="14-16">14-16 years</option>
                  </select>
                </div>
                <div className={styles.quickSearchField}>
                  <label htmlFor="interests">Interests</label>
                  <select 
                    id="interests"
                    name="interests"
                    value={searchParams.interests}
                    onChange={handleInputChange}
                    disabled={loading || categories.length === 0}
                  >
                    <option value="">Select Interest</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                    {loading && <option value="" disabled>Loading categories...</option>}
                  </select>
                </div>
                <div className={styles.quickSearchField}>
                  <label htmlFor="date">Dates</label>
                  <input 
                    type="date" 
                    id="date"
                    name="date"
                    value={searchParams.date}
                    onChange={handleInputChange}
                  />
                </div>
                <button 
                  type="submit" 
                  className={styles.quickSearchButton}
                  disabled={formSubmitting || loading}
                >
                  {formSubmitting ? 'Searching...' : 'Find Camps'}
                </button>
              </form>
            </div>
          </AnimatedSection>
        </div>
        <div className={styles.heroImage}>
          <AnimatedSection direction="right" delay={0.2}>
            <div className={styles.imageWrapper}>
              <div className={styles.floatingContainer}>
                <img 
                  src="/images/camp1.jpg" 
                  alt="Summer camp illustration" 
                  width={1800} 
                  height={1500}
                  className={styles.largeImage}
                />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
      
      <div className={styles.heroShapes}>
        <div className={`${styles.shape} ${styles.shape2}`}></div>
      </div>
    </section>
  );
};

export default Hero;