# DiscoveryOS

Product teams collect a lot of raw research: interview notes, survey exports, support tickets, reports. Turning that into a short list of problems worth solving is slow manual synthesis. Someone has to read everything, tag it, group it and count how often each problem comes up. DiscoveryOS automates that first pass. You upload a document and get back individual insights tagged by type and sentiment, grouped into themes. The most repeated complaints are pulled out as candidate opportunities, i.e. what to look at next.

## What it does today

- **Upload research files.** The web app accepts PDF, DOCX, TXT and CSV files and keeps an upload history.
- **Extract the text.** Python scripts read each format: PyMuPDF for PDF, python-docx for DOCX, pandas for CSV, and plain reads for TXT.
- **Break the text into insights with an LLM.** A LangGraph pipeline calls a model through OpenRouter (default `openai/gpt-oss-120b`). It splits the text into sentences and labels each one with one of nine insight types: observation, issue, request, complaint, compliment, evidence, event, recommendation or question. Each label comes with a confidence score and a sentiment. The pipeline then splits sentences into atomic facts and asks the model to flag duplicates.
- **Group and rank.** No LLM is used in this step. Insights are sorted into six fixed themes by keyword match (Checkout, Performance, UI/UX, Features, Onboarding, Support). The five most repeated issue and complaint insights become "opportunities", each with an impact label and an average confidence.
- **Store and browse.** Each analysis is saved as one JSON row in a Supabase table. An API returns a project's results, with filename search and status and date filters. The frontend has screens for an overview dashboard, insights, opportunities, reports, AI agents and upload history.
- **Shared foundation packages.** Three TypeScript packages are not yet connected to the web app:
  - `packages/core`: domain types and Zod schemas for a Document → Evidence → Insight → Theme → Opportunity → Report chain.
  - `packages/ingestion`: input validation, language detection, chunking and content hashing.
  - `packages/ai-engine`: a Gemini client. It validates the model's structured output against those schemas and retries with the validation error fed back to the model. It also backs off on rate limits.
- **Database schema for traceability.** The Supabase migrations define tables for workspaces, documents, evidence, insights, themes, opportunities and reports. Junction tables link each step to the next, and a generic `relationships` table connects any two entities. Document chunks, embedding references, processing logs and row-level security are included too. This sets up a graph-style trail from each opportunity back to the source text. The current upload flow doesn't write to these tables yet.

## How it works

```
Upload (Next.js, /api/upload)
  -> extract.py              text from PDF / DOCX / TXT / CSV
  -> semantic_analysis.py    LangGraph pipeline (OpenRouter LLM):
                               split sentences -> classify type, confidence, sentiment
                               -> atomic facts -> sentiment -> de-duplicate
  -> formatter               keyword themes, top-5 opportunities, counts
  -> Supabase "extracted"    one JSON row per document
  -> dashboard screens       read back through /api/extracted
```

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Parsing | Python 3: PyMuPDF, python-docx, pandas |
| Analysis | LangGraph, LangChain's OpenAI-compatible client pointed at OpenRouter |
| Data | Supabase (PostgreSQL with row-level security) |
| Shared packages | TypeScript, Zod, Gemini API, Turborepo, pnpm |

## Project structure

- `discovery-frontend/`: Next.js app, API routes, Python parser (`python/`) and analysis pipeline (`langgraph_pipeline/`)
- `packages/core/`: shared types, schemas and utilities
- `packages/ingestion/`: document ingestion service
- `packages/ai-engine/`: LLM client, structured output and retry logic
- `supabase/`: database migrations and seed data
- `python/`: reserved; the parser lives in `discovery-frontend/python/`

## Setup

Shared packages (from the repo root):

```bash
pnpm install
pnpm build
pnpm dev
```

Copy `.env.example` to `.env` and add your `GEMINI_API_KEY` (get one from https://ai.google.dev/). This key is used by `packages/ai-engine`.

Web app and analysis pipeline:

```bash
cd discovery-frontend
npm install
pip3 install -r python/requirements.txt -r langgraph_pipeline/requirements.txt
npm run dev
```

The pipeline reads `OPENROUTER_API_KEY` from the environment. Next.js passes the variables in `discovery-frontend/.env.local` to the Python scripts it starts, so the key can go there. The app also needs Supabase credentials for its Supabase client.

## Status

This is an early prototype, not a finished product. Known gaps:

- The frontend imports helpers from `discovery-frontend/lib/` (Supabase client, API calls, project context). That folder isn't in the repo, because the frontend's `.gitignore` has a Python-style `lib/` rule. Until those files are committed, a fresh clone won't build.
- Some values in the analysis output are placeholders, not measurements. The agent list, pipeline step timings and agent success rates are hard-coded. "Users affected" is estimated as 5% per repeated mention.
- The embedding and clustering code is turned off. Themes come from fixed keyword lists, not from the content.
- The upload flow writes to an `extracted` table that the migrations in `supabase/` don't create. The normalised schema and the TypeScript packages aren't connected to the app yet.
- `discovery-frontend/QUICKSTART.md` mentions OpenAI and a `langgraph/` folder. The current code uses OpenRouter and `langgraph_pipeline/`.

## Who built what

- **Aryan Panwar:** monorepo setup, `packages/core`, `packages/ingestion`, `packages/ai-engine` and the Supabase schema.
- **[Abhishek Gurjar](https://github.com/AbhishekGurjar2):** the Next.js frontend, the upload API, Python text extraction and the LangGraph analysis pipeline.

## License

MIT, see [LICENSE](LICENSE).

---

Built by [Aryan Panwar](https://aryanpanwar.in) and [Abhishek Gurjar](https://github.com/AbhishekGurjar2).
