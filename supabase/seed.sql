-- Seed data for local development and testing
-- This file is executed AFTER all migrations
-- Filename: seed.sql

-- ============================================================================
-- Insert test workspace
-- ============================================================================
INSERT INTO workspaces (id, name, description)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Demo Workspace',
  'Test workspace for development'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Insert test documents
-- ============================================================================
INSERT INTO documents (
  id,
  workspace_id,
  title,
  description,
  content,
  source_type,
  original_file_name,
  language,
  status,
  processing_status,
  file_hash,
  file_size_bytes,
  chunk_count
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440002'::UUID,
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Customer Support Tickets - Q4 2024',
  'Aggregated support tickets from Q4 2024',
  'Users report that search functionality is slow when filtering by date range. The UI freezes for 3-5 seconds. Multiple users have complained about this in support tickets. We should optimize the query performance.',
  'TXT',
  'support-q4-2024.txt',
  'en',
  'PROCESSED',
  'COMPLETED',
  'abc123def456',
  1024,
  2
),
(
  '550e8400-e29b-41d4-a716-446655440003'::UUID,
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'User Interview Notes - Q1 2025',
  'Raw notes from 10 user interviews',
  'Interview subject mentioned that they often export reports to CSV but the export feature is buggy. Sometimes columns are out of order. Also mentioned that the onboarding process could be smoother. Takes about 15 minutes to set up a workspace.',
  'MARKDOWN',
  'interviews-q1-2025.md',
  'en',
  'PROCESSED',
  'COMPLETED',
  'def789ghi012',
  2048,
  3
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Insert test evidence (extracted from documents)
-- ============================================================================
INSERT INTO evidence (
  id,
  document_id,
  type,
  excerpt,
  full_text,
  start_char_index,
  end_char_index,
  confidence_score,
  agent_id
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440004'::UUID,
  '550e8400-e29b-41d4-a716-446655440002'::UUID,
  'COMPLAINT',
  'search functionality is slow when filtering by date range',
  'Users report that search functionality is slow when filtering by date range. The UI freezes for 3-5 seconds.',
  29,
  158,
  0.92,
  'RESEARCH_ANALYST'
),
(
  '550e8400-e29b-41d4-a716-446655440005'::UUID,
  '550e8400-e29b-41d4-a716-446655440002'::UUID,
  'COMPLAINT',
  'UI freezes for 3-5 seconds',
  'The UI freezes for 3-5 seconds.',
  159,
  194,
  0.88,
  'RESEARCH_ANALYST'
),
(
  '550e8400-e29b-41d4-a716-446655440006'::UUID,
  '550e8400-e29b-41d4-a716-446655440003'::UUID,
  'BUG',
  'export feature is buggy. Sometimes columns are out of order',
  'they often export reports to CSV but the export feature is buggy. Sometimes columns are out of order.',
  50,
  150,
  0.85,
  'RESEARCH_ANALYST'
),
(
  '550e8400-e29b-41d4-a716-446655440007'::UUID,
  '550e8400-e29b-41d4-a716-446655440003'::UUID,
  'COMPLAINT',
  'onboarding process could be smoother',
  'Also mentioned that the onboarding process could be smoother. Takes about 15 minutes to set up a workspace.',
  175,
  275,
  0.79,
  'RESEARCH_ANALYST'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Insert test insights (synthesized from evidence)
-- ============================================================================
INSERT INTO insights (
  id,
  title,
  description,
  evidence_ids,
  confidence_score,
  agent_id
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440008'::UUID,
  'Search Performance Issues',
  'Users consistently report slow search performance, particularly when using date range filters. Response times of 3-5 seconds cause UI freezes and poor user experience.',
  ARRAY['550e8400-e29b-41d4-a716-446655440004'::UUID, '550e8400-e29b-41d4-a716-446655440005'::UUID],
  0.90,
  'INSIGHT_SYNTHESIZER'
),
(
  '550e8400-e29b-41d4-a716-446655440009'::UUID,
  'Onboarding Friction',
  'The workspace setup and onboarding process takes approximately 15 minutes, which is perceived as slow by users. This creates friction for new users during initial adoption.',
  ARRAY['550e8400-e29b-41d4-a716-446655440007'::UUID, '550e8400-e29b-41d4-a716-446655440006'::UUID],
  0.82,
  'INSIGHT_SYNTHESIZER'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Insert test themes (grouped insights)
-- ============================================================================
INSERT INTO themes (
  id,
  title,
  description,
  insight_ids,
  confidence_score,
  agent_id
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440010'::UUID,
  'Core Product Performance',
  'Critical performance issues affecting user experience in core workflows: search is too slow, and exports have data integrity problems.',
  ARRAY['550e8400-e29b-41d4-a716-446655440008'::UUID, '550e8400-e29b-41d4-a716-446655440009'::UUID],
  0.86,
  'THEME_GROUPER'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Insert test opportunities (prioritized from themes)
-- ============================================================================
INSERT INTO opportunities (
  id,
  title,
  description,
  theme_ids,
  priority,
  estimated_impact,
  estimated_effort,
  confidence_score,
  agent_id
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440011'::UUID,
  'Optimize Search Query Performance',
  'Reduce search latency by optimizing database queries and adding appropriate indexes. Target: sub-500ms response time for date range filters.',
  ARRAY['550e8400-e29b-41d4-a716-446655440010'::UUID],
  'HIGH',
  0.95,
  0.65,
  0.88,
  'OPPORTUNITY_STRATEGIST'
),
(
  '550e8400-e29b-41d4-a716-446655440012'::UUID,
  'Fix CSV Export Column Ordering',
  'Ensure CSV export maintains correct column order and data integrity. Investigate root cause of column reordering bug.',
  ARRAY['550e8400-e29b-41d4-a716-446655440010'::UUID],
  'MEDIUM',
  0.80,
  0.35,
  0.85,
  'OPPORTUNITY_STRATEGIST'
),
(
  '550e8400-e29b-41d4-a716-446655440013'::UUID,
  'Streamline Workspace Onboarding',
  'Reduce workspace setup time from 15 minutes to under 5 minutes. Consider guided wizard, pre-configured templates, or automated setup steps.',
  ARRAY['550e8400-e29b-41d4-a716-446655440010'::UUID],
  'MEDIUM',
  0.75,
  0.70,
  0.82,
  'OPPORTUNITY_STRATEGIST'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Insert test report
-- ============================================================================
INSERT INTO reports (
  id,
  workspace_id,
  title,
  description,
  opportunity_ids,
  summary,
  agent_id
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440014'::UUID,
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Q1 2025 Product Discovery Report',
  'Analysis of user feedback and support data from Q4 2024 through Q1 2025',
  ARRAY[
    '550e8400-e29b-41d4-a716-446655440011'::UUID,
    '550e8400-e29b-41d4-a716-446655440012'::UUID,
    '550e8400-e29b-41d4-a716-446655440013'::UUID
  ],
  'This report synthesizes user feedback and identifies three high-priority product opportunities: optimizing search performance, fixing CSV export bugs, and streamlining onboarding. These opportunities address core pain points affecting user productivity and adoption.',
  'PRODUCT_INTELLIGENCE_MANAGER'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Insert test relationships
-- ============================================================================
INSERT INTO relationships (
  id,
  source_id,
  target_id,
  type,
  strength
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440015'::UUID,
  '550e8400-e29b-41d4-a716-446655440008'::UUID,
  '550e8400-e29b-41d4-a716-446655440010'::UUID,
  'part_of_theme',
  0.95
),
(
  '550e8400-e29b-41d4-a716-446655440016'::UUID,
  '550e8400-e29b-41d4-a716-446655440010'::UUID,
  '550e8400-e29b-41d4-a716-446655440011'::UUID,
  'informs_opportunity',
  0.90
)
ON CONFLICT DO NOTHING;
