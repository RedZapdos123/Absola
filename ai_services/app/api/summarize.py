from pydantic import BaseModel
from app.pipelines.summarize_chain import summarize_document
import logging

logger = logging.getLogger(__name__)


class SummarizeRequest(BaseModel):
    text: str


class SummarizeResponse(BaseModel):
    summary: str


async def summarize(request: SummarizeRequest) -> SummarizeResponse:
    """Generate legal summary of document text."""
    logger.info("Summarization requested")
    
    summary = summarize_document(request.text)
    
    return SummarizeResponse(summary=summary)
