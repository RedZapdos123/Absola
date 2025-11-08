"""
RAG (Retrieval-Augmented Generation) system using FAISS and LangChain.
Enables semantic search and context-aware Q&A.
"""

import logging
from typing import List, Optional, Dict
import numpy as np
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.docstore.document import Document as LangChainDocument

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RAGSystem:
    """Retrieval-Augmented Generation system for legal documents."""

    def __init__(self, embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """
        Initialize RAG system.

        Args:
            embedding_model: HuggingFace embedding model identifier
        """
        self.embedding_model_name = embedding_model
        self.embeddings = None
        self.vector_store = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        logger.info(f"RAG system initialized with {embedding_model}")

    def _get_embeddings(self):
        """Lazy load embeddings model."""
        if self.embeddings is None:
            logger.info(f"Loading embeddings model: {self.embedding_model_name}")
            self.embeddings = HuggingFaceEmbeddings(
                model_name=self.embedding_model_name,
                model_kwargs={"device": "cpu"},  # Use CPU for embeddings to save VRAM
                encode_kwargs={"normalize_embeddings": True},
            )
        return self.embeddings

    def index_documents(self, documents: List[Dict[str, str]]) -> bool:
        """
        Index documents into FAISS vector store.

        Args:
            documents: List of document dictionaries with 'text' and 'metadata'

        Returns:
            True if successful
        """
        try:
            logger.info(f"Indexing {len(documents)} documents")

            # Convert to LangChain documents
            langchain_docs = []
            for doc in documents:
                # Split document into chunks
                chunks = self.text_splitter.split_text(doc.get("text", ""))

                for i, chunk in enumerate(chunks):
                    metadata = doc.get("metadata", {}).copy()
                    metadata["chunk_id"] = i
                    langchain_docs.append(LangChainDocument(page_content=chunk, metadata=metadata))

            logger.info(f"Created {len(langchain_docs)} chunks from documents")

            # Create or update vector store
            embeddings = self._get_embeddings()

            if self.vector_store is None:
                self.vector_store = FAISS.from_documents(langchain_docs, embeddings)
            else:
                # Add to existing store
                new_store = FAISS.from_documents(langchain_docs, embeddings)
                self.vector_store.merge_from(new_store)

            logger.info("Documents indexed successfully")
            return True

        except Exception as e:
            logger.error(f"Error indexing documents: {e}")
            raise

    def search(self, query: str, k: int = 5) -> List[Dict]:
        """
        Search for relevant documents.

        Args:
            query: Search query
            k: Number of results to return

        Returns:
            List of relevant document chunks with scores
        """
        if self.vector_store is None:
            logger.warning("No documents indexed yet")
            return []

        try:
            # Perform similarity search
            docs_and_scores = self.vector_store.similarity_search_with_score(query, k=k)

            results = []
            for doc, score in docs_and_scores:
                results.append(
                    {"content": doc.page_content, "metadata": doc.metadata, "score": float(score)}
                )

            logger.info(f"Found {len(results)} results for query")
            return results

        except Exception as e:
            logger.error(f"Error searching documents: {e}")
            return []

    def get_context_for_query(self, query: str, k: int = 3) -> str:
        """
        Get concatenated context for a query.

        Args:
            query: Search query
            k: Number of chunks to retrieve

        Returns:
            Concatenated context text
        """
        results = self.search(query, k=k)

        if not results:
            return ""

        # Concatenate top results
        context_parts = [r["content"] for r in results]
        context = "\n\n---\n\n".join(context_parts)

        return context

    def save_index(self, path: str):
        """
        Save FAISS index to disk.

        Args:
            path: Directory path to save index
        """
        if self.vector_store is None:
            logger.warning("No vector store to save")
            return

        try:
            self.vector_store.save_local(path)
            logger.info(f"Index saved to {path}")
        except Exception as e:
            logger.error(f"Error saving index: {e}")
            raise

    def load_index(self, path: str):
        """
        Load FAISS index from disk.

        Args:
            path: Directory path to load index from
        """
        try:
            embeddings = self._get_embeddings()
            self.vector_store = FAISS.load_local(path, embeddings)
            logger.info(f"Index loaded from {path}")
        except Exception as e:
            logger.error(f"Error loading index: {e}")
            raise

    def clear_index(self):
        """Clear the current index."""
        self.vector_store = None
        logger.info("Index cleared")

    def get_stats(self) -> Dict:
        """
        Get statistics about the indexed documents.

        Returns:
            Dictionary with statistics
        """
        if self.vector_store is None:
            return {"indexed_chunks": 0}

        return {
            "indexed_chunks": self.vector_store.index.ntotal,
            "embedding_dimension": self.vector_store.index.d,
        }
