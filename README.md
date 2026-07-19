# Discovery

A monorepo for intelligent document processing and knowledge graph generation.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, TypeScript
- **Parser**: Python (extract.py, pdf.py, docx_extract.py)
- **Database**: Supabase (PostgreSQL with RLS)
- **Package Management**: pnpm

## Project Structure

- `discovery-frontend/` — Next.js frontend application
- `packages/core/` — Shared TypeScript utilities, types, schemas
- `supabase/` — Database migrations and seed data
- `python/` — Reserved; parser lives in `discovery-frontend/python/`

## Setup

```bash
pnpm install
pnpm build
pnpm dev
```

Copy `.env.example` to `.env` and add your `GEMINI_API_KEY` (get from https://ai.google.dev/api/rest).

See individual folder READMEs for detailed setup per service.
