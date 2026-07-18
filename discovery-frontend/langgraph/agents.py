"""
LangGraph-based semantic extraction agent.
Extracts atomic facts from research text and builds semantic understanding.
"""

from typing import TypedDict, List, Optional, Annotated
import json
import time
from operator import add
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from model import (
    AtomicInsight,
    InsightType,
    ExtractedContent,
    SemanticAnalysisRequest,
    SemanticAnalysisResponse,
)


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
    LangGraph agent for extracting atomic facts from research text.
    
    Process:
    1. Sentence splitting
    2. Semantic analysis per sentence
    3. Atomic fact extraction
    4. Sentiment analysis
    5. Deduplication and clustering
    """
    
    def __init__(self, model_name: str = "gpt-4-turbo-preview"):
        """Initialize the semantic extraction agent."""
        self.llm = ChatOpenAI(model=model_name, temperature=0.3)
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow."""
        workflow = StateGraph(SemanticState)
        
        # Add nodes
        workflow.add_node("split_sentences", self._split_sentences)
        workflow.add_node("analyze_semantics", self._analyze_semantics)
        workflow.add_node("extract_atomic_facts", self._extract_atomic_facts)
        workflow.add_node("analyze_sentiment", self._analyze_sentiment)
        workflow.add_node("deduplicate_cluster", self._deduplicate_cluster)
        workflow.add_node("aggregate_results", self._aggregate_results)
        
        # Add edges
        workflow.add_edge(START, "split_sentences")
        workflow.add_edge("split_sentences", "analyze_semantics")
        workflow.add_edge("analyze_semantics", "extract_atomic_facts")
        workflow.add_edge("extract_atomic_facts", "analyze_sentiment")
        workflow.add_edge("analyze_sentiment", "deduplicate_cluster")
        workflow.add_edge("deduplicate_cluster", "aggregate_results")
        workflow.add_edge("aggregate_results", END)
        
        return workflow.compile()
    
    def _split_sentences(self, state: SemanticState) -> SemanticState:
        """Split input text into sentences."""
        try:
            text = state["input_text"]
            # Simple sentence splitting - can be improved with NLTK
            sentences = [s.strip() for s in text.split('.') if s.strip()]
            state["sentences"] = sentences
            return state
        except Exception as e:
            state["error"] = f"Error splitting sentences: {str(e)}"
            return state
    
    def _analyze_semantics(self, state: SemanticState) -> SemanticState:
        """Analyze semantic content of each sentence."""
        try:
            sentences = state["sentences"]
            system_prompt = """You are a semantic analysis expert. For each sentence, identify:
- The primary semantic type (observation, issue, request, complaint, compliment, evidence, event, recommendation, question)
- Key entities and relationships
- Sentiment (positive, negative, neutral)
- Confidence level (0.0-1.0)

Return valid JSON array. Example:
[{"sentence": "...", "type": "observation", "confidence": 0.95, "sentiment": "neutral"}]"""
            
            all_analyses = []
            for sentence in sentences:
                message = HumanMessage(content=f"Analyze this sentence: {sentence}")
                response = self.llm.invoke([SystemMessage(content=system_prompt), message])
                
                try:
                    analyses = json.loads(response.content)
                    all_analyses.extend(analyses)
                except json.JSONDecodeError:
                    # Fallback if LLM doesn't return valid JSON
                    all_analyses.append({
                        "sentence": sentence,
                        "type": "observation",
                        "confidence": 0.5,
                        "sentiment": "neutral"
                    })
            
            state["raw_extractions"] = all_analyses
            return state
        except Exception as e:
            state["error"] = f"Error analyzing semantics: {str(e)}"
            return state
    
    def _extract_atomic_facts(self, state: SemanticState) -> SemanticState:
        """Extract atomic facts from semantic analysis."""
        try:
            extractions = state["raw_extractions"]
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
            for extraction in extractions:
                fact_message = HumanMessage(
                    content=f"Extract atomic facts from: {extraction.get('sentence', '')}"
                )
                response = self.llm.invoke([SystemMessage(content=system_prompt), fact_message])
                
                try:
                    facts = json.loads(response.content)
                    for fact in facts:
                        atomic_facts.append({
                            "text": fact.get("fact", ""),
                            "type": fact.get("type", "observation"),
                            "source_sentence": extraction.get("sentence", ""),
                            "confidence": extraction.get("confidence", 0.9),
                            "sentiment": extraction.get("sentiment", "neutral")
                        })
                except json.JSONDecodeError:
                    atomic_facts.append({
                        "text": extraction.get("sentence", ""),
                        "type": extraction.get("type", "observation"),
                        "source_sentence": extraction.get("sentence", ""),
                        "confidence": extraction.get("confidence", 0.9),
                        "sentiment": extraction.get("sentiment", "neutral")
                    })
            
            state["atomic_insights"] = atomic_facts
            return state
        except Exception as e:
            state["error"] = f"Error extracting atomic facts: {str(e)}"
            return state
    
    def _analyze_sentiment(self, state: SemanticState) -> SemanticState:
        """Analyze sentiment for each atomic insight."""
        try:
            insights = state["atomic_insights"]
            system_prompt = """Analyze sentiment: positive, negative, or neutral.
Return valid JSON. Example: {"sentiment": "positive", "score": 0.8}"""
            
            for insight in insights:
                message = HumanMessage(content=f"Sentiment of: {insight['text']}")
                response = self.llm.invoke([SystemMessage(content=system_prompt), message])
                
                try:
                    sentiment_data = json.loads(response.content)
                    insight["sentiment"] = sentiment_data.get("sentiment", "neutral")
                except json.JSONDecodeError:
                    pass
            
            state["atomic_insights"] = insights
            return state
        except Exception as e:
            state["error"] = f"Error analyzing sentiment: {str(e)}"
            return state
    
    def _deduplicate_cluster(self, state: SemanticState) -> SemanticState:
        """Remove duplicates and cluster similar insights."""
        try:
            insights = state["atomic_insights"]
            system_prompt = """Compare these insights for duplication/similarity.
Return JSON with: {"duplicates": [indices], "clusters": [[related_indices]]}"""
            
            # Convert to JSON for LLM
            insights_text = json.dumps([{"idx": i, "text": i["text"]} for i, _ in enumerate(insights)])
            message = HumanMessage(content=f"Find duplicates in: {insights_text}")
            response = self.llm.invoke([SystemMessage(content=system_prompt), message])
            
            try:
                dedup_data = json.loads(response.content)
                # Remove duplicates
                duplicates = set(dedup_data.get("duplicates", []))
                unique_insights = [i for idx, i in enumerate(insights) if idx not in duplicates]
                state["atomic_insights"] = unique_insights
            except json.JSONDecodeError:
                state["atomic_insights"] = insights
            
            return state
        except Exception as e:
            state["error"] = f"Error deduplicating: {str(e)}"
            return state
    
    def _aggregate_results(self, state: SemanticState) -> SemanticState:
        """Aggregate and format final results."""
        try:
            insights = state["atomic_insights"]
            
            # Convert to AtomicInsight objects
            atomic_insights = []
            insights_by_type = {}
            
            for insight in insights:
                try:
                    insight_type = InsightType[insight.get("type", "observation").upper()]
                except (KeyError, ValueError):
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
            
            state["atomic_insights"] = atomic_insights
            state["insights_by_type"] = insights_by_type
            state["total_insights"] = len(atomic_insights)
            
            return state
        except Exception as e:
            state["error"] = f"Error aggregating results: {str(e)}"
            return state
    
    def analyze(self, request: SemanticAnalysisRequest) -> SemanticAnalysisResponse:
        """Run semantic analysis on input text."""
        start_time = time.time()
        
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
            
            # Run the graph
            final_state = self.graph.invoke(initial_state)
            
            if final_state.get("error"):
                return SemanticAnalysisResponse(
                    success=False,
                    error=final_state["error"],
                    processing_time=time.time() - start_time
                )
            
            extracted_content = ExtractedContent(
                original_text=request.text,
                atomic_insights=final_state["atomic_insights"],
                total_insights=final_state["total_insights"],
                insights_by_type=final_state["insights_by_type"]
            )
            
            return SemanticAnalysisResponse(
                success=True,
                extracted_content=extracted_content,
                processing_time=time.time() - start_time
            )
        except Exception as e:
            return SemanticAnalysisResponse(
                success=False,
                error=f"Analysis failed: {str(e)}",
                processing_time=time.time() - start_time
            )
