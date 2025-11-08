from pydantic import BaseModel
from app.pipelines.rag_chain import run_rag_query
import logging

logger = logging.getLogger(__name__)


class QueryRequest(BaseModel):
    query: str
    faissIndexPath: str
    userPrompt: str = ""  # Optional user instructions for detailed responses


class QueryResponse(BaseModel):
    answer: str
    sources: list[str]


async def query_document(request: QueryRequest) -> QueryResponse:
    """Execute RAG query against document index with optional user prompt."""
    logger.info(f"Query requested: {request.query}")
    if request.userPrompt:
        logger.info(f"User prompt provided: {request.userPrompt}")
    
    result = run_rag_query(
        index_path=request.faissIndexPath,
        query=request.query,
        user_prompt=request.userPrompt,
    )
    
    return QueryResponse(
        answer=result["answer"],
        sources=result["sources"],
    )
