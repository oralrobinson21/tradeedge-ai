#!/bin/bash
# Start both backend and frontend together
# This script ensures both services run concurrently

# Kill any existing processes on our ports
pkill -f "node backend/server" 2>/dev/null || true

# Start backend in background
echo "Starting backend server..."
node backend/server.js &
BACKEND_PID=$!

# Wait for backend to be ready
for i in {1..10}; do
  if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "Backend ready on port 5000"
    break
  fi
  sleep 1
done

# Start frontend (this will run in foreground)
echo "Starting Expo frontend..."
EXPO_PACKAGER_PROXY_URL=https://$REPLIT_DEV_DOMAIN REACT_NATIVE_PACKAGER_HOSTNAME=$REPLIT_DEV_DOMAIN npx expo start

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
