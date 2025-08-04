import { useState, useEffect } from 'react';
import styles from './ChatMessage.module.css';
import CampCard from './CampCard';
import { parseCampCards, hasCards } from './cardParser';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
  useTypewriter?: boolean;
}

export default function ChatMessage({ message, isUser, timestamp, useTypewriter = false }: ChatMessageProps) {
  const [displayedText, setDisplayedText] = useState(useTypewriter ? '' : message);
  const [isTyping, setIsTyping] = useState(useTypewriter);
  const [parsedContent, setParsedContent] = useState<ReturnType<typeof parseCampCards> | null>(null);

  // Check if message contains camp cards
  const messageHasCards = !isUser && hasCards(message);

  useEffect(() => {
    if (!useTypewriter || isUser) {
      setDisplayedText(message);
      if (messageHasCards) {
        setParsedContent(parseCampCards(message));
      }
      return;
    }

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < message.length) {
        const currentText = message.slice(0, currentIndex + 1);
        setDisplayedText(currentText);
        
        // Parse cards as we type if we've reached card content
        if (messageHasCards && hasCards(currentText)) {
          setParsedContent(parseCampCards(currentText));
        }
        
        currentIndex++;
      } else {
        setIsTyping(false);
        if (messageHasCards) {
          setParsedContent(parseCampCards(message));
        }
        clearInterval(typingInterval);
      }
    }, 30); // Adjust speed here (lower = faster)

    return () => clearInterval(typingInterval);
  }, [message, useTypewriter, isUser, messageHasCards]);

  // Render content with cards
  const renderMessageContent = () => {
    if (!parsedContent || parsedContent.cards.length === 0) {
      // Regular message without cards
      return (
        <p className={styles.messageText}>
          {displayedText}
          {isTyping && !isUser && <span className={styles.cursor}>|</span>}
        </p>
      );
    }

    // Message with camp cards
    return (
      <div className={styles.cardMessage}>
        {parsedContent.beforeCards && (
          <p className={styles.messageText}>
            {parsedContent.beforeCards}
            {isTyping && !parsedContent.cards.length && <span className={styles.cursor}>|</span>}
          </p>
        )}
        
        {parsedContent.cards.map((card, index) => (
          <CampCard
            key={index}
            name={card.name}
            location={card.location}
            price={card.price}
            ages={card.ages}
            duration={card.duration}
            schedule={card.schedule}
            benefits={card.benefits}
            special={card.special}
            activities={card.activities}
            requirements={card.requirements}
            isDetailed={card.isDetailed}
          />
        ))}
        
        {parsedContent.afterCards && (
          <p className={styles.messageText}>
            {parsedContent.afterCards}
            {isTyping && <span className={styles.cursor}>|</span>}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={`${styles.messageContainer} ${isUser ? styles.userMessage : styles.botMessage}`}>
      <div className={`${styles.messageBubble} ${parsedContent?.cards.length ? styles.cardBubble : ''}`}>
        {renderMessageContent()}
        {timestamp && !isTyping && (
          <span className={styles.timestamp}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
