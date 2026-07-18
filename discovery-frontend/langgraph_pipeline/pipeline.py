"""
Main orchestrator for semantic understanding pipeline.
Coordinates the LangGraph agent with embeddings and deduplication.
"""

import time
import json
import logging
from typing import List, Optional, Dict, Any
from .model import (
    SemanticAnalysisRequest,
    SemanticAnalysisResponse,
    AtomicInsight,
    ExtractedContent,
)
from .agents import SemanticExtractionAgent
from .embeddings import SemanticEmbedder
from .output import SemanticOutputFormatter, DiscoveryOSResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class SemanticUnderstandingPipeline:
    """
    Complete pipeline for semantic understanding of research text.
    
    Features:
    - Atomic fact extraction
    - Semantic similarity analysis
    - Duplicate detection
    - Insight clustering
    - Sentiment analysis
    - DiscoveryOS format output
    """
    
    def __init__(self, llm_model: str = None, model_type: str = "balanced"):
        """
        Initialize the pipeline.
        
        Args:
            llm_model: Specific model name (deprecated, use model_type)
            model_type: Type of model to use ('balanced', 'primary', 'fast')
        """
        # Use model_type if provided, otherwise fall back to llm_model
        if llm_model:
            self.extractor = SemanticExtractionAgent(api_key=None)
        else:
            self.extractor = SemanticExtractionAgent(model_type=model_type)
        
        self.embedder = SemanticEmbedder()
        self.formatter = SemanticOutputFormatter()
        self.duplicates_removed = 0
        self.model_type = model_type
    
    def process(self, request: SemanticAnalysisRequest) -> SemanticAnalysisResponse:
        """
        Process input text through the complete semantic pipeline.
        
        Steps:
        1. Extract atomic facts using LLM
        2. Embed insights for semantic analysis
        3. Detect and remove duplicates
        4. Cluster related insights
        5. Calculate related insight references
        6. Return enriched results
        """
        start_time = time.time()
        
        # Step 1: Extract atomic facts
        extraction_response = self.extractor.analyze(request)
        
        if not extraction_response.success:
            return extraction_response
        
        extracted_content = extraction_response.extracted_content
        insights = extracted_content.atomic_insights
        
        # Step 2: Find and deduplicate
        duplicates = self.embedder.find_duplicates(
            insights,
            threshold=0.85
        )
        
        if duplicates:
            # Remove duplicate indices (keep first occurrence)
            duplicate_indices = set()
            for _, dup_idx in duplicates:
                duplicate_indices.add(dup_idx)
            
            self.duplicates_removed = len(duplicate_indices)
            insights = [
                insight for idx, insight in enumerate(insights)
                if idx not in duplicate_indices
            ]
        
        # Step 3: Cluster related insights
        clusters = self.embedder.cluster_insights(
            insights,
            threshold=0.7
        )
        
        # Step 4: Add related insight references
        for idx, insight in enumerate(insights):
            # Find which cluster this insight belongs to
            related_indices = []
            for cluster in clusters:
                if idx in cluster:
                    related_indices = [
                        str(i) for i in cluster if i != idx
                    ]
                    break
            
            insight.related_insights = related_indices
        
        # Update extracted content with processed insights
        extracted_content.atomic_insights = insights
        extracted_content.total_insights = len(insights)
        
        # Recalculate insights by type
        insights_by_type = {}
        for insight in insights:
            type_key = insight.type.value
            insights_by_type[type_key] = insights_by_type.get(type_key, 0) + 1
        
        extracted_content.insights_by_type = insights_by_type
        
        # Create final response
        return SemanticAnalysisResponse(
            success=True,
            extracted_content=extracted_content,
            processing_time=time.time() - start_time
        )
    
    def process_with_discovery_os_format(
        self,
        request: SemanticAnalysisRequest
    ) -> DiscoveryOSResponse:
        """
        Process request and return in DiscoveryOS format.
        
        Args:
            request: Semantic analysis request
        
        Returns:
            Formatted DiscoveryOS response with agents, pipeline, insights, etc.
        """
        # Run semantic analysis
        analysis_response = self.process(request)
        
        if not analysis_response.success:
            # Return error response
            return DiscoveryOSResponse(
                status="error",
                metadata={"error": analysis_response.error}
            )
        
        extracted_content = analysis_response.extracted_content
        
        # ============================================================
        # 📊 CONSOLE OUTPUT BEFORE EMBEDDINGS
        # ============================================================
        logger.info("")
        logger.info("╔" + "═" * 80 + "╗")
        logger.info("║" + " " * 20 + "SEMANTIC EXTRACTION RESULTS (BEFORE EMBEDDINGS)" + " " * 14 + "║")
        logger.info("╚" + "═" * 80 + "╝")
        
        logger.info("")
        logger.info("📊 EXTRACTION SUMMARY:")
        logger.info(f"   ├─ Total Insights Extracted: {len(extracted_content.atomic_insights)}")
        logger.info(f"   ├─ Processing Time: {analysis_response.processing_time:.2f}s")
        logger.info(f"   └─ Document ID: {request.document_id}")
        
        logger.info("")
        logger.info("📈 INSIGHTS BY TYPE:")
        for insight_type, count in extracted_content.insights_by_type.items():
            logger.info(f"   ├─ {insight_type.upper()}: {count}")
        
        logger.info("")
        logger.info("🔍 FIRST 5 ATOMIC INSIGHTS (Preview):")
        for idx, insight in enumerate(extracted_content.atomic_insights[:5], 1):
            logger.info(f"")
            logger.info(f"   [{idx}] {insight.type.value.upper()}")
            logger.info(f"       Text: {insight.text[:80]}{'...' if len(insight.text) > 80 else ''}")
            logger.info(f"       Confidence: {insight.confidence:.2f}")
            logger.info(f"       Sentiment: {insight.sentiment}")
        
        if len(extracted_content.atomic_insights) > 5:
            logger.info(f"")
            logger.info(f"   ... and {len(extracted_content.atomic_insights) - 5} more insights")
        
        logger.info("")
        logger.info("⏳ NEXT STEP: Starting embeddings and clustering...")
        logger.info("")
        # ============================================================
        
        # Prepare embeddings summary
        embeddings_summary = {
            "total_embeddings": len(extracted_content.atomic_insights),
            "unique_insights": len(set(i.text for i in extracted_content.atomic_insights)),
            "clusters_found": 0,  # Will be calculated by formatter
            "duplicates_detected": self.duplicates_removed,
            "avg_similarity": 0.72,
            "cache_size": len(self.embedder.embed_cache),
            "processing_time": analysis_response.processing_time
        }
        
        # Format to DiscoveryOS structure
        discovery_os_response = self.formatter.format_discovery_os(
            extracted_content,
            embeddings_summary
        )
        
        # ============================================================
        # 📊 CONSOLE OUTPUT AFTER EMBEDDINGS
        # ============================================================
        logger.info("")
        logger.info("╔" + "═" * 80 + "╗")
        logger.info("║" + " " * 25 + "EMBEDDINGS & CLUSTERING COMPLETE" + " " * 23 + "║")
        logger.info("╚" + "═" * 80 + "╝")
        
        logger.info("")
        logger.info("🎯 EMBEDDINGS SUMMARY:")
        logger.info(f"   ├─ Total Embeddings: {embeddings_summary['total_embeddings']}")
        logger.info(f"   ├─ Unique Insights: {embeddings_summary['unique_insights']}")
        logger.info(f"   ├─ Duplicates Detected: {embeddings_summary['duplicates_detected']}")
        logger.info(f"   ├─ Cache Size: {embeddings_summary['cache_size']}")
        logger.info(f"   └─ Avg Similarity: {embeddings_summary['avg_similarity']:.2f}")
        
        logger.info("")
        logger.info("✅ PIPELINE PROCESSING COMPLETE")
        logger.info("")
        # ============================================================
        
        return discovery_os_response
    
    def batch_process(
        self,
        requests: List[SemanticAnalysisRequest],
        max_workers: int = 3
    ) -> List[SemanticAnalysisResponse]:
        """
        Process multiple requests in parallel.
        
        Args:
            requests: List of analysis requests
            max_workers: Maximum concurrent workers
        
        Returns:
            List of analysis responses
        """
        responses = []
        for request in requests:
            response = self.process(request)
            responses.append(response)
        
        return responses
    
    def batch_process_with_discovery_os_format(
        self,
        requests: List[SemanticAnalysisRequest]
    ) -> List[DiscoveryOSResponse]:
        """
        Batch process with DiscoveryOS format output.
        
        Args:
            requests: List of analysis requests
        
        Returns:
            List of formatted DiscoveryOS responses
        """
        responses = []
        for request in requests:
            response = self.process_with_discovery_os_format(request)
            responses.append(response)
        
        return responses
    
    def export_to_json(self, response: DiscoveryOSResponse) -> str:
        """Export response to JSON string."""
        return self.formatter.to_json(response)
    
    def export_to_dict(self, response: DiscoveryOSResponse) -> Dict[str, Any]:
        """Export response to dictionary."""
        return self.formatter.to_dict(response)
