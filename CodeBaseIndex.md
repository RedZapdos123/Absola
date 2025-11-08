# Codebase Index

**Absola - Indian Legal Document Analysis Platform**  
*Production-ready AI-powered legal document analysis specialized for Indian law*

---

## Project Structure

```
absola/
├── frontend/              # Next.js 14 Frontend (Port 3000)
├── backend/               # Express.js Backend (Port 4000)
├── ai_services/           # Python FastAPI AI Services (Port 5000)
├── data/                  # Data storage (gitignored)
├── docs/                  # Documentation
├── tests/                 # Test suites
├── config/                # Configuration files
├── README.md              # Project overview
├── setup.ps1              # Automated setup script
├── start.ps1              # Application launcher
└── CodeBaseIndex.md       # This file
```

---

## Core Components

### 1. Frontend (`frontend/`)
**Technology:** Next.js 14 with App Router, React 18, TypeScript

#### Key Files
```
frontend/
├── app/
│   ├── page.tsx                    # Home page (Hero, Features, How It Works, About)
│   ├── layout.tsx                  # Root layout with metadata and providers
│   ├── globals.css                 # Global styles + Azure Division branding
│   └── document/[id]/
│       └── page.tsx                # Document detail page (Summary, Q&A, View)
│
├── components/
│   ├── upload/
│   │   └── DocumentUploader.tsx   # File upload component
│   ├── document/
│   │   ├── DocumentList.tsx       # List of uploaded documents
│   │   └── DocumentViewer.tsx     # Document metadata viewer
│   ├── analysis/
│   │   └── SummaryView.tsx        # AI-generated summary display
│   ├── rag/
│   │   ├── ChatInterface.tsx      # Q&A interface
│   │   └── MessageList.tsx        # Chat message display
│   └── ui/                         # Reusable UI components (Tabs, etc.)
│
├── lib/
│   ├── api.ts                      # Backend API client functions
│   ├── store.ts                    # Zustand state management
│   └── providers/
│       └── QueryProvider.tsx      # React Query provider
│
├── hooks/
│   └── useDocument.ts             # Custom hook for document operations
│
├── public/
│   └── logo.png                   # Azure Division logo
│
└── package.json                   # Dependencies (Next.js, React Query, Zustand)
```

#### Key Features
- Dark mode toggle (Amber theme)
- Drag-and-drop file upload
- Real-time chat interface for Q&A
- AI-powered summarization display
- Azure Division branding

---

### 2. Backend (`backend/`)
**Technology:** Node.js 20, Express.js, TypeScript, MongoDB

#### Key Files
```
backend/
├── src/
│   ├── server.ts                  # Application entry point
│   ├── app.ts                     # Express app setup
│   │
│   ├── config/
│   │   ├── env.ts                 # Environment configuration
│   │   ├── logger.ts              # Pino logger setup
│   │   └── storage.ts             # File storage configuration
│   │
│   ├── models/
│   │   └── Document.ts            # Mongoose document schema
│   │
│   ├── services/
│   │   ├── documentService.ts     # Document business logic
│   │   └── aiServiceClient.ts     # AI service HTTP client
│   │
│   ├── controllers/
│   │   ├── uploadController.ts    # File upload handling
│   │   ├── documentController.ts  # Document CRUD operations
│   │   └── ragController.ts       # RAG query handling
│   │
│   ├── routes/
│   │   ├── upload.ts              # Upload endpoints
│   │   ├── documents.ts           # Document endpoints
│   │   └── rag.ts                 # RAG endpoints
│   │
│   ├── middleware/
│   │   ├── errorHandler.ts        # Global error handling
│   │   └── requestLogger.ts       # Request logging middleware
│   │
│   └── types/
│       └── index.ts               # TypeScript type definitions
│
├── data/
│   ├── documents/                 # Uploaded files storage
│   └── tmp/                       # Temporary file storage
│
└── package.json                   # Dependencies (Express, Mongoose, Multer)
```

