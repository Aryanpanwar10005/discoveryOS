#!/bin/bash

# 🔍 Diagnostic Script - Check if Ollama is working

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════════╗"
echo "║                   🔍 DISCOVERY OS DIAGNOSTIC CHECK                             ║"
echo "╚════════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Check Ollama Server
echo -e "${BLUE}1️⃣  Checking Ollama Server...${NC}"
if curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Ollama server is running${NC}"
    
    # List available models
    echo -e "${BLUE}   Available models:${NC}"
    MODELS=$(curl -s http://127.0.0.1:11434/api/tags | python3 -c "import sys, json; data = json.load(sys.stdin); [print(f\"      - {m['name']}\") for m in data.get('models', [])]" 2>/dev/null)
    if [ -z "$MODELS" ]; then
        echo -e "${YELLOW}      ⚠️  No models found${NC}"
        echo -e "${YELLOW}      Run: ollama run phi3:mini${NC}"
    else
        echo "$MODELS"
    fi
else
    echo -e "${RED}❌ Ollama server not responding${NC}"
    echo -e "${YELLOW}   Fix: Run in Terminal 1: ollama serve${NC}"
fi

echo ""

# 2. Check Python Environment
echo -e "${BLUE}2️⃣  Checking Python Environment...${NC}"
if [ -d ".venv" ]; then
    echo -e "${GREEN}✅ Virtual environment exists${NC}"
    
    # Check if activated
    if [ -z "$VIRTUAL_ENV" ]; then
        echo -e "${YELLOW}⚠️  Virtual environment not activated${NC}"
        echo -e "${YELLOW}   Activate: source .venv/bin/activate${NC}"
    else
        echo -e "${GREEN}✅ Virtual environment is active${NC}"
    fi
else
    echo -e "${RED}❌ Virtual environment not found${NC}"
    echo -e "${YELLOW}   Create: python3 -m venv .venv${NC}"
fi

echo ""

# 3. Check LangChain Ollama
echo -e "${BLUE}3️⃣  Checking LangChain Ollama Package...${NC}"
python3 -c "from langchain_ollama import ChatOllama; print('✅ langchain_ollama installed')" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ langchain_ollama is installed${NC}"
else
    echo -e "${RED}❌ langchain_ollama not found${NC}"
    echo -e "${YELLOW}   Install: pip install langchain-ollama${NC}"
fi

echo ""

# 4. Test Ollama Connection
echo -e "${BLUE}4️⃣  Testing Ollama Connection...${NC}"
python3 << 'EOF' 2>/dev/null
try:
    from langchain_ollama import ChatOllama
    from langchain_core.messages import HumanMessage, SystemMessage
    
    print("   Testing phi3:mini connection...")
    llm = ChatOllama(model="phi3:mini", base_url="http://127.0.0.1:11434")
    
    # Quick test
    response = llm.invoke([HumanMessage(content="Say 'hello' in one word.")])
    print(f"   ✅ Connection successful")
    print(f"   Response: {response.content[:50]}...")
except Exception as e:
    print(f"   ❌ Connection failed: {str(e)}")
EOF

echo ""

# 5. Check Node.js Dev Server
echo -e "${BLUE}5️⃣  Checking Node.js Dev Server...${NC}"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Dev server is running${NC}"
else
    echo -e "${YELLOW}⚠️  Dev server not running${NC}"
    echo -e "${YELLOW}   Start: npm run dev${NC}"
fi

echo ""

# 6. Summary
echo "╔════════════════════════════════════════════════════════════════════════════════╗"
echo "║                            📋 SUMMARY                                          ║"
echo "╚════════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BLUE}For Analysis to Work, You Need:${NC}"
echo ""
echo -e "${BLUE}Terminal 1 (Running):${NC}"
echo "   ollama serve"
echo ""
echo -e "${BLUE}Terminal 2 (Model Downloaded):${NC}"
echo "   ollama run phi3:mini"
echo ""
echo -e "${BLUE}Terminal 3 (Development Server):${NC}"
echo "   npm run dev"
echo ""
echo -e "${GREEN}If all checks pass above, you're ready to upload!${NC}"
echo ""
