"""
Document processor for PDF and DOCX files.
Handles text extraction and preprocessing.
"""

import logging
from pathlib import Path
from typing import Optional, List
from pypdf import PdfReader
import pdfplumber
from docx import Document

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DocumentProcessor:
    """Process and extract text from various document formats."""

    def __init__(self):
        """Initialize document processor."""
        self.supported_formats = [".pdf", ".docx"]

    def is_supported(self, file_path: str) -> bool:
        """
        Check if file format is supported.

        Args:
            file_path: Path to the file

        Returns:
            True if supported, False otherwise
        """
        return Path(file_path).suffix.lower() in self.supported_formats

    def extract_text_from_pdf(self, file_path: str, use_pdfplumber: bool = True) -> str:
        """
        Extract text from PDF file.

        Args:
            file_path: Path to PDF file
            use_pdfplumber: Use pdfplumber (better for complex PDFs) vs PyPDF2

        Returns:
            Extracted text
        """
        try:
            if use_pdfplumber:
                return self._extract_with_pdfplumber(file_path)
            else:
                return self._extract_with_pypdf2(file_path)
        except Exception as e:
            logger.error(f"Error extracting PDF text: {e}")
            # Try alternate method
            try:
                if use_pdfplumber:
                    return self._extract_with_pypdf2(file_path)
                else:
                    return self._extract_with_pdfplumber(file_path)
            except Exception as e2:
                logger.error(f"Alternate extraction also failed: {e2}")
                raise

    def _extract_with_pdfplumber(self, file_path: str) -> str:
        """Extract text using pdfplumber."""
        text = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text.append(page_text)
        return "\n\n".join(text)

    def _extract_with_pypdf2(self, file_path: str) -> str:
        """Extract text using pypdf."""
        text = []
        with open(file_path, "rb") as file:
            pdf_reader = PdfReader(file)
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text.append(page_text)
        return "\n\n".join(text)

    def extract_text_from_docx(self, file_path: str) -> str:
        """
        Extract text from DOCX file.

        Args:
            file_path: Path to DOCX file

        Returns:
            Extracted text
        """
        try:
            doc = Document(file_path)
            text = []
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text.append(paragraph.text)
            return "\n\n".join(text)
        except Exception as e:
            logger.error(f"Error extracting DOCX text: {e}")
            raise

    def process_document(self, file_path: str) -> dict:
        """
        Process a document and extract metadata and text.

        Args:
            file_path: Path to the document

        Returns:
            Dictionary with document metadata and text
        """
        if not self.is_supported(file_path):
            raise ValueError(f"Unsupported file format: {Path(file_path).suffix}")

        file_path_obj = Path(file_path)
        suffix = file_path_obj.suffix.lower()

        logger.info(f"Processing document: {file_path_obj.name}")

        # Extract text based on format
        if suffix == ".pdf":
            text = self.extract_text_from_pdf(file_path)
        elif suffix == ".docx":
            text = self.extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported format: {suffix}")

        # Calculate basic statistics
        words = text.split()

        result = {
            "filename": file_path_obj.name,
            "format": suffix,
            "text": text,
            "word_count": len(words),
            "char_count": len(text),
            "page_estimate": len(text) // 3000 + 1,  # Rough estimate
        }

        logger.info(f"Extracted {result['word_count']} words from {result['filename']}")

        return result

    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """
        Split text into overlapping chunks for processing.

        Args:
            text: Input text
            chunk_size: Size of each chunk in characters
            overlap: Overlap between chunks

        Returns:
            List of text chunks
        """
        chunks = []
        start = 0
        text_length = len(text)

        while start < text_length:
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start += chunk_size - overlap

        return chunks

    def preprocess_text(self, text: str) -> str:
        """
        Clean and preprocess text.

        Args:
            text: Input text

        Returns:
            Cleaned text
        """
        # Remove excessive whitespace
        text = " ".join(text.split())

        # Remove common PDF artifacts
        text = text.replace("\x00", "")

        return text
