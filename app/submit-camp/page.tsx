"use client";
import React, { useState, useRef, useEffect, ChangeEvent, FormEvent, DragEvent } from 'react';
import styles from './page.module.css';
import Banner from '@/components/Banner';

interface CampFormData {
  organizationName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  campName: string;
  campDescription: string;
  ageRangeMin: string;
  ageRangeMax: string;
  campCategory: string;
  campAddress: string;
  campCity: string;
  campState: string;
  campZip: string;
  campWebsite: string;
  startDate: string;
  endDate: string;
  scheduleType: 'full-day' | 'half-day-am' | 'half-day-pm' | 'flexible';
  startTime: string;
  endTime: string;
  hasExtendedCare: boolean;
  extendedCareDetails: string;
  costPerWeek: string;
  discounts: string;
  registrationUrl: string;
  additionalInfo: string;
  agreeToTerms: boolean;
}

type ActiveTab = 'manual' | 'upload';

const SubmitCampPage = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('manual');
  const [formData, setFormData] = useState<CampFormData>({
    organizationName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    campName: '',
    campDescription: '',
    ageRangeMin: '',
    ageRangeMax: '',
    campCategory: '',
    campAddress: '',
    campCity: '',
    campState: '',
    campZip: '',
    campWebsite: '',
    startDate: '',
    endDate: '',
    scheduleType: 'full-day',
    startTime: '',
    endTime: '',
    hasExtendedCare: false,
    extendedCareDetails: '',
    costPerWeek: '',
    discounts: '',
    registrationUrl: '',
    additionalInfo: '',
    agreeToTerms: false
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to Array for easier handling
      const filesArray = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...filesArray]);
    }
  };
  
  const handleRemoveFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };
  
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Add files to existing uploaded files
      const filesArray = Array.from(e.dataTransfer.files);
      const filteredFiles = filesArray.filter(file => {
        // Filter for allowed file types
        return file.type === "application/pdf" || 
               file.type.startsWith("image/jpeg") || 
               file.type === "image/png";
      });
      
      if (filteredFiles.length > 0) {
        setUploadedFiles([...uploadedFiles, ...filteredFiles]);
      }
      
      // If any files were filtered out, show a notification
      if (filteredFiles.length < filesArray.length) {
        alert("Some files were not included because they're not in PDF, JPEG, or PNG format.");
      }
    }
  };
  
  
  const saveCampData = async (campData: any, source: string = 'manual') => {
    setIsSaving(true);
    setSaveSuccess(null);
    setApiError(null);
    
    try {
      const response = await fetch('/api/save-camp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campData,
          source,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save camp data: ${response.status}`);
      }
      
      const result = await response.json();
      setSaveSuccess('Camp data saved successfully to database!');
      return result;
    } catch (error) {
      console.error('Error saving camp data:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to save camp data');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (activeTab === 'manual') {
      console.log('Manual Form submitted:', formData);
      
      try {
        await saveCampData(formData, 'manual');
        alert('Camp (manual entry) submitted successfully! Our team will review and get back to you soon.');
      } catch (error) {
        alert('There was an error saving your camp data. Please try again.');
      }
    } else if (activeTab === 'upload') {
      if (uploadedFiles.length > 0) {
        // Reset previous response/error
        setApiResponse(null);
        setApiError(null);
        setIsUploading(true);
        
        try {
          // Create FormData object
          const formData = new FormData();
          
          // Add all files to the FormData object
          uploadedFiles.forEach(file => {
            formData.append('files', file);
          });
          
          // Send the request to the API endpoint through our proxy
          const response = await fetch('/api/extract-camp-info', {
            method: 'POST',
            body: formData,
            // Don't include Content-Type header, browser will set it with boundary for FormData
          });
          
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }
          
          // Parse the JSON response
          const data = await response.json();
          console.log('API Response:', data);
          
          // Store the response in state to display it
          setApiResponse(data);
          
          // If we have extracted data, save it to the database
          if (data.data && data.data.length > 0) {
            try {
              await saveCampData(data, 'upload');
            } catch (error) {
              console.error('Error saving extracted camp data:', error);
              // Don't throw here as we still want to show the extracted data
            }
          }
        } catch (error) {
          console.error('Error uploading files:', error);
          setApiError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
          setIsUploading(false);
        }
      } else {
        alert('Please select files to upload.');
      }
    }
  };
  
  return (
    <div className={styles.submitPage}>
      <Banner 
        title="Submit a Camp"
        description="Are you a camp provider? Submit your camp details to be featured on our platform and reach thousands of families."
      />
      
      <div className="container">
        <div className={styles.tabNavigation}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'manual' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            Manual Entry
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'upload' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload Document (PDF/JPEG)
          </button>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.formInfo}>
            <h2 className={styles.formInfoTitle}>Why Submit Your Camp?</h2>
            <ul className={styles.benefitsList}>
              <li className={styles.benefitItem}>
                <div className={styles.benefitIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.benefitContent}>
                  <h3 className={styles.benefitTitle}>Reach More Families</h3>
                  <p className={styles.benefitDescription}>
                    Get your camp in front of thousands of families actively looking for summer activities.
                  </p>
                </div>
              </li>
              <li className={styles.benefitItem}>
                <div className={styles.benefitIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.benefitContent}>
                  <h3 className={styles.benefitTitle}>Simplified Registration</h3>
                  <p className={styles.benefitDescription}>
                    Families can register directly through our platform, streamlining your enrollment process.
                  </p>
                </div>
              </li>
              <li className={styles.benefitItem}>
                <div className={styles.benefitIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.benefitContent}>
                  <h3 className={styles.benefitTitle}>Enhanced Visibility</h3>
                  <p className={styles.benefitDescription}>
                    Get featured in our Smart Planner recommendations based on children's interests and needs.
                  </p>
                </div>
              </li>
              <li className={styles.benefitItem}>
                <div className={styles.benefitIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 7H7V17H9V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 7H15V13H17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 7H11V10H13V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 14H11V17H13V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.benefitContent}>
                  <h3 className={styles.benefitTitle}>Detailed Analytics</h3>
                  <p className={styles.benefitDescription}>
                    Access insights about views, interest, and registration trends for your camp listings.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          
          {activeTab === 'manual' && (
            <form className={styles.submitForm} onSubmit={handleSubmit}>
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Provider Information</h2>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Organization Name *</label>
                  <input 
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  />
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Contact Name *</label>
                    <input 
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Contact Email *</label>
                    <input 
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Contact Phone *</label>
                  <input 
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Camp Details</h2>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Camp Name *</label>
                  <input 
                    type="text"
                    name="campName"
                    value={formData.campName}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Camp Description *</label>
                  <textarea 
                    name="campDescription"
                    value={formData.campDescription}
                    onChange={handleInputChange}
                    className={styles.formTextarea}
                    rows={4}
                    required
                  ></textarea>
                  <p className={styles.formHelp}>
                    Provide a detailed description of your camp, including activities, curriculum, and what makes it special.
                  </p>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Age Range *</label>
                    <div className={styles.ageRangeInputs}>
                      <input 
                        type="number"
                        name="ageRangeMin"
                        value={formData.ageRangeMin}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        placeholder="Min"
                        min="3"
                        max="18"
                        required
                      />
                      <span className={styles.rangeSeparator}>to</span>
                      <input 
                        type="number"
                        name="ageRangeMax"
                        value={formData.ageRangeMax}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        placeholder="Max"
                        min="3"
                        max="18"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Camp Category *</label>
                    <select 
                      name="campCategory"
                      value={formData.campCategory}
                      onChange={handleInputChange}
                      className={styles.formSelect}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="academic">Academic & STEM</option>
                      <option value="arts">Arts & Crafts</option>
                      <option value="sports">Sports & Fitness</option>
                      <option value="nature">Nature & Outdoors</option>
                      <option value="technology">Technology & Coding</option>
                      <option value="music">Music & Performing Arts</option>
                      <option value="specialty">Specialty Camps (e.g., Cooking, Chess)</option>
                      <option value="general">General Day Camp</option>
                    </select>
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Camp Address *</label>
                  <input 
                    type="text"
                    name="campAddress"
                    value={formData.campAddress}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="Street Address"
                    required
                  />
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>City *</label>
                    <input 
                      type="text"
                      name="campCity"
                      value={formData.campCity}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>State *</label>
                    <input 
                      type="text"
                      name="campState"
                      value={formData.campState}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>ZIP Code *</label>
                    <input 
                      type="text"
                      name="campZip"
                      value={formData.campZip}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Camp Website</label>
                  <input 
                    type="url"
                    name="campWebsite"
                    value={formData.campWebsite}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="https://yourcamp.com"
                  />
                </div>
              </div>
              
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Schedule & Logistics</h2>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Start Date *</label>
                    <input 
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>End Date *</label>
                    <input 
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Schedule Type *</label>
                  <select 
                    name="scheduleType"
                    value={formData.scheduleType}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                    required
                  >
                    <option value="full-day">Full Day (e.g., 9AM-4PM)</option>
                    <option value="half-day-am">Half Day - Morning (e.g., 9AM-12PM)</option>
                    <option value="half-day-pm">Half Day - Afternoon (e.g., 1PM-4PM)</option>
                    <option value="flexible">Flexible/Custom Hours</option>
                  </select>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Start Time *</label>
                    <input 
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>End Time *</label>
                    <input 
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox"
                      name="hasExtendedCare"
                      checked={formData.hasExtendedCare}
                      onChange={handleInputChange}
                    />
                    <span>We offer extended care (before/after camp hours)</span>
                  </label>
                </div>
                
                {formData.hasExtendedCare && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Extended Care Details</label>
                    <input 
                      type="text"
                      name="extendedCareDetails"
                      value={formData.extendedCareDetails}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      placeholder="e.g., 8AM-9AM and 4PM-6PM, $10/hour"
                    />
                  </div>
                )}
              </div>
              
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Pricing & Registration</h2>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Cost Per Week (USD) *</label>
                  <input 
                    type="number"
                    name="costPerWeek"
                    value={formData.costPerWeek}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="e.g., 350"
                    min="0"
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Discounts or Special Offers</label>
                  <textarea 
                    name="discounts"
                    value={formData.discounts}
                    onChange={handleInputChange}
                    className={styles.formTextarea}
                    rows={3}
                    placeholder="e.g., Early bird discount: 10% off if registered by May 1st. Sibling discount: 5% off for additional children."
                  ></textarea>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Registration Link *</label>
                  <input 
                    type="url"
                    name="registrationUrl"
                    value={formData.registrationUrl}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="https://yourcamp.com/register"
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Additional Information</h2>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Anything else to share?</label>
                  <textarea 
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    className={styles.formTextarea}
                    rows={3}
                    placeholder="e.g., What to bring, lunch policy, specific safety measures."
                  ></textarea>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    required
                  />
                  <span>I agree to the <a href="/terms-provider" target="_blank" className={styles.termsLink}>Provider Terms and Conditions</a> and confirm that all information submitted is accurate.</span>
                </label>
              </div>
              
              <button type="submit" className={styles.submitButton} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Submit Camp Information'}
              </button>
              
              {isSaving && (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                  <p className={styles.loadingText}>Saving camp information to database...</p>
                </div>
              )}
              
              {saveSuccess && (
                <div className={styles.successContainer}>
                  <p className={styles.successMessage}>{saveSuccess}</p>
                </div>
              )}
              
              {apiError && (
                <div className={styles.errorContainer}>
                  <p className={styles.errorMessage}>{apiError}</p>
                </div>
              )}
            </form>
          )}

          {activeTab === 'upload' && (
            <div className={styles.uploadSection}>
              <h2 className={styles.sectionTitle}>Upload Camp Documents</h2>
              <p className={styles.formHelp}>
                Upload PDF, JPEG, or PNG files containing your camp information. Our AI will attempt to extract the details.
                Please ensure the documents are clear and contain all necessary information (camp name, description, dates, pricing, etc.).
              </p>
              <form onSubmit={handleSubmit}>
                <div 
                  className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className={styles.dropZoneContent}>
                    <svg className={styles.uploadIcon} width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L2.621 19.485C2.72915 19.9177 2.97882 20.3018 3.33033 20.5763C3.68184 20.8508 4.11501 20.9999 4.561 21H19.439C19.885 20.9999 20.3182 20.8508 20.6697 20.5763C21.0212 20.3018 21.2708 19.9177 21.379 19.485L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3 className={styles.dropZoneTitle}>Drag & Drop Files Here</h3>
                    <p className={styles.dropZoneText}>or click to browse your files</p>
                    <p className={styles.dropZoneSupported}>Supported formats: PDF, JPEG, PNG</p>
                  </div>
                  <input 
                    type="file"
                    id="campDocument"
                    name="campDocument"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                    multiple
                    ref={fileInputRef}
                  />
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className={styles.fileList}>
                    <p className={styles.fileListTitle}>Selected files ({uploadedFiles.length}):</p>
                    <ul className={styles.fileNames}>
                      {uploadedFiles.map((file, index) => (
                        <li key={index} className={styles.fileName}>
                          <span className={styles.fileNameText}>{file.name}</span>
                          <button 
                            type="button" 
                            className={styles.removeFileBtn}
                            onClick={() => handleRemoveFile(index)}
                            aria-label="Remove file"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <button type="submit" className={styles.submitButton} disabled={uploadedFiles.length === 0 || isUploading || isSaving}>
                  {isUploading ? 'Processing...' : isSaving ? 'Saving...' : 'Upload and Extract Information'}
                </button>
                
                {saveSuccess && (
                  <div className={styles.successContainer}>
                    <p className={styles.successMessage}>{saveSuccess}</p>
                  </div>
                )}

                {isUploading && (
                  <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>Uploading and extracting camp information...</p>
                  </div>
                )}

                {apiError && (
                  <div className={styles.errorContainer}>
                    <h3 className={styles.errorTitle}>Error</h3>
                    <p className={styles.errorMessage}>{apiError}</p>
                  </div>
                )}

                {apiResponse && (
                  <div className={styles.responseContainer}>
                    <h3 className={styles.responseTitle}>Extracted Camp Information</h3>
                    
                    {apiResponse.data && apiResponse.data.length > 0 ? (
                      <div className={styles.extractedData}>
                        {apiResponse.data.map((offering: any, index: number) => (
                          <div key={index} className={styles.campOffering}>
                            <h4 className={styles.offeringTitle}>Camp Offering #{index + 1}</h4>
                            
                            {offering.camp_info && (
                              <div className={styles.infoSection}>
                                <h5 className={styles.sectionSubtitle}>Camp Information</h5>
                                <div className={styles.infoGrid}>
                                  {offering.camp_info.name && (
                                    <div className={styles.infoItem}>
                                      <span className={styles.infoLabel}>Name:</span>
                                      <span className={styles.infoValue}>{offering.camp_info.name}</span>
                                    </div>
                                  )}
                                  {offering.camp_info.description && (
                                    <div className={styles.infoItem}>
                                      <span className={styles.infoLabel}>Description:</span>
                                      <span className={styles.infoValue}>{offering.camp_info.description}</span>
                                    </div>
                                  )}
                                  {offering.camp_info.category && (
                                    <div className={styles.infoItem}>
                                      <span className={styles.infoLabel}>Category:</span>
                                      <span className={styles.infoValue}>{offering.camp_info.category}</span>
                                    </div>
                                  )}
                                  {offering.camp_info.age_range && (
                                    <div className={styles.infoItem}>
                                      <span className={styles.infoLabel}>Age Range:</span>
                                      <span className={styles.infoValue}>{offering.camp_info.age_range}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {offering.organization_info && (
                              <div className={styles.infoSection}>
                                <h5 className={styles.sectionSubtitle}>Organization Information</h5>
                                <div className={styles.infoGrid}>
                                  {offering.organization_info.name && (
                                    <div className={styles.infoItem}>
                                      <span className={styles.infoLabel}>Name:</span>
                                      <span className={styles.infoValue}>{offering.organization_info.name}</span>
                                    </div>
                                  )}
                                  {offering.organization_info.contact_email && (
                                    <div className={styles.infoItem}>
                                      <span className={styles.infoLabel}>Email:</span>
                                      <span className={styles.infoValue}>{offering.organization_info.contact_email}</span>
                                    </div>
                                  )}
                                  {offering.organization_info.contact_phone && (
                                    <div className={styles.infoItem}>
                                      <span className={styles.infoLabel}>Phone:</span>
                                      <span className={styles.infoValue}>{offering.organization_info.contact_phone}</span>
                                    </div>
                                  )}
                                  {offering.organization_info.website && (
                                    <div className={styles.infoItem}>
                                      <span className={styles.infoLabel}>Website:</span>
                                      <span className={styles.infoValue}>{offering.organization_info.website}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {offering.location && (
                              <div className={styles.infoSection}>
                                <h5 className={styles.sectionSubtitle}>Location</h5>
                                <div className={styles.infoGrid}>
                                  {offering.location.address && (
                                    <div className={styles.infoItem}>
                                      <span className={styles.infoLabel}>Address:</span>
                                      <span className={styles.infoValue}>{offering.location.address}</span>
                                    </div>
                                  )}
                                  {offering.location.city && (
                                    <div className={styles.infoItem}>
                                      <span className={styles.infoLabel}>City:</span>
                                      <span className={styles.infoValue}>{offering.location.city}</span>
                                    </div>
                                  )}
                                  {offering.location.state && (
                                    <div className={styles.infoItem}>
                                      <span className={styles.infoLabel}>State:</span>
                                      <span className={styles.infoValue}>{offering.location.state}</span>
                                    </div>
                                  )}
                                  {offering.location.zip && (
                                    <div className={styles.infoItem}>
                                      <span className={styles.infoLabel}>ZIP:</span>
                                      <span className={styles.infoValue}>{offering.location.zip}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {offering.sessions && offering.sessions.length > 0 && (
                              <div className={styles.infoSection}>
                                <h5 className={styles.sectionSubtitle}>Sessions ({offering.sessions.length})</h5>
                                <div className={styles.sessionsList}>
                                  {offering.sessions.map((session: any, sessionIndex: number) => (
                                    <div key={sessionIndex} className={styles.sessionItem}>
                                      <h6 className={styles.sessionTitle}>Session #{sessionIndex + 1}</h6>
                                      <div className={styles.infoGrid}>
                                        {session.dates && (
                                          <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Dates:</span>
                                            <span className={styles.infoValue}>{session.dates}</span>
                                          </div>
                                        )}
                                        {session.times && (
                                          <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Times:</span>
                                            <span className={styles.infoValue}>{session.times}</span>
                                          </div>
                                        )}
                                        {session.price && (
                                          <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Price:</span>
                                            <span className={styles.infoValue}>{session.price}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className={styles.offeringActions}>
                              <button 
                                type="button" 
                                className={styles.useDataButton}
                                onClick={async () => {
                                  if (offering.camp_info) {
                                    try {
                                      // Save the individual camp offering to the database
                                      await saveCampData(offering, 'upload_individual');
                                      alert('Camp data saved successfully! You can also switch to manual entry to edit any details.');
                                    } catch (error) {
                                      alert('Error saving camp data. Please try again.');
                                    }
                                  }
                                }}
                                disabled={isSaving}
                              >
                                {isSaving ? 'Saving...' : 'Save This Camp'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.noDataMessage}>
                        No camp information could be extracted from the uploaded files. Please try uploading clearer images or use the manual entry form.
                      </p>
                    )}
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitCampPage;