# 📊 Logging System & Debugging Guide

## Overview

The entire semantic analysis pipeline now has comprehensive logging at every step. This allows you to:
- Track progress through each stage
- Debug issues quickly
- Monitor performance
- Verify model usage
- See exact error locations

---

## 🎯 Logging Architecture

### Three-Layer Logging

**1. Semantic Analysis Wrapper** (`python/semantic_analysis.py`)
```
Entry point logging
├─ Received arguments
├─ Created request
├─ Initialized pipeline
└─ Final results
```

**2. LangGraph Pipeline** (`langgraph/pipeline.py`)
```
Orchestration logging
├─ Started processing
├─ Extraction response
├─ Embeddings/clustering
└─ DiscoveryOS formatting
```

**3. Semantic Extraction Agent** (`langgraph/agents.py`)
```
Detailed step logging
├─ Step 1: Sentence splitting
├─ Step 2: Semantic analysis (LLM call)
├─ Step 3: Atomic fact extraction (LLM call)
├─ Step 4: Sentiment analysis (LLM call)
├─ Step 5: Deduplication (LLM call)
└─ Step 6: Results aggregation
```

---

## 📝 Log Levels

### INFO Level (Default)
Shows:
- Initialization steps
- Each pipeline step (1-6)
- Counts and summaries
- Success/completion

### WARNING Level
Shows:
- Fallback behaviors
- Invalid JSON responses
- Type mismatches
- Partial failures

### ERROR Level
Shows:
- Failed API connections
- Exceptions during processing
- Missing environment variables
- Data validation errors

### DEBUG Level (Optional)
Shows:
- Raw LLM responses
- Detailed parsing steps
- Internal calculations
- Memory usage

---

## 🔍 Example Log Output

### Initialization
```
════════════════════════════════════════════════════════════════════════════════
🚀 INITIALIZING SEMANTIC EXTRACTION AGENT
════════════════════════════════════════════════════════════════════════════════
✅ OpenRouter API key loaded: sk-or-abc123...
📊 Model Configuration Selected:
   ├─ Type: balanced
   ├─ Model: openrouter/anthropic/claude-3-sonnet
   ├─ Temperature: 0.3
   └─ Max Tokens: 2000
🔌 Connecting to OpenRouter API...
✅ OpenRouter connection successful
🔨 Building LangGraph workflow...
📐 Building LangGraph state machine...
   ├─ Adding node: split_sentences
   ├─ Adding node: analyze_semantics
   ├─ Adding node: extract_atomic_facts
   ├─ Adding node: analyze_sentiment
   ├─ Adding node: deduplicate_cluster
   └─ Adding node: aggregate_results
   ├─ Adding edge: START → split_sentences
   ├─ Adding edge: split_sentences → analyze_semantics
   ...
✅ Graph compiled and ready
════════════════════════════════════════════════════════════════════════════════
```