#### Key Features
- MongoDB document storage
- Multer file upload handling
- Proxy to AI services
- Structured logging with Pino
- Centralized error handling

---

### 3. AI Services (`ai_services/`)
**Technology:** Python 3.11, FastAPI, LangChain, Gemini API

#### Key Files
```
ai_services/
├── app/
│   ├── main.py                    # FastAPI application entry
│   │
│   ├── api/
│   │   ├── ingest.py              # Document ingestion endpoint
│   │   ├── query.py               # RAG query endpoint
│   │   ├── summarize.py           # Summarization endpoint
│   │   └── scrape.py              # Web scraping endpoint
│   │
│   ├── core/
│   │   ├── config.py              # Configuration (4 API keys, 3 models)
│   │   ├── gemini_client.py       # Gemini LLM with key+model rotation
│   │   ├── embeddings.py          # Sentence-Transformers embeddings
│   │   ├── chunking.py            # Text chunking (950 chars, 100 overlap)
│   │   └── summarizer.py          # T5-based summarization
│   │
│   ├── pipelines/
│   │   ├── ingest_pipeline.py     # PDF→OCR→Chunk→Embed→Index
│   │   ├── rag_chain.py           # RAG with auto-scraping (1500 char limit)
│   │   └── summarize_pipeline.py  # Document summarization
│   │
│   ├── persistence/
│   │   └── faiss_store.py         # FAISS vector storage operations
│   │
│   └── scraping/
│       ├── indiankanoon.py        # IndianKanoon scraper (IPC, Articles, CrPC)
│       └── tldrlegal.py           # TLDRLegal scraper (GPL, MIT, Apache, BSD)
│
├── data/
│   ├── vector_indexes/            # FAISS indexes
│   ├── models/                    # Downloaded ML models
│   └── cache/
│       └── scrape/                # Scraped content cache (72h TTL)
│
└── requirements.txt               # Python dependencies
```

#### Key Features
- **Gemini AI Integration**
  - 4 API keys for load balancing
  - 3 models for rotation: gemini-2.0-flash-exp, gemini-exp-1206, gemini-2.0-flash-thinking-exp-1219
  
- **Smart RAG Pipeline**
  - Auto-detects legal terms (IPC, Articles, CrPC, licenses)
  - Auto-scrapes from IndianKanoon and TLDRLegal
  - 1500 character limit per source
  - Max 2 terms scraped per query
  
- **Document Processing**
  - PDF with OCR support
  - DOCX and TXT parsing
  - Text chunking (950 chars, 100 overlap)
  - FAISS vector indexing
  
- **Web Scraping**
  - Rate limiting (1 req/sec)
  - Retry with exponential backoff
  - Citation extraction
  - Metadata parsing

---

## Configuration Files

### `config/app.config.json`
```json
{
  "models": {
    "summarizer": "AventIQ/T5-Legal-Summarization-base",
    "embedder": "sentence-transformers/all-MiniLM-L6-v2"
  },
  "rag": {
    "top_k": 5,
    "chunk_size": 950,
    "chunk_overlap": 100,
    "max_context_chars": 12000
  }
}
```

### `ai_services/app/core/config.py`
**Gemini Configuration:**
- 4 API keys (hardcoded for production)
- 3 models for rotation
- Round-robin selection for load balancing

---

## Data Storage

```
data/
├── documents/                 # Uploaded files
│   └── <doc-id>/
│       ├── original.pdf       # Original uploaded file
│       ├── metadata.json      # Document metadata
│       └── chunks.json        # Extracted text chunks
│
├── vector_indexes/           # FAISS indexes
│   └── <doc-id>/
│       └── index.faiss        # Vector index for similarity search
│
├── models/                   # Downloaded ML models
│   ├── T5-Legal-Summarization-base/
│   └── all-MiniLM-L6-v2/
│
└── cache/
    └── scrape/               # Cached scraped content (72h TTL)
        ├── indiankanoon_<hash>.json
        └── tldrlegal_<hash>.json
```

---

## Testing

