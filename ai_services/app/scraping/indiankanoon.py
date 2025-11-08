"""
IndianKanoon Scraper - Comprehensive Implementation
Crawls IndianKanoon search results and judgment pages with:
- Rate limiting and retry logic
- Multiple selector fallbacks
- Citation extraction
- Metadata parsing
- Polite, resumable operation
"""
import requests
from bs4 import BeautifulSoup
import logging
import time
import re
import hashlib
from typing import Optional, Dict, List, Tuple
from datetime import datetime
from urllib.parse import urljoin, quote

logger = logging.getLogger(__name__)

# Configuration
BASE_URL = "https://indiankanoon.org"
RATE_LIMIT = 1.0  # 1 request per second
MAX_RETRIES = 3
TIMEOUT = 15
USER_AGENT = "AbsolaLegalScraper/1.0 (Educational)"

# Rate limiting state
_last_request_time = 0

# Citation patterns for Indian law
CITATION_PATTERNS = [
    r'\b(AIR|SCR|SCC)\s+\d{4}\s+\w+\s+\d+\b',
    r'\b\d{4}\s+\(\d+\)\s+\w+\s+\d+\b',
    r'\b\(\d{4}\)\s+\d+\s+\w+\s+\d+\b',
    r'Section\s+\d+[A-Z]?\s+(of\s+)?IPC',
    r'Article\s+\d+[A-Z]?',
]


def _rate_limit():
    """Enforce rate limiting between requests."""
    global _last_request_time
    current_time = time.time()
    time_since_last = current_time - _last_request_time
    
    if time_since_last < RATE_LIMIT:
        sleep_time = RATE_LIMIT - time_since_last
        logger.debug(f"Rate limiting: sleeping for {sleep_time:.2f}s")
        time.sleep(sleep_time)
    
    _last_request_time = time.time()


