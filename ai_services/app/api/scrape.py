import os
import json
import time
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.scraping.tldrlegal import scrape_tldrlegal
from app.scraping.indiankanoon import scrape_indiankanoon
from app.core.config import config
import logging

logger = logging.getLogger(__name__)


class ScrapeRequest(BaseModel):
    term: str


class ScrapeResponse(BaseModel):
    explanation: str
    provider: str = "unknown"


def get_cached_scrape(term: str) -> dict | None:
    """Check if term is in cache and not expired."""
    cache_file = os.path.join(config.SCRAPE_CACHE, f"{term}.json")
    
    if not os.path.exists(cache_file):
        return None

    with open(cache_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    cached_time = datetime.fromisoformat(data['timestamp'])
    expiry = cached_time + timedelta(hours=config.SCRAPE_CACHE_TTL_HOURS)

    if datetime.now() > expiry:
        logger.info(f"Cache expired for term: {term}")
        return None

    logger.info(f"Cache hit for term: {term}")
    return data


def save_scrape_cache(term: str, explanation: str, provider: str):
    """Save scraped result to cache."""
    cache_file = os.path.join(config.SCRAPE_CACHE, f"{term}.json")
    
    data = {
        "term": term,
        "explanation": explanation,
        "provider": provider,
        "timestamp": datetime.now().isoformat(),
    }

    with open(cache_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

    logger.info(f"Cached scrape result for: {term}")


async def scrape_context(request: ScrapeRequest) -> ScrapeResponse:
    """Scrape external explanation for a legal term."""
    term = request.term
    logger.info(f"Scrape requested for: {term}")

    if not config.SCRAPE_ENABLED:
        return ScrapeResponse(
            explanation="Scraping is disabled.",
            provider="disabled",
        )

    # Check cache
    cached = get_cached_scrape(term)
    if cached:
        return ScrapeResponse(
            explanation=cached["explanation"],
            provider=cached["provider"],
        )

    # Try providers
    explanation = None
    provider = "unknown"

    try:
        explanation = scrape_tldrlegal(term)
        provider = "tldrlegal"
    except Exception as e:
        logger.warning(f"TLDRLegal scrape failed: {e}")

    if not explanation:
        try:
            explanation = scrape_indiankanoon(term)
            provider = "indiankanoon"
        except Exception as e:
            logger.warning(f"IndianKanoon scrape failed: {e}")

    if not explanation:
        explanation = f"No external explanation found for '{term}'."
        provider = "none"

    # Cache result
    save_scrape_cache(term, explanation, provider)

    return ScrapeResponse(
        explanation=explanation,
        provider=provider,
    )
