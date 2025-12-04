#!/bin/bash

# CityTasks Startup Script
# Runs backend, Expo, and reverse proxy simultaneously
# All requests go through port 8081 (external: 80) - same origin, no CORS issues

echo "=========================================="
echo "          CityTasks Starting"
echo "=========================================="
echo ""
echo "Architecture:"
echo "  Proxy  (8081/external:80) - Main entry point"
echo "  Backend (5000)            - API server"
echo "  Expo   (19006)            - React Native web"
echo ""
echo "All web requests flow through the proxy:"
echo "  /api/* -> Backend (port 5000)"
echo "  /*     -> Expo (port 19006)"
echo ""
echo "=========================================="
echo ""

# Use process-compose
if command -v process-compose &> /dev/null; then
    exec process-compose -f process-compose.yaml
else
    echo "Error: process-compose not found"
    exit 1
fi
