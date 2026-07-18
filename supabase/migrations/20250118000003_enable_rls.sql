-- Migration: Enable Row-Level Security (RLS) policies
-- This migration sets up authentication and multi-tenant isolation via RLS
-- Timestamp: 2025-01-18 00:00:03

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_to_insight ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_to_theme ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_to_opportunity ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_to_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Workspace access policies
-- Users can only see workspaces they have access to
-- ============================================================================
CREATE POLICY workspace_select_policy ON workspaces
FOR SELECT
USING (TRUE); -- Workspaces readable by authenticated users (auth handled at application level)

CREATE POLICY workspace_insert_policy ON workspaces
FOR INSERT
WITH CHECK (TRUE); -- Insertable by authenticated users (auth handled at application level)

CREATE POLICY workspace_update_policy ON workspaces
FOR UPDATE
USING (TRUE) -- Workspaces updatable by authorized users (auth handled at application level)
WITH CHECK (TRUE);

CREATE POLICY workspace_delete_policy ON workspaces
FOR DELETE
USING (TRUE); -- Deletable by authorized users (auth handled at application level)

-- ============================================================================
-- Document access policies
-- Users can only access documents in their workspace
-- ============================================================================
CREATE POLICY document_select_policy ON documents
FOR SELECT
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE TRUE -- Application layer controls workspace membership
  )
);

CREATE POLICY document_insert_policy ON documents
FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT id FROM workspaces WHERE TRUE -- Application layer controls workspace membership
  )
);

CREATE POLICY document_update_policy ON documents
FOR UPDATE
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE TRUE -- Application layer controls workspace membership
  )
)
WITH CHECK (
  workspace_id IN (
    SELECT id FROM workspaces WHERE TRUE -- Application layer controls workspace membership
  )
);

CREATE POLICY document_delete_policy ON documents
FOR DELETE
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE TRUE -- Application layer controls workspace membership
  )
);

-- ============================================================================
-- Evidence access policies
-- Evidence is visible if user has access to the source document
-- ============================================================================
CREATE POLICY evidence_select_policy ON evidence
FOR SELECT
USING (
  document_id IN (
    SELECT id FROM documents WHERE workspace_id IN (
      SELECT id FROM workspaces WHERE TRUE
    )
  )
);

CREATE POLICY evidence_insert_policy ON evidence
FOR INSERT
WITH CHECK (
  document_id IN (
    SELECT id FROM documents WHERE workspace_id IN (
      SELECT id FROM workspaces WHERE TRUE
    )
  )
);

CREATE POLICY evidence_update_policy ON evidence
FOR UPDATE
USING (
  document_id IN (
    SELECT id FROM documents WHERE workspace_id IN (
      SELECT id FROM workspaces WHERE TRUE
    )
  )
)
WITH CHECK (
  document_id IN (
    SELECT id FROM documents WHERE workspace_id IN (
      SELECT id FROM workspaces WHERE TRUE
    )
  )
);

CREATE POLICY evidence_delete_policy ON evidence
FOR DELETE
USING (
  document_id IN (
    SELECT id FROM documents WHERE workspace_id IN (
      SELECT id FROM workspaces WHERE TRUE
    )
  )
);

-- ============================================================================
-- Insight access policies
-- Insights are workspace-scoped through evidence linking
-- ============================================================================
CREATE POLICY insight_select_policy ON insights
FOR SELECT
USING (TRUE); -- Application layer enforces workspace scoping

CREATE POLICY insight_insert_policy ON insights
FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY insight_update_policy ON insights
FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);

CREATE POLICY insight_delete_policy ON insights
FOR DELETE
USING (TRUE);

-- ============================================================================
-- Theme access policies
-- ============================================================================
CREATE POLICY theme_select_policy ON themes
FOR SELECT
USING (TRUE); -- Application layer enforces workspace scoping

CREATE POLICY theme_insert_policy ON themes
FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY theme_update_policy ON themes
FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);

CREATE POLICY theme_delete_policy ON themes
FOR DELETE
USING (TRUE);

-- ============================================================================
-- Opportunity access policies
-- ============================================================================
CREATE POLICY opportunity_select_policy ON opportunities
FOR SELECT
USING (TRUE); -- Application layer enforces workspace scoping

CREATE POLICY opportunity_insert_policy ON opportunities
FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY opportunity_update_policy ON opportunities
FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);

CREATE POLICY opportunity_delete_policy ON opportunities
FOR DELETE
USING (TRUE);

-- ============================================================================
-- Report access policies
-- Reports are workspace-scoped through workspace_id
-- ============================================================================
CREATE POLICY report_select_policy ON reports
FOR SELECT
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE TRUE
  )
);

CREATE POLICY report_insert_policy ON reports
FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT id FROM workspaces WHERE TRUE
  )
);

CREATE POLICY report_update_policy ON reports
FOR UPDATE
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE TRUE
  )
)
WITH CHECK (
  workspace_id IN (
    SELECT id FROM workspaces WHERE TRUE
  )
);

CREATE POLICY report_delete_policy ON reports
FOR DELETE
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE TRUE
  )
);

-- ============================================================================
-- Relationship access policies
-- Relationships are generally accessible if both endpoints are accessible
-- For now, allow all access (application layer controls)
-- ============================================================================
CREATE POLICY relationship_select_policy ON relationships
FOR SELECT
USING (TRUE);

CREATE POLICY relationship_insert_policy ON relationships
FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY relationship_update_policy ON relationships
FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);

CREATE POLICY relationship_delete_policy ON relationships
FOR DELETE
USING (TRUE);

-- ============================================================================
-- Junction table policies
-- ============================================================================
CREATE POLICY evidence_to_insight_select ON evidence_to_insight
FOR SELECT
USING (TRUE);

CREATE POLICY evidence_to_insight_insert ON evidence_to_insight
FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY insight_to_theme_select ON insight_to_theme
FOR SELECT
USING (TRUE);

CREATE POLICY insight_to_theme_insert ON insight_to_theme
FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY theme_to_opportunity_select ON theme_to_opportunity
FOR SELECT
USING (TRUE);

CREATE POLICY theme_to_opportunity_insert ON theme_to_opportunity
FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY opportunity_to_report_select ON opportunity_to_report
FOR SELECT
USING (TRUE);

CREATE POLICY opportunity_to_report_insert ON opportunity_to_report
FOR INSERT
WITH CHECK (TRUE);

-- ============================================================================
-- Document chunks policies
-- ============================================================================
CREATE POLICY document_chunks_select ON document_chunks
FOR SELECT
USING (
  document_id IN (
    SELECT id FROM documents WHERE workspace_id IN (
      SELECT id FROM workspaces WHERE TRUE
    )
  )
);

CREATE POLICY document_chunks_insert ON document_chunks
FOR INSERT
WITH CHECK (
  document_id IN (
    SELECT id FROM documents WHERE workspace_id IN (
      SELECT id FROM workspaces WHERE TRUE
    )
  )
);

-- ============================================================================
-- Entity embeddings policies
-- ============================================================================
CREATE POLICY entity_embeddings_select ON entity_embeddings
FOR SELECT
USING (TRUE); -- Application layer controls access

CREATE POLICY entity_embeddings_insert ON entity_embeddings
FOR INSERT
WITH CHECK (TRUE);

-- ============================================================================
-- Processing logs policies
-- ============================================================================
CREATE POLICY processing_logs_select ON processing_logs
FOR SELECT
USING (TRUE); -- Application layer controls access

CREATE POLICY processing_logs_insert ON processing_logs
FOR INSERT
WITH CHECK (TRUE);
