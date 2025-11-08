import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Base paths
BASE_DIR = Path(__file__).parent.parent.parent
DATA_DIR = BASE_DIR / "data"

class Config:
    """Configuration for AI Services."""
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    
    # Gemini API Keys (all 4 keys for rotation)
    GEMINI_KEYS = [
        "AIzaSyCqiHOLDMf_WlIyUCa1bX_-XMQ_7sKaBpA",
        "AIzaSyBuU_VMkH6AsKqm2AJOxS5D40jcCfZv2ks",
        "AIzaSyAfxRCB31CWA7XJMEIM6LTFMqHy9gqV_dI",
        "AIzaSyBCek4h3q4Tt--XzyQoW2VlN4vIQryqJdY"
    ]

    # Model names - Updated to latest Gemini models
    SUMMARIZER_MODEL = "AventIQ/T5-Legal-Summarization-base"
    # Using larger, more powerful embedding model for better semantic understanding
    EMBEDDING_MODEL = "sentence-transformers/all-mpnet-base-v2"  # 768 dimensions, better than MiniLM
    
    # Gemini models for rotation
    GEMINI_MODELS = ["gemini-2.0-flash-exp", "gemini-exp-1206", "gemini-2.0-flash-thinking-exp-1219"]
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", GEMINI_MODELS[0])

    # RAG configuration - Enhanced for 1M context window and detailed responses
    RAG_TOP_K = int(os.getenv("RAG_TOP_K", "20"))  # Increased to 20 for maximum relevant context
    RAG_TEMPERATURE = 0.3  # Slightly higher for more natural responses
    RAG_MAX_OUTPUT_TOKENS = 8192  # Increased to 8192 for very detailed explanations
    MAX_CONTEXT_CHARS = 900000  # Increased to 900K to utilize Gemini's 1M token context window (roughly 1M tokens)

    # Chunking configuration - Optimized for better semantic coherence
    CHUNK_SIZE = 1200  # Increased from 950 for more complete context per chunk
    CHUNK_OVERLAP = 200  # Increased from 100 to maintain better continuity

    # Storage paths
    DATA_ROOT = os.getenv("DATA_ROOT", "data")
    VECTOR_INDEXES = os.path.join(DATA_ROOT, "vector_indexes")
    MODELS_DIR = os.path.join(DATA_ROOT, "models")
    CACHE_DIR = os.path.join(DATA_ROOT, "cache")
    SCRAPE_CACHE = os.path.join(CACHE_DIR, "scrape")

    # Scraping
    SCRAPE_ENABLED = os.getenv("SCRAPE_ENABLED", "true").lower() == "true"
    SCRAPE_CACHE_TTL_HOURS = 72

    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")


config = Config()

# Create required directories
os.makedirs(config.VECTOR_INDEXES, exist_ok=True)
os.makedirs(config.MODELS_DIR, exist_ok=True)
os.makedirs(config.SCRAPE_CACHE, exist_ok=True)
