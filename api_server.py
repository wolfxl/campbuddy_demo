"""
Simple Flask API server for the camp chatbot
Wraps the existing Python chatbot for web integration
"""
import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add the Python chatbot files to the path
# Assuming the Python files are in a subdirectory or same directory
sys.path.append(os.path.join(os.path.dirname(__file__), 'python_chatbot'))

try:
    from chatbot_enhanced import CampChatbot
except ImportError:
    print("Error: Python chatbot files not found. Please ensure chatbot files are available.")
    sys.exit(1)

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Global chatbot instance (in production, you'd want session management)
chatbot = None

def initialize_chatbot():
    """Initialize the chatbot instance"""
    global chatbot
    try:
        chatbot = CampChatbot()
        print("✅ Chatbot initialized successfully!")
        return True
    except Exception as e:
        print(f"❌ Error initializing chatbot: {e}")
        return False

def generate_smart_suggestions(state):
    """Generate contextual suggestions based on current state"""
    suggestions = []
    
    if not state:
        return ['Tell me about camps', 'What activities are available?', 'Help me get started']
    
    # Basic info gathering suggestions
    if not state.get('child_name') or not state.get('child_age'):
        suggestions.extend(['My child is 8 years old', 'Tell me about age-appropriate camps'])
    
    # Activity-based suggestions
    if state.get('preferred_activities'):
        activities = state['preferred_activities']
        if 'swimming' in str(activities).lower():
            suggestions.append('Swimming camps near me')
        if 'art' in str(activities).lower():
            suggestions.append('Creative arts programs')
    else:
        suggestions.extend(['Arts and crafts', 'Swimming', 'Sports camps', 'STEM programs'])
    
    # Location suggestions
    if not state.get('location_preference'):
        suggestions.extend(['Camps in Texas', 'Local camps', 'Day camps vs overnight'])
    
    # Budget suggestions
    if not state.get('budget_range'):
        suggestions.extend(['Budget-friendly options', 'Premium programs'])
    
    # Phase-based suggestions
    session_context = state.get('session_context', {})
    current_phase = session_context.get('current_phase', 'exploring')
    
    if current_phase == 'building_profile':
        suggestions.extend(['Tell me more about my child', 'What information do you need?'])
    elif current_phase == 'exploring_options':
        suggestions.extend(['Show me recommendations', 'Compare these camps'])
    elif current_phase == 'planning_schedule':
        suggestions.extend(['Available dates', 'How do I register?'])
    
    # Return unique suggestions, limited to 4-6 items
    unique_suggestions = list(dict.fromkeys(suggestions))
    return unique_suggestions[:6]

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'chatbot_ready': chatbot is not None
    })

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    """Main chat endpoint"""
    try:
        if not chatbot:
            return jsonify({
                'error': 'Chatbot not initialized',
                'response': 'Sorry, the chatbot is not ready. Please try again later.',
                'suggestions': ['Try again', 'Help']
            }), 500
        
        # Get message from request
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({
                'error': 'No message provided',
                'response': 'Please provide a message.',
                'suggestions': []
            }), 400
        
        user_message = data['message'].strip()
        if not user_message:
            return jsonify({
                'response': 'Please ask me something about camps!',
                'suggestions': ['Find camps', 'Tell me about activities', 'Help me get started']
            })
        
        # Process message with chatbot (disable token details for API)
        bot_response = chatbot.process_message(user_message, show_token_details=False)
        
        # Get the last response from LLM handler to check for email draft
        llm_response_data = chatbot.llm_handler.last_response or {}

        # --- DEBUG LOGGING START ---
        print("\n" + "="*40 + " CHATBOT DEBUG " + "="*40)
        print(f"User Message: {user_message}")
        print("-" * 20 + " RAW BOT RESPONSE " + "-"*20)
        print(bot_response)
        
        # Check for email draft
        email_draft = llm_response_data.get('email_draft')
        if email_draft:
            print("-" * 20 + " EMAIL DRAFT FOUND " + "-"*20)
            print(f"Email Draft: {email_draft}")
        else:
            print("-" * 20 + " NO EMAIL DRAFT " + "-"*20)
        
        # Fallback check for email draft
        email_keywords = ['email', 'contact', 'draft']
        if any(keyword in user_message.lower() for keyword in email_keywords):
            if not email_draft:
                print("\n⚠️  WARNING: AI may have failed to generate an email draft when requested.\n")

        print("-" * 20 + " CURRENT STATE " + "-"*20)
        try:
            import json
            print(json.dumps(chatbot.state_manager.get_compact_state(), indent=2))
        except Exception as e:
            print(f"Could not dump state: {e}")
        print("="*95 + "\n")
        # --- DEBUG LOGGING END ---
        
        # Get current state for suggestions
        current_state = chatbot.state_manager.get_compact_state()
        suggestions = generate_smart_suggestions(current_state)
        
        # Return structured response
        return jsonify({
            'response': bot_response,
            'suggestions': suggestions,
            'state_summary': chatbot.state_manager.get_state_summary(),
            'status': 'success',
            'email_draft': llm_response_data.get('email_draft')
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({
            'error': str(e),
            'response': 'I apologize, but I encountered an error. Please try rephrasing your question.',
            'suggestions': ['Try again', 'Help', 'Reset conversation']
        }), 500

@app.route('/debug-chat', methods=['POST'])
def debug_chat():
    """Debug endpoint to see raw AI responses"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        # Process message with chatbot
        response = chatbot.process_message(message, show_token_details=False)
        
        # Return both the response and debug info
        current_state = chatbot.state_manager.get_compact_state()
        suggestions = generate_smart_suggestions(current_state)
        
        return jsonify({
            'response': response,
            'suggestions': suggestions,
            'debug_info': {
                'raw_response': response,  # This is what the AI actually sent
                'response_length': len(response),
                'contains_cards': '━━━' in response,
                'contains_camp_emoji': '🏕️' in response,
                'line_count': len(response.split('\n')),
                'first_100_chars': response[:100]
            }
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'debug_info': {'error_occurred': True}
        }), 500

@app.route('/status', methods=['GET'])
def status_endpoint():
    """Get chatbot status"""
    try:
        if not chatbot:
            return jsonify({'error': 'Chatbot not initialized'}), 500
        
        status = chatbot.get_status()
        return jsonify(status)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/reset', methods=['POST'])
def reset_endpoint():
    """Reset conversation"""
    try:
        if not chatbot:
            return jsonify({'error': 'Chatbot not initialized'}), 500
        
        reset_message = chatbot.reset_conversation()
        return jsonify({
            'message': reset_message,
            'status': 'reset_complete'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🏕️ Starting Camp Chatbot API Server...")
    
    # Initialize chatbot
    if initialize_chatbot():
        print("🚀 API Server starting on http://localhost:5000")
        print("📡 CORS enabled for Next.js frontend")
        print("📍 Endpoints:")
        print("   POST /chat - Main chat endpoint")
        print("   GET  /health - Health check")
        print("   GET  /status - Chatbot status")
        print("   POST /reset - Reset conversation")
        print("-" * 50)
        
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("❌ Failed to initialize chatbot. Exiting.")
        sys.exit(1)
