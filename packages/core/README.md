# @discoveryos/core

Shared domain models, types, schemas, and utilities for the DiscoveryOS platform.

The Core package is the lowest dependency layer of the entire system. Every other package (Frontend, AI Engine, Ingestion, Parser) depends on Core. Core depends on nothing except approved third-party libraries.

## Purpose

Core provides:

- **Domain Models**: Document, Evidence, Insight, Theme, Opportunity, Report
- **Validation Schemas**: Zod-based validation for all models
- **Shared Types**: UUID, ISODate, Timestamp, SourceType, DocumentStatus, etc.
- **Database Contracts**: Implementation-independent entity interfaces
- **Utilities**: Pure helper functions for UUID, dates, validation, relationships
- **Constants**: Supported file types, MIME types, chunk sizes, thresholds
- **Enums**: DocumentStatus, EvidenceType, OpportunityPriority, AgentName, etc.

## Architecture

```
packages/core/
├── src/
│   ├── types/           # Shared types and type definitions
│   ├── schemas/         # Zod validation schemas
│   ├── models/          # Domain models (types derived from schemas)
│   ├── database/        # Entity interfaces and contracts
│   ├── constants/       # Reusable constants
│   ├── enums/           # Business enums
│   ├── utils/           # Pure utility functions
│   └── index.ts         # Public API exports
├── dist/                # Compiled JavaScript (built)
├── package.json
├── tsconfig.json
└── README.md
```

## Design Principles

**Lowest Layer**
- Core is at the bottom of the dependency graph
- Everything depends on Core
- Core depends only on approved third-party libraries (currently: zod)

**Domain-First Modeling**
- Models represent the business domain, not the database
- The database adapts to the domain, not the other way around
- Models are immutable where practical

**Traceability**
- Every Insight, Theme, Opportunity, and Report is traceable back to its originating Evidence and Document
- Relationships preserve the full audit trail

**Framework-Agnostic**
- No Next.js, Express, or React dependencies
- No Supabase client or ORM
- No AI frameworks or LLM libraries
- No filesystem, networking, or IO

**Pure Functions**
- Utilities have no side effects
- No async, no networking, no state mutations
- Utilities are reusable in any environment (frontend, backend, Python parser, agents)

## Usage

### Importing Domain Models

```typescript
import {
  Document,
  Evidence,
  Insight,
  Theme,
  Opportunity,
  Report,
} from "@discoveryos/core";
```

### Importing Schemas

```typescript
import {
  DocumentSchema,
  EvidenceSchema,
  InsightSchema,
  ThemeSchema,
  OpportunitySchema,
  ReportSchema,
} from "@discoveryos/core";

// Validate and parse
const document = DocumentSchema.parse(rawData);
```

### Importing Types

```typescript
import {
  UUID,
  ISODate,
  Timestamp,
  SourceType,
  DocumentStatus,
  ProcessingStatus,
  ConfidenceScore,
  Result,
} from "@discoveryos/core";
```

### Importing Constants

```typescript
import {
  SUPPORTED_FILE_TYPES,
  SUPPORTED_MIME_TYPES,
  MAX_UPLOAD_SIZE_MB,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_CHUNK_OVERLAP,
  SUPPORTED_LANGUAGES,
  CONFIDENCE_THRESHOLDS,
} from "@discoveryos/core";
```

### Importing Enums

```typescript
import {
  DocumentStatusEnum,
  EvidenceTypeEnum,
  OpportunityPriorityEnum,
  AgentNameEnum,
  SourceTypeEnum,
  ProcessingStatusEnum,
  LanguageEnum,
} from "@discoveryos/core";
```

### Importing Utilities

```typescript
import {
  generateUUID,
  formatISODate,
  getCurrentTimestamp,
  buildRelationship,
  calculateConfidenceScore,
  normalizeChunk,
} from "@discoveryos/core";
```

## Folder Responsibilities

### `types/`

Defines reusable type definitions used throughout the system:

- Primitive types: UUID, ISODate, Timestamp
- Status types: DocumentStatus, ProcessingStatus, ConfidenceScore
- Source types: SourceType, LanguageEnum
- Error types: ValidationError, ProcessingError, AnalysisError, AgentError
- Result types: Result<T>, SuccessResult<T>, FailureResult
- Relationship types: Relationship, RelationshipContext
- Metadata types: Metadata, ChunkMetadata, EmbeddingReference, AnalysisSummary

### `schemas/`

Zod validation schemas for all domain models:

- DocumentSchema: Validates document structure
- EvidenceSchema: Validates evidence extraction
- InsightSchema: Validates insight synthesis
- ThemeSchema: Validates theme grouping
- OpportunitySchema: Validates opportunity creation
- ReportSchema: Validates final report structure

Schemas are reusable by frontend validation, backend API validation, parser validation, and agent result validation.

### `models/`

Domain models derived from schemas. Each model includes:

- TypeScript interface
- Constructor/factory function
- Immutable data structure
- Business method if needed (rare)

### `database/`

Implementation-independent database contracts:

- Entity interfaces for each domain model
- Relationship definitions
- Shared table models
- No Supabase client, no SQL, no queries, no migrations

### `constants/`

Reusable constants referenced throughout the system:

- Supported file types and MIME types
- Upload and chunk size limits
- Supported languages
- Confidence score thresholds
- Default values
- Schema versions
- Application version

### `enums/`

Business enums that prevent magic strings:

- DocumentStatusEnum
- EvidenceTypeEnum
- OpportunityPriorityEnum
- AgentNameEnum
- SourceTypeEnum
- ProcessingStatusEnum
- LanguageEnum

