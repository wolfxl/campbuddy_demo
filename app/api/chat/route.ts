import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Forward request to Python backend
    const pythonResponse = await fetch(`${PYTHON_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message.trim() }),
    });

    if (!pythonResponse.ok) {
      const errorData = await pythonResponse.json().catch(() => ({}));
      
      return NextResponse.json({
        response: errorData.response || 'I apologize, but I encountered an issue. Please try again.',
        suggestions: errorData.suggestions || ['Try again', 'Help me get started'],
        error: 'Backend service error',
      }, { status: 500 });
    }

    // Parse response from Python backend
    const data = await pythonResponse.json();

    // Return structured response for frontend
    return NextResponse.json({
      response: data.response || 'I apologize, but I encountered an issue processing your request.',
      suggestions: data.suggestions || [],
      stateSummary: data.state_summary || '',
      status: data.status || 'success',
      email_draft: data.email_draft || null,
    });

  } catch (error) {
    console.error('API Error:', error);
    
    // Check if it's a connection error to Python backend
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json({
        response: 'I apologize, but the chatbot service is currently unavailable. Please make sure the Python backend is running and try again.',
        suggestions: ['Try again later', 'Check backend status'],
        error: 'Backend connection failed',
      }, { status: 503 });
    }

    return NextResponse.json({
      response: 'I apologize, but I encountered an unexpected error. Please try again.',
      suggestions: ['Try again', 'Rephrase your question'],
      error: 'Internal server error',
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Check if Python backend is accessible
    const healthResponse = await fetch(`${PYTHON_API_URL}/health`, {
      method: 'GET',
    });

    const healthData = await healthResponse.json();

    return NextResponse.json({
      status: 'healthy',
      backend_status: healthResponse.ok ? 'connected' : 'disconnected',
      backend_ready: healthData.chatbot_ready || false,
    });

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      backend_status: 'disconnected',
      backend_ready: false,
      error: 'Cannot connect to Python backend',
    }, { status: 503 });
  }
}
