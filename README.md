# Absola - Indian Legal Document Analysis

**AI-powered legal document analysis specialized for Indian law**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)](docker-compose.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Production Ready](https://img.shields.io/badge/status-production--ready-success.svg)](.)

## Overview

Absola is a production-ready legal document analysis platform specialized for Indian law. It combines advanced AI with web scraping to provide comprehensive legal research and document analysis. Built with Next.js, Node.js, and Python FastAPI, it leverages Gemini AI for intelligent analysis of IPC sections, constitutional articles, case law, and legal documents.

**For complete codebase documentation, see [CodeBaseIndex.md](CodeBaseIndex.md)**

### Key Features

- **Indian Law Specialized** - IPC, Constitution, CrPC, case law expertise
- **RAG-Powered AI** - Gemini API with FAISS vector search
- **Smart Web Scraping** - IndianKanoon and TLDRLegal integration (1500 char limit)
- **Multi-Format Support** - PDF with OCR, DOCX, TXT documents
- **Interactive Q&A** - Ask questions about your legal documents
- **Automatic Term Detection** - Scrapes relevant legal terms from queries
- **Production Ready** - Docker containerized with all dependencies
- **Modern UI** - Dark mode, responsive design, amber theme
- **Privacy First** - All processing on your infrastructure

## Quick Start

1. Run automated setup:
```powershell
.\setup.ps1
```

2. Start all services:
```powershell
.\start.ps1
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- AI Services: http://localhost:5000

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│         React 18 • TailwindCSS • Zustand • React Query      │
│                    Port 3000                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
┌──────────────────────────┴──────────────────────────────────┐
│                   Backend (Node.js + Express)                │
│       TypeScript • MongoDB • Multer • Axios • Pino          │
│                    Port 4000                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
┌──────────────────────────┴──────────────────────────────────┐
│                 AI Services (Python + FastAPI)               │
│   LangChain • Gemini • FAISS • Transformers • BeautifulSoup │
│   Enhanced RAG: 12 chunks, 2048 tokens, 32K context        │
│                    Port 5000                                 │
└──────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18 with TypeScript
- TailwindCSS + Shadcn UI
- Zustand (state management)
- React Query (server state)
- React Markdown (rendering)

**Backend:**
- Node.js 20 + Express.js
- MongoDB 7 with Mongoose
- TypeScript (strict mode)
- Multer (file uploads)
- Pino (structured logging)

**AI Services:**
- Python 3.11 + FastAPI
- LangChain + ChatGoogleGenerativeAI (Gemini)
- FAISS (vector search)
- Sentence-Transformers (embeddings)
- Transformers (T5 summarization)
- BeautifulSoup4 (web scraping)

## Quick Start

### Automated Setup (Recommended)

```powershell
# One-command setup (creates venv, installs all dependencies)
.\setup.ps1

# Start application
docker-compose up -d
# OR for manual start: .\start.ps1

# Access at http://localhost:3000
```

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker 20.10+ (optional, for MongoDB)
- 8GB+ RAM, 10GB+ disk space

**Note:** Gemini API keys are pre-configured (4 keys with rotation)

### Manual Setup (Alternative)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/absola.git
cd absola

# 2. Start services
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
# AI Service: http://localhost:5000
```

## Usage

### 1. Upload Document

- Navigate to http://localhost:3000
- Click "Browse Files" or drag & drop a PDF/DOCX/TXT file
- Click "Upload & Analyze"
- Wait for processing to complete (status changes to "ready")

### 2. View Summary

- Click "View" on your document
- Go to "Summary" tab
- See AI-generated bullet points highlighting:
  - Parties and effective dates
  - Payment obligations
  - Term and termination clauses
  - IP rights and liability
  - Jurisdiction and risks

### 3. Ask Questions (with Smart Scraping)

- Go to "Ask Questions" tab
- Type your question about the document
- Get AI-powered answers enhanced with:
  - Document context from uploaded files
  - Auto-scraped content from IndianKanoon (for IPC, Articles, CrPC)
  - Auto-scraped content from TLDRLegal (for licenses like MIT, GPL)
  - Maximum 1500 characters per source
- View source citations to see where information came from

### 4. Explore Document

- Use "View Document" tab to see file details
- All data is stored locally in `data/documents/<document-id>/`
- FAISS indexes saved in `data/vector_indexes/<document-id>/`

## Development

### Local Development (No Docker)

**Backend:**
```bash
cd backend
npm install
npm run dev  # Port 4000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # Port 3000
```

**AI Services:**
```bash
cd ai_services
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5000
```

**MongoDB:**
```bash
docker run -d -p 27017:27017 --name absola-mongo mongo:7
```

### Project Structure

See **[CodeBaseIndex.md](CodeBaseIndex.md)** for complete project structure, file locations, and API documentation.

## Documentation

- **[CodeBaseIndex.md](CodeBaseIndex.md)** - Complete codebase reference
- **[docs/Usage.md](docs/Usage.md)** - User guide and tutorials
- **[docs/InstallationAndSetup.md](docs/InstallationAndSetup.md)** - Setup and configuration

## Security & Privacy

### Data Sovereignty
- All processing happens on your infrastructure
- Documents never leave your network
- FAISS indexes stored locally
- MongoDB data isolated in Docker network

### API Keys
- Only Gemini API keys required (for RAG generation)
- Top-5 chunks transmitted, not full documents
- Context truncated to 12,000 chars max
- Key rotation supported (4 keys recommended)

### Best Practices
- Use `.env` files for secrets (never commit)
- Enable HTTPS with reverse proxy in production
- Restrict MongoDB to internal network
- Set up firewall rules for exposed ports

## Deployment

### Production with Docker

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clears data)
docker-compose down -v
```

### Scaling

**Horizontal Scaling (AI Service):**
```yaml
# docker-compose.yml
services:
  ai:
    deploy:
      replicas: 3
