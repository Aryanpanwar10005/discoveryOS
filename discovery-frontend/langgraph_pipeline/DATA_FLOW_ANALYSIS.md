# LangGraph Pipeline - Detailed Input/Output Analysis

## 🔄 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      INPUT SOURCES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Option 1: Direct Text                                           │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ SemanticAnalysisRequest {                              │     │
│  │    text: "User complained about..."                    │     │
│  │    document_id: "doc_001"                              │     │
│  │ }                                                      │     │
│  └────────────────────────────────────────────────────────┘     │
│                            ↓                                     │
│  Option 2: File Upload (MISSING ❌)                              │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ File: document.pdf / notes.docx / data.csv             │     │
│  │ → Should extract text → Create Request                │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│            LANGGRAPH SEMANTIC EXTRACTION AGENT                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STATE: SemanticState                                            │
│  {                                                              │
│    input_text: str,                                            │
│    sentences: List[str],                                       │
│    raw_extractions: List[dict],                                │
│    atomic_insights: List[AtomicInsight],                        │
│    insights_by_type: dict,                                     │
│    total_insights: int,                                        │
│    error: Optional[str]                                        │
│  }                                                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ NODE 1: SPLIT SENTENCES                              │      │
│  ├──────────────────────────────────────────────────────┤      │
│  │ INPUT:  state["input_text"]                          │      │
│  │         = "Users complained. Pages are slow. Fix it" │      │
│  │                                                      │      │
│  │ PROCESS: text.split('.')                             │      │
│  │                                                      │      │
│  │ OUTPUT: state["sentences"]                           │      │
│  │         = ["Users complained",                       │      │
│  │            "Pages are slow",                         │      │
│  │            "Fix it"]                                 │      │
│  └──────────────────────────────────────────────────────┘      │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ NODE 2: ANALYZE SEMANTICS                            │      │
│  ├──────────────────────────────────────────────────────┤      │
│  │ INPUT:  state["sentences"]                           │      │
│  │                                                      │      │
│  │ PROCESS: For each sentence:                          │      │
│  │         - Call LLM (gpt-4-turbo-preview)            │      │
│  │         - Prompt: "Identify: type, sentiment,       │      │
│  │            confidence"                              │      │
│  │         - Extract JSON response                      │      │
│  │                                                      │      │
│  │ OUTPUT: state["raw_extractions"]                     │      │
│  │  [{                                                  │      │
│  │    "sentence": "Users complained",                  │      │
│  │    "type": "complaint",                              │      │
│  │    "confidence": 0.95,                               │      │
│  │    "sentiment": "negative"                           │      │
│  │  }, ...]                                             │      │
│  └──────────────────────────────────────────────────────┘      │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ NODE 3: EXTRACT ATOMIC FACTS                         │      │
│  ├──────────────────────────────────────────────────────┤      │
│  │ INPUT:  state["raw_extractions"]                     │      │
│  │                                                      │      │
│  │ PROCESS: For each extraction:                        │      │
│  │         - Call LLM prompt: "Break into atomic facts" │      │
│  │         - Extract multiple facts from 1 sentence    │      │
│  │         - Never merge unrelated ideas                │      │
│  │                                                      │      │
│  │ OUTPUT: state["atomic_insights"] (List[AtomicInsight])      │
│  │  [                                                   │      │
│  │    {                                                 │      │
│  │      "type": "complaint",                            │      │
│  │      "text": "Users complained",                     │      │
│  │      "source_sentence": "Users complained",         │      │
│  │      "confidence": 0.95,                             │      │
│  │      "sentiment": "negative"                         │      │
│  │    },                                                │      │
│  │    {                                                 │      │
│  │      "type": "issue",                                │      │
│  │      "text": "Pages are slow",                       │      │
│  │      "source_sentence": "Pages are slow",           │      │
│  │      "confidence": 0.92,                             │      │
│  │      "sentiment": "negative"                         │      │
│  │    }                                                 │      │
│  │  ]                                                   │      │
│  └──────────────────────────────────────────────────────┘      │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ NODE 4: ANALYZE SENTIMENT                            │      │
│  ├──────────────────────────────────────────────────────┤      │
│  │ INPUT:  state["atomic_insights"]                     │      │
│  │                                                      │      │
│  │ PROCESS: For each insight:                           │      │
│  │         - Call LLM: "Analyze sentiment"              │      │
│  │         - Update sentiment field                     │      │
│  │                                                      │      │
│  │ OUTPUT: state["atomic_insights"]                     │      │
│  │         (with updated sentiment)                     │      │
│  └──────────────────────────────────────────────────────┘      │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ NODE 5: DEDUPLICATE & CLUSTER                        │      │
│  ├──────────────────────────────────────────────────────┤      │
│  │ INPUT:  state["atomic_insights"]                     │      │
│  │                                                      │      │
│  │ PROCESS: LLM-based deduplication                     │      │
│  │         - Find similar insights                      │      │
│  │         - Remove duplicates                          │      │
│  │         - Keep only unique insights                  │      │
│  │                                                      │      │
│  │ OUTPUT: state["atomic_insights"]                     │      │
│  │         (deduplicated list)                          │      │
│  └──────────────────────────────────────────────────────┘      │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ NODE 6: AGGREGATE RESULTS                            │      │
│  ├──────────────────────────────────────────────────────┤      │
│  │ INPUT:  state["atomic_insights"]                     │      │
│  │                                                      │      │
│  │ PROCESS: - Convert to AtomicInsight objects          │      │
│  │         - Count by type                              │      │
│  │         - Calculate stats                            │      │
│  │                                                      │      │
│  │ OUTPUT: state["insights_by_type"]                    │      │
│  │  {                                                   │      │
│  │    "complaint": 1,                                   │      │
│  │    "issue": 1,                                       │      │
│  │    "recommendation": 0,                              │      │
│  │    ...                                               │      │
│  │  }                                                   │      │
│  │                                                      │      │
│  │         state["total_insights"] = 2                  │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              SEMANTIC EMBEDDER                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ INPUT:  List[AtomicInsight]                                      │
│                                                                  │
│ OPERATIONS:                                                      │
│  1. embed_insights() → List[List[float]]                         │
│     Uses OpenAI text-embedding-3-small                          │
│     Each insight → 1536-dim vector                              │
│                                                                  │
│  2. find_duplicates() → List[Tuple[int, int]]                    │
│     Cosine similarity >= 0.85 → duplicate                        │
│                                                                  │
│  3. cluster_insights() → List[List[int]]                         │
│     Cosine similarity >= 0.7 → related                           │
│     Groups related insights together                             │
│                                                                  │
│  4. get_related_insights() → List[int]                           │
│     Find top-k related insights                                  │
│                                                                  │
│ OUTPUT: Updated insights with:                                   │
│  - removed duplicates                                            │
│  - related_insights IDs populated                                │
│  - clustering information                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│            SEMANTIC OUTPUT FORMATTER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ INPUT:  ExtractedContent {                                       │
│   original_text: str,                                           │
│   atomic_insights: List[AtomicInsight],                         │
│   total_insights: int,                                          │
│   insights_by_type: dict                                        │
│ }                                                               │
│                                                                  │
│ PROCESSING:                                                      │
│  1. Format each insight → AtomicInsightFormatted                 │
│  2. Extract themes from insights                                │
│  3. Generate opportunities from issues                           │
│  4. Create pipeline steps                                        │
│  5. Generate agent info                                          │
│  6. Calculate validation results                                 │
│                                                                  │
│ OUTPUT: DiscoveryOSResponse {                                    │
│   metadata: {...},                                              │
│   agents: [AgentInfo],                                          │
│   pipeline: [PipelineStep],                                     │
│   dashboard: {...},                                             │
│   insights: [AtomicInsightFormatted],                            │
│   themes: [InsightTheme],                                       │
│   opportunities: [...],                                         │
│   embeddings_summary: EmbeddingsSummary,                         │
│   validation: ValidationResult,                                 │
│   status: "success"                                             │
│ }                                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   FINAL OUTPUT                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ JSON Format (ready for dashboard):                               │
│                                                                  │
│ {                                                               │
│   "metadata": {                                                 │
│     "generated_at": "2026-05-26T10:30:00Z",                    │
│     "version": "1.0.0"                                          │
│   },                                                            │
│   "agents": [                                                   │
│     {                                                           │
│       "id": "ag_1",                                             │
│       "name": "Ingestion Agent",                                │
│       "role": "Collects & normalizes raw research",             │
│       "status": "active",                                       │
│       "success_rate": 99.2,                                     │
│       ...                                                       │
│     }                                                           │
│   ],                                                            │
│   "pipeline": [...],                                            │
│   "dashboard": {                                                │
│     "total_insights": 2,                                        │
│     "insights_by_type": {                                       │
│       "complaint": 1,                                           │
│       "issue": 1                                                │
│     },                                                          │
│     "avg_confidence": 0.935                                     │
│   },                                                            │
│   "insights": [                                                 │
│     {                                                           │
│       "id": "in_1",                                             │
│       "type": "complaint",                                      │
│       "title": "Users complained",                              │
│       "confidence": 0.95,                                       │
│       "sentiment": "negative",                                  │
│       "related_insights": ["in_2"]                              │
│     },                                                          │
│     {                                                           │
│       "id": "in_2",                                             │
│       "type": "issue",                                          │
│       "title": "Pages are slow",                                │
│       "confidence": 0.92,                                       │
│       "sentiment": "negative",                                  │
│       "related_insights": ["in_1"]                              │
│     }                                                           │
│   ],                                                            │
│   "themes": [                                                   │
│     {                                                           │
│       "id": "theme_1",                                          │
│       "name": "Performance",                                    │
│       "count": 2,                                               │
│       "sentiment_breakdown": {"negative": 2}                    │
│     }                                                           │
│   ],                                                            │
│   "opportunities": [                                            │
│     {                                                           │
│       "id": "op_1",                                             │
│       "rank": 1,                                                │
│       "title": "Address: Pages are slow",                       │
│       "impact": "High",                                         │
│       "confidence": 92,                                         │
│       "evidence_count": 1                                       │
│     }                                                           │
│   ],                                                            │
│   "validation": {                                               │
│     "total_checked": 2,                                         │
│     "valid_count": 2,                                           │
│     "avg_confidence": 0.935,                                    │
│     "issues": []                                                │
│   },                                                            │
│   "status": "success"                                           │
│ }                                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Component-by-Component Input/Output

