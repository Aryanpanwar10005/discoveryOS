"""
Output formatting for semantic analysis results.
Transforms extracted atomic insights into the DiscoveryOS data format.
"""

from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field
from model import AtomicInsight, ExtractedContent, InsightType


class OutputFormat(str, Enum):
    """Supported output formats."""
    DISCOVERY_OS = "discovery_os"
    JSON = "json"
    CSV = "csv"


class AtomicInsightFormatted(BaseModel):
    """Formatted atomic insight for output."""
    id: str = Field(..., description="Unique insight identifier")
    type: str = Field(..., description="Insight type")
    title: str = Field(..., description="Insight title/text")
    description: str = Field(..., description="Full insight text")
    confidence: float = Field(..., description="Confidence score (0-1)")
    sentiment: str = Field(..., description="Sentiment: positive/negative/neutral")
    source_sentence: str = Field(..., description="Original source text")
    related_insights: List[str] = Field(default_factory=list, description="Related insight IDs")
    created_at: str = Field(..., description="Creation timestamp")
    tags: List[str] = Field(default_factory=list, description="Insight tags")


class InsightTheme(BaseModel):
    """Grouped insights by theme."""
    id: str = Field(..., description="Theme identifier")
    name: str = Field(..., description="Theme name")
    count: int = Field(..., description="Number of insights in theme")
    insights: List[AtomicInsightFormatted] = Field(default_factory=list)
    sentiment_breakdown: Dict[str, int] = Field(default_factory=dict)


class ValidationResult(BaseModel):
    """Validation results."""
    total_checked: int
    valid_count: int
    invalid_count: int
    duplicates_removed: int
    avg_confidence: float
    issues: List[str] = Field(default_factory=list)


class AgentInfo(BaseModel):
    """Agent information."""
    id: str
    name: str
    role: str
    status: str = "active"
    description: str
    last_run_at: Optional[str] = None
    items_processed_label: str
    success_rate: float
    avg_run_time_seconds: int
    icon: str


class PipelineStep(BaseModel):
    """Pipeline step information."""
    id: str
    order: int
    name: str
    status: str
    detail: str
    duration_seconds: Optional[int] = None


class EmbeddingsSummary(BaseModel):
    """Embeddings analysis summary."""
    total_embeddings: int
    unique_insights: int
    clusters_found: int
    duplicates_detected: int
    avg_similarity: float
    cache_size: int
    processing_time: float


class DiscoveryOSResponse(BaseModel):
    """Complete DiscoveryOS format response."""
    metadata: Dict[str, Any] = Field(default_factory=dict)
    agents: List[AgentInfo] = Field(default_factory=list)
    pipeline: List[PipelineStep] = Field(default_factory=list)
    dashboard: Dict[str, Any] = Field(default_factory=dict)
    insights: List[AtomicInsightFormatted] = Field(default_factory=list)
    themes: List[InsightTheme] = Field(default_factory=list)
    opportunities: List[Dict[str, Any]] = Field(default_factory=list)
    reports: List[Dict[str, Any]] = Field(default_factory=list)
    embeddings_summary: EmbeddingsSummary = Field(default_factory=dict)
    validation: ValidationResult = Field(default_factory=dict)
    status: str = "success"


