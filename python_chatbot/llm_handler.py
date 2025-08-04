"""
Google LLM integration for the camp chatbot
"""
import google.generativeai as genai
import json
from typing import Dict, Any, Optional
from config import Config

class LLMHandler:
    def __init__(self):
        self.model = None
        self.last_response = None
        self.initialize_llm()
    
    def initialize_llm(self) -> None:
        """Initialize Google Generative AI"""
        try:
            # Validate config
            Config.validate()
            
            # Configure the API
            genai.configure(api_key=Config.GOOGLE_API_KEY)
            
            # Initialize the model
            self.model = genai.GenerativeModel(
                model_name=Config.CHAT_LLM,
                generation_config=genai.GenerationConfig(
                    temperature=Config.TEMPERATURE,
                    max_output_tokens=Config.MAX_OUTPUT_TOKENS,
                    response_mime_type="application/json"  # Request JSON response
                )
            )
            
            print(f"Successfully initialized {Config.CHAT_LLM}")
            
        except Exception as e:
            print(f"Error initializing LLM: {e}")
            raise
    
    def generate_response(self, prompt: str) -> Dict[str, Any]:
        """
        Generate response from LLM
        Returns: Dictionary with 'response' and 'state_updates' keys
        """
        try:
            if not self.model:
                raise ValueError("LLM model not initialized")
            
            # Generate response
            response = self.model.generate_content(prompt)
            
            if not response or not response.text:
                raise ValueError("Empty response from LLM")
            
            # Parse JSON response
            try:
                parsed_response = json.loads(response.text)
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                print(f"Raw response: {response.text}")
                # Fallback response
                return {
                    "response": "I apologize, but I encountered an error processing your request. Could you please try rephrasing your question?",
                    "state_updates": {}
                }
            
            # Validate response structure and combine conversational text with cards
            if not isinstance(parsed_response, dict):
                raise ValueError("Response is not a valid dictionary")
            
            conversational_text = parsed_response.get("conversational_response", "")
            cards_text = parsed_response.get("camp_cards_text", "")
            
            if not conversational_text:
                raise ValueError("Response missing 'conversational_response' field")
            
            # Combine the parts into a single response string for downstream processing
            combined_response = f"{conversational_text}\n\n{cards_text}".strip()
            
            # Reconstruct the response object for the chatbot
            email_draft = parsed_response.get("email_draft")
            if email_draft and email_draft.get("subject"):
                # Ensure from field is always present
                if not email_draft.get("from"):
                    email_draft["from"] = "brianchow06@gmail.com"
                final_email_draft = email_draft
            else:
                final_email_draft = None
                
            final_response = {
                "response": combined_response,
                "email_draft": final_email_draft,
                "state_updates": parsed_response.get("state_updates", {})
            }
            
            self.last_response = final_response
            return final_response
            
        except Exception as e:
            print(f"Error generating response: {e}")
            # Return error response
            return {
                "response": f"I'm sorry, I encountered an error: {str(e)}. Please try again.",
                "state_updates": {}
            }
    
    def test_connection(self) -> bool:
        """Test LLM connection with a simple prompt"""
        try:
            test_prompt = '''Please respond with this exact JSON format:
            {{
                "conversational_response": "Connection test successful!",
                "camp_cards_text": "",
                "email_draft": null,
                "state_updates": {{}}
            }}'''
            
            result = self.generate_response(test_prompt)
            
            if result.get("response") and "successful" in result["response"].lower():
                print("LLM connection test: PASSED")
                return True
            else:
                print("LLM connection test: FAILED - Unexpected response")
                return False
                
        except Exception as e:
            print(f"LLM connection test: FAILED - {e}")
            return False
    
    def get_model_info(self) -> Dict[str, str]:
        """Get information about the current model"""
        return {
            "model_name": Config.CHAT_LLM,
            "temperature": str(Config.TEMPERATURE),
            "max_tokens": str(Config.MAX_OUTPUT_TOKENS),
            "api_configured": "Yes" if Config.GOOGLE_API_KEY else "No"
        }
