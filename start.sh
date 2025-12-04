#!/bin/bash

cleanup() {
    echo "Cleaning up..."
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    exit 0
}

trap cleanup EXIT INT TERM

node backend/server.js &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

sleep 2

if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Backend failed to start"
    exit 1
fi

echo "Starting frontend..."
EXPO_PACKAGER_PROXY_URL=https://$REPLIT_DEV_DOMAIN REACT_NATIVE_PACKAGER_HOSTNAME=$REPLIT_DEV_DOMAIN npx expo start
