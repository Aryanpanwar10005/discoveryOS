"""
Semantic Analysis Wrapper
Handles calling the semantic pipeline and returning formatted results
"""

import sys
import json
import time
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from langgraph import (
    SemanticUnderstandingPipeline,
    SemanticAnalysisRequest,
)


def analyze_text(text: str, document_id: str = None, user_id: str = None) -> dict:
    """
    Analyze text and return DiscoveryOS formatted results.
    
    Args:
        text: Raw text to analyze
        document_id: Optional document reference
        user_id: Optional user reference
    
    Returns:
        dict: {
            "success": bool,
            "data": DiscoveryOSResponse (as dict),
            "error": str or None,
            "processing_time": float
        }
    """
    try:
        start_time = time.time()
        
        # Initialize pipeline
        pipeline = SemanticUnderstandingPipeline(
            llm_model="gpt-4-turbo-preview"
        )
        
        # Create request
        request = SemanticAnalysisRequest(
            text=text,
            document_id=document_id,
            user_id=user_id
        )
        
        # Process
        response = pipeline.process_with_discovery_os_format(request)
        
        # Convert to dict for JSON serialization
        response_dict = pipeline.export_to_dict(response)
        
        processing_time = time.time() - start_time
        
        return {
            "success": response.status == "success",
            "data": response_dict,
            "error": None,
            "processing_time": processing_time
        }
    
    except Exception as e:
        return {
            "success": False,
            "data": None,
            "error": str(e),
            "processing_time": time.time() - start_time
        }


def main():
    """
    Main entry point for command-line invocation.
    
    Usage:
        python semantic_analysis.py <text> [document_id] [user_id]
    
    Output:
        JSON to stdout
    """
    if len(sys.argv) < 2:
        error_response = {
            "success": False,
            "data": None,
            "error": "Missing required argument: text",
            "processing_time": 0
        }
        print(json.dumps(error_response))
        sys.exit(1)
    
    text = sys.argv[1]
    document_id = sys.argv[2] if len(sys.argv) > 2 else None
    user_id = sys.argv[3] if len(sys.argv) > 3 else None
    
    result = analyze_text(text, document_id, user_id)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
