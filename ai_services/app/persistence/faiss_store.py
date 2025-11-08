import os
import faiss
import numpy as np
from typing import List, Tuple
from app.core.config import config
import logging
import pickle

logger = logging.getLogger(__name__)


class FAISSStore:
    """FAISS vector store manager."""

    def __init__(self):
        self._indexes = {}  # Cache for loaded indexes

    def create_index(self, embeddings: List[List[float]], chunks: List[str], document_id: str) -> str:
        """
        Create and save a FAISS index from embeddings.
        
        Args:
            embeddings: List of embedding vectors
            chunks: Original text chunks (for later retrieval)
            document_id: Unique document identifier
        
        Returns:
            Path to saved index
        """
        embeddings_array = np.array(embeddings).astype('float32')
        dimension = embeddings_array.shape[1]

        # Create FAISS index
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings_array)

        # Save index and chunks
        index_dir = os.path.join(config.VECTOR_INDEXES, document_id)
        os.makedirs(index_dir, exist_ok=True)

        index_path = os.path.join(index_dir, "index.faiss")
        chunks_path = os.path.join(index_dir, "chunks.pkl")

        faiss.write_index(index, index_path)
        
        with open(chunks_path, 'wb') as f:
            pickle.dump(chunks, f)

        logger.info(f"Created FAISS index at {index_path} with {len(chunks)} chunks")
        return index_path

    def load_index(self, index_path: str) -> Tuple[faiss.Index, List[str]]:
        """Load FAISS index and associated chunks."""
        if index_path in self._indexes:
            return self._indexes[index_path]

        if not os.path.exists(index_path):
            raise FileNotFoundError(f"Index not found: {index_path}")

        index = faiss.read_index(index_path)
        
        # Load chunks
        index_dir = os.path.dirname(index_path)
        chunks_path = os.path.join(index_dir, "chunks.pkl")
        
        with open(chunks_path, 'rb') as f:
            chunks = pickle.load(f)

        self._indexes[index_path] = (index, chunks)
        logger.info(f"Loaded FAISS index from {index_path}")
        
        return index, chunks

    def search(
        self, 
        index_path: str, 
        query_embedding: List[float], 
        k: int = 5
    ) -> List[Tuple[str, float]]:
        """
        Search for top-k similar chunks.
        
        Args:
            index_path: Path to FAISS index
            query_embedding: Query vector
            k: Number of results to return
        
        Returns:
            List of (chunk_text, distance) tuples
        """
        index, chunks = self.load_index(index_path)
        
        query_vector = np.array([query_embedding]).astype('float32')
        distances, indices = index.search(query_vector, k)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < len(chunks):
                results.append((chunks[idx], float(dist)))

        logger.info(f"Retrieved {len(results)} chunks from FAISS")
        return results


# Global instance
faiss_store = FAISSStore()
