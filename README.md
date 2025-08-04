# 🏕️ CampBuddy Demo

An AI-powered summer camp discovery platform with intelligent chat interface.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ and pip
- Google Gemini API key

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/wolfxl/campbuddy_demo.git
   cd campbuddy_demo
   
   # Install Node.js dependencies
   npm install
   
   # Install Python dependencies
   pip install -r requirements.txt
   ```

2. **Configure environment**
   ```bash
   # Copy template file
   cp .env.example .env
   ```
   
   Edit `.env` with your Google API key:
   ```env
   GOOGLE_API_KEY=your_google_gemini_api_key_here
   ```

3. **Start the application**
   
   **Option 1: Use start script**
   ```bash
   # Windows
   start.bat
   
   # Linux/Mac
   chmod +x start.sh
   ./start.sh
   ```
   
   **Option 2: Manual start (2 terminals)**
   ```bash
   # Terminal 1 - Backend
   python api_server.py
   
   # Terminal 2 - Frontend  
   npm run dev
   ```

4. **Access the app**
   - Main app: http://localhost:3000
   - Chat interface: http://localhost:3000/chat

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Python Flask API with Google Gemini AI
- **Database**: CSV-based camp data (easy to modify)
- **Maps**: Leaflet for interactive camp locations

## 📁 Project Structure

```
├── app/                 # Next.js pages and routes
├── components/          # React components  
├── lib/                # Utility functions
├── python_chatbot/     # AI chatbot backend
├── public/             # Static assets
├── styles/             # CSS styles
├── api_server.py       # Flask API server
├── camps_data.csv      # Camp database
└── requirements.txt    # Python dependencies
```

## 🛠️ Development

### Adding New Camps
Edit `camps_data.csv` with new camp information and restart the backend.

### API Endpoints
- `POST /chat` - Send messages to AI chatbot
- `GET /health` - Check backend status

### Environment Variables
- `GOOGLE_API_KEY` - Your Google Gemini API key (required)
- `CHAT_LLM` - AI model (optional, default: gemini-2.0-flash-lite)

## 🧪 Testing

Try these sample conversations:
- "Hi, I have an 8-year-old who loves science"
- "Show me art camps in Texas"
- "What are some budget-friendly options?"

## 📞 Support

For issues or questions, please create an issue in this repository.

---

**Built with ❤️ for parents seeking great summer camp experiences.**
