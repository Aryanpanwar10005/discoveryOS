"""
Background worker for semantic analysis using Bull queue.
Processes uploads asynchronously without blocking the API.
"""

import json
import time
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


MIN_TEXT_LENGTH = 50  # Minimum characters for analysis


def analyze_text_background(text: str, document_id: str, user_id: str = None, model_type: str = "balanced") -> dict:
    """
    Analyze text in background with status tracking.
    
    Args:
        text: Text to analyze
        document_id: Document ID for tracking
        user_id: User ID
        model_type: Type of model ('balanced', 'primary', 'fast')
    
    Returns:
        Dictionary with results or error
    """
    logger.info("")
    logger.info("=" * 100)
    logger.info(f"🔄 BACKGROUND ANALYSIS STARTED - Document ID: {document_id}")
    logger.info("=" * 100)
    
    start_time = time.time()
    
    try:
        # Step 1: Validate text length
        logger.info(f"📊 Step 1/5: Validating input...")
        text_length = len(text.strip())
        logger.info(f"   ├─ Text length: {text_length} characters")
        
        if text_length < MIN_TEXT_LENGTH:
            error_msg = f"Insufficient data: Text too short ({text_length} chars, minimum {MIN_TEXT_LENGTH})"
            logger.warning(f"   ❌ {error_msg}")
            logger.info("=" * 100)
            
            return {
                "success": False,
                "error": error_msg,
                "status": "failed",
                "processing_time": time.time() - start_time,
                "document_id": document_id,
                "reason": "insufficient_data"
            }
        
        logger.info(f"   ✅ Text length valid")
        
        # Step 2: Import pipeline
        logger.info(f"📊 Step 2/5: Importing LangGraph pipeline...")
        try:
            from langgraph import (
                SemanticUnderstandingPipeline,
                SemanticAnalysisRequest,
            )
            logger.info(f"   ✅ Pipeline imported")
        except Exception as e:
            logger.error(f"   ❌ Failed to import pipeline: {e}")
            return {
                "success": False,
                "error": f"Pipeline import failed: {str(e)}",
                "status": "failed",
                "processing_time": time.time() - start_time,
                "document_id": document_id,
                "reason": "import_error"
            }
        
        # Step 3: Create request
        logger.info(f"📊 Step 3/5: Creating analysis request...")
        request = SemanticAnalysisRequest(
            text=text,
            document_id=document_id,
            user_id=user_id
        )
        logger.info(f"   ✅ Request created")
        
        # Step 4: Initialize pipeline
        logger.info(f"📊 Step 4/5: Initializing pipeline with model: {model_type}...")
        try:
            pipeline = SemanticUnderstandingPipeline(model_type=model_type)
            logger.info(f"   ✅ Pipeline initialized")
        except Exception as e:
            logger.error(f"   ❌ Failed to initialize pipeline: {e}")
            return {
                "success": False,
                "error": f"Pipeline initialization failed: {str(e)}",
                "status": "failed",
                "processing_time": time.time() - start_time,
                "document_id": document_id,
                "reason": "init_error"
            }
        
        # Step 5: Process
        logger.info(f"📊 Step 5/5: Running semantic analysis...")
        logger.info(f"   ├─ This may take 3-8 seconds...")
        
        response = pipeline.process_with_discovery_os_format(request)
        
        processing_time = time.time() - start_time
        
        if response.get("status") != "success":
            logger.error(f"   ❌ Analysis failed: {response.get('error')}")
            logger.info("=" * 100)
            
            return {
                "success": False,
                "error": response.get("error", "Unknown error"),
                "status": "failed",
                "processing_time": processing_time,
                "document_id": document_id,
                "reason": "analysis_error"
            }
        
        logger.info(f"   ✅ Analysis complete")
        logger.info(f"")
        logger.info(f"✅ BACKGROUND ANALYSIS SUCCESSFUL")
        logger.info(f"   ├─ Document ID: {document_id}")
        logger.info(f"   ├─ Total insights: {response.get('dashboard', {}).get('total_insights', 0)}")
        logger.info(f"   ├─ Processing time: {processing_time:.2f}s")
        logger.info(f"   └─ Status: complete")
        logger.info("=" * 100)
        
        # Add metadata
        response["document_id"] = document_id
        response["processing_time"] = processing_time
        response["status"] = "complete"
        response["success"] = True
        
        return response
        
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f"")
        logger.error(f"❌ CRITICAL ERROR IN BACKGROUND ANALYSIS")
        logger.error(f"   ├─ Document ID: {document_id}")
        logger.error(f"   ├─ Error: {str(e)}")
        logger.error(f"   └─ Processing time: {processing_time:.2f}s")
        logger.error("=" * 100)
        
        return {
            "success": False,
            "error": str(e),
            "status": "failed",
            "processing_time": processing_time,
            "document_id": document_id,
            "reason": "critical_error"
        }


if __name__ == "__main__":
    # Test the background worker
    test_text = """
    Users complained about the checkout process taking too long. 
    They mentioned it has too many steps and they want a simpler experience.
    Several users suggested adding a guest checkout option.
    The current flow requires creating an account which is frustrating.
    """
    
    result = analyze_text_background(test_text, "doc_test_001", model_type="balanced")
    print(json.dumps(result, indent=2))
