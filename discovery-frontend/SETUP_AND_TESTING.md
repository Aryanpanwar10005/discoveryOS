# LangGraph Pipeline - Installation & Testing Guide

## ✅ Complete Setup Guide

### Phase 1: Install Dependencies (2 minutes)

#### 1.1 Python Requirements

```bash
# Navigate to project root
cd discoveryOS/discovery-frontend

# Install all LangGraph dependencies
pip3 install -r langgraph/requirements.txt
```

**Expected packages installed:**
- langgraph >= 0.0.65
- langchain >= 0.1.0
- langchain-openai >= 0.0.5
- pydantic >= 2.0.0
- numpy >= 1.24.0
- scikit-learn >= 1.3.0
- python-dotenv >= 1.0.0

**Verify installation:**
```bash
python3 -c "import langgraph; print(langgraph.__version__)"
# Should output: 0.0.65 or higher
```

#### 1.2 System Requirements

```bash
# Check Python version
python3 --version
# Should be: Python 3.8 or higher

# Check pip
pip3 --version
# Should be latest version
```

---

### Phase 2: Environment Configuration (1 minute)

#### 2.1 Set OpenAI API Key

**Option 1: .env.local file**
```bash
# Create or update .env.local
echo "OPENAI_API_KEY=sk-your-api-key-here" >> .env.local
```

**Option 2: Environment variable**
```bash
export OPENAI_API_KEY=sk-your-api-key-here
```

**Get your API key:**
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Copy to .env.local

#### 2.2 Verify .env.local

```bash
cat .env.local
# Should show:
# OPENAI_API_KEY=sk-...
# NEXT_PUBLIC_SUPABASE_URL=...
# etc
```

---

### Phase 3: Test Python Script (2 minutes)

#### 3.1 Direct Test of semantic_analysis.py

```bash
# Test the semantic analysis script directly
python3 python/semantic_analysis.py \
  "Users complained about slow checkout process. They want guest checkout."
```

**Expected output:**
```json
{
  "success": true,
  "data": {
    "metadata": {
      "generated_at": "2026-05-26T10:30:00Z",
      "version": "1.0.0"
    },
    "dashboard": {
      "total_insights": 2,
      "insights_by_type": {
        "complaint": 1,
        "request": 1,
        ...
      },
      "avg_confidence": 0.90
    },
    "insights": [...],
    "themes": [...],
    "opportunities": [...]
  },
  "error": null,
  "processing_time": 2.34
}
```

#### 3.2 Test with Document ID

```bash
python3 python/semantic_analysis.py \
  "Users complained about slow checkout" \
  "test_doc_001" \
  "test_user"
```

---

### Phase 4: Test API Route (3 minutes)

#### 4.1 Start Development Server

```bash
# In one terminal
npm run dev
```

**Expected output:**
```
> next dev

  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

#### 4.2 Test Upload Endpoint

**Using curl:**
```bash
# Create a test text file
echo "Users complained about checkout performance. Pages take too long to load." > test.txt

# Upload it
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.txt"
```

**Expected response (200 OK):**
```json
{
  "success": true,
  "extracted": {
    "metadata": {...},
    "dashboard": {...},
    "insights": [...],
    "themes": [...],
    "opportunities": [...]
  },
  "document_id": 1,
  "insights_count": 2,
  "processing_time": 5.23
}
```

#### 4.3 Test via Frontend

1. Open http://localhost:3000/uploads
2. Click "Upload Research" button
3. Select a test file (PDF, DOCX, TXT, or CSV)
4. Watch the loading spinner
5. See success toast notification
6. Verify in upload history table

---

## 🧪 Testing Scenarios

### Scenario 1: Simple Text File

**File**: `simple.txt`
```
Users complained about slow checkout.
The app crashes sometimes.
We need better error handling.
```

**Expected Results:**
- ✅ 3 insights extracted
- ✅ Types: complaint, issue, recommendation
- ✅ Processing time: 2-4 seconds
- ✅ Status: success

### Scenario 2: Complex PDF

**File**: `customer_feedback.pdf` (multi-page)

**Expected Results:**
- ✅ 10-20 insights extracted
- ✅ Multiple themes (checkout, performance, UI)
- ✅ Processing time: 5-8 seconds
- ✅ Database stores complete JSON

### Scenario 3: CSV Data

**File**: `survey_responses.csv`

**Expected Results:**
- ✅ Text extracted from cells
- ✅ Insights from all rows
- ✅ Aggregated analysis
- ✅ Complete DiscoveryOS format

---

## 🔍 Debugging

### Debug Mode: Enable Logging

**In route.ts, add logging:**
```typescript
console.log("Step 1: Extracting text...");
console.log("Text length:", extractedText.length);
console.log("Step 2: Running semantic analysis...");
console.log("Result:", semanticResult.stdout);
```

**In Node.js console:**
```bash
NODE_DEBUG=* npm run dev
```

### Common Issues & Solutions

#### Issue 1: "ModuleNotFoundError: No module named 'langgraph'"

**Cause**: Dependencies not installed  
**Solution**:
```bash
pip3 install -r langgraph/requirements.txt
python3 -c "import langgraph; print('OK')"
```

#### Issue 2: "API key error"

**Cause**: OPENAI_API_KEY not set  
**Solution**:
```bash
# Check if set
echo $OPENAI_API_KEY

# If empty, set it
export OPENAI_API_KEY=sk-your-key

# Or add to .env.local
echo "OPENAI_API_KEY=sk-your-key" >> .env.local
```

#### Issue 3: "spawn ENOENT"

**Cause**: Python not found  
**Solution**:
```bash
which python3
# Should output /usr/bin/python3 or similar

