-- Migration: Create junction tables and enhanced relationships
-- This migration creates link tables for many-to-many relationships between entities
-- Timestamp: 2025-01-18 00:00:02

-- ============================================================================
-- TABLE: evidence_to_insight
-- Description: Junction table linking evidence items to insights
-- Replaces the simple UUID[] approach for better relational integrity
-- ============================================================================
CREATE TABLE IF NOT EXISTS evidence_to_insight (
  evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
  insight_id UUID NOT NULL REFERENCES insights(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (evidence_id, insight_id)
);

CREATE INDEX idx_evidence_to_insight_insight_id ON evidence_to_insight(insight_id);

-- ============================================================================
-- TABLE: insight_to_theme
-- Description: Junction table linking insights to themes
-- ============================================================================
CREATE TABLE IF NOT EXISTS insight_to_theme (
  insight_id UUID NOT NULL REFERENCES insights(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (insight_id, theme_id)
);

CREATE INDEX idx_insight_to_theme_theme_id ON insight_to_theme(theme_id);

-- ============================================================================
-- TABLE: theme_to_opportunity
-- Description: Junction table linking themes to opportunities
-- ============================================================================
CREATE TABLE IF NOT EXISTS theme_to_opportunity (
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (theme_id, opportunity_id)
);

CREATE INDEX idx_theme_to_opportunity_opportunity_id ON theme_to_opportunity(opportunity_id);

-- ============================================================================
-- TABLE: opportunity_to_report
-- Description: Junction table linking opportunities to reports
-- ============================================================================
CREATE TABLE IF NOT EXISTS opportunity_to_report (
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (opportunity_id, report_id)
);

CREATE INDEX idx_opportunity_to_report_report_id ON opportunity_to_report(report_id);

-- ============================================================================
-- TABLE: document_chunk
-- Description: Individual text chunks created by splitting documents
-- Enables efficient storage and retrieval of document segments
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  start_char_index INTEGER NOT NULL,
  end_char_index INTEGER NOT NULL,
  chunk_hash VARCHAR(64) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chunk_content_not_empty CHECK (TRIM(content) != ''),
  CONSTRAINT chunk_valid_indices CHECK (start_char_index >= 0 AND end_char_index > start_char_index)
);

CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_document_chunks_chunk_index ON document_chunks(document_id, chunk_index);
CREATE INDEX idx_document_chunks_hash ON document_chunks(chunk_hash);

-- ============================================================================
-- TABLE: entity_embeddings
-- Description: Vector embeddings for evidence, insights, and other entities
-- Stores references to embeddings in external vector store (Pinecone, Weaviate, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS entity_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  embedding_id VARCHAR(255) NOT NULL,
  model VARCHAR(100) NOT NULL,
  dimension INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT embedding_valid_entity_type CHECK (entity_type IN ('evidence', 'insight', 'theme', 'opportunity', 'document_chunk')),
  CONSTRAINT embedding_dimension_positive CHECK (dimension > 0)
);

CREATE INDEX idx_entity_embeddings_entity ON entity_embeddings(entity_type, entity_id);
CREATE INDEX idx_entity_embeddings_embedding_id ON entity_embeddings(embedding_id);
CREATE INDEX idx_entity_embeddings_model ON entity_embeddings(model);

-- ============================================================================
-- TABLE: processing_logs
-- Description: Audit trail for document and entity processing
-- Tracks when each entity was processed and by which agent
-- ============================================================================
CREATE TABLE IF NOT EXISTS processing_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  agent_id VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT processing_log_valid_status CHECK (status IN ('QUEUED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'PARTIAL'))
);

CREATE INDEX idx_processing_logs_entity ON processing_logs(entity_type, entity_id);
CREATE INDEX idx_processing_logs_agent_id ON processing_logs(agent_id);
CREATE INDEX idx_processing_logs_status ON processing_logs(status);
CREATE INDEX idx_processing_logs_created_at ON processing_logs(created_at);

-- ============================================================================
-- Update relationship table to add foreign key constraints where possible
-- Note: relationships are flexible and may reference any entity type
-- ============================================================================

-- Create function to validate relationship existence
CREATE OR REPLACE FUNCTION validate_relationship_targets()
RETURNS TRIGGER AS $$
BEGIN
  -- This function exists as a placeholder for custom validation logic
  -- In a real implementation, you might check that source_id and target_id
  -- actually exist in their respective entity tables
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: We intentionally do NOT create a trigger here because:
-- 1. Relationships can cross-reference any entity type
-- 2. Enforcing this at the database level would be over-complex
-- 3. Application logic should validate relationship integrity
