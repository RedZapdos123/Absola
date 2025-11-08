from langchain.prompts import ChatPromptTemplate
from app.core.gemini_client import get_gemini_llm, truncate_context
from app.core.embeddings import embed_query
from app.persistence.faiss_store import faiss_store
from app.core.config import config
from app.scraping.indiankanoon import scrape_indiankanoon
from app.scraping.tldrlegal import scrape_tldrlegal
import logging
import re

logger = logging.getLogger(__name__)

RAG_PROMPT_TEMPLATE = """You are an expert legal analysis assistant specializing in Indian law and the Indian legal system. You have deep knowledge of:

- The Constitution of India (Articles, Fundamental Rights, Directive Principles, Schedules)
- Indian Penal Code (IPC) and Criminal Procedure Code (CrPC)
- Civil Procedure Code (CPC) and Evidence Act
- Supreme Court and High Court precedents
- Personal laws, family law, property law, and contract law in India
- Recent amendments and landmark judgments

Use ONLY the provided context chunks from the uploaded documents to answer the question. Apply your expertise in Indian law to provide accurate, contextually appropriate, and HIGHLY DETAILED answers in natural, conversational language.

Context Chunks:
{context}

Question: {query}

{user_prompt}

Instructions for Response:
- Provide a COMPREHENSIVE, DETAILED, and NATURAL LANGUAGE analysis based on the context provided
- Write as if you're explaining to a colleague or client - conversational yet professional
- Structure your response with proper paragraphs and smooth transitions between ideas
- Begin with a clear, direct answer, then expand with detailed explanations
- Reference relevant sections, articles, or case law with full explanations of their significance
- Explain legal concepts thoroughly, including:
  * What they mean in plain language
  * Their historical context and purpose
  * How they're applied in practice
  * Their implications and consequences
  * Related concepts and provisions
- Include relevant background information, precedents, and judicial interpretations
- Provide real-world examples and scenarios where applicable
- If the answer is not in the context, state: "Based on the provided documents, I don't have sufficient information to fully answer this question. However, I can provide general guidance on [topic]..."
- Cite which chunk numbers you used naturally (e.g., "Based on the information in chunks 1, 3, and 5..." or "According to the document...")
- Use proper legal terminology but immediately explain complex terms in accessible language
- When citing Indian statutes, use the standard format (e.g., "Section 498A of the Indian Penal Code", "Article 21 of the Constitution of India")
- Write in complete sentences and flowing paragraphs - avoid bullet points unless specifically requested
- Aim for thoroughness - detailed, nuanced explanations are strongly preferred over brief summaries
- Make your response engaging and easy to follow while maintaining professional accuracy
- Use transitional phrases like "Furthermore," "Additionally," "It's important to note that," etc.

Answer:"""


def _extract_legal_terms(query: str) -> list:
    """Extract potential legal terms from query for web scraping."""
    # Look for IPC sections, Articles, license names, etc.
    patterns = [
        r'Section\s+\d+[A-Z]?\s*(of\s+)?IPC',
        r'Article\s+\d+[A-Z]?',
        r'CrPC\s+\d+',
        r'GPL|MIT|Apache|BSD',
    ]
    
    terms = []
    for pattern in patterns:
        matches = re.findall(pattern, query, re.IGNORECASE)
        terms.extend(matches)
    
    return terms


def run_rag_query(index_path: str, query: str, user_prompt: str = "") -> dict:
    """
    Execute RAG pipeline: retrieve relevant chunks and generate answer.
    Now includes web scraping for legal terms not found in documents.
    
    Args:
        index_path: Path to FAISS index
        query: User question
        user_prompt: Additional user instructions/context for answer generation
    
    Returns:
        Dict with 'answer' and 'sources' keys
    """
    logger.info(f"RAG query: {query}")
    if user_prompt:
        logger.info(f"User prompt: {user_prompt}")

    # Step 1: Embed query
    query_embedding = embed_query(query)

    # Step 2: Retrieve top-k chunks
    results = faiss_store.search(
        index_path=index_path,
        query_embedding=query_embedding,
        k=config.RAG_TOP_K,
    )

    # Step 3: Build context from document chunks
    context_parts = []
    sources = []
    
    if results:
        for idx, (chunk_text, distance) in enumerate(results, 1):
            context_parts.append(f"<CHUNK {idx}>\n{chunk_text}\n</CHUNK {idx}>")
            sources.append(chunk_text[:200])  # First 200 chars for citation
    
    # Step 4: Try to enhance with web scraping for specific legal terms
    legal_terms = _extract_legal_terms(query)
    
    if legal_terms:
        logger.info(f"Found legal terms to scrape: {legal_terms}")
        
        for term in legal_terms[:2]:  # Limit to 2 terms to avoid too many requests
            # Try IndianKanoon for Indian legal terms
            if any(keyword in term.upper() for keyword in ['IPC', 'ARTICLE', 'CRPC']):
                scraped = scrape_indiankanoon(term)
                if scraped:
                    context_parts.append(f"<WEB_SOURCE: IndianKanoon>\n{scraped}\n</WEB_SOURCE>")
                    sources.append(f"IndianKanoon: {term}")
                    logger.info(f"Added IndianKanoon content for: {term}")
            
            # Try TLDRLegal for license terms
            elif any(keyword in term.upper() for keyword in ['GPL', 'MIT', 'APACHE', 'BSD']):
                scraped = scrape_tldrlegal(term)
                if scraped:
                    context_parts.append(f"<WEB_SOURCE: TLDRLegal>\n{scraped}\n</WEB_SOURCE>")
                    sources.append(f"TLDRLegal: {term}")
                    logger.info(f"Added TLDRLegal content for: {term}")
    
    if not context_parts:
        return {
            "answer": "No relevant context found in the document. Please upload relevant legal documents or try a different query.",
            "sources": [],
        }

    context = "\n\n".join(context_parts)
    context = truncate_context(context)

    # Step 5: Build prompt with user's additional instructions
    user_prompt_section = ""
    if user_prompt:
        user_prompt_section = f"\nAdditional User Instructions:\n{user_prompt}\n"
    
    prompt = ChatPromptTemplate.from_template(RAG_PROMPT_TEMPLATE)
    messages = prompt.format_messages(context=context, query=query, user_prompt=user_prompt_section)

    # Step 6: Query Gemini with enhanced configuration
    logger.info("Calling Gemini for detailed answer generation")
    llm = get_gemini_llm(temperature=config.RAG_TEMPERATURE)
    response = llm.invoke(messages)

    answer = response.content

    logger.info("RAG query complete")
    return {
        "answer": answer,
        "sources": sources,
    }