# If not found:
brew install python3  # macOS
sudo apt-get install python3  # Linux
```

#### Issue 4: Timeout (>30s)

**Cause**: File too large or network slow  
**Solution**:
- Use smaller test file
- Check network connection
- Implement request timeout

#### Issue 5: JSON parse error

**Cause**: Python script failed silently  
**Solution**:
```bash
# Test script directly
python3 python/semantic_analysis.py "test text"

# Check stderr
python3 python/semantic_analysis.py "test text" 2>&1 | tail -20
```

---

## 📊 Verification Checklist

Use this to verify everything works:

```
SETUP:
□ Python 3.8+ installed
□ Dependencies installed (pip3 install -r langgraph/requirements.txt)
□ OPENAI_API_KEY set
□ .env.local updated

PYTHON TESTING:
□ semantic_analysis.py runs directly
□ Returns valid JSON
□ success=true in response
□ processing_time < 10s

API TESTING:
□ Development server runs (npm run dev)
□ /api/upload endpoint responds
□ File upload accepted
□ No errors in console

FRONTEND TESTING:
□ /uploads page loads
□ "Upload Research" button visible
□ File upload modal opens
□ File selection works
□ Upload completes (3-8s)
□ Success toast shown
□ Upload history updated

DATABASE TESTING:
□ Supabase connected
□ extracted table has new row
□ content is valid JSON
□ status="processed"
□ filename saved

END-TO-END:
□ Upload file
□ Get insights back
□ See results in /uploads page
□ Check Supabase for stored data
```

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

```bash
# 1. Test in production mode
npm run build
npm run start

# 2. Check all dependencies
pip3 install -r langgraph/requirements.txt --upgrade

# 3. Verify environment
echo $OPENAI_API_KEY  # Should output your key (not empty)

# 4. Test upload with larger file
# 5. Monitor performance
# 6. Check error logs
```

### Environment Variables (Production)

```bash
# .env.production (or set in deployment platform)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
DATABASE_URL=postgresql://...
NODE_ENV=production
```

---

## 📈 Performance Testing

### Test 1: Small File (< 1 MB)

```bash
# Create small test file
echo "Users complained about checkout" > small.txt

# Upload and measure
time curl -X POST http://localhost:3000/api/upload \
  -F "file=@small.txt"

# Expected: 3-5 seconds total
```

### Test 2: Medium File (1-5 MB)

```bash
# Create medium test file (simulated)
python3 << 'EOF'
with open('medium.txt', 'w') as f:
    for i in range(100):
        f.write(f"User feedback {i}: Users complained about {['checkout', 'performance', 'ui'][i%3]}.\n")
EOF

# Upload
time curl -X POST http://localhost:3000/api/upload \
  -F "file=@medium.txt"

# Expected: 5-8 seconds total
```

### Test 3: Large File (5-10 MB)

```bash
# Expected: 8-15 seconds total
# May hit timeout - consider implementing job queue
```

---

## 🔧 Advanced Configuration

### Custom LLM Model

Edit `python/semantic_analysis.py`:

```python
# Change from gpt-4-turbo-preview to another model
pipeline = SemanticUnderstandingPipeline(
    llm_model="gpt-3.5-turbo"  # Cheaper but less accurate
    # or
    # llm_model="gpt-4"  # More accurate but more expensive
)
```

### Embedding Model

Edit `langgraph/embeddings.py`:

```python
# Change embedding model
self.embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large"  # Higher quality (3072-dim)
    # or keep default: text-embedding-3-small (1536-dim)
)
```

### Thresholds

Edit `langgraph/pipeline.py`:

```python
# Duplicate detection threshold (default 0.85)
duplicates = self.embedder.find_duplicates(
    insights,
    threshold=0.90  # More strict (fewer duplicates removed)
)

# Clustering threshold (default 0.7)
clusters = self.embedder.cluster_insights(
    insights,
    threshold=0.80  # More strict (smaller clusters)
)
```

---

## 📚 Next Steps After Setup

1. **Test with real data**: Upload customer feedback files
2. **Monitor metrics**: Track processing times and error rates
3. **Optimize performance**: Cache embeddings, batch process
4. **Build dashboard**: Visualize insights and themes
5. **Iterate**: Collect feedback and improve prompts

---

## 💡 Tips & Tricks

### Batch Processing

Process multiple documents:
```python
requests = [
    SemanticAnalysisRequest(text=doc) 
    for doc in documents
]
responses = pipeline.batch_process_with_discovery_os_format(requests)
```

### Caching Embeddings

Results are cached in memory during a session. For persistence:
```python
# Save embeddings
import json
with open('embeddings_cache.json', 'w') as f:
    json.dump(embedder.embed_cache, f)

# Load embeddings
with open('embeddings_cache.json', 'r') as f:
    embedder.embed_cache = json.load(f)
```

### Export Results

```python
# Export to JSON
json_str = pipeline.export_to_json(response)

# Export to dict
dict_data = pipeline.export_to_dict(response)

# Save to file
with open('results.json', 'w') as f:
    json.dump(dict_data, f, indent=2)
```

---

## ✅ You're All Set!

The LangGraph pipeline is installed, configured, and ready to use.

**Next**: Go to `/uploads` page and try uploading a file!

**Questions?** Check:
- `LANGGRAPH_INTEGRATION.md` - Full integration guide
- `QUICKSTART.md` - 5-minute setup
- `langgraph/README.md` - Pipeline documentation
