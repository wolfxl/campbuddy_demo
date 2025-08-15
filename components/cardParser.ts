interface ParsedCampCard {
  name: string;
  location: string;
  price: string;
  ages: string;
  duration?: string;
  schedule?: string;
  benefits: string[];
  activities?: string[];
  isDetailed: boolean;
  originalText: string;
}

export interface ParsedContent {
  beforeCards: string;
  cards: ParsedCampCard[];
  afterCards: string;
}

export function parseCampCards(text: string): ParsedContent {
  // Pattern to match card boundaries (━━━ lines)
  const cardBoundaryPattern = /━{20,}/g;
  
  // Split text by card boundaries
  const sections = text.split(cardBoundaryPattern);
  
  const cards: ParsedCampCard[] = [];
  let beforeCards = '';
  let afterCards = '';
  
  // Process each section
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    
    if (!section) continue;
    
    // Check if this section contains camp card content
    const cardMatch = section.match(/🏕️/);
    
    if (cardMatch) {
      // This is a camp card section
      const card = parseIndividualCard(section);
      if (card) {
        cards.push(card);
      }
    } else {
      // This is regular text content
      if (cards.length === 0) {
        // Text before any cards
        beforeCards += section + ' ';
      } else {
        // Text after cards
        afterCards += section + ' ';
      }
    }
  }
  
  return {
    beforeCards: beforeCards.trim(),
    cards,
    afterCards: afterCards.trim()
  };
}

function parseIndividualCard(cardText: string): ParsedCampCard | null {
  try {
    // Extract camp name
    const nameMatch = cardText.match(/🏕️\s*(.*)/);
    if (!nameMatch) return null;
    
    const name = nameMatch[1].replace(/\*\*/g, '').trim();
    
    // Extract location
    const locationMatch = cardText.match(/📍\s*(?:Location:\s*)?([^\n]+)/i);
    const location = locationMatch ? locationMatch[1].trim() : '';
    
    // Extract price
    const priceMatch = cardText.match(/💰\s*(?:Cost:\s*)?\$?([^\n|]+)/i);
    const price = priceMatch ? priceMatch[1].trim().replace(/\s*\|\s*.*$/, '') : '';
    
    // Extract ages
    const agesMatch = cardText.match(/👥\s*(?:Age Range:\s*)?Ages?\s*([^\n]+)/i);
    const ages = agesMatch ? agesMatch[1].trim() : '';
    
    // Extract duration
    const durationMatch = cardText.match(/📅\s*(?:Duration:\s*)?([^\n]+)/i);
    const duration = durationMatch ? durationMatch[1].trim() : undefined;
    
    // Extract schedule
    const scheduleMatch = cardText.match(/⏰\s*(?:Schedule:\s*)?([^\n]+)/i);
    const schedule = scheduleMatch ? scheduleMatch[1].trim() : undefined;
    
    // Extract activities (detailed cards only)
    const activities: string[] = [];
    const activitiesSection = cardText.match(/🎯\s*\*\*What Your Child Will Do:\*\*\s*((?:•[^\n]+\n?)+)/i);
    if (activitiesSection) {
      const activityMatches = activitiesSection[1].match(/•\s*([^\n]+)/g);
      if (activityMatches) {
        activities.push(...activityMatches.map(match => match.replace(/^•\s*/, '').trim()));
      }
    }
    
    // Extract benefits
    const benefits: string[] = [];
    
    // Try detailed format first
    let benefitsSection = cardText.match(/🌟\s*\*\*Educational Benefits:\*\*\s*((?:•[^\n]+\n?)+)/i);
    if (benefitsSection) {
      const benefitMatches = benefitsSection[1].match(/•\s*([^\n]+)/g);
      if (benefitMatches) {
        benefits.push(...benefitMatches.map(match => match.replace(/^•\s*/, '').trim()));
      }
    } else {
      // Try simple format
      benefitsSection = cardText.match(/🎯\s*(?:Perfect for:\s*)?([^\n]+)/i);
      if (benefitsSection) {
        const benefitText = benefitsSection[1].trim();
        // Split by common separators
        benefits.push(...benefitText.split(/[,&]/).map(b => b.trim()).filter(b => b));
      }
    }
    
    const isDetailed = !!(activities.length > 0 || duration || schedule);
    
    return {
      name,
      location,
      price,
      ages,
      duration,
      schedule,
      benefits,
      activities: activities.length > 0 ? activities : undefined,
      isDetailed,
      originalText: cardText
    };
    
  } catch (error) {
    console.warn('Error parsing camp card:', error);
    return null;
  }
}

export function hasCards(text: string): boolean {
  return /━{20,}/g.test(text) && /🏕️/.test(text);
}
