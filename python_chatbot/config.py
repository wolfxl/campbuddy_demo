"""
Configuration settings for the camp chatbot
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    CHAT_LLM = os.getenv('CHAT_LLM', 'gemini-2.0-flash-lite')
    
    # Conversation settings
    MAX_CONVERSATION_HISTORY = 15  # Keep last 15 message pairs
    
    # CSV file path (relative to project root)
    CSV_FILE_PATH = 'camps_data.csv'
    
    # LLM settings
    TEMPERATURE = 0.7
    MAX_OUTPUT_TOKENS = 2048
    
    @classmethod
    def validate(cls):
        """Validate that required environment variables are set"""
        if not cls.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        return True
