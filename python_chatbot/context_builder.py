"""
Context builder for the camp chatbot - Enhanced Educational Advisor
Combines CSV data, state, and conversation history into LLM prompts
"""
import json
from typing import List, Dict, Any
from state_manager import StateManager
from csv_handler import CSVHandler

class ContextBuilder:
    def __init__(self, csv_handler: CSVHandler, state_manager: StateManager):
        self.csv_handler = csv_handler
        self.state_manager = state_manager
        self.conversation_history = []
    
    def add_to_history(self, role: str, content: str) -> None:
        """Add message to conversation history"""
        self.conversation_history.append({
            "role": role,
            "content": content,
            "timestamp": self._get_timestamp()
        })
        
        # Keep only recent history (as configured)
        from config import Config
        max_history = Config.MAX_CONVERSATION_HISTORY * 2  # *2 because we store both user and assistant
        if len(self.conversation_history) > max_history:
            self.conversation_history = self.conversation_history[-max_history:]
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def get_recent_history_string(self) -> str:
        """Get recent conversation history as formatted string"""
        if not self.conversation_history:
            return "No previous conversation."
        
        history_parts = []
        for msg in self.conversation_history[-10:]:  # Last 10 messages
            role = "Parent/Guardian" if msg["role"] == "user" else "Educational Advisor"
            history_parts.append(f"{role}: {msg['content']}")
        
        return "\n".join(history_parts)
    
    def build_context_prompt(self, user_input: str) -> str:
        """Build complete context prompt for LLM"""
        
        # Get current state
        current_state = self.state_manager.get_compact_state()
        
        # Get CSV data
        csv_data = self.csv_handler.get_csv_as_json_string()
        
        # Get conversation history
        recent_history = self.get_recent_history_string()
        
        # Build the complete prompt
        prompt = f"""You are an expert Educational Advisor for K-12 summer programs. Your goal is to have a natural, conversational interaction with parents to help them find the perfect camp.

**THREE INTERACTION MODES:**

1.  **Conversational Mode (Default):**
    *   Your primary mode. Be warm, conversational.
    *   You can mention camps by name (e.g., "The Tech Innovators Camp is a great option for coding.").
    *   Please answer user's question as an Educational Advisor, even some questioons are not direlct related to camps.
    *   **In this mode, you MUST NOT show the detailed camp card.** Keep it conversational.

2.  **Detailed Mode (On Request):**
    *   You will ONLY enter this mode when the user explicitly asks for details (e.g., "Tell me more about that camp," "Show me the details," "Can you give me the specifics?").
    *   In this mode, you MUST display the full, detailed camp card using the format provided below.

3.  **Scheduling Mode (On Request):**
    *   Triggered when the user asks to "plan a schedule," "organize weeks," or mentions specific months for planning.
    *   Review camps in the `camps_being_considered` state.
    *   Based on their `available_dates`, create a simple week-by-week schedule.
    *   Example: "Here is a potential schedule for July: Week 1 (July 1-7): Tech Innovators Camp, Week 2 (July 8-14): Sports Champions Camp."
    *   Do not show the full camp card in this mode.

4.  **Email Drafting Mode (On Request):**
    *   Triggered when the user asks to "email," "contact," or "draft an email" for a camp.
    *   **When triggered, you MUST immediately draft the email in the same response. Do NOT ask for confirmation.**
    *   You MUST populate the `email_draft` field in the JSON response.
    *   Use a placeholder for the camp email address (e.g., `contact@examplename.com`).
    *   **Always use "brianchow06@gmail.com" as the "from" email address.**
    *   The subject and body should be based on the user's request and the camp's context.
    *   Example:
        *   User says: "Email the Tech Camp about spots in July"
        *   Your `conversational_response`: "I have drafted an email to the Tech Camp for you..."
        *   Your `email_draft` field: `{{ "to": "contact@techcamp.com", "from": "brianchow06@gmail.com", "subject": "Inquiry...", "body": "..." }}`

**CRITICAL RULES:**
*   **NEVER show a card unless explicitly asked for details.**
*   **ONLY use information from the "AVAILABLE SUMMER PROGRAMS" list.** Do not invent camp details.
*   Refer to camps by their exact `camp_name` from the data.
*   Update the `camps_being_considered` in the state any camps proposed by the you.

**AVAILABLE SUMMER PROGRAMS:**
{csv_data}

**CURRENT LEARNER PROFILE:**
{json.dumps(current_state, indent=2) if current_state else "No learner profile established yet."}

**RECENT CONVERSATION:**
{recent_history}

**PARENT/GUARDIAN MESSAGE:** {user_input}

---
**DETAILED CAMP CARD FORMAT (ONLY use when asked for details):**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏕️ **[Camp Name]**
📍 Location: [location]
💰 Cost: $[price] per week
👥 Age Range: [ages]
📅 Duration: [duration]
⏰ Schedule: [schedule]

🎯 **What Your Child Will Do:**
• [activity 1]
• [activity 2]
• [activity 3]

🌟 **Educational Benefits:**
• [benefit 1]
• [benefit 2]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
---

**RESPONSE FORMAT:**
Please respond with ONLY a valid JSON object in this exact format:
{{
    "conversational_response": "Your conversational text goes here (2-4 sentences max).",
    "camp_cards_text": "If you are in Detailed Mode, the full text of the camp card(s) goes here. Otherwise, this is an empty string.",
    "email_draft": {{
        "to": "placeholder@example.com",
        "from": "brianchow06@gmail.com",
        "subject": "Email subject",
        "body": "Email body..."
    }},
    "state_updates": {{
        "child_name": "update only if mentioned",
        "child_age": "update only if mentioned (use number)",
        "grade_level": "update only if mentioned",
        "preferred_activities": ["add any new activities mentioned"],
        "budget_range": "update only if budget/investment mentioned",
        "location_preference": "update only if location mentioned",
        "scheduling": {{
            "available_dates": ["add any dates mentioned"]
        }},
        "session_context": {{
            "camps_being_considered": ["add camps mentioned by name"],
            "camps_ruled_out": ["add camps dismissed by user"]
        }}
    }}
}}
"""

        return prompt
    
    def clear_history(self) -> None:
        """Clear conversation history"""
        self.conversation_history = []
    
    def get_history_summary(self) -> str:
        """Get a summary of conversation history"""
        if not self.conversation_history:
            return "No conversation history"
        
        total_messages = len(self.conversation_history)
        user_messages = len([m for m in self.conversation_history if m["role"] == "user"])
        assistant_messages = len([m for m in self.conversation_history if m["role"] == "assistant"])
        
        return f"Total messages: {total_messages} (Parent: {user_messages}, Advisor: {assistant_messages})"
