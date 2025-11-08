import requests
from bs4 import BeautifulSoup
import logging
import time

logger = logging.getLogger(__name__)

# Rate limiting: minimum seconds between requests
_last_request_time = 0
_MIN_REQUEST_INTERVAL = 1.0  # 1 second between requests


def _rate_limit():
    """Enforce rate limiting between requests."""
    global _last_request_time
    current_time = time.time()
    time_since_last = current_time - _last_request_time
    
    if time_since_last < _MIN_REQUEST_INTERVAL:
        sleep_time = _MIN_REQUEST_INTERVAL - time_since_last
        logger.debug(f"Rate limiting: sleeping for {sleep_time:.2f}s")
        time.sleep(sleep_time)
    
    _last_request_time = time.time()


def _longest_text_block(soup: BeautifulSoup) -> str | None:
    """Find the longest visible text block on the page as a fallback.

    This helps when the site structure changes; we pick the longest
    non-empty text node from common content containers.
    """
    candidates = []
    selectors = [
        'article',
        'main',
        'div.card-body',
        'div.content',
        'div.entry-content',
        'section',
        'div',
    ]

    for sel in selectors:
        for el in soup.select(sel):
            text = el.get_text(separator=' ', strip=True)
            if text and len(text) > 100:
                candidates.append(text)

    if not candidates:
        # As a last resort, look at all paragraphs
        for p in soup.find_all('p'):
            t = p.get_text(separator=' ', strip=True)
            if t and len(t) > 80:
                candidates.append(t)

    if not candidates:
        return None

    # Return the longest candidate
    candidates.sort(key=lambda x: len(x), reverse=True)
    return candidates[0]


def scrape_tldrlegal(term: str, max_retries: int = 3) -> str | None:
    """
    Scrape TLDRLegal for license/term explanation.

    Features:
    - Rate limiting (1 request per second)
    - Retry logic with exponential backoff
    - Multiple selector fallbacks
    - Browser-like headers to avoid blocking
    
    Args:
        term: Search term (e.g., "MIT License", "GPL")
        max_retries: Maximum number of retry attempts
    
    Returns:
        Extracted text or None if not found
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                      'AppleWebKit/537.36 (KHTML, like Gecko) '
                      'Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }

    search_url = f"https://tldrlegal.com/search?q={requests.utils.quote(term)}"
    
    for attempt in range(max_retries):
        try:
            # Rate limiting
            _rate_limit()
            
            logger.info(f"TLDRLegal: Searching for '{term}' (attempt {attempt + 1}/{max_retries})")
            
            resp = requests.get(
                search_url,
                headers=headers,
                timeout=10,
                allow_redirects=True
            )
            resp.raise_for_status()

            soup = BeautifulSoup(resp.text, 'html.parser')

            # Try a few likely selectors first (site-specific)
            selectors = [
                'div.summary',
                'div.license-info',
                'div.card-body',
                'div.result',
                'article',
            ]

            for sel in selectors:
                el = soup.select_one(sel)
                if el:
                    text = el.get_text(separator=' ', strip=True)
                    if text and len(text) > 50:
                        # Limit to 1500 characters max
                        text = text[:1500]
                        logger.info(f"TLDRLegal: Found {len(text)} chars for '{term}' using selector {sel}")
                        return text

            # Fallback: return the longest block of text we can find
            fallback = _longest_text_block(soup)
            if fallback:
                # Limit to 1500 characters max
                fallback = fallback[:1500]
                logger.info(f"TLDRLegal: Found {len(fallback)} chars for '{term}' via fallback")
                return fallback

            logger.warning(f"TLDRLegal: No results found for '{term}'")
            return None
            
        except requests.exceptions.Timeout:
            logger.warning(f"TLDRLegal: Timeout on attempt {attempt + 1}")
            if attempt < max_retries - 1:
                backoff = 2 ** attempt
                logger.info(f"Retrying in {backoff}s...")
                time.sleep(backoff)
            else:
                logger.error(f"TLDRLegal: Max retries exceeded for '{term}'")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"TLDRLegal: Request error on attempt {attempt + 1}: {e}")
            if attempt < max_retries - 1:
                backoff = 2 ** attempt
                time.sleep(backoff)
            else:
                return None
                
        except Exception as e:
            logger.error(f"TLDRLegal: Unexpected error: {e}")
            return None
    
    return None
