"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './CampsList.module.css';

interface Camp {
  camp_id: number;
  camp_name: string;
  description: string;
  price: number;
  min_grade: number;
  max_grade: number;
  categories: string;
  organization_name: string;
}

const CampsList = () => {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      // Fetch camps for iCode Frisco (organization_id: 64)
      // First try the correct table structure
      let { data, error } = await supabase
        .from('camps')
        .select('*')
        .eq('organization_id', 64)
        .limit(20);
        
      // If that fails, try without join
      if (error) {
        console.log('Trying direct query...');
        const result = await supabase
          .from('camps')
          .select('camp_id, camp_name, description, price, min_grade, max_grade, categories')
          .eq('organization_id', 64)
          .limit(20);
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      // Transform the data to flatten the organization name
      const transformedData = data?.map(camp => ({
        ...camp,
        organization_name: camp.organizations?.organization_name || 'iCode Frisco'
      })) || [];

      setCamps(transformedData);
    } catch (err) {
      console.error('Error fetching camps:', err);
      setError('Failed to load camps');
      
      // Fallback to mock data for demo
      setCamps([
        {
          camp_id: 1,
          camp_name: "Animation Creation : Exploring Today's Digital Tools",
          description: "Inspired by Pixar, Walt Disney, and DreamWorks, this camp will explore the methods used in these animations studios and apply them to make our own animations!",
          price: 499,
          min_grade: 1,
          max_grade: 5,
          categories: "Digital Drawing & Illustration, Game Development with Unity, Theatre & Script Writing",
          organization_name: "iCode Frisco"
        },
        {
          camp_id: 2,
          camp_name: "Content Creator: Build Your Brand",
          description: "Step into the world of digital creativity and entrepreneurship! This engaging camp offers hands-on training in content creation, personal branding, and storytelling.",
          price: 499,
          min_grade: 4,
          max_grade: 7,
          categories: "Acting & Voice Performance, Content Creation & Influencers, Digital Drawing & Illustration",
          organization_name: "iCode Frisco"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading your camps...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <p className={styles.fallbackNote}>Showing demo data instead.</p>
      </div>
    );
  }

  return (
    <div className={styles.campsContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Camps</h1>
        <p className={styles.subtitle}>Manage and view your camp listings</p>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{camps.length}</span>
          <span className={styles.statLabel}>Total Camps</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>Active</span>
          <span className={styles.statLabel}>Status</span>
        </div>
      </div>

      <div className={styles.campsGrid}>
        {camps.map((camp) => (
          <div key={camp.camp_id} className={styles.campCard}>
            <div className={styles.campHeader}>
              <h3 className={styles.campName}>{camp.camp_name || 'Unnamed Camp'}</h3>
              <span className={styles.campPrice}>${camp.price || 0}</span>
            </div>
            
            <p className={styles.campDescription}>
              {camp.description && camp.description.length > 150 
                ? `${camp.description.substring(0, 150)}...` 
                : camp.description || 'No description available'}
            </p>
            
            <div className={styles.campMeta}>
              <span className={styles.gradeRange}>
                Grades {camp.min_grade || 'K'}-{camp.max_grade || '12'}
              </span>
            </div>
            
            <div className={styles.campCategories}>
              {camp.categories && camp.categories.split(', ').slice(0, 3).map((category, index) => (
                <span key={index} className={styles.categoryTag}>
                  {category}
                </span>
              ))}
            </div>
            
            <div className={styles.campActions}>
              <button className={styles.viewButton}>View Details</button>
              <button className={styles.editButton}>Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampsList;