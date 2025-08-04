"use client";
import React, { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';
import Banner from '@/components/Banner';

const AIAssistantPage = () => {
  // State for chat messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hi there! I'm your Camp Buddy AI Assistant. I can help you with summer camp planning, finding the right camps for your kids, or answering any questions about our platform. How can I help you today?"
    }
  ]);
  
  // State for current message input
  const [currentMessage, setCurrentMessage] = useState('');
  
  // Reference for auto-scrolling to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Sample suggested questions
  const suggestedQuestions = [
    "Help me find a STEM camp for my 10-year-old",
    "What camps are available for the week of June 10?",
    "I need to find something closer to home",
    "How does multi-kid scheduling work?",
    "Can you help me fill in Week 3 for my schedule?"
  ];
  
  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle message submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!currentMessage.trim()) return;
    
    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      type: 'user',
      content: currentMessage
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setCurrentMessage('');
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const assistantResponse = generateResponse(currentMessage);
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'assistant',
        content: assistantResponse
      }]);
    }, 1000);
  };
  
  // Handle suggested question click
  const handleSuggestedQuestion = (question: string) => {
    setCurrentMessage(question);
  };
  
  // Generate a response based on user input (this is just a simple simulation)
  const generateResponse = (userMessage: string) => {
    const userMessageLower = userMessage.toLowerCase();
    
    if (userMessageLower.includes('stem') || userMessageLower.includes('science') || userMessageLower.includes('technology')) {
      return "I'd be happy to help you find a STEM camp! We have several excellent options. Code Wizards by TechKids Learning is very popular for ages 10-14, and Science Explorers by Discovery Education is great for ages 8-13. Would you like me to add one of these to your schedule or show you more STEM camp options?";
    }
    
    if (userMessageLower.includes('week 3') || userMessageLower.includes('june 17')) {
      return "For the week of June 17-23 (Week 3), we have several great camps available. Some popular options include Theater Workshop by Spotlight Kids, Adventure Explorers by Outdoor Kids Academy, and Sports All-Stars by Active Youth Sports. Would you like more information about any of these camps?";
    }
    
    if (userMessageLower.includes('closer') || userMessageLower.includes('near') || userMessageLower.includes('home')) {
      return "I can definitely help you find camps closer to your location. Could you share your ZIP code with me? That way, I can search for camps within a specific radius of your home.";
    }
    
    if (userMessageLower.includes('multi-kid') || userMessageLower.includes('siblings') || userMessageLower.includes('children')) {
      return "Our multi-kid scheduling feature makes it easy to coordinate camps for siblings! You can view all your children's schedules on the same calendar, see drop-off and pick-up times side by side, and even filter for camps that can accommodate all your kids at the same location. Would you like me to show you how to set this up in the Smart Planner?";
    }
    
    if (userMessageLower.includes('june 10') || userMessageLower.includes('week 2')) {
      return "For the week of June 10-16 (Week 2), we have several camps available across different interests. Some options include Code Wizards (STEM), Creative Canvas (Arts), Sports All-Stars (Athletics), and Adventure Explorers (Outdoor). Would you like to know more about any of these camps or see the full list for that week?";
    }
    
    // Default response
    return "Thanks for your message! I'd be happy to help with that. Could you provide a few more details about what you're looking for so I can give you the most relevant assistance?";
  };
  
  return (
    <div className={styles.assistantPage}>
      <Banner 
        title="AI Camp Assistant"
        description="Ask me anything about summer camps, scheduling, or get personalized recommendations for your children."
      />
      
      <div className="container">
        <div className={styles.chatContainer}>
          <div className={styles.chatMessages}>
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`${styles.message} ${message.type === 'user' ? styles.userMessage : styles.assistantMessage}`}
              >
                <div className={styles.messageContent}>
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className={styles.inputContainer}>
            <form onSubmit={handleSubmit} className={styles.messageForm}>
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask me anything about summer camps..."
                className={styles.messageInput}
              />
              <button type="submit" className={styles.sendButton}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          </div>
          
          <div className={styles.suggestedQuestions}>
            <h3 className={styles.suggestedTitle}>Suggested Questions</h3>
            <div className={styles.questionsList}>
              {suggestedQuestions.map((question, index) => (
                <button 
                  key={index} 
                  className={styles.questionButton}
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className={styles.featureCallout}>
          <div className={styles.calloutIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 12H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.calloutContent}>
            <h3 className={styles.calloutTitle}>Planning a complex summer?</h3>
            <p className={styles.calloutDescription}>
              Use our Smart Planner for even more personalized scheduling. Input your children's ages, interests, and your preferences to generate a complete summer plan.
            </p>
            <a href="/planner" className={styles.calloutButton}>
              Try Smart Planner
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;