### `utils/`

Pure utility functions with zero side effects:

- UUID generation (deterministic for testing)
- Date formatting and parsing
- Confidence score calculation
- Metadata helpers
- Relationship builders
- Chunk normalization
- Validation helpers

## Naming Conventions

**Models**
- PascalCase: `Document`, `Evidence`, `Insight`, `Theme`, `Opportunity`, `Report`

**Schemas**
- PascalCase + "Schema": `DocumentSchema`, `EvidenceSchema`

**Enums**
- PascalCase + "Enum": `DocumentStatusEnum`, `EvidenceTypeEnum`

**Constants**
- UPPER_SNAKE_CASE: `SUPPORTED_FILE_TYPES`, `MAX_UPLOAD_SIZE_MB`

**Utilities**
- camelCase: `generateUUID()`, `formatISODate()`, `buildRelationship()`

**Types**
- PascalCase: `UUID`, `ISODate`, `SourceType`, `Result<T>`

## Traceability Example

```typescript
// A Report preserves the full audit trail:
const report: Report = {
  id: generateUUID(),
  title: "Q4 Product Opportunities",
  opportunities: [
    {
      id: generateUUID(),
      title: "Improve Onboarding",
      themes: [
        {
          id: themeId,
          name: "Activation",
          insights: [
            {
              id: insightId,
              summary: "Users struggle to complete onboarding",
              evidence: [
                {
                  id: evidenceId,
                  type: EvidenceTypeEnum.USER_QUOTE,
                  content: "I gave up halfway through the onboarding",
                  documentId: originalDocumentId, // ← Traceable to source document
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Every element references back to its originating document
```

## Schema Reusability

Schemas are designed for reuse across the entire pipeline:

- **Frontend**: Validates user input, displays validation errors
- **Backend**: Validates API requests, ensures data integrity
- **Parser**: Validates parsed results before ingestion
- **Agents**: Validates LLM outputs before storing
- **Tests**: Generates valid test data

```typescript
// Parser generating evidence
const evidence = EvidenceSchema.parse({
  id: generateUUID(),
  type: EvidenceTypeEnum.PAIN_POINT,
  content: "Users cannot find the export button",
  documentId: docId,
  timestamp: getCurrentTimestamp(),
});

// API validation
app.post("/evidence", (req, res) => {
  const evidence = EvidenceSchema.parse(req.body);
  // ...
});

// Frontend validation
const result = EvidenceSchema.safeParse(formData);
if (!result.success) {
  displayErrors(result.error);
}
```

## Export Examples

All public exports are centralized in `src/index.ts`:

```typescript
// Domain Models
export type { Document, Evidence, Insight, Theme, Opportunity, Report };

// Schemas (for validation)
export { DocumentSchema, EvidenceSchema, InsightSchema, ThemeSchema, OpportunitySchema, ReportSchema };

// Types
export type { UUID, ISODate, Timestamp, SourceType, DocumentStatus, ProcessingStatus, ConfidenceScore };
export type { Result, SuccessResult, FailureResult };
export type { ValidationError, ProcessingError, AnalysisError, AgentError };
export type { Relationship, Metadata, ChunkMetadata, EmbeddingReference, AnalysisSummary };

// Enums
export { DocumentStatusEnum, EvidenceTypeEnum, OpportunityPriorityEnum, AgentNameEnum };
export { SourceTypeEnum, ProcessingStatusEnum, LanguageEnum };

// Constants
export {
  SUPPORTED_FILE_TYPES,
  SUPPORTED_MIME_TYPES,
  MAX_UPLOAD_SIZE_MB,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_CHUNK_OVERLAP,
  SUPPORTED_LANGUAGES,
  CONFIDENCE_THRESHOLDS,
  SCHEMA_VERSION,
  APP_VERSION,
};

// Utilities
export {
  generateUUID,
  formatISODate,
  parseISODate,
  getCurrentTimestamp,
  buildRelationship,
  calculateConfidenceScore,
  normalizeChunk,
  validateEmail,
};

// Database Contracts
export type { DocumentEntity, EvidenceEntity, InsightEntity, ThemeEntity, OpportunityEntity, ReportEntity };
```

## Integration Points

The Core package integrates with:

- **Frontend**: Form validation, type safety, constants
- **Backend/API**: Request/response validation, domain models
- **Ingestion Layer**: Validated document and evidence schemas
- **AI Engine**: Schemas for LLM inputs/outputs, result validation
- **Python Parser**: Validation schemas for parsed data
- **LangGraph**: Type definitions for agent state and transitions
- **Tests**: Schemas for test data generation

## TypeScript Strict Mode

All code follows TypeScript strict mode:

- No `any` types
- No implicit `any`
- No null/undefined without explicit handling
- Full type coverage

## No Circular Imports

The dependency graph is strictly one-way:

```
types/ (no imports)
  ↑
schemas/ (imports from types/)
database/ (imports from types/)
utils/ (imports from types/)
  ↑
index.ts (imports from all)
```

## Production Quality

This package:

- ✅ Builds successfully with zero warnings
- ✅ Has zero external framework dependencies
- ✅ Has zero AI dependencies
- ✅ Has zero Supabase dependencies
- ✅ Has zero frontend dependencies
- ✅ Exports all public models, schemas, types, enums, constants, and utilities
- ✅ Preserves full traceability across the product discovery pipeline
- ✅ Is ready for immediate consumption by all layers

## Build & Test

```bash
# Build
pnpm -F @discoveryos/core build

# Type check
pnpm -F @discoveryos/core typecheck

# Clean
pnpm -F @discoveryos/core clean
```