### 1. **SemanticAnalysisRequest** (Entry Point)
```
INPUT:
  - text: "Users complained. Pages are slow. Fix it"
  - document_id: "doc_001" (optional)
  - user_id: "user_123" (optional)

OUTPUT:
  - Passed to SemanticExtractionAgent
```

### 2. **SemanticExtractionAgent** (LangGraph)
```
INPUT:
  SemanticState {
    input_text: "Users complained. Pages are slow. Fix it"
  }

PROCESS: 6-node graph

OUTPUT:
  SemanticState {
    input_text: "Users complained. Pages are slow. Fix it",
    sentences: ["Users complained", "Pages are slow", "Fix it"],
    raw_extractions: [{...}, {...}],
    atomic_insights: [AtomicInsight, AtomicInsight],
    insights_by_type: {"complaint": 1, "issue": 1},
    total_insights: 2,
    error: null
  }
```

### 3. **SemanticEmbedder**
```
INPUT:
  List[AtomicInsight]:
  [
    {type: "complaint", text: "Users complained", ...},
    {type: "issue", text: "Pages are slow", ...}
  ]

PROCESS:
  - Convert to embeddings (OpenAI)
  - Calculate similarity matrix
  - Find duplicates (threshold: 0.85)
  - Find clusters (threshold: 0.7)

OUTPUT:
  Updated insights with:
  - Duplicates removed
  - related_insights populated
  - Clustering info added
```