def _make_request(url: str, max_retries: int = MAX_RETRIES) -> Optional[requests.Response]:
    """
    Make HTTP request with retry logic and exponential backoff.
    
    Args:
        url: URL to fetch
        max_retries: Maximum retry attempts
        
    Returns:
        Response object or None on failure
    """
    headers = {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
    }
    
    for attempt in range(max_retries):
        try:
            _rate_limit()
            
            logger.debug(f"Fetching {url} (attempt {attempt + 1}/{max_retries})")
            
            response = requests.get(
                url,
                headers=headers,
                timeout=TIMEOUT,
                allow_redirects=True
            )
            
            # Handle rate limiting
            if response.status_code == 429:
                backoff = 2 ** (attempt + 1)
                logger.warning(f"Rate limited. Waiting {backoff}s")
                time.sleep(backoff)
                continue
            
            # Handle server errors
            if response.status_code >= 500:
                backoff = 2 ** attempt
                logger.warning(f"Server error {response.status_code}. Backing off {backoff}s")
                time.sleep(backoff)
                continue
            
            response.raise_for_status()
            return response
            
        except requests.exceptions.Timeout:
            logger.warning(f"Timeout on attempt {attempt + 1}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
    
    return None


def _extract_citations(text: str) -> List[str]:
    """Extract legal citations from text."""
    citations = []
    for pattern in CITATION_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        citations.extend(matches)
    return list(set(citations))  # Remove duplicates


def _extract_metadata(soup: BeautifulSoup) -> Dict[str, any]:
    """
    Extract structured metadata from judgment page.
    
    Returns dict with: title, court, date, citation, judges, parties, etc.
    """
    metadata = {
        'title': None,
        'court': None,
        'date': None,
        'citation': [],
        'judges': [],
        'parties': {},
    }
    
    # Extract title
    title_elem = soup.select_one('h1.doc_title, .doctitle, h1')
    if title_elem:
        metadata['title'] = title_elem.get_text(strip=True)
    
    # Extract court info
    court_elem = soup.select_one('.docsource_main, .court_name')
    if court_elem:
        metadata['court'] = court_elem.get_text(strip=True)
    
    # Extract date
    date_elem = soup.select_one('.doc_date, .judgment_date')
    if date_elem:
        metadata['date'] = date_elem.get_text(strip=True)
    
    # Extract citations from full text
    full_text = soup.get_text(separator=' ')
    metadata['citation'] = _extract_citations(full_text)
    
    return metadata


def search_indiankanoon(query: str, max_results: int = 10) -> List[Dict[str, str]]:
    """
    Search IndianKanoon and return list of results with URLs.
    
    Args:
        query: Search term (e.g., "Section 498A IPC")
        max_results: Maximum number of results to return
        
    Returns:
        List of dicts with 'title', 'url', 'snippet', 'date', 'court'
    """
    search_url = f"{BASE_URL}/search/?formInput={quote(query)}"
    
    response = _make_request(search_url)
    if not response:
        logger.error(f"Failed to search for '{query}'")
        return []
    
    soup = BeautifulSoup(response.text, 'html.parser')
    results = []
    
    # Extract search results
    result_divs = soup.select('div.result')
    
    for div in result_divs[:max_results]:
        result = {}
        
        # Extract title and URL
        title_link = div.select_one('a.result_title, a[href*="/doc/"]')
        if title_link:
            result['title'] = title_link.get_text(strip=True)
            result['url'] = urljoin(BASE_URL, title_link.get('href', ''))
            
            # Extract doc ID from URL
            match = re.search(r'/doc/(\d+)', result['url'])
            if match:
                result['doc_id'] = f"indiankanoon-{match.group(1)}"
        
        # Extract snippet/preview
        snippet_elem = div.select_one('.docsource, .doc_fragment')
        if snippet_elem:
            result['snippet'] = snippet_elem.get_text(strip=True)[:300]
        
        # Extract metadata if available
        meta_elem = div.select_one('.result_meta, .doc_meta')
        if meta_elem:
            meta_text = meta_elem.get_text(strip=True)
            result['metadata'] = meta_text
        
        if result.get('title') and result.get('url'):
            results.append(result)
    
    logger.info(f"Found {len(results)} results for '{query}'")
    return results


def fetch_judgment(url: str) -> Optional[Dict[str, any]]:
    """
    Fetch full judgment from IndianKanoon document URL.
    
    Args:
        url: Full URL to judgment page
        
    Returns:
        Dict with structured data or None on failure
    """
    response = _make_request(url)
    if not response:
        return None
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Extract doc ID
    doc_id = None
    match = re.search(r'/doc/(\d+)', url)
    if match:
        doc_id = f"indiankanoon-{match.group(1)}"
    else:
        # Generate from URL hash
        doc_id = f"indiankanoon-{hashlib.md5(url.encode()).hexdigest()[:12]}"
    
    # Get metadata
    metadata = _extract_metadata(soup)
    
    # Extract full judgment text
    full_text_elem = soup.select_one('#judgments, .judgment_text, .doc_text')
    if full_text_elem:
        full_text = full_text_elem.get_text(separator='\n', strip=True)
    else:
        # Fallback: get all paragraphs
        paragraphs = soup.select('p')
        full_text = '\n\n'.join(p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 50)
    
    # Extract citations and links
    cited_docs = []
    for link in soup.select('a[href*="/doc/"]'):
        href = link.get('href', '')
        if href and '/doc/' in href:
            cited_url = urljoin(BASE_URL, href)
            match = re.search(r'/doc/(\d+)', cited_url)
            if match:
                cited_docs.append(f"indiankanoon-{match.group(1)}")
    
    return {
        'doc_id': doc_id,
        'url': url,
        'title': metadata['title'],
        'court': metadata['court'],
        'date': metadata['date'],
        'citation': metadata['citation'],
        'judges': metadata['judges'],
        'parties': metadata['parties'],
        'full_text': full_text,
        'cites': list(set(cited_docs)),  # Remove duplicates
        'fetched_at': datetime.now().isoformat(),
        'source_url': url,
    }


def scrape_indiankanoon(term: str, max_retries: int = 3) -> Optional[str]:
    """
    Simple scraper for quick legal term lookup (backward compatible).
    
    Args:
        term: Search term (e.g., "Section 498A IPC", "Article 21")
        max_retries: Maximum number of retry attempts
    
    Returns:
        Extracted text summary or None if not found
    """
    logger.info(f"IndianKanoon: Searching for '{term}'")
    
    # Search for the term
    results = search_indiankanoon(term, max_results=1)
    
    if not results:
        logger.warning(f"IndianKanoon: No results found for '{term}'")
        return None
    
    # Get first result
    first_result = results[0]
    
    # Try to fetch full judgment
    judgment = fetch_judgment(first_result['url'])
    
    if judgment and judgment.get('full_text'):
        # Return summary: title + snippet of text (max 1500 chars)
        summary = f"{judgment['title']}\n\n"
        if judgment.get('court'):
            summary += f"Court: {judgment['court']}\n"
        if judgment.get('date'):
            summary += f"Date: {judgment['date']}\n"
        if judgment.get('citation'):
            summary += f"Citations: {', '.join(judgment['citation'][:3])}\n"
        summary += f"\n{judgment['full_text'][:1500]}"
        
        logger.info(f"IndianKanoon: Found {len(summary)} chars for '{term}'")
        return summary
    
    # Fallback: return snippet from search results
    snippet = first_result.get('snippet', '')
    if snippet:
        logger.info(f"IndianKanoon: Returning snippet for '{term}'")
        return f"{first_result['title']}\n\n{snippet}"
    
    logger.warning(f"IndianKanoon: Could not extract text for '{term}'")
    return None
