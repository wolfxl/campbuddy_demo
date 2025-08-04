"use client";
import React, { useState } from 'react';
import styles from './page.module.css';
import Banner from '@/components/Banner';

const FavoritesPage = () => {
  // Sample favorite camps data
  const [favoriteCamps, setFavoriteCamps] = useState([
    {
      id: 1,
      name: "Science Explorers",
      organization: "Discovery Education",
      dates: "July 17 - July 28, 2025",
      price: "$400 per week",
      times: "9:00 AM - 4:00 PM",
      ageRange: "8-13 years",
      location: "Science Center, Frisco",
      description: "Hands-on experiments, science projects, and STEM challenges.",
      category: "STEM",
      isFavorite: true
    },
    {
      id: 2,
      name: "Adventure Explorers",
      organization: "Outdoor Kids Academy",
      dates: "June 5 - June 16, 2025",
      price: "$350 per week",
      times: "9:00 AM - 3:00 PM",
      ageRange: "8-12 years",
      location: "Pine Ridge Park, Frisco",
      description: "A wilderness adventure camp focused on survival skills, nature exploration, and team building.",
      category: "Nature",
      isFavorite: true
    },
    {
      id: 3,
      name: "Creative Canvas",
      organization: "Young Artists Studio",
      dates: "July 10 - July 21, 2025",
      price: "$375 per week",
      times: "9:00 AM - 2:00 PM",
      ageRange: "7-12 years",
      location: "Arts District, Frisco",
      description: "Explore painting, drawing, sculpture, and mixed media arts.",
      category: "Arts",
      isFavorite: true
    }
  ]);
  
  // Sample saved plans data
  const [savedPlans, setSavedPlans] = useState([
    {
      id: 101,
      name: "Summer 2025 - Week 1-3",
      children: ["Emma", "Jacob"],
      dates: "June 3 - June 23, 2025",
      lastUpdated: "May 20, 2025",
      campCount: 6
    },
    {
      id: 102,
      name: "STEM Focus - July",
      children: ["Emma"],
      dates: "July 8 - July 28, 2025",
      lastUpdated: "May 15, 2025",
      campCount: 3
    }
  ]);
  
  // Remove camp from favorites
  const removeFromFavorites = (campId: number) => {
    setFavoriteCamps(prevCamps => prevCamps.filter(camp => camp.id !== campId));
  };
  
  // Delete saved plan
  const deleteSavedPlan = (planId: number) => {
    setSavedPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
  };
  
  return (
    <div className={styles.favoritesPage}>
      <Banner 
        title="My Favorites"
        description="View and manage your saved camps and summer plans."
      />
      
      <div className="container">
        <div className={styles.favoritesContent}>
          {/* Tabs Navigation */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
              <button className={`${styles.tabButton} ${styles.active}`}>
                Favorite Camps
              </button>
              <button className={styles.tabButton}>
                Saved Plans
              </button>
            </div>
          </div>
          
          {/* Favorite Camps Section */}
          <div className={styles.tabContent}>
            <div className={styles.favoriteCamps}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Favorite Camps</h2>
                <div className={styles.viewOptions}>
                  <button className={`${styles.viewButton} ${styles.active}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                      <rect x="4" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                      <rect x="13" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                      <rect x="13" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Grid
                  </button>
                  <button className={styles.viewButton}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    List
                  </button>
                </div>
              </div>
              
              {favoriteCamps.length > 0 ? (
                <div className={styles.campsGrid}>
                  {favoriteCamps.map(camp => (
                    <div key={camp.id} className={styles.campCard}>
                      <div className={styles.campImageContainer}>
                        <div className={styles.campImage}></div>
                        <button 
                          className={`${styles.favoriteButton} ${camp.isFavorite ? styles.favorited : ''}`}
                          onClick={() => removeFromFavorites(camp.id)}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <div className={styles.campCategory}>{camp.category}</div>
                      </div>
                      <div className={styles.campInfo}>
                        <h3 className={styles.campName}>{camp.name}</h3>
                        <p className={styles.campOrg}>{camp.organization}</p>
                        <div className={styles.campDetails}>
                          <div className={styles.campDetail}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {camp.dates}
                          </div>
                          <div className={styles.campDetail}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {camp.times}
                          </div>
                          <div className={styles.campDetail}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {camp.ageRange}
                          </div>
                          <div className={styles.campDetail}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {camp.location}
                          </div>
                          <div className={styles.campDetail}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {camp.price}
                          </div>
                        </div>
                        <p className={styles.campDescription}>{camp.description}</p>
                        <div className={styles.campActions}>
                          <button className={styles.campDetailsButton}>View Details</button>
                          <button className={styles.campRegisterButton}>Register</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className={styles.emptyTitle}>No Favorite Camps Yet</h3>
                  <p className={styles.emptyDescription}>
                    Browse camps and click the heart icon to add them to your favorites.
                  </p>
                  <a href="/camps" className={styles.emptyButton}>
                    Browse Camps
                  </a>
                </div>
              )}
            </div>
            
            {/* Saved Plans Section (Hidden by default) */}
            <div className={`${styles.savedPlans} ${styles.hidden}`}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Saved Summer Plans</h2>
              </div>
              
              {savedPlans.length > 0 ? (
                <div className={styles.plansGrid}>
                  {savedPlans.map(plan => (
                    <div key={plan.id} className={styles.planCard}>
                      <div className={styles.planHeader}>
                        <h3 className={styles.planTitle}>{plan.name}</h3>
                        <div className={styles.planActions}>
                          <button className={styles.planActionButton}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button 
                            className={styles.planActionButton}
                            onClick={() => deleteSavedPlan(plan.id)}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className={styles.planDetails}>
                        <div className={styles.planDetail}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>{plan.dates}</span>
                        </div>
                        <div className={styles.planDetail}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>Children: {plan.children.join(", ")}</span>
                        </div>
                        <div className={styles.planDetail}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>{plan.campCount} camps</span>
                        </div>
                        <div className={styles.planDetail}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>Last updated: {plan.lastUpdated}</span>
                        </div>
                      </div>
                      <div className={styles.planButtons}>
                        <button className={styles.viewPlanButton}>View Plan</button>
                        <button className={styles.editPlanButton}>Edit Plan</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className={styles.emptyTitle}>No Saved Plans Yet</h3>
                  <p className={styles.emptyDescription}>
                    Use our Smart Planner to create personalized summer schedules for your children.
                  </p>
                  <a href="/planner" className={styles.emptyButton}>
                    Try Smart Planner
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;