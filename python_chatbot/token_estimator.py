"""
Token estimation utilities for the camp chatbot
Provides rough token counting for prompts and responses
"""
import json
import re
from typing import Dict, Any, List
from datetime import datetime

class TokenEstimator:
    """
    Simple token estimator for Gemini models
    Uses approximate word-to-token ratios
    """
    
    def __init__(self):
        # Approximate token ratios for different content types
        self.TOKENS_PER_WORD = 1.3  # Average for English text
        self.TOKENS_PER_JSON_CHAR = 0.25  # JSON is more token-dense
        self.TOKENS_PER_CSV_CHAR = 0.3   # CSV data estimation
    
    def estimate_text_tokens(self, text: str) -> int:
        """Estimate tokens for regular text"""
        if not text:
            return 0
        
        # Remove extra whitespace and count words
        words = len(text.split())
        return int(words * self.TOKENS_PER_WORD)
    
    def estimate_json_tokens(self, json_data: Any) -> int:
        """Estimate tokens for JSON data"""
        if not json_data:
            return 0
        
        # Convert to string and estimate
        json_str = json.dumps(json_data, separators=(',', ':'))
        return int(len(json_str) * self.TOKENS_PER_JSON_CHAR)
    
    def estimate_csv_tokens(self, csv_text: str) -> int:
        """Estimate tokens for CSV data"""
        if not csv_text:
            return 0
        
        return int(len(csv_text) * self.TOKENS_PER_CSV_CHAR)
    
    def estimate_prompt_tokens(self, prompt: str) -> Dict[str, int]:
        """
        Break down prompt token estimation by sections
        """
        sections = {}
        total_tokens = 0
        
        # Try to identify different sections in the prompt
        if "**AVAILABLE SUMMER PROGRAMS:**" in prompt:
            # Extract CSV section
            csv_start = prompt.find("**AVAILABLE SUMMER PROGRAMS:**")
            csv_end = prompt.find("**CURRENT LEARNER PROFILE:**")
            if csv_end > csv_start:
                csv_section = prompt[csv_start:csv_end]
                sections["csv_data"] = self.estimate_csv_tokens(csv_section)
                total_tokens += sections["csv_data"]
        
        if "**CURRENT LEARNER PROFILE:**" in prompt:
            # Extract state section
            state_start = prompt.find("**CURRENT LEARNER PROFILE:**")
            state_end = prompt.find("**RECENT CONVERSATION:**")
            if state_end > state_start:
                state_section = prompt[state_start:state_end]
                sections["user_state"] = self.estimate_text_tokens(state_section)
                total_tokens += sections["user_state"]
        
        if "**RECENT CONVERSATION:**" in prompt:
            # Extract conversation section
            conv_start = prompt.find("**RECENT CONVERSATION:**")
            conv_end = prompt.find("**PARENT/GUARDIAN MESSAGE:**")
            if conv_end > conv_start:
                conv_section = prompt[conv_start:conv_end]
                sections["conversation_history"] = self.estimate_text_tokens(conv_section)
                total_tokens += sections["conversation_history"]
        
        if "**PARENT/GUARDIAN MESSAGE:**" in prompt:
            # Extract user message
            msg_start = prompt.find("**PARENT/GUARDIAN MESSAGE:**")
            msg_end = prompt.find("**EDUCATIONAL GUIDANCE APPROACH:**")
            if msg_end > msg_start:
                msg_section = prompt[msg_start:msg_end]
                sections["user_message"] = self.estimate_text_tokens(msg_section)
                total_tokens += sections["user_message"]
        
        if "**EDUCATIONAL GUIDANCE APPROACH:**" in prompt:
            # Extract instructions section
            inst_start = prompt.find("**EDUCATIONAL GUIDANCE APPROACH:**")
            inst_section = prompt[inst_start:]
            sections["instructions"] = self.estimate_text_tokens(inst_section)
            total_tokens += sections["instructions"]
        
        # If sections don't add up, estimate the whole prompt
        if total_tokens == 0:
            total_tokens = self.estimate_text_tokens(prompt)
            sections["full_prompt"] = total_tokens
        
        sections["total"] = total_tokens
        return sections
    
    def estimate_response_tokens(self, response: str) -> int:
        """Estimate tokens for LLM response"""
        return self.estimate_text_tokens(response)


class ConversationLogger:
    """
    Logs conversation rounds with detailed token analysis
    """
    
    def __init__(self):
        self.token_estimator = TokenEstimator()
        self.conversation_log = []
        self.total_input_tokens = 0
        self.total_output_tokens = 0
    
    def log_conversation_round(self, 
                               user_input: str,
                               prompt: str,
                               llm_response: Dict[str, Any],
                               state_before: Dict[str, Any],
                               state_after: Dict[str, Any]) -> Dict[str, Any]:
        """
        Log a complete conversation round with token analysis
        """
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Estimate tokens
        prompt_tokens = self.token_estimator.estimate_prompt_tokens(prompt)
        response_text = llm_response.get("response", "")
        response_tokens = self.token_estimator.estimate_response_tokens(response_text)
        state_update_tokens = self.token_estimator.estimate_json_tokens(
            llm_response.get("state_updates", {})
        )
        
        # Create log entry
        log_entry = {
            "timestamp": timestamp,
            "round_number": len(self.conversation_log) + 1,
            "user_input": user_input,
            "user_input_tokens": self.token_estimator.estimate_text_tokens(user_input),
            "prompt_analysis": prompt_tokens,
            "response": {
                "text": response_text,
                "tokens": response_tokens
            },
            "state_updates": {
                "data": llm_response.get("state_updates", {}),
                "tokens": state_update_tokens
            },
            "token_summary": {
                "input_tokens": prompt_tokens["total"],
                "output_tokens": response_tokens + state_update_tokens,
                "total_tokens": prompt_tokens["total"] + response_tokens + state_update_tokens
            }
        }
        
        # Update totals
        self.total_input_tokens += prompt_tokens["total"]
        self.total_output_tokens += response_tokens + state_update_tokens
        
        # Add to log
        self.conversation_log.append(log_entry)
        
        return log_entry
    
    def get_session_summary(self) -> Dict[str, Any]:
        """Get summary of entire conversation session"""
        if not self.conversation_log:
            return {"message": "No conversation rounds logged yet"}
        
        return {
            "total_rounds": len(self.conversation_log),
            "total_input_tokens": self.total_input_tokens,
            "total_output_tokens": self.total_output_tokens,
            "total_session_tokens": self.total_input_tokens + self.total_output_tokens,
            "average_input_per_round": round(self.total_input_tokens / len(self.conversation_log)),
            "average_output_per_round": round(self.total_output_tokens / len(self.conversation_log))
        }
    
    def clear_log(self) -> None:
        """Clear conversation log"""
        self.conversation_log = []
        self.total_input_tokens = 0
        self.total_output_tokens = 0
