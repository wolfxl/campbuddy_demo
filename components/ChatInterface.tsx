'use client';
import { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import QuickActions from './QuickActions';
import ChatInput from './ChatInput';
import EmailDraftDialog from './EmailDraftDialog';
import styles from './ChatInterface.module.css';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  useTypewriter?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
}

interface EmailDraft {
  to: string;
  from: string;
  subject: string;
  body: string;
}

const initialQuickActions: QuickAction[] = [
  { id: 'find-camps', label: 'Find Camps', icon: '🏕️' },
  { id: 'near-me', label: 'Near Me', icon: '📍' },
  { id: 'activities', label: 'Activities', icon: '🎯' },
  { id: 'help', label: 'Help', icon: '❓' },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickActions, setQuickActions] = useState<QuickAction[]>(initialQuickActions);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Send welcome message
    const welcomeMessage: Message = {
      id: '1',
      text: "Hi! I'm your Educational Advisor. I'll help you find the perfect summer program for your child - combining fun activities with real learning benefits. What are you looking for?",
      isUser: false,
      timestamp: new Date(),
      useTypewriter: true,
    };
    setMessages([welcomeMessage]);
  }, []);

  const addMessage = (text: string, isUser: boolean, useTypewriter = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      useTypewriter,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getBotResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });
      
      const data = await response.json();
      
      setIsTyping(false);
      
      // Add bot response with typewriter effect
      addMessage(data.response, false, true);
      
      // Handle email draft - only show dialog if user explicitly requested email
      const emailKeywords = ['email', 'contact', 'draft', 'send an email', 'write an email'];
      const userRequestedEmail = emailKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
      );
      
      if (data.email_draft && data.email_draft.subject && userRequestedEmail) {
        setEmailDraft(data.email_draft);
      }
      
      // Update smart suggestions from backend
      if (data.suggestions && data.suggestions.length > 0) {
        setSmartSuggestions(data.suggestions);
        
        // Clear suggestions after 15 seconds
        setTimeout(() => setSmartSuggestions([]), 15000);
      }
      
    } catch (error) {
      console.error('Error getting bot response:', error);
      setIsTyping(false);
      
      // Fallback error message
      addMessage(
        "I apologize, but I'm having trouble connecting right now. Please make sure the backend service is running and try again.",
        false,
        true
      );
    }
  };

  // Smart suggestions are now handled by the backend API response
  // This function is kept for backward compatibility but not used

  const handleSendMessage = (message: string) => {
    addMessage(message, true);
    getBotResponse(message);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
    setSmartSuggestions([]);
  };

  const handleQuickAction = (actionId: string) => {
    const actionMessages: Record<string, string> = {
      'find-camps': 'Help me find camps',
      'near-me': 'Show me camps near my location',
      'activities': 'What activities are available?',
      'help': 'I need help using this assistant',
    };
    
    const message = actionMessages[actionId] || 'I clicked a quick action';
    handleSendMessage(message);
  };

  return (
    <div className={styles.chatContainer}>
      <ChatHeader />
      
      <div className={styles.messagesContainer}>
        <div className={styles.messagesList}>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
              useTypewriter={message.useTypewriter}
            />
          ))}
          {smartSuggestions.length > 0 && (
            <div className={styles.smartSuggestions}>
              {smartSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={styles.suggestionPill}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className={styles.inputSection}>
        <QuickActions
          actions={quickActions}
          onActionClick={handleQuickAction}
          disabled={isTyping}
        />
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isTyping}
          placeholder="Ask about camps, activities, locations..."
        />
      </div>
      
      <EmailDraftDialog
        draft={emailDraft}
        onClose={() => setEmailDraft(null)}
      />
    </div>
  );
}