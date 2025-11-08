import os
from PyPDF2 import PdfReader
from docx import Document as DocxDocument
from app.core.chunking import chunk_text
from app.core.embeddings import embed_texts
from app.persistence.faiss_store import faiss_store
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)


class IngestRequest(BaseModel):
    filepath: str


class IngestResponse(BaseModel):
    faissIndexPath: str
    chunks: int


def extract_text(filepath: str) -> str:
    """Extract text from PDF, DOCX, or TXT file."""
    ext = os.path.splitext(filepath)[1].lower()

    if ext == ".pdf":
        reader = PdfReader(filepath)
        text = "\n\n".join(page.extract_text() for page in reader.pages)
    elif ext == ".docx":
        doc = DocxDocument(filepath)
        text = "\n\n".join(para.text for para in doc.paragraphs)
    elif ext == ".txt":
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    return text


async def ingest_document(request: IngestRequest) -> IngestResponse:
    """
    Ingest document: extract text, chunk, embed, and create FAISS index.
    """
    filepath = request.filepath
    logger.info(f"Ingesting document: {filepath}")

    # Extract text
    text = extract_text(filepath)
    logger.info(f"Extracted {len(text)} characters")

    # Chunk text
    chunks = chunk_text(text)

    # Embed chunks
    embeddings = embed_texts(chunks)

    # Create FAISS index
    document_id = os.path.basename(os.path.dirname(filepath))
    index_path = faiss_store.create_index(embeddings, chunks, document_id)

    logger.info(f"Document ingested successfully: {index_path}")
    
    return IngestResponse(
        faissIndexPath=index_path,
        chunks=len(chunks),
    )
