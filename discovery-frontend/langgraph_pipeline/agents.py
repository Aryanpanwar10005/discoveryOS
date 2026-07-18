"""
LangGraph-based semantic extraction agent with Ollama.
Extracts atomic facts from research text and builds semantic understanding.
"""

from typing import TypedDict, List, Optional, Annotated
import json
import time
import os
import logging
from operator import add
from langgraph.graph import StateGraph, START, END
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage
from .model import (
    AtomicInsight,
    InsightType,
    ExtractedContent,
    SemanticAnalysisRequest,
    SemanticAnalysisResponse,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Ollama Model Configuration
OLLAMA_CONFIG = {
    "primary": {
        "model": "neural-chat",
        "base_url": "http://127.0.0.1:11434",
        "temperature": 0.3,
    },
    "fast": {
        "model": "phi3:mini",
        "base_url": "http://127.0.0.1:11434",
        "temperature": 0.3,
    },
     "balanced": {
        "model": "phi3:mini",
        "base_url": "http://127.0.0.1:11434",
        "temperature": 0.3,
    }
}

# Fallback to local/open models if needed
FALLBACK_MODELS = {
    "local": {
        "name": "local-model",
        "temperature": 0.3,
        "max_tokens": 2000,
    }
}


class SemanticState(TypedDict):
    """State management for semantic analysis workflow."""
    input_text: str
    sentences: List[str]
    raw_extractions: List[dict]
    atomic_insights: List[AtomicInsight]
    insights_by_type: dict
    total_insights: int
    error: Optional[str]


class SemanticExtractionAgent:
    """
    LangGraph agent for extracting atomic facts from research text using OpenRouter API.
    
    Process Flow:
    1. Split Sentences - Break text into manageable sentences
    2. Analyze Semantics - Classify each sentence semantically
    3. Extract Atomic Facts - Break down into atomic insights
    4. Analyze Sentiment - Determine sentiment for each insight
    5. Deduplicate & Cluster - Remove duplicates and group similar items
    6. Aggregate Results - Format and count final insights
    
    Models Available via OpenRouter:
    - Primary: Claude-3-Opus (best quality, higher cost)
    - Balanced: Claude-3-Sonnet (good quality, balanced cost)
    - Fast: Llama-2-70B (faster, lower cost)
    """
    
    def __init__(self, model_type: str = "balanced", base_url: str = None):
        """
        Initialize the semantic extraction agent with Ollama.
        
        Args:
            model_type: Type of model to use ('primary', 'balanced', 'fast')
            base_url: Ollama server URL (uses config if not provided)
        
        Example:
            agent = SemanticExtractionAgent(model_type="balanced")
        
        Setup:
            1. Install Ollama from https://ollama.ai
            2. Run: ollama serve
            3. In another terminal: ollama run phi3:mini
        """
        logger.info("=" * 80)
        logger.info("🚀 INITIALIZING SEMANTIC EXTRACTION AGENT WITH OLLAMA")
        logger.info("=" * 80)
        
        # Select model configuration
        if model_type not in OLLAMA_CONFIG:
            logger.warning(f"⚠️ Unknown model type '{model_type}', using 'balanced'")
            model_type = "balanced"
        
        config = OLLAMA_CONFIG[model_type]
        
        # Override base_url if provided
        if base_url:
            config["base_url"] = base_url
        
        logger.info(f"📊 Model Configuration Selected:")
        logger.info(f"   ├─ Type: {model_type}")
        logger.info(f"   ├─ Model: {config['model']}")
        logger.info(f"   ├─ Base URL: {config['base_url']}")
        logger.info(f"   └─ Temperature: {config['temperature']}")
        
        # Initialize ChatOllama
        try:
            logger.info("🔌 Connecting to Ollama...")
            self.llm = ChatOllama(
                model=config["model"],
                base_url=config["base_url"],
                temperature=config["temperature"],
            )
            logger.info("✅ Ollama connection successful")
        except Exception as e:
            logger.error(f"❌ Failed to connect to Ollama: {str(e)}")
            logger.error(f"   Make sure Ollama is running: ollama serve")
            logger.error(f"   And the model is available: ollama run {config['model']}")
            raise
        
        self.model_name = config["model"]
        self.model_type = model_type
        
        logger.info("🔨 Building LangGraph workflow...")
        self.graph = self._build_graph()
        logger.info("✅ Workflow built successfully")
        logger.info("=" * 80)
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow with logging."""
        logger.info("📐 Building LangGraph state machine...")
        workflow = StateGraph(SemanticState)
        
        # Add nodes
        logger.info("   ├─ Adding node: split_sentences")
        workflow.add_node("split_sentences", self._split_sentences)
        logger.info("   ├─ Adding node: analyze_semantics")
        workflow.add_node("analyze_semantics", self._analyze_semantics)
        logger.info("   ├─ Adding node: extract_atomic_facts")
        workflow.add_node("extract_atomic_facts", self._extract_atomic_facts)
        logger.info("   ├─ Adding node: analyze_sentiment")
        workflow.add_node("analyze_sentiment", self._analyze_sentiment)
        logger.info("   ├─ Adding node: deduplicate_cluster")
        workflow.add_node("deduplicate_cluster", self._deduplicate_cluster)
        logger.info("   └─ Adding node: aggregate_results")
        workflow.add_node("aggregate_results", self._aggregate_results)
        
        # Add edges (workflow flow)
        logger.info("   ├─ Adding edge: START → split_sentences")
        workflow.add_edge(START, "split_sentences")
        logger.info("   ├─ Adding edge: split_sentences → analyze_semantics")
        workflow.add_edge("split_sentences", "analyze_semantics")
        logger.info("   ├─ Adding edge: analyze_semantics → extract_atomic_facts")
        workflow.add_edge("analyze_semantics", "extract_atomic_facts")
        logger.info("   ├─ Adding edge: extract_atomic_facts → analyze_sentiment")
        workflow.add_edge("extract_atomic_facts", "analyze_sentiment")
        logger.info("   ├─ Adding edge: analyze_sentiment → deduplicate_cluster")
        workflow.add_edge("analyze_sentiment", "deduplicate_cluster")
        logger.info("   ├─ Adding edge: deduplicate_cluster → aggregate_results")
        workflow.add_edge("deduplicate_cluster", "aggregate_results")
        logger.info("   └─ Adding edge: aggregate_results → END")
        workflow.add_edge("aggregate_results", END)
        
        logger.info("✅ Graph edges configured")
        compiled = workflow.compile()
        logger.info("✅ Graph compiled and ready")
        return compiled
    
    def _split_sentences(self, state: SemanticState) -> SemanticState:
        """Split input text into sentences."""
        logger.info("")
        logger.info("=" * 80)
        logger.info("STEP 1️⃣  : SPLIT SENTENCES")
        logger.info("=" * 80)
        
        try:
            text = state["input_text"]
            logger.info(f"📥 Input text length: {len(text)} characters")
            
            # Simple sentence splitting by period
            sentences = [s.strip() for s in text.split('.') if s.strip()]
            logger.info(f"✅ Split into {len(sentences)} sentences")
            
            for i, sentence in enumerate(sentences[:3], 1):  # Log first 3
                logger.info(f"   └─ Sentence {i}: {sentence[:60]}{'...' if len(sentence) > 60 else ''}")
            
            if len(sentences) > 3:
                logger.info(f"   └─ ... and {len(sentences) - 3} more sentences")
            
            state["sentences"] = sentences
            logger.info("✅ STEP 1 COMPLETE: Sentences split successfully")
            return state
        except Exception as e:
            logger.error(f"❌ STEP 1 FAILED: Error splitting sentences: {str(e)}")
            state["error"] = f"Error splitting sentences: {str(e)}"
            return state
    
    def _analyze_semantics(self, state: SemanticState) -> SemanticState:
        """Analyze semantic content of each sentence using OpenRouter."""
        logger.info("")
        logger.info("=" * 80)
        logger.info("STEP 2️⃣  : ANALYZE SEMANTICS")
        logger.info("=" * 80)
        
        try:
            sentences = state["sentences"]
            logger.info(f"📊 Analyzing {len(sentences)} sentences semantically...")
            logger.info(f"🤖 Using model: {self.model_name}")
            
            system_prompt = """You are a semantic analysis expert. For each sentence, identify:
- The primary semantic type (observation, issue, request, complaint, compliment, evidence, event, recommendation, question)
- Key entities and relationships
- Sentiment (positive, negative, neutral)
- Confidence level (0.0-1.0)

Return valid JSON array. Example:
[{"sentence": "...", "type": "observation", "confidence": 0.95, "sentiment": "neutral"}]"""
            
            all_analyses = []
            for idx, sentence in enumerate(sentences, 1):
                logger.info(f"   ├─ Analyzing sentence {idx}/{len(sentences)}: {sentence[:50]}...")
                
                try:
                    message = HumanMessage(content=f"Analyze this sentence: {sentence}")
                    response = self.llm.invoke([
                        SystemMessage(content=system_prompt), 
                        message
                    ])
                    
                    logger.debug(f"   │  ├─ Raw response: {response.content[:100]}...")
                    
                    analyses = json.loads(response.content)
                    all_analyses.extend(analyses)
                    logger.info(f"   │  ✅ Extracted {len(analyses)} analysis results")
                    
                except json.JSONDecodeError:
                    logger.warning(f"   │  ⚠️ Invalid JSON from LLM, using fallback")
                    all_analyses.append({
                        "sentence": sentence,
                        "type": "observation",
                        "confidence": 0.5,
                        "sentiment": "neutral"
                    })
                except Exception as e:
                    logger.error(f"   │  ❌ Error processing sentence: {str(e)}")
                    all_analyses.append({
                        "sentence": sentence,
                        "type": "observation",
                        "confidence": 0.3,
                        "sentiment": "neutral"
                    })
            
            logger.info(f"✅ Total analyses extracted: {len(all_analyses)}")
            state["raw_extractions"] = all_analyses
            logger.info("✅ STEP 2 COMPLETE: Semantic analysis done")
            return state
        except Exception as e:
            logger.error(f"❌ STEP 2 FAILED: Error analyzing semantics: {str(e)}")
            state["error"] = f"Error analyzing semantics: {str(e)}"
            return state
    
    def _extract_atomic_facts(self, state: SemanticState) -> SemanticState:
        """Extract atomic facts from semantic analysis using OpenRouter."""
        logger.info("")
        logger.info("=" * 80)
        logger.info("STEP 3️⃣  : EXTRACT ATOMIC FACTS")
        logger.info("=" * 80)
        
        try:
            extractions = state["raw_extractions"]
            logger.info(f"📊 Extracting atomic facts from {len(extractions)} analyses...")
            logger.info(f"🤖 Using model: {self.model_name}")
            
            system_prompt = """You are an expert at breaking down complex sentences into atomic facts.
Each atomic fact should be:
- Single, focused idea
- Independent (can stand alone)
- Free of jargon
- Clear and specific

For each sentence, extract ALL atomic facts it contains. Never merge unrelated ideas.
Return valid JSON array. Example:
[{"fact": "...", "type": "observation"}, {"fact": "...", "type": "issue"}]"""
            
            atomic_facts = []
            for idx, extraction in enumerate(extractions, 1):
                logger.info(f"   ├─ Processing extraction {idx}/{len(extractions)}")
                logger.info(f"   │  ├─ Type: {extraction.get('type', 'unknown')}")
                logger.info(f"   │  └─ Confidence: {extraction.get('confidence', 0):.2f}")
                
                try:
                    fact_message = HumanMessage(
                        content=f"Extract atomic facts from: {extraction.get('sentence', '')}"
                    )
                    response = self.llm.invoke([
                        SystemMessage(content=system_prompt), 
                        fact_message
                    ])
                    
                    facts = json.loads(response.content)
                    logger.info(f"   │  ✅ Extracted {len(facts)} atomic facts")
                    
                    for fact_idx, fact in enumerate(facts, 1):
                        atomic_facts.append({
                            "text": fact.get("fact", ""),
                            "type": fact.get("type", "observation"),
                            "source_sentence": extraction.get("sentence", ""),
                            "confidence": extraction.get("confidence", 0.9),
                            "sentiment": extraction.get("sentiment", "neutral")
                        })
                        logger.debug(f"   │  │  └─ Fact {fact_idx}: {fact.get('fact', '')[:40]}...")
                
                except json.JSONDecodeError:
                    logger.warning(f"   │  ⚠️ Invalid JSON from LLM, using fallback")
                    atomic_facts.append({
                        "text": extraction.get("sentence", ""),
                        "type": extraction.get("type", "observation"),
                        "source_sentence": extraction.get("sentence", ""),
                        "confidence": extraction.get("confidence", 0.9),
                        "sentiment": extraction.get("sentiment", "neutral")
                    })
                except Exception as e:
                    logger.error(f"   │  ❌ Error extracting facts: {str(e)}")
            
            logger.info(f"✅ Total atomic facts extracted: {len(atomic_facts)}")
            state["atomic_insights"] = atomic_facts
            logger.info("✅ STEP 3 COMPLETE: Atomic facts extracted")
            return state
        except Exception as e:
            logger.error(f"❌ STEP 3 FAILED: Error extracting atomic facts: {str(e)}")
            state["error"] = f"Error extracting atomic facts: {str(e)}"
            return state
    
    def _analyze_sentiment(self, state: SemanticState) -> SemanticState:
        """Analyze sentiment for each atomic insight using OpenRouter."""
        logger.info("")
        logger.info("=" * 80)
        logger.info("STEP 4️⃣  : ANALYZE SENTIMENT")
        logger.info("=" * 80)
        
        try:
            insights = state["atomic_insights"]
            logger.info(f"📊 Analyzing sentiment for {len(insights)} insights...")
            logger.info(f"🤖 Using model: {self.model_name}")
            
            system_prompt = """Analyze sentiment: positive, negative, or neutral.
Return valid JSON. Example: {"sentiment": "positive", "score": 0.8}"""
            
            sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
            
            for idx, insight in enumerate(insights, 1):
                logger.info(f"   ├─ Analyzing sentiment {idx}/{len(insights)}: {insight['text'][:40]}...")
                
                try:
                    message = HumanMessage(content=f"Sentiment of: {insight['text']}")
                    response = self.llm.invoke([
                        SystemMessage(content=system_prompt), 
                        message
                    ])
                    
                    sentiment_data = json.loads(response.content)
                    sentiment = sentiment_data.get("sentiment", "neutral")
                    insight["sentiment"] = sentiment
                    sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
                    logger.info(f"   │  ✅ Sentiment: {sentiment} (score: {sentiment_data.get('score', 0):.2f})")
                    
                except json.JSONDecodeError:
                    logger.warning(f"   │  ⚠️ Invalid JSON, using default: neutral")
                    insight["sentiment"] = "neutral"
                    sentiment_counts["neutral"] += 1
                except Exception as e:
                    logger.error(f"   │  ❌ Error analyzing sentiment: {str(e)}")
                    insight["sentiment"] = "neutral"
                    sentiment_counts["neutral"] += 1
            
            logger.info(f"✅ Sentiment breakdown:")
            logger.info(f"   ├─ Positive: {sentiment_counts['positive']}")
            logger.info(f"   ├─ Negative: {sentiment_counts['negative']}")
            logger.info(f"   └─ Neutral: {sentiment_counts['neutral']}")
            
            state["atomic_insights"] = insights
            logger.info("✅ STEP 4 COMPLETE: Sentiment analysis done")
            return state
        except Exception as e:
            logger.error(f"❌ STEP 4 FAILED: Error analyzing sentiment: {str(e)}")
            state["error"] = f"Error analyzing sentiment: {str(e)}"
            return state
    
    def _deduplicate_cluster(self, state: SemanticState) -> SemanticState:
        """Remove duplicates and cluster similar insights using OpenRouter."""
        logger.info("")
        logger.info("=" * 80)
        logger.info("STEP 5️⃣  : DEDUPLICATE & CLUSTER")
        logger.info("=" * 80)
        
        try:
            insights = state["atomic_insights"]
            logger.info(f"📊 Deduplicating and clustering {len(insights)} insights...")
            logger.info(f"🤖 Using model: {self.model_name}")
            
            system_prompt = """Compare these insights for duplication/similarity.
Return JSON with: {"duplicates": [indices], "clusters": [[related_indices]]}"""
            
            # Convert to JSON for LLM
            insights_text = json.dumps([
                {"idx": i, "text": insights[i]["text"]} 
                for i in range(len(insights))
            ])
            logger.info(f"   ├─ Sending {len(insights)} insights to deduplication...")
            
            try:
                message = HumanMessage(content=f"Find duplicates in: {insights_text}")
                response = self.llm.invoke([
                    SystemMessage(content=system_prompt), 
                    message
                ])
                
                dedup_data = json.loads(response.content)
                duplicates = set(dedup_data.get("duplicates", []))
                clusters = dedup_data.get("clusters", [])
                
                logger.info(f"   ✅ Duplicates found: {len(duplicates)}")
                logger.info(f"   ✅ Clusters found: {len(clusters)}")
                
                # Remove duplicates
                unique_insights = [i for idx, i in enumerate(insights) if idx not in duplicates]
                logger.info(f"   ✅ Insights after deduplication: {len(unique_insights)} (removed {len(duplicates)})")
                
                # Add cluster relationships
                for cluster_group in clusters:
                    logger.info(f"   ├─ Cluster with {len(cluster_group)} related insights")
                
                state["atomic_insights"] = unique_insights
            except json.JSONDecodeError:
                logger.warning(f"   ⚠️ Invalid JSON from LLM, skipping deduplication")
                state["atomic_insights"] = insights
            
            logger.info("✅ STEP 5 COMPLETE: Deduplication and clustering done")
            return state
        except Exception as e:
            logger.error(f"❌ STEP 5 FAILED: Error deduplicating: {str(e)}")
            state["error"] = f"Error deduplicating: {str(e)}"
            return state
    
    def _aggregate_results(self, state: SemanticState) -> SemanticState:
        """Aggregate and format final results."""
        logger.info("")
        logger.info("=" * 80)
        logger.info("STEP 6️⃣  : AGGREGATE RESULTS")
        logger.info("=" * 80)
        
        try:
            insights = state["atomic_insights"]
            logger.info(f"📊 Aggregating {len(insights)} insights...")
            
            # Convert to AtomicInsight objects
            atomic_insights = []
            insights_by_type = {}
            
            for insight in insights:
                try:
                    insight_type = InsightType[insight.get("type", "observation").upper()]
                except (KeyError, ValueError):
                    logger.warning(f"   ⚠️ Unknown insight type: {insight.get('type')}, defaulting to OBSERVATION")
                    insight_type = InsightType.OBSERVATION
                
                atomic_insight = AtomicInsight(
                    type=insight_type,
                    text=insight.get("text", ""),
                    confidence=float(insight.get("confidence", 0.9)),
                    source_sentence=insight.get("source_sentence", ""),
                    sentiment=insight.get("sentiment", "neutral")
                )
                atomic_insights.append(atomic_insight)
                
                # Count by type
                type_key = insight_type.value
                insights_by_type[type_key] = insights_by_type.get(type_key, 0) + 1
            
            logger.info(f"✅ Aggregation complete:")
            logger.info(f"   ├─ Total insights: {len(atomic_insights)}")
            logger.info(f"   └─ Breakdown by type:")
            for insight_type, count in sorted(insights_by_type.items()):
                logger.info(f"       ├─ {insight_type.upper()}: {count}")
            
            state["atomic_insights"] = atomic_insights
            state["insights_by_type"] = insights_by_type
            state["total_insights"] = len(atomic_insights)
            
            logger.info("✅ STEP 6 COMPLETE: Results aggregated successfully")
            return state
        except Exception as e:
            logger.error(f"❌ STEP 6 FAILED: Error aggregating results: {str(e)}")
            state["error"] = f"Error aggregating results: {str(e)}"
            return state
    
    def analyze(self, request: SemanticAnalysisRequest) -> SemanticAnalysisResponse:
        """
        Run semantic analysis on input text through the complete pipeline.
        
        Args:
            request: SemanticAnalysisRequest with text to analyze
        
        Returns:
            SemanticAnalysisResponse with extracted insights
        """
        logger.info("")
        logger.info("╔" + "═" * 78 + "╗")
        logger.info("║" + " " * 20 + "SEMANTIC ANALYSIS PIPELINE START" + " " * 26 + "║")
        logger.info("╚" + "═" * 78 + "╝")
        
        start_time = time.time()
        logger.info(f"⏱️  Start time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"📄 Input text length: {len(request.text)} characters")
        
        try:
            initial_state: SemanticState = {
                "input_text": request.text,
                "sentences": [],
                "raw_extractions": [],
                "atomic_insights": [],
                "insights_by_type": {},
                "total_insights": 0,
                "error": None,
            }
            
            logger.info("🔄 Running LangGraph workflow...")
            
            # Run the graph
            final_state = self.graph.invoke(initial_state)
            
            processing_time = time.time() - start_time
            
            if final_state.get("error"):
                logger.error(f"❌ Pipeline error: {final_state['error']}")
                logger.error(f"⏱️  Total processing time: {processing_time:.2f}s")
                logger.info("╔" + "═" * 78 + "╗")
                logger.info("║" + " " * 20 + "SEMANTIC ANALYSIS PIPELINE FAILED" + " " * 25 + "║")
                logger.info("╚" + "═" * 78 + "╝")
                
                return SemanticAnalysisResponse(
                    success=False,
                    error=final_state["error"],
                    processing_time=processing_time
                )
            
            extracted_content = ExtractedContent(
                original_text=request.text,
                atomic_insights=final_state["atomic_insights"],
                total_insights=final_state["total_insights"],
                insights_by_type=final_state["insights_by_type"]
            )
            
            logger.info("")
            logger.info("✅ PIPELINE COMPLETED SUCCESSFULLY")
            logger.info(f"   ├─ Total insights extracted: {final_state['total_insights']}")
            logger.info(f"   ├─ Processing time: {processing_time:.2f}s")
            logger.info(f"   └─ Model used: {self.model_name}")
            
            logger.info("╔" + "═" * 78 + "╗")
            logger.info("║" + " " * 22 + "SEMANTIC ANALYSIS PIPELINE SUCCESS" + " " * 22 + "║")
            logger.info("╚" + "═" * 78 + "╝")
            
            return SemanticAnalysisResponse(
                success=True,
                extracted_content=extracted_content,
                processing_time=processing_time
            )
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"❌ CRITICAL ERROR: {str(e)}")
            logger.error(f"⏱️  Total processing time: {processing_time:.2f}s")
            logger.info("╔" + "═" * 78 + "╗")
            logger.info("║" + " " * 20 + "SEMANTIC ANALYSIS PIPELINE CRASHED" + " " * 24 + "║")
            logger.info("╚" + "═" * 78 + "╝")
            
            return SemanticAnalysisResponse(
                success=False,
                error=f"Analysis failed: {str(e)}",
                processing_time=processing_time
            )