### Pipeline Execution
```
════════════════════════════════════════════════════════════════════════════════
SEMANTIC ANALYSIS PIPELINE START
════════════════════════════════════════════════════════════════════════════════
⏱️  Start time: 2024-05-26 14:32:45
📄 Input text length: 245 characters
🔄 Running LangGraph workflow...

════════════════════════════════════════════════════════════════════════════════
STEP 1️⃣  : SPLIT SENTENCES
════════════════════════════════════════════════════════════════════════════════
📥 Input text length: 245 characters
✅ Split into 3 sentences
   └─ Sentence 1: Users complained about checkout process being too long.
   └─ Sentence 2: They want a simpler faster experience.
   └─ Sentence 3: Guest checkout option would help.
✅ STEP 1 COMPLETE: Sentences split successfully

════════════════════════════════════════════════════════════════════════════════
STEP 2️⃣  : ANALYZE SEMANTICS
════════════════════════════════════════════════════════════════════════════════
📊 Analyzing 3 sentences semantically...
🤖 Using model: openrouter/anthropic/claude-3-sonnet
   ├─ Analyzing sentence 1/3: Users complained about chec...
   │  ✅ Extracted 1 analysis results
   ├─ Analyzing sentence 2/3: They want a simpler faster...
   │  ✅ Extracted 1 analysis results
   └─ Analyzing sentence 3/3: Guest checkout option woul...
      ✅ Extracted 1 analysis result
✅ Total analyses extracted: 3
✅ STEP 2 COMPLETE: Semantic analysis done

════════════════════════════════════════════════════════════════════════════════
STEP 3️⃣  : EXTRACT ATOMIC FACTS
════════════════════════════════════════════════════════════════════════════════
📊 Extracting atomic facts from 3 analyses...
🤖 Using model: openrouter/anthropic/claude-3-sonnet
   ├─ Processing extraction 1/3
   │  ├─ Type: complaint
   │  └─ Confidence: 0.92
   │  ✅ Extracted 2 atomic facts
   │  │  └─ Fact 1: Users complained about checkout...
   │  │  └─ Fact 2: Process has too many steps...
   ├─ Processing extraction 2/3
   │  ├─ Type: request
   │  └─ Confidence: 0.88
   │  ✅ Extracted 1 atomic facts
   │  │  └─ Fact 1: Users want simpler checkout...
   └─ Processing extraction 3/3
      ├─ Type: request
      └─ Confidence: 0.85
      ✅ Extracted 1 atomic facts
         └─ Fact 1: Add guest checkout option...
✅ Total atomic facts extracted: 4
✅ STEP 3 COMPLETE: Atomic facts extracted

════════════════════════════════════════════════════════════════════════════════
STEP 4️⃣  : ANALYZE SENTIMENT
════════════════════════════════════════════════════════════════════════════════
📊 Analyzing sentiment for 4 insights...
🤖 Using model: openrouter/anthropic/claude-3-sonnet
   ├─ Analyzing sentiment 1/4: Users complained about...
   │  ✅ Sentiment: negative (score: 0.82)
   ├─ Analyzing sentiment 2/4: Process has too many st...
   │  ✅ Sentiment: negative (score: 0.78)
   ├─ Analyzing sentiment 3/4: Users want simpler che...
   │  ✅ Sentiment: neutral (score: 0.65)
   └─ Analyzing sentiment 4/4: Add guest checkout op...
      ✅ Sentiment: positive (score: 0.72)
✅ Sentiment breakdown:
   ├─ Positive: 1
   ├─ Negative: 2
   └─ Neutral: 1
✅ STEP 4 COMPLETE: Sentiment analysis done

════════════════════════════════════════════════════════════════════════════════
STEP 5️⃣  : DEDUPLICATE & CLUSTER
════════════════════════════════════════════════════════════════════════════════
📊 Deduplicating and clustering 4 insights...
🤖 Using model: openrouter/anthropic/claude-3-sonnet
   ├─ Sending 4 insights to deduplication...
   ✅ Duplicates found: 0
   ✅ Clusters found: 2
   ✅ Insights after deduplication: 4 (removed 0)
   ├─ Cluster with 2 related insights
   └─ Cluster with 2 related insights
✅ STEP 5 COMPLETE: Deduplication and clustering done

════════════════════════════════════════════════════════════════════════════════
STEP 6️⃣  : AGGREGATE RESULTS
════════════════════════════════════════════════════════════════════════════════
📊 Aggregating 4 insights...
✅ Aggregation complete:
   ├─ Total insights: 4
   └─ Breakdown by type:
       ├─ COMPLAINT: 1
       ├─ REQUEST: 2
       └─ OBSERVATION: 1
✅ STEP 6 COMPLETE: Results aggregated successfully

════════════════════════════════════════════════════════════════════════════════
✅ PIPELINE COMPLETED SUCCESSFULLY
   ├─ Total insights extracted: 4
   ├─ Processing time: 8.23s
   └─ Model used: openrouter/anthropic/claude-3-sonnet
════════════════════════════════════════════════════════════════════════════════
```

---

## 🐛 Debug Mode

### Enable Debug Logging

**In Python script:**
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Set environment variable:**
```bash
export LOG_LEVEL=DEBUG
```

### What DEBUG Shows

- Raw LLM responses (first 100 chars)
- JSON parsing details
- Intermediate calculations
- Cache hits/misses
- Token counts

---

## 🔍 Common Issues & Logs

### Issue: API Key Not Found

**Log Output:**
```
❌ OPENROUTER_API_KEY not found in environment variables
❌ Failed to connect to OpenRouter: OPENROUTER_API_KEY not set
```

**Solution:**
```bash
echo "OPENROUTER_API_KEY=sk-or-your-key" >> .env.local
npm run dev  # Restart
```

### Issue: Invalid JSON from LLM

**Log Output:**
```
⚠️  Invalid JSON from LLM, using fallback
⚠️  Invalid JSON from LLM, skipping deduplication
```

**Solution:**
- Try again (temporary issue)
- Use different model (`fast` → `balanced` → `primary`)
- Reduce max_tokens slightly

### Issue: Timeout

**Log Output:**
```
❌ Error analyzing semantics: Request timeout after 30s
⏱️  Total processing time: 30.12s
```

**Solution:**
- Use faster model
- Reduce input text size
- Check internet connection

### Issue: Step Fails Unexpectedly

**Log Output:**
```
❌ STEP 3 FAILED: Error extracting atomic facts: ...
```

