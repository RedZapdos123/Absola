import os
import random
from typing import Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import config
import logging

logger = logging.getLogger(__name__)

_current_key_index = 0
_current_model_index = 0


def get_gemini_llm(model: str = None, temperature: float = None) -> ChatGoogleGenerativeAI:
    """
    Create a Gemini LLM instance with key and model rotation support.
    Rotates through 4 API keys and 3 models for load balancing.
    
    Args:
        model: Gemini model name (default: rotates through available models)
        temperature: Temperature for generation (default: from config)
    
    Returns:
        ChatGoogleGenerativeAI instance
    """
    global _current_key_index, _current_model_index

    if not config.GEMINI_KEYS:
        raise ValueError(
            "No Gemini API keys found. Please check config."
        )

    # Round-robin key selection (4 keys)
    api_key = config.GEMINI_KEYS[_current_key_index % len(config.GEMINI_KEYS)]
    _current_key_index += 1

    # Round-robin model selection if not specified
    if model is None:
        model_name = config.GEMINI_MODELS[_current_model_index % len(config.GEMINI_MODELS)]
        _current_model_index += 1
    else:
        model_name = model
    
    temp = temperature if temperature is not None else config.RAG_TEMPERATURE

    logger.info(f"Initializing Gemini LLM with model: {model_name} (Key #{_current_key_index % len(config.GEMINI_KEYS) + 1})")

    return ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=api_key,
        temperature=temp,
        max_output_tokens=config.RAG_MAX_OUTPUT_TOKENS,
    )


def truncate_context(text: str, max_chars: int = None) -> str:
    """Truncate text to maximum character limit."""
    max_chars = max_chars or config.MAX_CONTEXT_CHARS
    if len(text) <= max_chars:
        return text
    
    logger.warning(f"Truncating context from {len(text)} to {max_chars} characters")
    return text[:max_chars] + "\n... [truncated]"
