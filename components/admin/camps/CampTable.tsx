"use client";
import React, { useState, useEffect } from 'react';
import styles from './CampTable.module.css';

interface Camp {
  id: string;
  name: string;
  organization: string;
  status: string;
  location: string;
  sessions: number;
  priceRange: string;
  lastUpdated: string;
  type: 'published' | 'pending';
  originalId: number;
  rawData: any;
}

interface CampTableProps {
  viewMode: 'table' | 'grid';
  selectedCamps: string[];
  onSelectionChange: (selected: string[]) => void;
}

const CampTable: React.FC<CampTableProps> = ({ viewMode, selectedCamps, onSelectionChange }) => {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCampDetails, setShowCampDetails] = useState<any>(null);
  const [selectedCampForDetails, setSelectedCampForDetails] = useState<string | null>(null);

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/camps');
      const result = await response.json();
      
      if (result.success) {
        setCamps(result.data);
      } else {
        setError('Failed to fetch camps');
      }
    } catch (error) {
      console.error('Error fetching camps:', error);
      setError('Failed to fetch camps');
    } finally {
      setLoading(false);
    }
  };

  const handleCampAction = async (action: string, campIds: string[]) => {
    try {
      setActionLoading(action);
      const response = await fetch('/api/admin/camps/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, campIds }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchCamps();
        onSelectionChange([]);
        alert(`${action} completed successfully`);
      } else {
        alert(`Failed to ${action}: ${result.error}`);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert(`Error performing ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = async (campId: string) => {
    try {
      const response = await fetch('/api/admin/camps/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'view_details', campIds: [campId] }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowCampDetails(result.data);
        setSelectedCampForDetails(campId);
      }
    } catch (error) {
      console.error('Error fetching camp details:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedCamps.length === camps.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(camps.map(camp => camp.id));
    }
  };

  const handleSelectCamp = (campId: string) => {
    if (selectedCamps.includes(campId)) {
      onSelectionChange(selectedCamps.filter(id => id !== campId));
    } else {
      onSelectionChange([...selectedCamps, campId]);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      Published: styles.statusPublished,
      Pending: styles.statusPending,
      Draft: styles.statusDraft,
      Archived: styles.statusArchived
    };
    
    return (
      <span className={`${styles.statusBadge} ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status}
      </span>
    );
  };

  const CampDetailsModal = ({ details, onClose, campId, onDetailsUpdate }: { 
    details: any; 
    onClose: () => void; 
    campId?: string;
    onDetailsUpdate?: (newDetails: any) => void;
  }) => {
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    
    useEffect(() => {
      if (details) {
        const parsed = parseDetails(details);
        setEditData(parsed);
      }
    }, [details]);

    // Handle text selection tracking
    const handleMouseDown = () => {
      setIsSelecting(true);
    };

    const handleMouseUp = () => {
      // Add a small delay to ensure selection is complete
      setTimeout(() => {
        setIsSelecting(false);
      }, 100);
    };

    // Prevent modal close during text selection
    const handleOverlayClick = (e: React.MouseEvent) => {
      // Don't close if we're in the middle of selecting text
      if (isSelecting) {
        return;
      }
      
      // Don't close if the click target is within the modal
      if ((e.target as HTMLElement).closest(`.${styles.modal}`)) {
        return;
      }
      
      onClose();
    };

    const parseDetails = (data: any) => {
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        const camp = data.data[0];
        return {
          type: 'extracted',
          organization: {
            name: camp.organization_info?.name || '',
            email: camp.organization_info?.email || camp.organization_info?.contact_email || '',
            contact: camp.organization_info?.contact_phone || camp.organization_info?.contact_details || ''
          },
          camp: {
            camp_name: camp.camp_info?.name || '',
            description: camp.camp_info?.description || '',
            price: camp.camp_info?.price || (camp.camp_info?.price_text ? parseFloat(camp.camp_info.price_text.replace(/[^\\d.]/g, '')) || 0 : 0),
            min_grade: camp.camp_info?.min_grade || 1,
            max_grade: camp.camp_info?.max_grade || 12
          },
          location: {
            name: camp.sessions?.[0]?.location_info?.name || camp.camp_info?.name || '',
            address: camp.sessions?.[0]?.location_info?.address || '',
            city: camp.sessions?.[0]?.location_info?.city || '',
            state: camp.sessions?.[0]?.location_info?.state || '',
            zip: camp.sessions?.[0]?.location_info?.zip_code || '',
            latitude: camp.sessions?.[0]?.location_info?.latitude || null,
            longitude: camp.sessions?.[0]?.location_info?.longitude || null,
            formatted_address: camp.sessions?.[0]?.location_info?.address || ''
          },
          sessions: camp.sessions?.map((session: any) => ({
            start_date: session.start_date || '',
            end_date: session.end_date || '',
            days: session.days_of_week_text || 'Monday-Friday',
            start_time: session.start_time || '',
            end_time: session.end_time || ''
          })) || [],
          categories: camp.categories || ['General']
        };
      } else {
        return {
          type: 'manual',
          organization: {
            name: data.organizationName || '',
            email: data.contactEmail || '',
            contact: data.contactPhone || ''
          },
          camp: {
            camp_name: data.campName || '',
            description: data.campDescription || '',
            price: parseFloat(data.costPerWeek) || 0,
            min_grade: parseInt(data.ageRangeMin) || 1,
            max_grade: parseInt(data.ageRangeMax) || 12
          },
          location: {
            name: data.campName || '',
            address: data.campAddress || '',
            city: data.campCity || '',
            state: data.campState || '',
            zip: data.campZip || '',
            latitude: null,
            longitude: null,
            formatted_address: `${data.campAddress || ''}, ${data.campCity || ''}, ${data.campState || ''} ${data.campZip || ''}`.trim()
          },
          sessions: data.startDate && data.endDate ? [{
            start_date: data.startDate,
            end_date: data.endDate,
            days: 'Monday-Friday',
            start_time: '09:00',
            end_time: '17:00'
          }] : [],
          categories: [data.campCategory || 'General']
        };
      }
    };

    const updateEditData = (path: string, value: any) => {
      setEditData((prev: any) => {
        const newData = { ...prev };
        const keys = path.split('.');
        let current = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return newData;
      });
    };

    const updateSessionData = (index: number, field: string, value: any) => {
      setEditData((prev: any) => ({
        ...prev,
        sessions: prev.sessions.map((session: any, i: number) => 
          i === index ? { ...session, [field]: value } : session
        )
      }));
    };

    const handleSaveEdits = async () => {
      setSaving(true);
      try {
        const response = await fetch('/api/admin/camps/actions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            action: 'save_edits', 
            campIds: [campId], 
            editedData: editData 
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          await fetchCamps();
          
          // Refresh the modal details to show updated data
          const detailsResponse = await fetch('/api/admin/camps/actions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'view_details', campIds: [campId] }),
          });
          
          const detailsResult = await detailsResponse.json();
          
          if (detailsResult.success) {
            // Update both the modal's internal data and the parent's showCampDetails
            const freshParsedData = parseDetails(detailsResult.data);
            setEditData(freshParsedData);
            // Also update the parent component's details state
            if (onDetailsUpdate) {
              onDetailsUpdate(detailsResult.data);
            }
          }
          
          setEditMode(false);
          alert('Changes saved successfully!');
        } else {
          alert(`Failed to save changes: ${result.error}`);
        }
      } catch (error) {
        console.error('Error saving changes:', error);
        alert('Error saving changes');
      } finally {
        setSaving(false);
      }
    };

    const handlePublish = async () => {
      setSaving(true);
      try {
        const response = await fetch('/api/admin/camps/actions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            action: 'approve_edited', 
            campIds: [campId], 
            editedData: editData 
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          await fetchCamps();
          onSelectionChange([]);
          onClose();
          alert('Camp published successfully!');
        } else {
          alert(`Failed to publish camp: ${result.error}`);
        }
      } catch (error) {
        console.error('Error publishing camp:', error);
        alert('Error publishing camp');
      } finally {
        setSaving(false);
      }
    };

    const handleSaveChanges = async () => {
      setSaving(true);
      try {
        const response = await fetch('/api/admin/camps/actions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            action: 'update_camp', 
            campIds: [campId], 
            editedData: editData 
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          await fetchCamps();
          setEditMode(false);
          alert('Camp updated successfully!');
        } else {
          alert(`Failed to update camp: ${result.error}`);
        }
      } catch (error) {
        console.error('Error updating camp:', error);
        alert('Error updating camp');
      } finally {
        setSaving(false);
      }
    };

    if (!editData) return null;
    
    const isPending = campId?.startsWith('pending_');

    return (
      <div className={styles.modalOverlay} onClick={handleOverlayClick} onMouseUp={handleMouseUp}>
        <div className={styles.modal} onClick={e => e.stopPropagation()} onMouseDown={handleMouseDown}>
          <div className={styles.modalHeader}>
            <h3>{editMode ? 'Edit Camp Details' : 'Camp Details'}</h3>
            <div className={styles.modalHeaderActions}>
              {!editMode ? (
                <>
                  <button 
                    onClick={() => setEditMode(true)} 
                    className={styles.editButton}
                  >
                    Edit
                  </button>
                  {isPending && (
                    <>
                      <button 
                        onClick={handleSaveEdits} 
                        className={styles.saveButton}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button 
                        onClick={handlePublish} 
                        className={styles.publishButton}
                        disabled={saving}
                      >
                        {saving ? 'Publishing...' : 'Publish'}
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <button 
                    onClick={isPending ? handleSaveEdits : handleSaveChanges} 
                    className={styles.saveButton}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={() => setEditMode(false)} 
                    className={styles.cancelButton}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </>
              )}
              <button onClick={onClose} className={styles.closeButton}>×</button>
            </div>
          </div>
          <div className={styles.modalContent}>
            {editMode ? (
              <div className={styles.editForm}>
                <div className={styles.formSection}>
                  <h4 className={styles.sectionTitle}>Organization Information</h4>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Organization Name</label>
                      <input 
                        type="text" 
                        value={editData.organization?.name || ''}
                        onChange={(e) => updateEditData('organization.name', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Contact Email</label>
                      <input 
                        type="email" 
                        value={editData.organization?.email || ''}
                        onChange={(e) => updateEditData('organization.email', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Contact Phone/Details</label>
                      <input 
                        type="text" 
                        value={editData.organization?.contact || ''}
                        onChange={(e) => updateEditData('organization.contact', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4 className={styles.sectionTitle}>Camp Information</h4>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Camp Name</label>
                      <input 
                        type="text" 
                        value={editData.camp?.camp_name || ''}
                        onChange={(e) => updateEditData('camp.camp_name', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Description</label>
                      <textarea 
                        value={editData.camp?.description || ''}
                        onChange={(e) => updateEditData('camp.description', e.target.value)}
                        className={styles.formTextarea}
                        rows={4}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Price (USD)</label>
                      <input 
                        type="number" 
                        value={editData.camp?.price || ''}
                        onChange={(e) => updateEditData('camp.price', parseFloat(e.target.value) || 0)}
                        className={styles.formInput}
                        step="0.01"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Min Grade</label>
                      <input 
                        type="number" 
                        value={editData.camp?.min_grade || ''}
                        onChange={(e) => updateEditData('camp.min_grade', parseInt(e.target.value) || 1)}
                        className={styles.formInput}
                        min="1"
                        max="12"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Max Grade</label>
                      <input 
                        type="number" 
                        value={editData.camp?.max_grade || ''}
                        onChange={(e) => updateEditData('camp.max_grade', parseInt(e.target.value) || 12)}
                        className={styles.formInput}
                        min="1"
                        max="12"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Category</label>
                      <input 
                        type="text" 
                        value={editData.categories?.[0] || ''}
                        onChange={(e) => updateEditData('categories', [e.target.value])}
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                </div>

                  <div className={styles.formSection}>
                  <h4 className={styles.sectionTitle}>Location</h4>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Location Name</label>
                      <input 
                        type="text" 
                        value={editData.location?.name || ''}
                        onChange={(e) => updateEditData('location.name', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Address</label>
                      <input 
                        type="text" 
                        value={editData.location?.address || ''}
                        onChange={(e) => updateEditData('location.address', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>City</label>
                      <input 
                        type="text" 
                        value={editData.location?.city || ''}
                        onChange={(e) => updateEditData('location.city', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>State</label>
                      <input 
                        type="text" 
                        value={editData.location?.state || ''}
                        onChange={(e) => updateEditData('location.state', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>ZIP Code</label>
                      <input 
                        type="text" 
                        value={editData.location?.zip || ''}
                        onChange={(e) => updateEditData('location.zip', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Latitude</label>
                      <input 
                        type="number" 
                        value={editData.location?.latitude || ''}
                        onChange={(e) => updateEditData('location.latitude', parseFloat(e.target.value) || null)}
                        className={styles.formInput}
                        step="any"
                        placeholder="e.g., 33.151142"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Longitude</label>
                      <input 
                        type="number" 
                        value={editData.location?.longitude || ''}
                        onChange={(e) => updateEditData('location.longitude', parseFloat(e.target.value) || null)}
                        className={styles.formInput}
                        step="any"
                        placeholder="e.g., -96.8345099"
                      />
                    </div>
                  </div>
                </div>

                {editData.sessions && editData.sessions.length > 0 && (
                  <div className={styles.formSection}>
                    <h4 className={styles.sectionTitle}>Sessions</h4>
                    {editData.sessions.map((session: any, index: number) => (
                      <div key={index} className={styles.sessionCard}>
                        <h5>Session {index + 1}</h5>
                        <div className={styles.formGrid}>
                          <div className={styles.formGroup}>
                            <label>Start Date</label>
                            <input 
                              type="date" 
                              value={session.start_date || ''}
                              onChange={(e) => updateSessionData(index, 'start_date', e.target.value)}
                              className={styles.formInput}
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label>End Date</label>
                            <input 
                              type="date" 
                              value={session.end_date || ''}
                              onChange={(e) => updateSessionData(index, 'end_date', e.target.value)}
                              className={styles.formInput}
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label>Days of Week</label>
                            <input 
                              type="text" 
                              value={session.days || ''}
                              onChange={(e) => updateSessionData(index, 'days', e.target.value)}
                              className={styles.formInput}
                              placeholder="e.g., Monday-Friday"
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label>Start Time</label>
                            <input 
                              type="time" 
                              value={session.start_time || ''}
                              onChange={(e) => updateSessionData(index, 'start_time', e.target.value)}
                              className={styles.formInput}
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label>End Time</label>
                            <input 
                              type="time" 
                              value={session.end_time || ''}
                              onChange={(e) => updateSessionData(index, 'end_time', e.target.value)}
                              className={styles.formInput}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.viewMode}>
                <div className={styles.infoSection}>
                  <h4 className={styles.sectionTitle}>Organization Information</h4>
                  <div className={styles.infoGrid}>
                    <div><strong>Name:</strong> {editData.organization?.name || 'N/A'}</div>
                    <div><strong>Email:</strong> {editData.organization?.email || 'N/A'}</div>
                    <div><strong>Contact:</strong> {editData.organization?.contact || 'N/A'}</div>
                  </div>
                </div>

                <div className={styles.infoSection}>
                  <h4 className={styles.sectionTitle}>Camp Information</h4>
                  <div className={styles.infoGrid}>
                    <div><strong>Name:</strong> {editData.camp?.camp_name || 'N/A'}</div>
                    <div><strong>Description:</strong> {editData.camp?.description || 'N/A'}</div>
                    <div><strong>Price:</strong> ${editData.camp?.price || 'N/A'}</div>
                    <div><strong>Grades:</strong> {editData.camp?.min_grade || 1} - {editData.camp?.max_grade || 12}</div>
                    <div><strong>Category:</strong> {editData.categories?.[0] || 'N/A'}</div>
                  </div>
                </div>

                <div className={styles.infoSection}>
                  <h4 className={styles.sectionTitle}>Location</h4>
                  <div className={styles.infoGrid}>
                    <div><strong>Name:</strong> {editData.location?.name || 'N/A'}</div>
                    <div><strong>Address:</strong> {editData.location?.address || 'N/A'}</div>
                    <div><strong>City:</strong> {editData.location?.city || 'N/A'}</div>
                    <div><strong>State:</strong> {editData.location?.state || 'N/A'}</div>
                    <div><strong>ZIP:</strong> {editData.location?.zip || 'N/A'}</div>
                    <div><strong>Latitude:</strong> {editData.location?.latitude || 'N/A'}</div>
                    <div><strong>Longitude:</strong> {editData.location?.longitude || 'N/A'}</div>
                    {editData.location?.latitude && editData.location?.longitude && (
                      <div>
                        <strong>Coordinates:</strong> 
                        <a 
                          href={`https://www.google.com/maps?q=${editData.location.latitude},${editData.location.longitude}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ marginLeft: '5px', color: '#007bff' }}
                        >
                          View on Google Maps 🗺️
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {editData.sessions && editData.sessions.length > 0 && (
                  <div className={styles.infoSection}>
                    <h4 className={styles.sectionTitle}>Sessions ({editData.sessions.length})</h4>
                    {editData.sessions.map((session: any, index: number) => (
                      <div key={index} className={styles.sessionInfo}>
                        <h5>Session {index + 1}</h5>
                        <div className={styles.infoGrid}>
                          <div><strong>Dates:</strong> {session.start_date} to {session.end_date}</div>
                          <div><strong>Times:</strong> {session.start_time} - {session.end_time}</div>
                          <div><strong>Days:</strong> {session.days || 'N/A'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <details className={styles.jsonSection}>
                  <summary>Raw JSON Data</summary>
                  <pre className={styles.jsonDisplay}>
                    {JSON.stringify(details, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading camps...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error: {error}</p>
        <button onClick={fetchCamps} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  const BulkActions = () => {
    return (
      <div className={styles.bulkActions}>
        {selectedCamps.length > 0 && (
          <>
            <span className={styles.selectedCount}>
              {selectedCamps.length} selected
            </span>
            <button 
              className={styles.bulkButton}
              onClick={() => handleCampAction('delete', selectedCamps)}
              disabled={!!actionLoading}
            >
              {actionLoading === 'delete' ? 'Deleting...' : 'Delete Selected'}
            </button>
          </>
        )}
      </div>
    );
  };

  if (viewMode === 'grid') {
    return (
      <>
        <BulkActions />
        <div className={styles.gridView}>
          {camps.map((camp) => (
            <div key={camp.id} className={styles.campCard}>
              <div className={styles.cardHeader}>
                <input
                  type="checkbox"
                  checked={selectedCamps.includes(camp.id)}
                  onChange={() => handleSelectCamp(camp.id)}
                  className={styles.checkbox}
                />
                {getStatusBadge(camp.status)}
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.campName}>{camp.name}</h3>
                <p className={styles.organization}>{camp.organization}</p>
                <div className={styles.campDetails}>
                  <span className={styles.detail}>📍 {camp.location}</span>
                  <span className={styles.detail}>📅 {camp.sessions} sessions</span>
                  <span className={styles.detail}>💰 {camp.priceRange}</span>
                </div>
              </div>
              <div className={styles.cardActions}>
                <button 
                  className={styles.actionButton}
                  onClick={() => handleViewDetails(camp.id)}
                >
                  {camp.status === 'Pending' ? 'Edit/Approve' : 'Edit'}
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={() => handleCampAction('delete', [camp.id])}
                  disabled={!!actionLoading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        {showCampDetails && (
          <CampDetailsModal 
            details={showCampDetails} 
            onClose={() => setShowCampDetails(null)}
            campId={selectedCampForDetails}
            onDetailsUpdate={setShowCampDetails}
          />
        )}
      </>
    );
  }

  return (
    <>
      <BulkActions />
      <div className={styles.tableContainer}>
        <table className={styles.campTable}>
          <thead>
            <tr>
              <th className={styles.checkboxColumn}>
                <input
                  type="checkbox"
                  checked={selectedCamps.length === camps.length && camps.length > 0}
                  onChange={handleSelectAll}
                  className={styles.checkbox}
                />
              </th>
              <th>Camp Name</th>
              <th>Organization</th>
              <th>Status</th>
              <th>Location</th>
              <th>Sessions</th>
              <th>Price Range</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {camps.map((camp) => (
              <tr key={camp.id} className={selectedCamps.includes(camp.id) ? styles.selectedRow : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedCamps.includes(camp.id)}
                    onChange={() => handleSelectCamp(camp.id)}
                    className={styles.checkbox}
                  />
                </td>
                <td className={styles.campNameCell}>{camp.name}</td>
                <td>{camp.organization}</td>
                <td>{getStatusBadge(camp.status)}</td>
                <td>{camp.location}</td>
                <td>{camp.sessions}</td>
                <td>{camp.priceRange}</td>
                <td>{camp.lastUpdated}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleViewDetails(camp.id)}
                    >
                      {camp.status === 'Pending' ? 'Edit/Approve' : 'Edit'}
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleCampAction('delete', [camp.id])}
                      disabled={!!actionLoading}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showCampDetails && (
        <CampDetailsModal 
          details={showCampDetails} 
          onClose={() => setShowCampDetails(null)}
          campId={selectedCampForDetails}
          onDetailsUpdate={setShowCampDetails}
        />
      )}
    </>
  );
};

export default CampTable;