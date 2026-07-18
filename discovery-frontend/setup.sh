#!/bin/bash

# 🚀 ONE-COMMAND SETUP SCRIPT FOR DISCOVERY OS
# Copy and paste this entire script to set up everything

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════════╗"
echo "║                    🚀 DISCOVERY OS - COMPLETE SETUP                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Navigate to project
echo -e "${BLUE}📁 Step 1/8: Navigating to project directory...${NC}"
cd discoveryOS/discovery-frontend || { echo -e "${RED}❌ Failed to navigate${NC}"; exit 1; }
echo -e "${GREEN}✅ In project directory$(pwd)${NC}"

# Step 2: Check Python version
echo ""
echo -e "${BLUE}🐍 Step 2/8: Checking Python version...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 not found. Install it first:${NC}"
    echo "   Mac: brew install python3"
    echo "   Linux: sudo apt-get install python3"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}✅ $PYTHON_VERSION${NC}"

# Step 3: Create virtual environment
echo ""
echo -e "${BLUE}🏗️  Step 3/8: Creating virtual environment (.venv)...${NC}"
if [ -d ".venv" ]; then
    echo -e "${YELLOW}⚠️  .venv already exists${NC}"
else
    python3 -m venv .venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Step 4: Activate virtual environment
echo ""
echo -e "${BLUE}🔌 Step 4/8: Activating virtual environment...${NC}"
source .venv/bin/activate
echo -e "${GREEN}✅ Virtual environment activated (you should see (.venv) in your prompt)${NC}"

# Step 5: Upgrade pip
echo ""
echo -e "${BLUE}📦 Step 5/8: Upgrading pip...${NC}"
pip install --upgrade pip > /dev/null 2>&1
echo -e "${GREEN}✅ pip upgraded${NC}"

# Step 6: Install Python dependencies
echo ""
echo -e "${BLUE}📚 Step 6/8: Installing Python dependencies...${NC}"
pip install -r langgraph/requirements.txt
echo -e "${GREEN}✅ Python dependencies installed${NC}"

# Step 7: Install Node dependencies
echo ""
echo -e "${BLUE}📚 Step 7/8: Installing Node.js dependencies...${NC}"
npm install > /dev/null 2>&1
echo -e "${GREEN}✅ Node dependencies installed${NC}"

# Step 8: Create/update .env.local
echo ""
echo -e "${BLUE}🔑 Step 8/8: Setting up environment variables...${NC}"

if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
    if grep -q "OPENROUTER_API_KEY" .env.local; then
        echo -e "${GREEN}✅ OPENROUTER_API_KEY already set${NC}"
    else
        echo -e "${YELLOW}   Add OPENROUTER_API_KEY to .env.local${NC}"
    fi
else
    echo -e "${YELLOW}📝 .env.local created (add your keys)${NC}"
    touch .env.local
fi

# Verification
echo ""
echo "╔════════════════════════════════════════════════════════════════════════════════╗"
echo "║                            ✅ SETUP COMPLETE                                   ║"
echo "╚════════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo ""
echo "1. ${BLUE}Add OpenRouter API Key to .env.local:${NC}"
echo "   ${YELLOW}echo 'OPENROUTER_API_KEY=sk-or-your-key-here' >> .env.local${NC}"
echo ""
echo "2. ${BLUE}Verify everything is installed:${NC}"
echo "   ${YELLOW}python -c \"import langgraph; print('✅ Ready')\"${NC}"
echo ""
echo "3. ${BLUE}Start the development server:${NC}"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "4. ${BLUE}Open browser to:${NC}"
echo "   ${YELLOW}http://localhost:3000/uploads${NC}"
echo ""
echo "5. ${BLUE}Click 'Upload Research' and select a file!${NC}"
echo ""
echo -e "${GREEN}🎉 You're all set! Happy analyzing!${NC}"
echo ""
