#!/bin/bash

echo "Starting CampBuddy Demo..."

echo ""
echo "Starting Python backend..."
python api_server.py &
BACKEND_PID=$!

echo ""
echo "Waiting for backend to start..."
sleep 3

echo ""
echo "Starting Next.js frontend..."
npm run dev

# Kill backend when frontend stops
kill $BACKEND_PID 2>/dev/null
