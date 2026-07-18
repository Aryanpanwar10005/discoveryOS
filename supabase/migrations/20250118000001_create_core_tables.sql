-- Migration: Create core DiscoveryOS domain tables
-- This migration creates the foundational tables for documents, evidence, insights, themes, opportunities, and reports.
-- Timestamp: 2025-01-18 00:00:01

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLE: workspaces
-- Description: Top-level organizational unit for multi-tenancy
-- ============================================================================
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  CONSTRAINT workspace_name_not_empty CHECK (TRIM(name) != '')
);

CREATE INDEX idx_workspaces_created_at ON workspaces(created_at);
CREATE INDEX idx_workspaces_archived_at ON workspaces(archived_at) WHERE archived_at IS NOT NULL;

-- ============================================================================
-- TABLE: documents
-- Description: Source documents uploaded or ingested into a workspace
-- Maps to: DocumentEntity from database/index.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(1024) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  source_type VARCHAR(50) NOT NULL,
  original_file_name VARCHAR(255),
  language VARCHAR(10) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  processing_status VARCHAR(50) NOT NULL DEFAULT 'QUEUED',
  file_hash VARCHAR(64) NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  CONSTRAINT doc_title_not_empty CHECK (TRIM(title) != ''),
  CONSTRAINT doc_content_not_empty CHECK (TRIM(content) != ''),
  CONSTRAINT doc_file_size_positive CHECK (file_size_bytes > 0),
  CONSTRAINT doc_chunk_count_nonnegative CHECK (chunk_count >= 0),
  CONSTRAINT doc_valid_status CHECK (status IN ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED', 'ARCHIVED')),
  CONSTRAINT doc_valid_processing_status CHECK (processing_status IN ('QUEUED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'PARTIAL'))
);

CREATE INDEX idx_documents_workspace_id ON documents(workspace_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_processing_status ON documents(processing_status);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_documents_archived_at ON documents(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX idx_documents_file_hash ON documents(file_hash);

-- ============================================================================
-- TABLE: evidence
-- Description: Evidence extracted from documents by the Research Analyst agent
-- Maps to: EvidenceEntity from database/index.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  excerpt VARCHAR(1024) NOT NULL,
  full_text TEXT NOT NULL,
  start_char_index INTEGER NOT NULL,
  end_char_index INTEGER NOT NULL,
  confidence_score NUMERIC(3, 2) NOT NULL,
  agent_id VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT evidence_excerpt_not_empty CHECK (TRIM(excerpt) != ''),
  CONSTRAINT evidence_full_text_not_empty CHECK (TRIM(full_text) != ''),
  CONSTRAINT evidence_valid_indices CHECK (start_char_index >= 0 AND end_char_index > start_char_index),
  CONSTRAINT evidence_valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1),
  CONSTRAINT evidence_valid_type CHECK (type IN ('PAIN_POINT', 'USER_QUOTE', 'COMPLAINT', 'REQUEST', 'BUG', 'WORKFLOW_PROBLEM', 'FEATURE_REQUEST', 'OTHER'))
);

CREATE INDEX idx_evidence_document_id ON evidence(document_id);
CREATE INDEX idx_evidence_type ON evidence(type);
CREATE INDEX idx_evidence_agent_id ON evidence(agent_id);
CREATE INDEX idx_evidence_confidence_score ON evidence(confidence_score);
CREATE INDEX idx_evidence_created_at ON evidence(created_at);

-- ============================================================================
-- TABLE: insights
-- Description: High-level synthesized insights derived from evidence
-- Maps to: InsightEntity from database/index.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  evidence_ids UUID[] NOT NULL DEFAULT '{}',
  confidence_score NUMERIC(3, 2) NOT NULL,
  agent_id VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT insight_title_not_empty CHECK (TRIM(title) != ''),
  CONSTRAINT insight_description_not_empty CHECK (TRIM(description) != ''),
  CONSTRAINT insight_evidence_ids_not_empty CHECK (ARRAY_LENGTH(evidence_ids, 1) >= 2),
  CONSTRAINT insight_valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

CREATE INDEX idx_insights_agent_id ON insights(agent_id);
CREATE INDEX idx_insights_confidence_score ON insights(confidence_score);
CREATE INDEX idx_insights_created_at ON insights(created_at);
CREATE INDEX idx_insights_evidence_ids ON insights USING GIN(evidence_ids);

-- ============================================================================
-- TABLE: themes
-- Description: Grouped insights organized by recurring patterns
-- Maps to: ThemeEntity from database/index.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  insight_ids UUID[] NOT NULL DEFAULT '{}',
  confidence_score NUMERIC(3, 2) NOT NULL,
  agent_id VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT theme_title_not_empty CHECK (TRIM(title) != ''),
  CONSTRAINT theme_description_not_empty CHECK (TRIM(description) != ''),
  CONSTRAINT theme_insight_ids_not_empty CHECK (ARRAY_LENGTH(insight_ids, 1) >= 2),
  CONSTRAINT theme_valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

CREATE INDEX idx_themes_agent_id ON themes(agent_id);
CREATE INDEX idx_themes_confidence_score ON themes(confidence_score);
CREATE INDEX idx_themes_created_at ON themes(created_at);
CREATE INDEX idx_themes_insight_ids ON themes USING GIN(insight_ids);

-- ============================================================================
-- TABLE: opportunities
-- Description: Prioritized product opportunities derived from themes
-- Maps to: OpportunityEntity from database/index.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  theme_ids UUID[] NOT NULL DEFAULT '{}',
  priority VARCHAR(50) NOT NULL,
  estimated_impact NUMERIC(3, 2) NOT NULL,
  estimated_effort NUMERIC(3, 2) NOT NULL,
  confidence_score NUMERIC(3, 2) NOT NULL,
  agent_id VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT opportunity_title_not_empty CHECK (TRIM(title) != ''),
  CONSTRAINT opportunity_description_not_empty CHECK (TRIM(description) != ''),
  CONSTRAINT opportunity_theme_ids_max CHECK (ARRAY_LENGTH(theme_ids, 1) <= 5),
  CONSTRAINT opportunity_valid_priority CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  CONSTRAINT opportunity_valid_impact CHECK (estimated_impact >= 0 AND estimated_impact <= 1),
  CONSTRAINT opportunity_valid_effort CHECK (estimated_effort >= 0 AND estimated_effort <= 1),
  CONSTRAINT opportunity_valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

CREATE INDEX idx_opportunities_priority ON opportunities(priority);
CREATE INDEX idx_opportunities_agent_id ON opportunities(agent_id);
CREATE INDEX idx_opportunities_confidence_score ON opportunities(confidence_score);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at);
CREATE INDEX idx_opportunities_theme_ids ON opportunities USING GIN(theme_ids);

-- ============================================================================
-- TABLE: reports
-- Description: Generated reports synthesizing opportunities for stakeholders
-- Maps to: ReportEntity from database/index.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  opportunity_ids UUID[] NOT NULL DEFAULT '{}',
  summary TEXT NOT NULL,
  agent_id VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT report_title_not_empty CHECK (TRIM(title) != ''),
  CONSTRAINT report_summary_not_empty CHECK (TRIM(summary) != ''),
  CONSTRAINT report_opportunity_ids_max CHECK (ARRAY_LENGTH(opportunity_ids, 1) <= 20)
);

