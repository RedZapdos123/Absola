from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.api.ingest import ingest_document, IngestRequest, IngestResponse
from app.api.summarize import summarize, SummarizeRequest, SummarizeResponse
from app.api.query import query_document, QueryRequest, QueryResponse
from app.api.scrape import scrape_context, ScrapeRequest, ScrapeResponse
from app.core.config import config
import logging
import time

# Configure logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Absola AI Service",
    description="Document analysis and RAG service for legal documents",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_start_time = time.time()


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "service": "ai",
        "status": "healthy",
        "uptime": time.time() - _start_time,
        "gemini_keys_configured": len(config.GEMINI_KEYS) > 0,
    }


@app.post("/ingest", response_model=IngestResponse)
async def ingest(request: IngestRequest):
    """Ingest document: extract text, chunk, embed, and create FAISS index."""
    try:
        return await ingest_document(request)
    except Exception as e:
        logger.error(f"Ingest error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/summarize", response_model=SummarizeResponse)
async def create_summary(request: SummarizeRequest):
    """Generate legal summary of document."""
    try:
        return await summarize(request)
    except Exception as e:
        logger.error(f"Summarization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """Execute RAG query against document index."""
    try:
        return await query_document(request)
    except Exception as e:
        logger.error(f"Query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/scrape", response_model=ScrapeResponse)
async def scrape(request: ScrapeRequest):
    """Scrape external explanation for a legal term."""
    try:
        return await scrape_context(request)
    except Exception as e:
        logger.error(f"Scrape error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
