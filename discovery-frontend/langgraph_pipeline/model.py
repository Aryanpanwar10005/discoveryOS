"""
Data models for semantic understanding of research insights.
Defines the structure for extracting atomic facts from text.
"""

from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class InsightType(str, Enum):
    """Types of atomic insights that can be extracted from text."""
    OBSERVATION = "observation"
    ISSUE = "issue"
    REQUEST = "request"
    COMPLAINT = "complaint"
    COMPLIMENT = "compliment"
    EVIDENCE = "evidence"
    EVENT = "event"
    RECOMMENDATION = "recommendation"
    QUESTION = "question"


class AtomicInsight(BaseModel):
    """Represents a single atomic fact extracted from text."""
    type: InsightType = Field(
        ...,
        description="The type/category of this atomic insight"
    )
    text: str = Field(
        ...,
        description="The extracted atomic insight text (single, focused idea)"
    )
    confidence: float = Field(
        default=0.9,
        ge=0.0,
        le=1.0,
        description="Confidence score for this extraction (0-1)"
    )
    source_sentence: str = Field(
        ...,
        description="The original sentence(s) this was extracted from"
    )
    related_insights: List[str] = Field(
        default_factory=list,
        description="IDs of related insights (if any)"
    )
    sentiment: Optional[str] = Field(
        default=None,
        description="Sentiment: positive, negative, or neutral"
    )


class ExtractedContent(BaseModel):
    """Complete extraction result from a piece of text."""
    original_text: str = Field(
        ...,
        description="The original input text"
    )
    atomic_insights: List[AtomicInsight] = Field(
        default_factory=list,
        description="List of extracted atomic insights"
    )
    total_insights: int = Field(
        default=0,
        description="Total number of atomic insights extracted"
    )
    insights_by_type: dict = Field(
        default_factory=dict,
        description="Count of insights grouped by type"
    )


class SemanticAnalysisRequest(BaseModel):
    """Request to perform semantic analysis on text."""
    text: str = Field(
        ...,
        description="The text to analyze"
    )
    document_id: Optional[str] = Field(
        default=None,
        description="Optional reference to source document"
    )
    user_id: Optional[str] = Field(
        default=None,
        description="Optional user identifier"
    )


class SemanticAnalysisResponse(BaseModel):
    """Response from semantic analysis."""
    success: bool
    extracted_content: Optional[ExtractedContent] = None
    error: Optional[str] = None
    processing_time: float = Field(
        default=0.0,
        description="Time taken to process in seconds"
    )
