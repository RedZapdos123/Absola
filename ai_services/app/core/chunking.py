from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.core.config import config
import logging

logger = logging.getLogger(__name__)


def chunk_text(text: str) -> list[str]:
    """
    Split text into overlapping chunks for embedding.
    
    Args:
        text: Input document text
    
    Returns:
        List of text chunks
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.CHUNK_SIZE,
        chunk_overlap=config.CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = splitter.split_text(text)
    logger.info(f"Split text into {len(chunks)} chunks")
    
    return chunks
