from transformers import pipeline
from app.core.config import config
import logging

logger = logging.getLogger(__name__)

# Global summarizer instance
_summarizer = None


def get_summarizer():
    """Load and cache T5 summarization model."""
    global _summarizer
    
    if _summarizer is None:
        logger.info(f"Loading summarizer model: {config.SUMMARIZER_MODEL}")
        _summarizer = pipeline(
            "text2text-generation",
            model=config.SUMMARIZER_MODEL,
            device=-1,  # CPU (use 0 for GPU if available)
        )
        logger.info("Summarizer loaded")
    
    return _summarizer


LEGAL_SUMMARY_PROMPT = """You are a legal summarization assistant. Convert the following contract text into concise bullet points focusing on:
- Parties & Effective Date
- Payment & Financial Obligations
- Term & Renewal
- Termination Rights
- Confidentiality & IP
- Liability & Indemnification
- Governing Law & Jurisdiction
- Notable Risk Clauses

Text:
{document_text}

Return 8-15 bullet points, each starting with a hyphen."""


def summarize_document(text: str) -> str:
    """
    Generate legal summary of document.
    
    Args:
        text: Full document text
    
    Returns:
        Bullet-point summary
    """
    summarizer = get_summarizer()
    
    # Truncate if too long (T5 has token limits)
    max_input_tokens = 1024
    truncated_text = text[:max_input_tokens * 4]  # Rough estimate
    
    prompt = LEGAL_SUMMARY_PROMPT.format(document_text=truncated_text)
    
    logger.info("Generating summary")
    result = summarizer(
        prompt,
        max_length=512,
        min_length=100,
        do_sample=False,
    )
    
    summary = result[0]['generated_text']
    logger.info("Summary generated")
    
    return summary
