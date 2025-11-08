from sentence_transformers import SentenceTransformer
from app.core.config import config
import logging

logger = logging.getLogger(__name__)

# Global model instance (loaded once)
_embedding_model: SentenceTransformer = None


def get_embedding_model() -> SentenceTransformer:
    """Load and cache the embedding model."""
    global _embedding_model
    
    if _embedding_model is None:
        logger.info(f"Loading embedding model: {config.EMBEDDING_MODEL}")
        _embedding_model = SentenceTransformer(config.EMBEDDING_MODEL)
        logger.info("Embedding model loaded")
    
    return _embedding_model


def embed_texts(texts: list[str], batch_size: int = 16) -> list[list[float]]:
    """
    Convert text chunks to dense vectors.
    
    Args:
        texts: List of text strings to embed
        batch_size: Batch size for processing
    
    Returns:
        List of embedding vectors
    """
    model = get_embedding_model()
    
    logger.info(f"Embedding {len(texts)} texts")
    embeddings = model.encode(texts, batch_size=batch_size, show_progress_bar=False)
    
    return embeddings.tolist()


def embed_query(query: str) -> list[float]:
    """Embed a single query string."""
    model = get_embedding_model()
    embedding = model.encode([query], show_progress_bar=False)[0]
    return embedding.tolist()
