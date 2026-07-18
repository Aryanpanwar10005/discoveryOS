// ============================================================================
// Shared domain types for DiscoveryOS
// These types define the exact shape every API response must match.
// Keep this file in sync with API_CONTRACTS.md.
// ============================================================================

export type ImpactLevel = "Low" | "Medium" | "High" | "Very High";
export type InsightType = "pain_point" | "feature_request" | "praise" | "question";
export type SourceType = "interview" | "survey" | "ticket" | "review" | "call";
export type AgentStatus = "active" | "idle" | "error" | "running";
export type PipelineStepStatus = "completed" | "in_progress" | "pending" | "failed";
export type ReportStatus = "ready" | "generating" | "failed" | "scheduled";

export interface User {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
}

export interface StatCard {
  id: string;
  label: string;
  value: number;
  helperText: string;
  delta: string;
  deltaTrend: "up" | "down" | "flat";
  icon: "research" | "insights" | "themes" | "opportunities" | "confidence";
  sparkline?: number[];
}

export interface PainPoint {
  id: string;
  label: string;
  mentions: number;
  maxMentions: number; // used to size the bar relative to the top item
}

export interface PainPointMatrixItem {
  id: string;
  label: string;
  impact: number; // 0-100, y axis
  frequency: number; // 0-100, x axis
  size: number; // bubble radius weight 0-100
  color: "red" | "orange" | "blue" | "purple" | "green";
}

export interface RecentInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  sourceLabel: string; // e.g. "Interview #12"
  timeAgo: string; // e.g. "2 min ago"
}

export interface Opportunity {
  id: string;
  rank: number;
  title: string;
  icon: "checkout" | "guest" | "delivery" | "payment" | "returns" | "generic";
  impact: ImpactLevel;
  confidence: number; // 0-100
  evidenceCount: number;
  description?: string;
  usersAffectedPct?: number;
  status?: "new" | "in_review" | "planned" | "shipped";
  createdAt?: string;
}

export interface SegmentSlice {
  id: string;
  label: string;
  pct: number;
  color: "purple" | "blue" | "green" | "orange" | "gray";
}

export interface EvidenceItem {
  id: string;
  sourceLabel: string;
  quote: string;
  sourceType: SourceType;
}

export interface AiRecommendation {
  id: string;
  title: string;
  impact: ImpactLevel;
  summary: string;
  confidence: number;
  usersAffectedPct: number;
  evidenceCount: number;
  topEvidence: EvidenceItem[];
}

export interface PipelineStep {
  id: string;
  order: number;
  name: string;
  status: PipelineStepStatus;
  detail: string;
}

export interface OverviewResponse {
  user: User;
  project: Project;
  sprintLabel: string;
  stats: StatCard[];
  topPainPoints: PainPoint[];
  painPointMatrix: PainPointMatrixItem[];
  recentInsights: RecentInsight[];
  topOpportunities: Opportunity[];
  insightsBySegment: {
    total: number;
    slices: SegmentSlice[];
  };
  aiRecommendation: AiRecommendation;
  agentPipeline: PipelineStep[];
}

export interface InsightRecord {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  sourceLabel: string;
  sourceType: SourceType;
  segment: string;
  theme: string;
  sentiment: "negative" | "neutral" | "positive";
  timeAgo: string;
  createdAt: string;
}

export interface InsightsResponse {
  total: number;
  filters: {
    types: InsightType[];
    themes: string[];
    segments: string[];
  };
  insights: InsightRecord[];
}

export interface OpportunitiesResponse {
  total: number;
  opportunities: Opportunity[];
}

export interface ReportRecord {
  id: string;
  title: string;
  summary: string;
  status: ReportStatus;
  createdAt: string;
  author: string;
  pages: number;
  format: "pdf" | "docx" | "web";
  tags: string[];
}

export interface ReportsResponse {
  total: number;
  reports: ReportRecord[];
}

export interface AgentRecord {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  description: string;
  lastRunAt: string;
  itemsProcessedLabel: string;
  successRate: number;
  avgRunTimeSeconds: number;
  icon: "ingestion" | "insight" | "theme" | "prioritization" | "report";
}

export interface AgentsResponse {
  total: number;
  agents: AgentRecord[];
  pipeline: PipelineStep[];
}
