'use client';
import React, { useState, useEffect } from 'react';
import styles from './EmailDraftDialog.module.css';

interface EmailDraft {
  to: string;
  from: string;
  subject: string;
  body: string;
}

interface EmailDraftDialogProps {
  draft: EmailDraft | null;
  onClose: () => void;
}

export default function EmailDraftDialog({ draft, onClose }: EmailDraftDialogProps) {
  const [editedDraft, setEditedDraft] = useState<EmailDraft | null>(draft);

  useEffect(() => {
    setEditedDraft(draft);
  }, [draft]);

  if (!draft) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedDraft(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSend = () => {
    // In a real app, this would dispatch the email.
    // For this simulation, we'll just log it and close the dialog.
    console.log('Simulating email send:', editedDraft);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h3>New Message</h3>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        <div className={styles.content}>
          <div className={styles.field}>
            <label htmlFor="to">To:</label>
            <input
              type="text"
              id="to"
              name="to"
              value={editedDraft?.to || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="from">From:</label>
            <input
              type="text"
              id="from"
              name="from"
              value={editedDraft?.from || 'brianchow06@gmail.com'}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="subject">Subject:</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={editedDraft?.subject || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="body">Body:</label>
            <textarea
              id="body"
              name="body"
              value={editedDraft?.body || ''}
              onChange={handleInputChange}
              rows={12}
            />
          </div>
        </div>
        <div className={styles.footer}>
          <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
          <button onClick={handleSend} className={styles.sendButton}>Send</button>
        </div>
      </div>
    </div>
  );
}
