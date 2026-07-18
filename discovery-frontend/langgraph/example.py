"""
Example usage of the semantic understanding pipeline.
Demonstrates how to use the LangGraph semantic extraction system.
"""

import json
from langgraph import (
    SemanticUnderstandingPipeline,
    SemanticAnalysisRequest,
)


def example_basic_usage():
    """Example of basic semantic analysis."""
    
    # Initialize the pipeline
    pipeline = SemanticUnderstandingPipeline(
        llm_model="gpt-4-turbo-preview"
    )
    
    # Example research text
    research_text = """
    The users are frustrated with the slow loading time and report that pages take 
    over 10 seconds to load. They requested a performance improvement feature. 
    We observed this issue in multiple user sessions. A beta tester complained about 
    the memory usage being too high. However, one user complimented the clean UI design. 
    Evidence from analytics shows 40% bounce rate on slow pages. We need to implement 
    caching and lazy loading. Is the issue related to the backend database queries?
    """
    
    # Create analysis request
    request = SemanticAnalysisRequest(
        text=research_text,
        document_id="doc_001",
        user_id="user_123"
    )
    
    # Process through pipeline
    response = pipeline.process(request)
    
    if response.success:
        content = response.extracted_content
        
        print("=" * 60)
        print("SEMANTIC ANALYSIS RESULTS")
        print("=" * 60)
        print(f"\nTotal Atomic Insights: {content.total_insights}")
        print(f"Processing Time: {response.processing_time:.2f}s")
        
        print("\nInsights by Type:")
        for insight_type, count in content.insights_by_type.items():
            print(f"  - {insight_type}: {count}")
        
        print("\nExtracted Atomic Insights:")
        print("-" * 60)
        for idx, insight in enumerate(content.atomic_insights, 1):
            print(f"\n{idx}. [{insight.type.value.upper()}]")
            print(f"   Text: {insight.text}")
            print(f"   Confidence: {insight.confidence:.2%}")
            print(f"   Sentiment: {insight.sentiment}")
            if insight.related_insights:
                print(f"   Related: {', '.join(insight.related_insights)}")
            print(f"   Source: {insight.source_sentence[:60]}...")
    else:
        print(f"Error: {response.error}")


def example_discovery_os_format():
    """Example of DiscoveryOS format output."""
    
    pipeline = SemanticUnderstandingPipeline()
    
    research_text = """
    Users struggle with the checkout process - too many steps. They want guest checkout.
    We've seen 40% cart abandonment. The issue is critical for conversions.
    Customers compliment the product quality and fast shipping.
    We need to simplify checkout and add guest option.
    Evidence: 132 user interviews mention checkout friction.
    """
    
    request = SemanticAnalysisRequest(
        text=research_text,
        document_id="doc_checkout_001"
    )
    
    # Get DiscoveryOS format
    discovery_response = pipeline.process_with_discovery_os_format(request)
    
    print("\n" + "=" * 60)
    print("DISCOVERY OS FORMAT OUTPUT")
    print("=" * 60)
    
    # Print as pretty JSON
    response_dict = pipeline.export_to_dict(discovery_response)
    print(json.dumps(response_dict, indent=2))
    
    # Print summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Status: {discovery_response.status}")
    print(f"Total Insights: {len(discovery_response.insights)}")
    print(f"Total Themes: {len(discovery_response.themes)}")
    print(f"Total Opportunities: {len(discovery_response.opportunities)}")
    print(f"Agents: {len(discovery_response.agents)}")
    print(f"Pipeline Steps: {len(discovery_response.pipeline)}")
    print(f"Average Confidence: {discovery_response.validation.avg_confidence:.2%}")


def batch_example():
    """Example of batch processing multiple documents."""
    
    pipeline = SemanticUnderstandingPipeline()
    
    documents = [
        """
        The checkout process is confusing. Users complained about too many steps. 
        We need to simplify the flow. Evidence shows 30% cart abandonment rate.
        """,
        """
        Users love the new dark mode feature. They complimented the performance improvement.
        The app now loads 50% faster. One user requested an auto-save feature.
        """,
    ]
    
    requests = [
        SemanticAnalysisRequest(text=doc, document_id=f"doc_{i}")
        for i, doc in enumerate(documents)
    ]
    
    responses = pipeline.batch_process(requests)
    
    for i, response in enumerate(responses):
        print(f"\n\nDocument {i + 1}:")
        if response.success:
            print(f"  Total insights: {response.extracted_content.total_insights}")
            print(f"  Processing time: {response.processing_time:.2f}s")
        else:
            print(f"  Error: {response.error}")


def export_json_example():
    """Example of exporting to JSON."""
    
    pipeline = SemanticUnderstandingPipeline()
    
    research_text = """
    The app is too slow. Users want faster loading. We observed 50% drop-off rate.
    Customers compliment the UI. We need better caching. Is it a backend issue?
    """
    
    request = SemanticAnalysisRequest(text=research_text)
    discovery_response = pipeline.process_with_discovery_os_format(request)
    
    # Export to JSON
    json_output = pipeline.export_to_json(discovery_response)
    
    print("\n" + "=" * 60)
    print("JSON EXPORT")
    print("=" * 60)
    print(json_output)


if __name__ == "__main__":
    print("Running semantic understanding pipeline examples...\n")
    
    # Run examples
    print("\n\n>>> EXAMPLE 1: Basic Usage")
    example_basic_usage()
    
    print("\n\n>>> EXAMPLE 2: DiscoveryOS Format")
    example_discovery_os_format()
    
    print("\n\n>>> EXAMPLE 3: Batch Processing")
    batch_example()
    
    print("\n\n>>> EXAMPLE 4: JSON Export")
    export_json_example()