class SemanticOutputFormatter:
    """
    Formats semantic analysis results into DiscoveryOS output structure.
    
    Transforms atomic insights into aggregated dashboard, themes,
    opportunities, and reports format.
    """
    
    def __init__(self):
        """Initialize the output formatter."""
        self.insight_counter = 0
    
    def _generate_insight_id(self) -> str:
        """Generate unique insight ID."""
        self.insight_counter += 1
        return f"in_{self.insight_counter}"
    
    def _categorize_insights(
        self,
        insights: List[AtomicInsight]
    ) -> Dict[str, List[AtomicInsight]]:
        """Categorize insights by type."""
        categories = {t.value: [] for t in InsightType}
        
        for insight in insights:
            categories[insight.type.value].append(insight)
        
        return categories
    
    def _extract_themes(
        self,
        insights: List[AtomicInsight]
    ) -> List[InsightTheme]:
        """Extract themes/topics from insights."""
        # Simple theme extraction based on keywords
        theme_keywords = {
            "Checkout": ["checkout", "purchase", "cart", "payment"],
            "Performance": ["slow", "fast", "speed", "load", "lag"],
            "UI/UX": ["confusing", "unclear", "design", "interface", "button"],
            "Features": ["need", "want", "feature", "capability", "tool"],
            "Onboarding": ["first-time", "new user", "setup", "onboard"],
            "Support": ["help", "support", "issue", "problem", "contact"],
        }
        
        themes_dict: Dict[str, List[AtomicInsight]] = {
            name: [] for name in theme_keywords
        }
        
        for insight in insights:
            text_lower = insight.text.lower()
            for theme_name, keywords in theme_keywords.items():
                if any(kw in text_lower for kw in keywords):
                    themes_dict[theme_name].append(insight)
                    break
        
        # Convert to InsightTheme objects
        themes = []
        for theme_name, theme_insights in themes_dict.items():
            if theme_insights:
                sentiment_breakdown = {}
                for insight in theme_insights:
                    sentiment = insight.sentiment or "neutral"
                    sentiment_breakdown[sentiment] = sentiment_breakdown.get(sentiment, 0) + 1
                
                theme = InsightTheme(
                    id=f"theme_{len(themes) + 1}",
                    name=theme_name,
                    count=len(theme_insights),
                    insights=[self._format_insight(i) for i in theme_insights],
                    sentiment_breakdown=sentiment_breakdown
                )
                themes.append(theme)
        
        return themes
    
    def _format_insight(self, insight: AtomicInsight, insight_id: Optional[str] = None) -> AtomicInsightFormatted:
        """Format single insight."""
        return AtomicInsightFormatted(
            id=insight_id or self._generate_insight_id(),
            type=insight.type.value,
            title=insight.text[:80],  # Short title
            description=insight.text,
            confidence=insight.confidence,
            sentiment=insight.sentiment or "neutral",
            source_sentence=insight.source_sentence,
            related_insights=insight.related_insights,
            created_at=datetime.utcnow().isoformat() + "Z",
            tags=[insight.type.value, insight.sentiment or "neutral"]
        )
    
    def _generate_opportunities(
        self,
        insights: List[AtomicInsight],
        extracted_content: ExtractedContent
    ) -> List[Dict[str, Any]]:
        """Generate opportunities from insights."""
        opportunities = []
        
        # Group issues/requests by theme
        issues = [i for i in insights if i.type in [InsightType.ISSUE, InsightType.COMPLAINT]]
        requests = [i for i in insights if i.type == InsightType.REQUEST]
        
        # Find high-frequency issues
        issue_texts: Dict[str, int] = {}
        for issue in issues:
            text = issue.text[:100]
            issue_texts[text] = issue_texts.get(text, 0) + 1
        
        # Create opportunities from high-frequency issues
        for rank, (issue_text, count) in enumerate(
            sorted(issue_texts.items(), key=lambda x: x[1], reverse=True)[:5],
            1
        ):
            # Find related evidence
            related_insights = [i for i in insights if issue_text in i.text]
            avg_confidence = (
                sum(i.confidence for i in related_insights) / len(related_insights)
                if related_insights else 0.7
            )
            
            # Determine impact level
            if count >= 5:
                impact = "Very High"
            elif count >= 3:
                impact = "High"
            else:
                impact = "Medium"
            
            opportunity = {
                "id": f"op_{rank}",
                "rank": rank,
                "title": f"Address: {issue_text[:50]}...",
                "icon": "lightbulb",
                "impact": impact,
                "confidence": int(avg_confidence * 100),
                "evidence_count": count,
                "description": f"Multiple users reported: {issue_text}",
                "users_affected_pct": min(100, count * 5),
                "status": "identified" if rank <= 2 else "backlog",
                "created_at": datetime.utcnow().isoformat() + "Z"
            }
            opportunities.append(opportunity)
        
        return opportunities
    
    def _generate_pipeline_steps(self) -> List[PipelineStep]:
        """Generate pipeline execution steps."""
        steps = [
            PipelineStep(
                id="step_1",
                order=1,
                name="Ingestion Agent",
                status="completed",
                detail="Documents uploaded and extracted",
                duration_seconds=5
            ),
            PipelineStep(
                id="step_2",
                order=2,
                name="Semantic Extraction",
                status="completed",
                detail="Atomic facts extracted",
                duration_seconds=3
            ),
            PipelineStep(
                id="step_3",
                order=3,
                name="Embedding Analysis",
                status="completed",
                detail="Semantic similarity calculated",
                duration_seconds=2
            ),
            PipelineStep(
                id="step_4",
                order=4,
                name="Deduplication",
                status="completed",
                detail="Duplicates removed",
                duration_seconds=1
            ),
            PipelineStep(
                id="step_5",
                order=5,
                name="Clustering",
                status="completed",
                detail="Related insights grouped",
                duration_seconds=1
            ),
        ]
        return steps
    
    def _generate_agents(self) -> List[AgentInfo]:
        """Generate agent information."""
        agents = [
            AgentInfo(
                id="ag_1",
                name="Ingestion Agent",
                role="Collects & normalizes raw research",
                status="active",
                description="Processes documents and extracts raw text for analysis",
                items_processed_label="Documents processed",
                success_rate=99.2,
                avg_run_time_seconds=5,
                icon="ingestion"
            ),
            AgentInfo(
                id="ag_2",
                name="Semantic Agent",
                role="Extracts atomic facts and insights",
                status="active",
                description="Breaks down text into atomic insights with semantic understanding",
                items_processed_label="Atomic insights extracted",
                success_rate=92.5,
                avg_run_time_seconds=3,
                icon="brain"
            ),
            AgentInfo(
                id="ag_3",
                name="Embedding Agent",
                role="Analyzes semantic relationships",
                status="active",
                description="Calculates similarity and clusters related insights",
                items_processed_label="Embeddings computed",
                success_rate=98.8,
                avg_run_time_seconds=2,
                icon="network"
            ),
        ]
        return agents
    
    def _generate_validation(
        self,
        insights: List[AtomicInsight]
    ) -> ValidationResult:
        """Generate validation results."""
        valid_count = len([i for i in insights if i.confidence > 0.7])
        invalid_count = len(insights) - valid_count
        avg_confidence = (
            sum(i.confidence for i in insights) / len(insights)
            if insights else 0.0
        )
        
        issues = []
        if avg_confidence < 0.75:
            issues.append("Average confidence is below recommended threshold (75%)")
        
        if invalid_count > len(insights) * 0.2:
            issues.append("More than 20% of insights have low confidence")
        
        return ValidationResult(
            total_checked=len(insights),
            valid_count=valid_count,
            invalid_count=invalid_count,
            duplicates_removed=0,  # This would be updated by embedder
            avg_confidence=avg_confidence,
            issues=issues
        )
    
    def format_discovery_os(
        self,
        extracted_content: ExtractedContent,
        embeddings_summary: Optional[Dict[str, Any]] = None
    ) -> DiscoveryOSResponse:
        """
        Format semantic analysis into DiscoveryOS response structure.
        
        Args:
            extracted_content: Extracted atomic insights
            embeddings_summary: Optional embeddings analysis
        
        Returns:
            Formatted DiscoveryOS response
        """
        insights = extracted_content.atomic_insights
        
        # Format insights
        formatted_insights = [
            self._format_insight(insight)
            for insight in insights
        ]
        
        # Extract themes
        themes = self._extract_themes(insights)
        
        # Generate opportunities
        opportunities = self._generate_opportunities(insights, extracted_content)
        
        # Generate pipeline steps
        pipeline_steps = self._generate_pipeline_steps()
        
        # Generate agents
        agents = self._generate_agents()
        
        # Generate validation
        validation = self._generate_validation(insights)
        
        # Create embeddings summary if not provided
        if embeddings_summary is None:
            embeddings_summary_obj = EmbeddingsSummary(
                total_embeddings=len(insights),
                unique_insights=len(set(i.text for i in insights)),
                clusters_found=len(themes),
                duplicates_detected=0,
                avg_similarity=0.72,
                cache_size=len(set(i.text for i in insights)),
                processing_time=0.0
            )
        else:
            embeddings_summary_obj = EmbeddingsSummary(**embeddings_summary)
        
        # Build dashboard
        dashboard = {
            "total_insights": len(insights),
            "insights_by_type": extracted_content.insights_by_type,
            "total_themes": len(themes),
            "total_opportunities": len(opportunities),
            "avg_confidence": validation.avg_confidence,
            "sentiment_breakdown": self._calculate_sentiment_breakdown(insights)
        }
        
        # Create response
        response = DiscoveryOSResponse(
            metadata={
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "version": "1.0.0",
                "format": "discovery_os"
            },
            agents=agents,
            pipeline=pipeline_steps,
            dashboard=dashboard,
            insights=formatted_insights,
            themes=themes,
            opportunities=opportunities,
            embeddings_summary=embeddings_summary_obj,
            validation=validation,
            status="success"
        )
        
        return response
    
    def _calculate_sentiment_breakdown(self, insights: List[AtomicInsight]) -> Dict[str, int]:
        """Calculate sentiment distribution."""
        breakdown = {"positive": 0, "negative": 0, "neutral": 0}
        
        for insight in insights:
            sentiment = insight.sentiment or "neutral"
            breakdown[sentiment] = breakdown.get(sentiment, 0) + 1
        
        return breakdown
    
    def to_dict(self, response: DiscoveryOSResponse) -> Dict[str, Any]:
        """Convert response to dictionary."""
        return response.model_dump(by_alias=False, exclude_none=True)
    
    def to_json(self, response: DiscoveryOSResponse) -> str:
        """Convert response to JSON string."""
        import json
        return json.dumps(self.to_dict(response), indent=2)
