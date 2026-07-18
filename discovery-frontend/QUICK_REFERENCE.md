# Quick Reference Card

## 🚀 QUICK START (Copy-Paste Ready)

### 1️⃣ Install Dependencies
```bash
cd discoveryOS/discovery-frontend
pip3 install -r langgraph/requirements.txt
```

### 2️⃣ Set API Key
```bash
echo "OPENAI_API_KEY=sk-your-key-here" >> .env.local
```

### 3️⃣ Test It
```bash
# Test Python script
python3 python/semantic_analysis.py "Users complained about checkout"

# Or start dev server
npm run dev
# Then go to http://localhost:3000/uploads
```

---

## 📊 DATA FLOW AT A GLANCE

```
User uploads file
    ↓ (0.5s)
File saved to /uploads
    ↓ (1-2s)
extract.py → extract text
    ↓ (2-5s)
semantic_analysis.py → LangGraph pipeline
    ↓ (0.5s)
Supabase → store results
    ↓
Frontend → show insights + themes + opportunities
```

---

## 🎯 KEY COMPONENTS

| Component | Location | Purpose |
|-----------|----------|---------|
| Python Wrapper | `python/semantic_analysis.py` | Entry point |
| LangGraph Agent | `langgraph/agents.py` | 6-node pipeline |
| Embeddings | `langgraph/embeddings.py` | Clustering & dedup |
| Output Formatter | `langgraph/output.py` | DiscoveryOS format |
| Pipeline | `langgraph/pipeline.py` | Orchestrator |
| API Route | `app/api/upload/route.ts` | Integration layer |

---

## 📥 INPUT / OUTPUT

### Input
```json
{
  "file": "customer_feedback.pdf"
}
```

### Output
```json
{
  "success": true,
  "extracted": {
    "dashboard": {"total_insights": 15, ...},
    "insights": [{...}, ...],
    "themes": [{...}, ...],
    "opportunities": [{...}, ...]
  },
  "insights_count": 15,
  "processing_time": 6.23
}
```

---

## 🔍 9 INSIGHT TYPES

```
1. Observation   - "The app has 5 screens"
2. Issue         - "App crashes"
3. Request       - "Add dark mode"
4. Complaint     - "UI is confusing"
5. Compliment    - "Fast checkout"
6. Evidence      - "50% bounce rate"
7. Event         - "Updated yesterday"
8. Recommendation- "Simplify process"
9. Question      - "Why so slow?"
```

---

## ⚙️ INSTALLATION VERIFICATION

```bash
# ✅ Check 1: Python version
python3 --version  # Should be 3.8+

# ✅ Check 2: Dependencies installed
pip3 show langgraph  # Should exist

# ✅ Check 3: API key set
echo $OPENAI_API_KEY  # Should show sk-...

# ✅ Check 4: Script works
python3 python/semantic_analysis.py "test"  # Should return JSON

# ✅ Check 5: Dev server runs
npm run dev  # Should start on port 3000

# ✅ Check 6: Upload works
# Go to /uploads, upload file, should complete in 3-8s
```

---

## 🛠️ TROUBLESHOOTING

| Error | Fix |
|-------|-----|
| `No module named langgraph` | `pip3 install -r langgraph/requirements.txt` |
| `API key error` | `echo "OPENAI_API_KEY=sk-..." >> .env.local` |
| `spawn ENOENT` | `which python3` (check path) |
| Timeout (>30s) | Use smaller file |
| `JSON parse error` | Check stderr output |

---

## 📊 PERFORMANCE TARGETS

| Stage | Target |
|-------|--------|
| Upload | < 1s |
| Extract | 1-2s |
| Analyze | 2-5s |
| Store | < 1s |
| **Total** | **3-8s** |

---

## 📁 DOCUMENTATION

| File | Purpose | Time |
|------|---------|------|
| QUICKSTART.md | 5-min setup | 5 min |
| SETUP_AND_TESTING.md | Full guide | 30 min |
| LANGGRAPH_INTEGRATION.md | Architecture | 20 min |
| langgraph/README.md | Pipeline docs | 30 min |

---

## 🔐 ENVIRONMENT

```bash
# Required
OPENAI_API_KEY=sk-...

# Already configured (existing)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 🎉 WHAT YOU GET

✅ Automatic text extraction  
✅ Semantic analysis  
✅ 9 insight types  
✅ Sentiment analysis  
✅ Confidence scoring  
✅ Theme extraction  
✅ Opportunity generation  
✅ Deduplication  
✅ Clustering  
✅ DiscoveryOS format  

---

## 💡 USAGE EXAMPLES

### Via Frontend
1. Open `/uploads`
2. Click "Upload Research"
3. Select file
4. Wait 3-8 seconds
5. See results!

### Via Python
```python
from langgraph import SemanticUnderstandingPipeline, SemanticAnalysisRequest

pipeline = SemanticUnderstandingPipeline()
request = SemanticAnalysisRequest(text="Users complained...")
response = pipeline.process_with_discovery_os_format(request)
```

### Via API
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@document.pdf"
```

---

## 📋 CHECKLIST

Before going live:

- [ ] Dependencies installed
- [ ] OPENAI_API_KEY set
- [ ] Python script tested
- [ ] Dev server runs
- [ ] Upload works
- [ ] Results in database
- [ ] Frontend displays data

---

## 🔗 IMPORTANT LINKS

- API Key: https://platform.openai.com/api-keys
- Docs: See markdown files in repo
- Examples: `langgraph/example.py`

---

## ⏱️ TYPICAL WORKFLOW

```
0:00 - User starts upload
0:05 - File saved to /uploads
0:50 - Text extracted
2:50 - Semantic analysis complete
3:20 - Results stored
3:21 - Response returned to frontend
```

---

## 🎯 SUCCESS CRITERIA

✅ File uploads without error  
✅ Processing completes in < 10 seconds  
✅ Response contains insights array  
✅ Insights have type, confidence, sentiment  
✅ Themes extracted from insights  
✅ Opportunities generated from issues  
✅ Data stored in database  

---

**Status**: ✅ READY TO USE

**Next**: Run `pip3 install -r langgraph/requirements.txt` and enjoy!