```
tests/
├── __init__.py
├── conftest.py                    # Pytest configuration
├── test_scrapers_unit.py          # Scraper unit tests (11 passing)
├── test_models.py                 # Model loading tests
├── test_processor.py              # Document processing tests
├── test_rag.py                    # RAG pipeline tests
└── e2e/
    └── app.spec.ts                # Playwright E2E tests
```

**Run Tests:**
```bash
# Unit tests
python -m unittest tests.test_scrapers_unit

# E2E tests
npm run test:e2e
```

---

## Documentation

```
docs/
├── Usage.md                       # User guide
└── InstallationAndSetup.md        # Setup guide
```

---

## Deployment

### Docker Compose
```yaml
services:
  frontend:  # Next.js (Port 3000)
  backend:   # Express.js (Port 4000)
  ai:        # FastAPI (Port 5000)
  mongo:     # MongoDB (Port 27017)
```

**Commands:**
```bash
# Setup (one-time)
.\setup.ps1

# Start all services
docker-compose up -d

# Start manually (development)
.\start.ps1
```

---

## API Endpoints

### Backend (Port 4000)
```
POST   /api/upload              # Upload document
GET    /api/documents           # List documents
GET    /api/documents/:id       # Get document details
DELETE /api/documents/:id       # Delete document
POST   /api/rag/query           # Ask question
```

### AI Services (Port 5000)
```
POST   /ingest                  # Ingest document (PDF→Index)
POST   /query                   # RAG query with auto-scraping
POST   /summarize               # Generate summary
POST   /scrape                  # Manual scraping
GET    /health                  # Health check
```

---

## Branding

### Azure Division
- **Logo:** `frontend/public/logo.png` (Shield icon)
- **Color:** Royal Blue (#4169E1)
- **Font:** Georgia serif
- **CSS Class:** `.azure-blue`

### Theme
- **Base:** Amber color palette (#FFF5E6 to #78350F)
- **Font:** Georgia serif throughout
- **Dark Mode:** Fully supported with class-based toggle

---

## Security

### API Keys
- 4 Gemini API keys hardcoded in `config.py`
- Keys rotate automatically via round-robin
- No .env file needed for production

### Rate Limiting
- Web scraping: 1 request/second
- Max 2 terms scraped per RAG query
- Retry with exponential backoff

### Data Privacy
- All processing on local infrastructure
- Documents stored locally
- Only context chunks sent to Gemini (max 12,000 chars)

---

## Key Metrics

- **Document Ingestion:** ~10-30s for 10-page PDF
- **RAG Query:** ~2-5s (with scraping: +3s per term)
- **Summarization:** ~5-15s
- **FAISS Search:** <100ms

---

## Development

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker 20.10+
- 8GB+ RAM

### Quick Start
```bash
# 1. Setup
.\setup.ps1

# 2. Start services
docker-compose up -d

# 3. Access
http://localhost:3000
```

---

## Key Technologies

| Component | Technology | Version |
|-----------|------------|---------|
| Frontend | Next.js | 14.2.33 |
| Backend | Express.js | 4.18.2 |
| AI | FastAPI | 0.110.0 |
| LLM | Gemini | 2.0-flash-exp |
| Database | MongoDB | 7.0 |
| Vector DB | FAISS | 1.8.0 |
| Embeddings | Sentence-Transformers | all-MiniLM-L6-v2 |
| Summarization | T5 | Legal-Summarization-base |

---

## Credits

**Creator:** Mridankan Mandal  
**Organization:** Azure Division  
**Status:** Production Ready  
**Version:** 1.0.0

---

## Quick Reference

### File Locations
- Logo: `frontend/public/logo.png`
- Config: `ai_services/app/core/config.py`
- API Keys: Hardcoded in config (4 keys)
- Models: 3 models in rotation

### Important Notes
- Character limit: 1500 max per scrape
- Auto-scraping: IPC, Articles, CrPC, licenses
- All test scripts removed
- Only essential .md files kept
- Setup script automates all dependencies

---

**Last Updated:** 2025-11-08  
**Index Version:** 1.0.0