```

**Load Balancing (Backend):**
- Use nginx or Caddy for reverse proxy
- Configure upstream servers
- Enable session affinity if needed

## Testing

### Unit Tests
```bash
# Backend (Jest)
cd backend
npm test

# AI Services (pytest)
cd ai_services
pytest
```

### Integration Tests
```bash
# End-to-end (Playwright)
npm run test:e2e
```

## Key Features

### Gemini AI Integration
- **4 API Keys** with automatic rotation
- **3 Models** for load balancing:
  - gemini-2.0-flash-exp
  - gemini-exp-1206
  - gemini-2.0-flash-thinking-exp-1219

### Smart Scraping
- **IndianKanoon**: IPC, Articles, CrPC (auto-detected)
- **TLDRLegal**: GPL, MIT, Apache, BSD (auto-detected)
- **1500 char limit** per source
- **Rate limiting**: 1 req/sec with retry logic

### Performance
- Document ingestion: ~10-30s (10-page PDF)
- RAG query: ~2-5s (+3s per scraped term)
- FAISS search: <100ms

## License

This project is licensed under the MIT License.

## Acknowledgments

- **LangChain** - RAG framework
- **Google Gemini** - LLM provider
- **FAISS** - Vector search (Meta AI)
- **IndianKanoon** - Indian legal database
- **Transformers** - Hugging Face models
- **Next.js** - React framework (Vercel)
- **FastAPI** - Python web framework

## Credits

**Creator:** Mridankan Mandal  
**Organization:** Azure Division

## Support

- **Documentation**: See `/docs` directory
- **Spec**: See `spec.md` for full technical details
- **Implementation Docs**: See `CONSOLIDATION_COMPLETE.md` and `INDIANKANOON_CONSOLIDATION.md`

---

Production-ready Indian legal document analysis platform  
Built for accuracy, privacy, and compliance
