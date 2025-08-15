# 🏕️ CampBuddy Smart Demo

**An intelligent summer camp discovery platform powered by AI**

CampBuddy Smart Demo is a comprehensive web application that helps parents find the perfect summer camps for their children through AI-powered conversations, interactive maps, and smart recommendations.

![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)
![Python](https://img.shields.io/badge/Python-3.8+-green)
![Flask](https://img.shields.io/badge/Flask-2.3.3-lightgrey)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## 🌟 Features

### 🤖 AI-Powered Camp Discovery
- **Smart Chatbot**: Conversational AI that understands your child's interests, age, and preferences
- **Google Gemini Integration**: Advanced language model for natural, helpful conversations
- **Context-Aware Recommendations**: Personalized camp suggestions based on ongoing conversation
- **Educational Advisor Personality**: Warm, professional guidance from an experienced camp counselor

### 🗺️ Interactive Camp Exploration
- **Interactive Maps**: Leaflet-powered maps showing camp locations with radius filtering
- **Location-Based Search**: Find camps within specific distances from your location
- **Detailed Camp Cards**: Rich information cards with pricing, age ranges, and categories
- **Session Management**: View and manage multiple camp sessions and dates

### 🎨 Modern User Experience
- **Responsive Design**: Beautiful UI that works on desktop, tablet, and mobile
- **Glassmorphism Effects**: Modern, elegant visual design with smooth animations
- **Framer Motion**: Fluid animations and transitions throughout the interface
- **Typewriter Effects**: Engaging text animations for AI responses
- **Dark/Light Mode**: Adaptive theming for user preference

### 📊 Smart Data Management
- **Supabase Integration**: Real-time database for camp data and user preferences
- **CSV Data Import**: Easy camp data management through CSV files
- **State Management**: Persistent conversation context and user preferences
- **Favorites System**: Save and manage favorite camps

## 🏗️ Architecture

### Frontend (Next.js 14)
- **App Router**: Modern Next.js routing with TypeScript
- **Server Components**: Optimized performance with React Server Components
- **API Routes**: Built-in API endpoints for backend communication
- **Static Generation**: Fast loading with static site generation where possible

### Backend (Python Flask)
- **Flask API Server**: RESTful API for AI chat and data processing
- **Google Gemini LLM**: Advanced language model integration
- **Conversation State**: Persistent chat context and user preferences
- **CSV Data Handler**: Flexible camp data management
- **Token Management**: Efficient API usage tracking

### Database & Storage
- **Supabase**: PostgreSQL database with real-time capabilities
- **CSV Data**: Flexible camp data storage and import system
- **Memory Bank**: Conversation history and context storage

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.8+ and pip
- **Google API Key** for Gemini AI
- **Supabase Account** (optional, for full database features)

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
setup.bat
```

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd camp_smart_demo
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Configure environment variables**
   ```bash
   # Copy template files
   cp .env.example .env
   cp .env.local.example .env.local
   ```
   
   Edit `.env` and `.env.local` with your actual keys:
   
   **`.env`:**
   ```env
   GOOGLE_API_KEY=your_google_gemini_api_key
   CHAT_LLM=gemini-2.0-flash-lite
   ```
   
   **`.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the application**
   
   **Windows:**
   ```bash
   start.bat
   ```
   
   **Manual start (two terminals):**
   ```bash
   # Terminal 1 - Backend
   python api_server.py
   
   # Terminal 2 - Frontend
   npm run dev
   ```

### 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access the application
open http://localhost:3000
```

## 📱 Usage

### Access Points
- **Main Application**: http://localhost:3000
- **AI Chat Interface**: http://localhost:3000/chat
- **Camp Browser**: http://localhost:3000/camps
- **Admin Panel**: http://localhost:3000/admin
- **API Health Check**: http://localhost:5000/health

### Getting Started
1. Navigate to the chat interface at `/chat`
2. Start a conversation: *"Hi, I have a 10-year-old who loves science and art"*
3. Let the AI guide you through finding perfect camps
4. Explore recommendations on the interactive map
5. Save favorites and compare options

### Sample Conversations
- *"My daughter is 8 years old and loves swimming and arts and crafts"*
- *"What are some budget-friendly STEM camps in Texas?"*
- *"Show me outdoor adventure camps for teenagers"*
- *"I need camps within 20 miles of Dallas"*

## 🛠️ Development

### Project Structure
```
├── app/                          # Next.js 14 App Router
│   ├── api/                     # API routes
│   ├── chat/                    # Chat interface
│   ├── camps/                   # Camp browser
│   ├── admin/                   # Admin panel
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── ChatInterface.tsx        # Main chat UI
│   ├── CampCard.tsx            # Camp display cards
│   └── MapComponent.tsx         # Interactive maps
├── lib/                         # Utility libraries
├── python_chatbot/              # Python AI backend
│   ├── chatbot_enhanced.py      # Main chatbot class
│   ├── llm_handler.py          # Google Gemini integration
│   ├── state_manager.py        # User state tracking
│   ├── csv_handler.py          # Camp data management
│   ├── context_builder.py      # AI prompt construction
│   └── token_estimator.py      # Token usage tracking
├── public/                      # Static assets
├── styles/                      # Global styles
├── api_server.py               # Flask API server
├── camps_data.csv              # Sample camp data
└── docker-compose.yml          # Docker configuration
```

### Key Technologies
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Python 3.8+, Flask, Google Gemini AI
- **Database**: Supabase (PostgreSQL), CSV data handling
- **Maps**: Leaflet, React-Leaflet
- **Animation**: Framer Motion
- **Deployment**: Docker, Docker Compose

### API Endpoints

#### Frontend API Routes
- `GET/POST /api/chat` - Main chat interface proxy
- `GET /api/health` - System health check
- `POST /api/reset` - Reset conversation state

#### Backend Flask API
- `POST /chat` - Process AI chat messages
- `GET /health` - Backend health status
- `POST /reset` - Reset conversation state
- `GET /status` - Full system status

### Environment Variables

Create a `.env` file with the following variables:

```env
# Google AI Configuration
GOOGLE_API_KEY=your_google_gemini_api_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional Configuration
FLASK_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🧪 Testing

### Manual Testing
1. **Start both services** (frontend and backend)
2. **Navigate to** http://localhost:3000/chat
3. **Test conversations**:
   - Basic greeting: *"Hello!"*
   - Child info: *"I have an 8-year-old daughter who loves art"*
   - Specific requests: *"Show me STEM camps in Texas"*
   - Location queries: *"What camps are near Dallas?"*

### API Testing
```bash
# Test backend health
curl http://localhost:5000/health

# Test chat endpoint
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, I need help finding camps"}'

# Test frontend API proxy
curl http://localhost:3000/api/health
```

## 🚀 Deployment

### Production Environment

1. **Set production environment variables**
2. **Build the Next.js application**
   ```bash
   npm run build
   ```
3. **Use Docker for containerized deployment**
   ```bash
   docker-compose up --build -d
   ```

### Environment-Specific Configurations

- **Development**: Uses `.env.local` for local overrides
- **Production**: Configure environment variables in your deployment platform
- **Docker**: Uses environment variables from `docker-compose.yml`

## 📊 Camp Data Management

### CSV Data Format
The application uses CSV files for camp data with the following structure:

```csv
camp_id,camp_name,description,price,min_grade,max_grade,organization_id,organization_name,categories,session_dates,latitude,longitude,formatted_address
```

### Adding New Camps
1. **Edit `camps_data.csv`** with new camp information
2. **Restart the backend** to load new data
3. **Or use the admin interface** at `/admin` (if implemented)

### Categories
Supported camp categories include:
- Arts & Digital Media
- Science & Engineering
- Gaming
- Outdoors & Adventure
- Sports & Fitness
- Life Skills & Hobbies
- History & Culture
- Writing & Storytelling

## 🔧 Troubleshooting

### Common Issues

**Backend Connection Failed**
- Ensure Python backend is running on port 5000
- Check that all Python dependencies are installed
- Verify Google API key is valid and set in `.env`

**Frontend Build Errors**
- Run `npm install` to ensure all dependencies are installed
- Check that Node.js version is 18+
- Verify TypeScript configuration in `tsconfig.json`

**Map Not Loading**
- Check that Leaflet CSS is properly imported
- Verify location coordinates in camp data are valid
- Ensure browser has location permissions if needed

**AI Responses Not Working**
- Verify Google API key is valid and has Gemini API access
- Check Python backend logs for error messages
- Ensure proper CORS configuration between frontend and backend

### Debug Commands

```bash
# Check Python dependencies
pip list

# Check Node.js dependencies
npm list

# Test Python backend directly
python -c "from python_chatbot.chatbot_enhanced import CampChatbot; print('Backend OK')"

# Check environment variables
cat .env
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powering the intelligent conversations
- **Supabase** for the database and real-time capabilities
- **Next.js Team** for the excellent React framework
- **Leaflet** for the interactive mapping capabilities
- **Framer Motion** for smooth animations

## 📞 Support

For support, questions, or feature requests:

1. **Check the documentation** in this README
2. **Search existing issues** in the GitHub repository
3. **Create a new issue** with detailed information
4. **Contact the development team** through the repository

---

**Happy camping! 🏕️✨**

*Built with ❤️ for parents and children seeking amazing summer camp experiences.*
