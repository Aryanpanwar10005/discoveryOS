# DiscoveryOS

**AI-powered Product Discovery Intelligence Platform**

A monorepo-based platform for discovering and analyzing product insights using advanced AI agents and document processing capabilities.

## Technology Stack

- **Monorepo**: [Turborepo](https://turbo.build)
- **Package Manager**: [pnpm](https://pnpm.io)
- **Runtime**: [Node.js 18+](https://nodejs.org)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Web Framework**: [Next.js 15](https://nextjs.org)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **AI**: [LangGraph](https://langchain-ai.github.io/langgraph)
- **Deployment**: [Vercel](https://vercel.com)
- **Document Processing**: Python

## Repository Architecture

```
discoveryos/
├── apps/
│   └── web/                 # Next.js application
├── packages/
│   ├── ai-engine/           # AI agents and orchestration
│   │   ├── agents/          # Agent implementations
│   │   ├── graph/           # LangGraph definitions
│   │   ├── prompts/         # LLM prompts
│   │   ├── tools/           # Agent tools
│   │   └── shared/          # Shared AI utilities
│   ├── ingestion/           # Document ingestion pipeline
│   └── core/                # Shared core library
│       ├── database/        # Database utilities
│       ├── schemas/         # Data schemas
│       ├── types/           # Type definitions
│       └── utils/           # General utilities
├── python/                  # Python services (document parsing)
├── supabase/                # Supabase migrations and config
├── docs/                    # Documentation
├── tests/                   # Integration tests
├── scripts/                 # Build and utility scripts
├── .github/                 # GitHub workflows
├── pnpm-workspace.yaml      # pnpm workspace config
├── turbo.json              # Turborepo config
├── tsconfig.json           # Shared TypeScript config
├── package.json            # Root package manifest
├── .env.example            # Environment variables template
├── .gitignore              # Git exclusions
└── README.md               # This file
```

## Installation

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **pnpm**: Version 9.0.0 or higher ([install globally](https://pnpm.io/installation))

### Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```
   Fill in the environment variables with your Supabase and OpenAI credentials.

3. **Verify workspace**:
   ```bash
   pnpm list -r
   ```

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all development servers in parallel |
| `pnpm build` | Build all packages and applications |
| `pnpm lint` | Run linters across the monorepo |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm format` | Format code with Prettier |
| `pnpm clean` | Remove build artifacts and node_modules |

### Running Specific Apps/Packages

```bash
# Run specific package
pnpm -F @discoveryos/web dev

# Run from package directory
cd apps/web && pnpm dev
```

## Workspace Structure

- **`apps/`**: Deployed applications (Next.js frontend)
- **`packages/`**: Shared libraries and core functionality
  - **`ai-engine`**: LangGraph-based AI agents and orchestration
  - **`ingestion`**: Document parsing and ingestion pipeline
  - **`core`**: Shared types, schemas, and utilities
- **`python/`**: Python services for document processing
- **`supabase/`**: Database schema and migrations
- **`scripts/`**: Build and deployment scripts

## Configuration Files

- **`package.json`**: Root manifest with workspace and shared scripts
- **`pnpm-workspace.yaml`**: pnpm workspace configuration
- **`turbo.json`**: Turborepo pipeline and caching rules
- **`tsconfig.json`**: Shared TypeScript compiler options
- **`.env.example`**: Environment variables template
- **`.gitignore`**: Git exclusions

## Contributing

1. Create a feature branch from `main`
2. Make changes in the relevant package(s)
3. Run `pnpm typecheck && pnpm lint && pnpm format` before committing
4. Push and open a pull request

## License

Proprietary — All rights reserved.
