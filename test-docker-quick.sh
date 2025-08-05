#!/bin/bash

# Quick Docker test for Smithery scenario
echo "🚀 Quick Docker Test - Smithery Scenario (No Environment Variables)"
echo "================================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Build
echo "📦 Building Docker image..."
docker build -t lokalise-mcp:test . || exit 1

echo ""
echo "✅ Build complete!"
echo ""

# Run
echo "🏃 Starting container (no environment variables)..."
docker run -d --name lokalise-mcp-test -p 3000:3000 lokalise-mcp:test

# Wait for startup
echo "⏳ Waiting for server to start..."
sleep 3

# Show logs
echo ""
echo "📋 Server logs:"
echo "---------------"
docker logs lokalise-mcp-test
echo ""

# Test commands
echo -e "${GREEN}✨ Server is running!${NC}"
echo ""
echo -e "${YELLOW}Test Commands:${NC}"
echo ""
echo "1. Test without API key (will fail):"
echo "   curl -X POST 'http://localhost:3000/mcp' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"jsonrpc\":\"2.0\",\"method\":\"tools/list\",\"id\":1}'"
echo ""
echo "2. Test WITH API key in query params (will work):"
echo "   curl -X POST 'http://localhost:3000/mcp?LOKALISE_API_KEY=your_api_key_here' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"jsonrpc\":\"2.0\",\"method\":\"tools/list\",\"id\":1}'"
echo ""
echo "3. View real-time logs:"
echo "   docker logs -f lokalise-mcp-test"
echo ""
echo "4. Stop and cleanup:"
echo "   docker stop lokalise-mcp-test && docker rm lokalise-mcp-test"
echo ""
echo -e "${GREEN}Ready for testing! Replace 'your_api_key_here' with your actual API key.${NC}"