**Where to Look:**
- Check the step number (1-6)
- See exact error message
- LLM response logged just before error

---

## 📊 Performance Monitoring

### Log Metrics

Each step logs:
```
STEP X: ✅ COMPLETE
   ├─ Items processed: N
   ├─ Time elapsed: Xs
   ├─ Success rate: Y%
   └─ Model used: model-name
```

### Total Pipeline Time

```
⏱️  Start time: 2024-05-26 14:32:45
⏱️  End time: 2024-05-26 14:32:53
⏱️  Total: 8.23s
```

### Breakdown
```
Step 1 (Split):        ~0.5s
Step 2 (Semantics):    ~2.5s (LLM call 1)
Step 3 (Atomic):       ~2.5s (LLM call 2)
Step 4 (Sentiment):    ~1.5s (LLM call 3)
Step 5 (Deduplicate):  ~1.0s (LLM call 4)
Step 6 (Aggregate):    ~0.2s
─────────────────────
Total:                 ~8.2s
```

---

## 🔄 Live Monitoring

### Watch Logs in Real-Time

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Upload a file
# Go to http://localhost:3000/uploads
# Click "Upload Research"

# Terminal 1: Watch logs appear in real-time
# Each step completes and logs show progress
```

### Extract Logs to File

```bash
# Save logs to file
npm run dev > app.log 2>&1

# Watch in real-time
tail -f app.log

# Search for specific step
grep "STEP 2" app.log

# Extract errors only
grep "❌" app.log
```

---

## 📋 Log Checklist

### Successful Analysis Should Show

- [ ] API key loaded successfully
- [ ] Model configuration logged
- [ ] Connection established
- [ ] STEP 1: Sentences split ✅
- [ ] STEP 2: Semantics analyzed ✅
- [ ] STEP 3: Atomic facts extracted ✅
- [ ] STEP 4: Sentiment analyzed ✅
- [ ] STEP 5: Deduplication done ✅
- [ ] STEP 6: Results aggregated ✅
- [ ] Final metrics shown
- [ ] Total processing time < 15s

### If Any Step Shows ❌

- Check the exact error message
- Look at previous successful step
- Verify input data quality
- Try different model
- Check internet connection

---

## 🎯 Log Navigation Guide

### Find Information By Type

| What | Search For |
|------|-----------|
| Total insights extracted | `Total insights: N` |
| Processing time | `⏱️  Total processing time:` |
| Model used | `Using model:` |
| Error in step X | `STEP X FAILED:` |
| API key issue | `API key` or `connection` |
| Sentiment breakdown | `Sentiment breakdown:` |
| Duplicates removed | `Duplicates found:` |
| Confidence scores | `confidence:` |

---

## 💡 Best Practices

### 1. Always Check First & Last Log Lines
```
✅ PIPELINE COMPLETED SUCCESSFULLY  (shows success)
════════════════════════════════════════════════════════════════════════════════
```

### 2. If Something Fails, Find Step Number
```
❌ STEP 3 FAILED: ...
```

### 3. Check the Error Message
```
Error extracting atomic facts: [specific error]
```

### 4. Look at Previous Step Output
Sometimes error context is in step before

### 5. Check Input Data Quality
```
📄 Input text length: 245 characters
```

---

## 🚀 Quick Debugging Tips

**Problem: Nothing happens?**
- Check logs for API key error
- Verify .env.local exists
- Restart dev server

**Problem: Step X times out?**
- That step calls an LLM
- Check internet connection
- Try faster model

**Problem: Invalid JSON?**
- LLM returned bad response
- Temporary issue, usually fixed by retry
- Try different model

**Problem: Low confidence scores?**
- Normal (0.5-0.95 range is ok)
- Lower text quality = lower confidence
- Use primary model for better results

---

## 📞 Support

### If You're Stuck

1. **Find the step that failed**
   ```
   Search logs for "❌"
   ```

2. **Read the error message**
   ```
   Look for "Error:" or specific issue
   ```

3. **Check this guide**
   ```
   Search this document for the error
   ```

4. **Try the solution**
   ```
   Follow the suggested fix
   ```

5. **Re-run and check logs again**
   ```
   Logs should show improvement
   ```

---

## 🎉 Summary

Your application now has:

✅ **6 detailed pipeline steps** - Each logs progress  
✅ **OpenRouter API logging** - Shows model usage  
✅ **Error reporting** - Shows exact failures  
✅ **Performance metrics** - Tracks timing  
✅ **Success verification** - Final status shown  

**Use the logs to:**
- Verify everything works
- Debug issues quickly
- Optimize performance
- Monitor API usage
- Understand the flow

**Happy analyzing!** 🚀
