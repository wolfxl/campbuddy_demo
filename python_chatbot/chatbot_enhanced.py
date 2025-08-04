"""
Main Camp Recommendation Chatbot Application - Enhanced with Token Logging
"""
import json
import sys
from typing import Dict, Any

from config import Config
from state_manager import StateManager
from csv_handler import CSVHandler
from context_builder import ContextBuilder
from llm_handler import LLMHandler
from token_estimator import ConversationLogger

class CampChatbot:
    def __init__(self):
        """Initialize the chatbot with all components"""
        print("🏕️  Initializing Camp Recommendation Chatbot...")
        
        try:
            # Initialize components
            self.csv_handler = CSVHandler(Config.CSV_FILE_PATH)
            self.state_manager = StateManager()
            self.context_builder = ContextBuilder(self.csv_handler, self.state_manager)
            self.llm_handler = LLMHandler()
            
            # Initialize token logging
            self.conversation_logger = ConversationLogger()
            
            print("✅ All components initialized successfully!")
            
            # Test LLM connection
            if self.llm_handler.test_connection():
                print("✅ LLM connection verified!")
            else:
                print("⚠️  LLM connection test failed")
            
        except Exception as e:
            print(f"❌ Error initializing chatbot: {e}")
            raise
    
    def process_message(self, user_input: str, show_token_details: bool = True) -> str:
        """
        Process user message and return response with detailed token logging
        Main conversation flow: User Input → Context Builder → LLM → Response + State Update
        """
        try:
            # Capture state before processing
            state_before = self.state_manager.get_compact_state().copy()
            
            # Build context prompt
            prompt = self.context_builder.build_context_prompt(user_input)
            
            # Get response from LLM
            llm_response = self.llm_handler.generate_response(prompt)
            
            # Extract response and state updates
            user_response = llm_response.get("response", "Sorry, I couldn't process that.")
            state_updates = llm_response.get("state_updates", {})
            
            # Update state
            if state_updates:
                self.state_manager.update_state(state_updates)
            
            # Capture state after processing
            state_after = self.state_manager.get_compact_state().copy()
            
            # Add to conversation history
            self.context_builder.add_to_history("user", user_input)
            self.context_builder.add_to_history("assistant", user_response)
            
            # Log conversation round with token details
            if show_token_details:
                log_entry = self.conversation_logger.log_conversation_round(
                    user_input=user_input,
                    prompt=prompt,
                    llm_response=llm_response,
                    state_before=state_before,
                    state_after=state_after
                )
            
            return user_response
            
        except Exception as e:
            error_msg = f"I apologize, but I encountered an error: {str(e)}"
            print(f"Error processing message: {e}")
            return error_msg
    
    def get_status(self) -> Dict[str, Any]:
        """Get current chatbot status and state"""
        base_status = {
            "model_info": self.llm_handler.get_model_info(),
            "csv_summary": self.csv_handler.get_csv_summary(),
            "current_state": self.state_manager.get_compact_state(),
            "state_summary": self.state_manager.get_state_summary(),
            "conversation_summary": self.context_builder.get_history_summary()
        }
        
        # Add token session summary
        base_status["token_session_summary"] = self.conversation_logger.get_session_summary()
        
        return base_status
    
    def reset_conversation(self) -> str:
        """Reset conversation and state"""
        self.state_manager.reset_state()
        self.context_builder.clear_history()
        self.conversation_logger.clear_log()
        return "Great! I'm ready to help you find the perfect summer program for your child!"
    
    def reload_csv(self) -> str:
        """Reload CSV data"""
        try:
            self.csv_handler.reload_csv()
            return "CSV data reloaded successfully!"
        except Exception as e:
            return f"Error reloading CSV: {e}"
