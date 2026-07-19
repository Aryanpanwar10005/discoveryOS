"""
Semantic Analysis Wrapper for OpenRouter API
Handles calling the semantic pipeline and returning formatted results
"""

import sys
import json
import time
import logging
from pathlib import Path

# Configure logging with more detail
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add parent directories to path for imports
python_dir = Path(__file__).parent
project_root = python_dir.parent
sys.path.insert(0, str(project_root))  # Add project root
sys.path.insert(0, str(python_dir))    # Add python dir

logger.info(f"Python path: {sys.path[:3]}")

try:
    from langgraph_pipeline import (
        SemanticUnderstandingPipeline,
        SemanticAnalysisRequest,
    )
    logger.info("✅ Successfully imported langgraph modules")
except ImportError as e:
    logger.error(f"❌ Failed to import langgraph: {e}")
    logger.error(f"   Python path: {sys.path}")
    raise


def analyze_text(text: str, document_id: str = None, user_id: str = None, model_type: str = "balanced") -> dict:
    """
    Analyze text using semantic pipeline with OpenRouter API.
    
    Args:
        text: Text to analyze
        document_id: ID of the document being analyzed
        user_id: ID of the user
        model_type: Type of model to use ('balanced', 'primary', 'fast')
    
    Returns:
        Dictionary with analysis results
    
    Example:
        result = analyze_text("Users complained about checkout", model_type="balanced")
    """
    logger.info("")
    logger.info("=" * 100)
    logger.info("🚀 SEMANTIC ANALYSIS WRAPPER STARTED")
    logger.info("=" * 100)
    
    start_time = time.time()
    
    try:
        logger.info(f"📝 Input Details:")
        logger.info(f"   ├─ Text length: {len(text)} characters")
        logger.info(f"   ├─ Document ID: {document_id}")
        logger.info(f"   ├─ User ID: {user_id}")
        logger.info(f"   └─ Model type: {model_type}")
        
        # Create request
        logger.info("")
        logger.info("📋 Creating SemanticAnalysisRequest...")
        request = SemanticAnalysisRequest(
            text=text,
            document_id=document_id,
            user_id=user_id
        )
        logger.info("✅ Request created successfully")
        
        # Initialize pipeline
        logger.info("")
        logger.info("🔧 Initializing SemanticUnderstandingPipeline...")
        pipeline = SemanticUnderstandingPipeline(model_type=model_type)
        logger.info("✅ Pipeline initialized successfully")
        
        # Process request
        logger.info("")
        logger.info("🔄 Processing request through pipeline...")
        logger.info(f"⏱️  Start processing: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        response = pipeline.process_with_discovery_os_format(request)

        response = response.model_dump()
        
        processing_time = time.time() - start_time
        
        logger.info("")
        logger.info(f"⏱️  Processing complete: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"⏱️  Total time: {processing_time:.2f}s")
        
        if not response.get("status") == "success":
            logger.error(f"❌ Pipeline returned non-success status: {response.get('status')}")
            logger.error(f"   Error: {response.get('error')}")
            return {
                "success": False,
                "error": f"Pipeline error: {response.get('error')}",
                "processing_time": processing_time
            }
        
        logger.info("")
        logger.info("✅ ANALYSIS SUCCESSFUL")
        logger.info(f"   ├─ Total insights: {response.get('dashboard', {}).get('total_insights', 0)}")
        logger.info(f"   ├─ Avg confidence: {response.get('dashboard', {}).get('avg_confidence', 0):.2f}")
        logger.info(f"   ├─ Processing time: {processing_time:.2f}s")
        logger.info(f"   └─ Model used: {response.get('metadata', {}).get('model_used', 'unknown')}")
        
        # Add processing time to response
        response["processing_time"] = processing_time
        
        logger.info("")
        logger.info("=" * 100)
        logger.info("✅ SEMANTIC ANALYSIS WRAPPER COMPLETE")
        logger.info("=" * 100)
        
        return response
        
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error("")
        logger.error("❌ CRITICAL ERROR IN SEMANTIC ANALYSIS")
        logger.error(f"   ├─ Error type: {type(e).__name__}")
        logger.error(f"   ├─ Error message: {str(e)}")
        logger.error(f"   ├─ Processing time before crash: {processing_time:.2f}s")
        logger.error(f"   └─ Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        logger.error("")
        logger.error("=" * 100)
        logger.error("❌ SEMANTIC ANALYSIS WRAPPER FAILED")
        logger.error("=" * 100)
        
        return {
            "success": False,
            "error": str(e),
            "processing_time": processing_time
        }


def main():
    """Main entry point for command-line execution."""
    logger.info("")
    logger.info("╔" + "═" * 98 + "╗")
    logger.info("║" + " " * 35 + "SEMANTIC ANALYSIS TOOL" + " " * 41 + "║")
    logger.info("╚" + "═" * 98 + "╝")
    
    if len(sys.argv) < 2:
        logger.error("❌ Usage: python semantic_analysis.py '<text>' [model_type]")
        logger.error("   Example: python semantic_analysis.py 'Users complained about checkout' balanced")
        sys.exit(1)
    
    text = sys.argv[1]
    model_type = sys.argv[2] if len(sys.argv) > 2 else "balanced"
    document_id = sys.argv[3] if len(sys.argv) > 3 else None
    
    logger.info("")
    logger.info(f"📥 Arguments received:")
    logger.info(f"   ├─ Text: {text[:60]}{'...' if len(text) > 60 else ''}")
    logger.info(f"   ├─ Model type: {model_type}")
    logger.info(f"   └─ Document ID: {document_id}")
    
    # Run analysis
    result = analyze_text(text, document_id=document_id, model_type=model_type)
    
    # Output JSON to stdout (important for Node.js parsing)
    logger.info("")
    logger.info("📤 Outputting results to stdout...")
    logger.info(f"Result = {result}")
    print(json.dumps(result, indent=2))
    
    logger.info("")
    if result.get("status") == "success":
        logger.info("✅ Results sent to stdout")
        sys.exit(0)
    else:
        logger.error("❌ Analysis failed, error in results")
        sys.exit(1)


if __name__ == "__main__":
    main()
