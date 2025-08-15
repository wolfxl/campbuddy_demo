"use client";
import React, { useState } from 'react';
import styles from './page.module.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setTimeout(() => {
      setFormStatus({
        submitted: true,
        error: false,
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    }, 1000);
  };
  
  return (
    <div className={styles.contactPage}>
      <section className={styles.contactHero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Contact Us</h1>
            <p className={styles.heroDescription}>
              Have questions or need help? Our team is here to assist you.
            </p>
          </div>
        </div>
      </section>
      
      <section className={styles.contactContent}>
        <div className={`container ${styles.contactContainer}`}>
          <div className={styles.contactInfo}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Contact Information</h3>
              <div className={styles.infoItem}>
                <svg className={styles.infoIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 22C16.9706 22 21 17.9706 21 13C21 8.02944 16.9706 4 12 4C7.02944 4 3 8.02944 3 13C3 17.9706 7.02944 22 12 22Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 22V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M20 13H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 6V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4 13H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div>
                  <h4>Location</h4>
                  <p>123 Tech Street, San Francisco, CA 94107</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <svg className={styles.infoIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <h4>Hours</h4>
                  <p>Monday - Friday: 9am - 5pm<br />Saturday & Sunday: Closed</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <svg className={styles.infoIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 6L12 14L21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <h4>Email</h4>
                  <p>info@wedu.com<br />support@wedu.com</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <svg className={styles.infoIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92V19.92C22 20.4704 21.7893 20.9996 21.4142 21.3746C21.0391 21.7497 20.5099 21.9604 19.9595 21.96C16.4289 21.5923 13.0523 20.2843 10.1818 18.18C7.54427 16.2721 5.40985 13.8392 4.03051 11.02C2.9797 8.19353 1.85856 4.75193 2.04051 1.05C2.04147 0.500456 2.25217 -0.0278108 2.62719 -0.402221C3.00222 -0.776632 3.5314 -0.987126 4.08102 -0.986328H7.08051C8.02579 -0.996111 8.82659 0.397767 9.04051 1.32C9.20351 2.22 9.4474 3.10 9.7704 3.94C10.1052 4.8818 9.9251 5.94607 9.20051 6.68L7.79051 8.09C9.06029 10.8569 11.1431 13.2397 13.9101 14.51L15.3201 13.1C16.0539 12.3757 17.1182 12.1959 18.0601 12.53C18.9 12.853 19.78 13.0969 20.6801 13.26C21.6239 13.478 22.0161 14.3147 22.0001 15.26L22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <h4>Phone</h4>
                  <p>+1 (555) 123-4567<br />+1 (555) 987-6543</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.contactForm}>
            <h3 className={styles.formTitle}>Send Us a Message</h3>
            {formStatus.submitted ? (
              <div className={styles.formSuccess}>
                <div className={styles.successIcon}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
                    <path d="M14 24L20 30L34 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4>Thank you for contacting us!</h4>
                <p>We have received your message and will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Your Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject</label>
                  <select 
                    id="subject" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="sales">Sales</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="message">Message</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows={5} 
                    value={formData.message} 
                    onChange={handleChange} 
                    required
                  ></textarea>
                </div>
                <button type="submit" className={styles.submitButton}>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
      
      <section className={styles.mapSection}>
        <div className={styles.mapPlaceholder}>
          <div className={styles.mapOverlay}>
            <p>Map placeholder - Interactive map would be implemented here</p>
          </div>
        </div>
      </section>
    </div>
  );
}