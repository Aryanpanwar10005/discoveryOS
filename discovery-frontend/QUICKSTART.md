# LangGraph Pipeline - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (1 min)

```bash
cd discoveryOS/discovery-frontend

# Install all required packages
pip3 install -r langgraph/requirements.txt
```

**Expected output**:
```
Successfully installed langgraph-0.0.65 langchain-0.1.0 langchain-openai-0.0.5 ...
```

### Step 2: Set Environment Variable (30 sec)

```bash
# Get your OpenAI API key from https://platform.openai.com/api-keys

# Add to .env.local
echo "OPENAI_API_KEY=sk-your-key-here" >> .env.local
```

### Step 3: Verify Installation (30 sec)

```bash
# Test semantic_analysis.py directly
python3 python/semantic_analysis.py \
  "Users complained about slow checkout"
```

**Expected output** (JSON):
```json
{
  "success": true,
  "data": {...},
  "error": null,
  "processing_time": 2.45
}
```

### Step 4: Test Upload (2 min)

1. Start development server
```bash
npm run dev
```

2. Go to `/uploads` page

3. Click "Upload Research" button

4. Select a test file (PDF/DOCX/TXT)

5. ✅ Watch the magic! Check response toast

---

## 📋 What Happens When You Upload

```
File
  ↓
extract.py    → Extract text from file
  ↓
semantic_analysis.py → Analyze text with LangGraph
  ↓
Database      → Store results
  ↓
Response      → Return insights to frontend
```

---

## 📊 Expected Response

After upload, the frontend receives:

```javascript
{
  "success": true,
  "extracted": {
    "dashboard": {
      "total_insights": 15,
      "insights_by_type": {
        "complaint": 5,
        "issue": 3,
        "observation": 4,
        ...
      }
    },
    "insights": [
      {
        "id": "in_1",
        "type": "complaint",
        "title": "Users complained",
        "confidence": 0.92,
        "sentiment": "negative"
      },
      ...
    ],
    "themes": [
      {
        "name": "Checkout",
        "count": 5
      },
      ...
    ]
  },
  "insights_count": 15,
  "processing_time": 5.23
}
```

---

## 🔍 How to View Results

### In Database (Supabase)

1. Go to your Supabase dashboard
2. Select `extracted` table
3. View `content` column (JSON)

### In Frontend

1. Go to `/uploads` page
2. See upload history with status
3. Click on entry to view insights

---

## 📝 Code Overview

### semantic_analysis.py (Entry Point)

```python
# Takes: text, document_id (optional)
# Returns: DiscoveryOS JSON format
# Time: 2-5 seconds

def analyze_text(text, document_id=None):
    pipeline = SemanticUnderstandingPipeline()
    request = SemanticAnalysisRequest(text=text)
    response = pipeline.process_with_discovery_os_format(request)
    return response_dict
```

### route.ts (API Integration)

```typescript
// Takes: File upload
// Returns: DiscoveryOS JSON + metadata

export async function POST(req: NextRequest) {
  // 1. Save file
  // 2. Extract text
  // 3. Run semantic_analysis.py
  // 4. Store in database
  // 5. Return response
}
```

---

## ⚡ Performance

| Stage | Time |
|-------|------|
| Upload | 0.5s |
| Extract | 1-2s |
| Analyze | 2-5s |
| Store | 0.5s |
| **Total** | **3-8s** |

---

## 🎯 9 Insight Types Extracted

✅ Observation  
✅ Issue  
✅ Request  
✅ Complaint  
✅ Compliment  
✅ Evidence  
✅ Event  
✅ Recommendation  
✅ Question  

---

## 🛠️ Troubleshooting

### Error: "No module named 'langgraph'"

```bash
# Install dependencies
pip3 install -r langgraph/requirements.txt
```

### Error: "API key error"

```bash
# Set environment variable
export OPENAI_API_KEY=sk-your-key
# Or add to .env.local
```

### Error: "spawn ENOENT"

```bash
# Check Python path
which python3
# Should output: /usr/bin/python3
```

### Processing takes >30s

- File is too large
- API is slow
- Check network connection

---

## 📚 More Documentation

- **Full Integration Guide**: `LANGGRAPH_INTEGRATION.md`
- **Pipeline Analysis**: `langgraph/PIPELINE_ANALYSIS.md`
- **Data Flow**: `langgraph/DATA_FLOW_ANALYSIS.md`
- **Examples**: `langgraph/example.py`

---

## ✅ Verification Checklist

- [ ] Dependencies installed
- [ ] OPENAI_API_KEY set
- [ ] semantic_analysis.py runs standalone
- [ ] Upload page opens
- [ ] File upload works
- [ ] Response has insights
- [ ] Data stored in database

---

## 💡 Next Steps

1. Upload a test document
2. Check the response
3. View insights in `/uploads` page
4. Build dashboard to visualize data
5. Integrate with other features

---

## 🎉 You're Ready!

The LangGraph pipeline is now fully integrated and ready to use.

Start uploading documents and see the magic happen!

**Questions?** Check `LANGGRAPH_INTEGRATION.md` for detailed docs.