### 4. **SemanticOutputFormatter**
```
INPUT:
  ExtractedContent {
    original_text: "Users complained...",
    atomic_insights: [...],
    total_insights: 2,
    insights_by_type: {...}
  }

PROCESS:
  - Format insights
  - Extract themes (keyword-based)
  - Generate opportunities (from issues)
  - Create pipeline steps
  - Generate agent info
  - Calculate validation

OUTPUT:
  DiscoveryOSResponse (complete JSON)
```

### 5. **SemanticUnderstandingPipeline** (Orchestrator)
```
INPUT:
  SemanticAnalysisRequest {
    text: str,
    document_id: str,
    user_id: str
  }

OPERATIONS:
  1. Calls: SemanticExtractionAgent.analyze()
  2. Calls: SemanticEmbedder methods
  3. Calls: SemanticOutputFormatter.format_discovery_os()

OUTPUT:
  DiscoveryOSResponse (complete formatted response)
```

---

## ✅ Current WORKING Capabilities

| Stage | Input | Processing | Output | Status |
|-------|-------|-----------|--------|--------|
| Entry | Text string | - | SemanticAnalysisRequest | ✅ |
| LangGraph | Text | 6-node analysis | AtomicInsights | ✅ |
| Embeddings | Insights | Similarity calc | Clustered insights | ✅ |
| Formatting | Insights | Theme/opportunity extraction | DiscoveryOS JSON | ✅ |
| Export | DiscoveryOS | JSON serialization | JSON string | ✅ |

---

## ❌ MISSING Capabilities

| Stage | Input | Processing | Output | Status |
|-------|-------|-----------|--------|--------|
| File Upload | PDF/DOCX file | - | - | ❌ |
| OCR | Binary file | Text extraction | Raw text + metadata | ❌ |
| Doc Classifier | Text | LLM classification | Document type + entities | ❌ |
| Entity Extractor | Text | NER | Named entities | ❌ |

---

## 🎯 Conclusion

**Current Pipeline**: ✅ **FULLY FUNCTIONAL** for text input
- Takes raw text
- Extracts atomic insights
- Performs semantic analysis
- Outputs DiscoveryOS format

**Missing Components**: ❌ **FILE PROCESSING**
- No file upload handling
- No OCR capability
- No document classification
- No entity extraction

**To Use Currently**:
```python
# Must provide already-extracted text
request = SemanticAnalysisRequest(
    text="extracted text here"  # Text already extracted from file
)

response = pipeline.process_with_discovery_os_format(request)
```

Would you like me to implement the missing file processing components?
