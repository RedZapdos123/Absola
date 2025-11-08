"""Common test fixtures and configuration."""

import pytest


@pytest.fixture
def sample_text():
    """Provide sample text for testing."""
    return """
    This is a sample legal document for testing purposes.
    It contains multiple paragraphs and sections.
    
    Article 1: Introduction
    This article introduces the main concepts.
    
    Article 2: Terms and Conditions
    These are the terms that apply.
    """


@pytest.fixture
def sample_metadata():
    """Provide sample metadata for testing."""
    return {"filename": "test_document.pdf", "format": ".pdf", "word_count": 100}
