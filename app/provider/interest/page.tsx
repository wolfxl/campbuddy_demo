"use client";
import React from 'react';
import styles from './page.module.css';

const InterestPage = () => {
  const interestData = [
    {
      id: 1,
      name: "Sarah Martinez",
      email: "sarah.m@email.com",
      camp: "Animation Creation : Exploring Today's Digital Tools",
      timestamp: "2 hours ago",
      status: "new"
    },
    {
      id: 2,
      name: "John Davis",
      email: "john.davis@email.com",
      camp: "Content Creator: Build Your Brand",
      timestamp: "5 hours ago",
      status: "viewed"
    },
    {
      id: 3,
      name: "Lisa Kim",
      email: "lisa.kim@email.com",
      camp: "Creative Lab : 3D Printing & Design",
      timestamp: "1 day ago",
      status: "contacted"
    },
    {
      id: 4,
      name: "Michael Johnson",
      email: "m.johnson@email.com",
      camp: "Artist's Studio : 2D & 3D Digital Design",
      timestamp: "2 days ago",
      status: "viewed"
    },
    {
      id: 5,
      name: "Emma Wilson",
      email: "emma.w@email.com",
      camp: "Animation Creation : Exploring Today's Digital Tools",
      timestamp: "3 days ago",
      status: "contacted"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#ef4444';
      case 'viewed': return '#f59e0b';
      case 'contacted': return '#059669';
      default: return '#6b7280';
    }
  };

  return (
    <div className={styles.interestContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Interest & Inquiries</h1>
        <p className={styles.subtitle}>Track families who have shown interest in your camps</p>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>89</span>
          <span className={styles.statLabel}>Total Interest</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>12</span>
          <span className={styles.statLabel}>This Week</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>3</span>
          <span className={styles.statLabel}>New Today</span>
        </div>
      </div>

      <div className={styles.interestList}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>Recent Interest</h3>
        </div>
        
        {interestData.map((item) => (
          <div key={item.id} className={styles.interestItem}>
            <div className={styles.itemLeft}>
              <div className={styles.avatar}>
                {item.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className={styles.itemInfo}>
                <h4 className={styles.itemName}>{item.name}</h4>
                <p className={styles.itemEmail}>{item.email}</p>
              </div>
            </div>
            
            <div className={styles.itemCenter}>
              <p className={styles.itemCamp}>{item.camp}</p>
              <p className={styles.itemTime}>{item.timestamp}</p>
            </div>
            
            <div className={styles.itemRight}>
              <span 
                className={styles.statusBadge}
                style={{ backgroundColor: getStatusColor(item.status) }}
              >
                {item.status}
              </span>
              <button className={styles.contactButton}>
                Contact
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterestPage;