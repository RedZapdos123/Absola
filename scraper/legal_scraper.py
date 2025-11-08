"""
Web scraping utilities for legal resources.
Scrapes TLDR Legal and Indian Kanoon for legal information.
"""

import logging
import time
from typing import List, Dict, Optional
import requests
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaseScraper:
    """Base class for web scrapers."""

    def __init__(self, delay: float = 1.0):
        """
        Initialize scraper.

        Args:
            delay: Delay between requests in seconds
        """
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        )

    def get_page(self, url: str) -> Optional[BeautifulSoup]:
        """
        Fetch and parse a web page.

        Args:
            url: URL to fetch

        Returns:
            BeautifulSoup object or None if failed
        """
        try:
            logger.info(f"Fetching: {url}")
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            time.sleep(self.delay)
            return BeautifulSoup(response.content, "lxml")
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return None


class TLDRLegalScraper(BaseScraper):
    """Scraper for TLDR Legal (tldrlegal.com)."""

    BASE_URL = "https://tldrlegal.com"

    def scrape_license(self, license_slug: str) -> Optional[Dict]:
        """
        Scrape a specific license from TLDR Legal.

        Args:
            license_slug: License identifier (e.g., 'mit', 'gpl-3.0')

        Returns:
            Dictionary with license information
        """
        url = f"{self.BASE_URL}/license/{license_slug}"
        soup = self.get_page(url)

        if not soup:
            return None

        try:
            title = soup.find("h1")
            title_text = title.get_text(strip=True) if title else license_slug

            # Extract license summary sections
            can_do = []
            cannot_do = []
            must_do = []

            # Find permission sections (structure may vary)
            sections = soup.find_all("div", class_="license-section")
            for section in sections:
                heading = section.find(["h2", "h3"])
                if heading:
                    heading_text = heading.get_text(strip=True).lower()
                    items = [li.get_text(strip=True) for li in section.find_all("li")]

                    if "can" in heading_text or "permit" in heading_text:
                        can_do.extend(items)
                    elif "cannot" in heading_text or "forbid" in heading_text:
                        cannot_do.extend(items)
                    elif "must" in heading_text or "condition" in heading_text:
                        must_do.extend(items)

            return {
                "title": title_text,
                "slug": license_slug,
                "can": can_do,
                "cannot": cannot_do,
                "must": must_do,
                "url": url,
            }
        except Exception as e:
            logger.error(f"Error parsing license {license_slug}: {e}")
            return None

    def scrape_popular_licenses(self) -> List[Dict]:
        """
        Scrape information about popular licenses.

        Returns:
            List of license dictionaries
        """
        popular_licenses = [
            "mit",
            "apache-2.0",
            "gpl-3.0",
            "bsd-3-clause",
            "isc",
            "lgpl-3.0",
            "mpl-2.0",
        ]

        results = []
        for license_slug in popular_licenses:
            license_data = self.scrape_license(license_slug)
            if license_data:
                results.append(license_data)

        logger.info(f"Scraped {len(results)} licenses from TLDR Legal")
        return results


class IndianKanoonScraper(BaseScraper):
    """Scraper for Indian Kanoon (indiankanoon.org)."""

    BASE_URL = "https://indiankanoon.org"

    def search_cases(self, query: str, max_results: int = 10) -> List[Dict]:
        """
        Search for cases on Indian Kanoon.

        Args:
            query: Search query
            max_results: Maximum number of results

        Returns:
            List of case dictionaries
        """
        search_url = f"{self.BASE_URL}/search/?formInput={query.replace(' ', '+')}"
        soup = self.get_page(search_url)

        if not soup:
            return []

        results = []
        result_divs = soup.find_all("div", class_="result")[:max_results]

        for div in result_divs:
            try:
                title_tag = div.find("a", class_="result_title")
                if not title_tag:
                    continue

                title = title_tag.get_text(strip=True)
                case_url = self.BASE_URL + title_tag.get("href", "")

                # Get case excerpt
                excerpt_tag = div.find("div", class_="result_text")
                excerpt = excerpt_tag.get_text(strip=True) if excerpt_tag else ""

                results.append({"title": title, "url": case_url, "excerpt": excerpt})
            except Exception as e:
                logger.error(f"Error parsing search result: {e}")
                continue

        logger.info(f"Found {len(results)} cases for query: {query}")
        return results

    def get_case_details(self, case_url: str) -> Optional[Dict]:
        """
        Get detailed information about a specific case.

        Args:
            case_url: URL of the case

        Returns:
            Dictionary with case details
        """
        soup = self.get_page(case_url)

        if not soup:
            return None

        try:
            # Extract case title
            title_tag = soup.find("h1")
            title = title_tag.get_text(strip=True) if title_tag else "Unknown"

            # Extract case text
            doc_content = soup.find("div", class_="doc")
            if not doc_content:
                doc_content = soup.find("div", id="content")

            full_text = doc_content.get_text(separator="\n", strip=True) if doc_content else ""

            return {
                "title": title,
                "url": case_url,
                "full_text": full_text,
                "text_length": len(full_text),
            }
        except Exception as e:
            logger.error(f"Error getting case details: {e}")
            return None


class LegalScraper:
    """Unified interface for legal web scraping."""

    def __init__(self, delay: float = 1.0):
        """
        Initialize legal scraper.

        Args:
            delay: Delay between requests in seconds
        """
        self.tldr_scraper = TLDRLegalScraper(delay=delay)
        self.kanoon_scraper = IndianKanoonScraper(delay=delay)

    def scrape_licenses(self) -> List[Dict]:
        """Scrape license information from TLDR Legal."""
        return self.tldr_scraper.scrape_popular_licenses()

    def search_indian_cases(self, query: str, max_results: int = 10) -> List[Dict]:
        """Search for Indian legal cases."""
        return self.kanoon_scraper.search_cases(query, max_results)

    def get_case_details(self, case_url: str) -> Optional[Dict]:
        """Get detailed case information."""
        return self.kanoon_scraper.get_case_details(case_url)