CREATE INDEX idx_reports_workspace_id ON reports(workspace_id);
CREATE INDEX idx_reports_agent_id ON reports(agent_id);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_reports_opportunity_ids ON reports USING GIN(opportunity_ids);

-- ============================================================================
-- TABLE: relationships
-- Description: Directed relationships between any two entities
-- Enables graph-like traversal of the domain model
-- ============================================================================
CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL,
  target_id UUID NOT NULL,
  type VARCHAR(100) NOT NULL,
  strength NUMERIC(3, 2) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT relationship_valid_strength CHECK (strength >= 0 AND strength <= 1),
  CONSTRAINT relationship_different_ids CHECK (source_id != target_id)
);

CREATE INDEX idx_relationships_source_id ON relationships(source_id);
CREATE INDEX idx_relationships_target_id ON relationships(target_id);
CREATE INDEX idx_relationships_type ON relationships(type);
CREATE INDEX idx_relationships_strength ON relationships(strength);
CREATE INDEX idx_relationships_created_at ON relationships(created_at);
CREATE INDEX idx_relationships_source_target ON relationships(source_id, target_id);

-- ============================================================================
-- Audit trigger: auto-update updated_at timestamp
-- Applied to all tables with updated_at column
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON workspaces
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evidence_updated_at
BEFORE UPDATE ON evidence
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insights_updated_at
BEFORE UPDATE ON insights
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_themes_updated_at
BEFORE UPDATE ON themes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
BEFORE UPDATE ON opportunities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relationships_updated_at
BEFORE UPDATE ON relationships
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
