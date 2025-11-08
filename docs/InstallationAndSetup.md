# API Documentation - Project Absola

## Modules

### 1. Models Module (`models/`)

#### ModelLoader

Manages loading and caching of ML models.

```python
from models import ModelLoader

loader = ModelLoader(max_memory_gb=8.0)
model, tokenizer = loader.load_t5_model()
loader.unload_models()  # Free memory
```

**Methods:**

- `load_t5_model(model_name: str = "t5-base")` -> tuple[Model, Tokenizer]
- `load_llama_model(model_name: str)` -> tuple[Model, Tokenizer]
- `unload_models()` -> None

#### Summarizer

T5-based text summarization.

```python
from models import ModelLoader, Summarizer

loader = ModelLoader()
summarizer = Summarizer(loader)
summary = summarizer.summarize(text, max_length=150, min_length=50)
```

**Methods:**

- `summarize(text: str, max_length: int = 150, min_length: int = 50)` -> str

#### QASystem

Question answering system.

```python
from models import ModelLoader, QASystem

loader = ModelLoader()
qa = QASystem(loader)
answer = qa.answer_question(question, context, max_length=200)
```

**Methods:**

- `answer_question(question: str, context: str, max_length: int = 200)` -> str

---

### 2. Processor Module (`processor/`)

#### DocumentProcessor

Process and extract text from documents.

```python
from processor import DocumentProcessor

processor = DocumentProcessor()
doc_data = processor.process_document("file.pdf")
chunks = processor.chunk_text(doc_data['text'])
```

**Methods:**

- `is_supported(file_path: str)` -> bool
- `extract_text_from_pdf(file_path: str)` -> str
- `extract_text_from_docx(file_path: str)` -> str
- `process_document(file_path: str)` -> dict
- `chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200)` -> List[str]
- `preprocess_text(text: str)` -> str

**Return Format (process_document):**

```python
{
    "filename": str,
    "format": str,
    "text": str,
    "word_count": int,
    "char_count": int,
    "page_estimate": int
}
```

---

### 3. RAG Module (`rag/`)

#### RAGSystem

Retrieval-Augmented Generation system.

```python
from rag import RAGSystem

rag = RAGSystem(embedding_model="sentence-transformers/all-MiniLM-L6-v2")
rag.index_documents([{"text": "...", "metadata": {...}}])
results = rag.search("query", k=5)
context = rag.get_context_for_query("query", k=3)
```

**Methods:**

- `index_documents(documents: List[Dict])` -> bool
- `search(query: str, k: int = 5)` -> List[Dict]
- `get_context_for_query(query: str, k: int = 3)` -> str
- `save_index(path: str)` -> None
- `load_index(path: str)` -> None
- `clear_index()` -> None
- `get_stats()` -> Dict

**Document Format:**

```python
{
    "text": str,  # Document text
    "metadata": {  # Optional metadata
        "filename": str,
        "format": str,
        ...
    }
}
```

**Search Result Format:**

```python
{
    "content": str,  # Chunk text
    "metadata": dict,  # Chunk metadata
    "score": float  # Similarity score
}
```

---

### 4. Scraper Module (`scraper/`)

#### LegalScraper

Unified interface for legal web scraping.

```python
from scraper import LegalScraper

scraper = LegalScraper(delay=1.0)
licenses = scraper.scrape_licenses()
cases = scraper.search_indian_cases("contract law", max_results=10)
case_details = scraper.get_case_details(case_url)
```

**Methods:**

- `scrape_licenses()` -> List[Dict]
- `search_indian_cases(query: str, max_results: int = 10)` -> List[Dict]
- `get_case_details(case_url: str)` -> Optional[Dict]

#### TLDRLegalScraper

Scraper for TLDR Legal.

```python
from scraper import TLDRLegalScraper

scraper = TLDRLegalScraper(delay=1.0)
license_data = scraper.scrape_license("mit")
licenses = scraper.scrape_popular_licenses()
```

**License Format:**

```python
{
    "title": str,
    "slug": str,
    "can": List[str],  # Permissions
    "cannot": List[str],  # Limitations
    "must": List[str],  # Conditions
    "url": str
}
```

#### IndianKanoonScraper

Scraper for Indian Kanoon.

```python
from scraper import IndianKanoonScraper

scraper = IndianKanoonScraper(delay=1.0)
cases = scraper.search_cases("trademark", max_results=10)
case_details = scraper.get_case_details(case_url)
```

**Case Format:**

```python
{
    "title": str,
    "url": str,
    "excerpt": str,
    "full_text": str  # Only in get_case_details
}
```

---

## Usage Examples

### Complete Workflow Example

```python
from models import ModelLoader, Summarizer
from processor import DocumentProcessor
from rag import RAGSystem

# 1. Process document
processor = DocumentProcessor()
doc_data = processor.process_document("contract.pdf")

# 2. Generate summary
loader = ModelLoader()
summarizer = Summarizer(loader)
summary = summarizer.summarize(doc_data['text'][:2000])

# 3. Index for RAG
rag = RAGSystem()
rag.index_documents([{
    "text": doc_data['text'],
    "metadata": {"filename": doc_data['filename']}
}])

# 4. Ask questions
context = rag.get_context_for_query("What are the payment terms?")
print(f"Relevant context: {context}")

# 5. Clean up
loader.unload_models()
rag.clear_index()
```

### Web Scraping Example

```python
from scraper import LegalScraper

scraper = LegalScraper()

# Get license info
licenses = scraper.scrape_licenses()
for lic in licenses:
    print(f"{lic['title']}: {lic['url']}")

# Search case law
cases = scraper.search_indian_cases("breach of contract")
for case in cases:
    print(f"{case['title']}: {case['excerpt']}")
```

---

## Configuration

### Environment Variables

No environment variables required. All configuration is code-based.

### Memory Configuration

```python
# Adjust max memory
loader = ModelLoader(max_memory_gb=4.0)  # For systems with 4GB RAM

# Use different embedding model
rag = RAGSystem(embedding_model="sentence-transformers/paraphrase-MiniLM-L3-v2")
```

### Performance Tuning

```python
# Adjust chunk size for RAG
processor = DocumentProcessor()
chunks = processor.chunk_text(text, chunk_size=500, overlap=100)

# Adjust retrieval count
results = rag.search(query, k=10)  # Get more results
context = rag.get_context_for_query(query, k=5)  # Use more context
```

---

## Error Handling

All modules use Python's standard exception handling:

```python
try:
    doc_data = processor.process_document("file.pdf")
except ValueError as e:
    print(f"Unsupported format: {e}")
except Exception as e:
    print(f"Processing error: {e}")
```

Common exceptions:
- `ValueError`: Invalid input or unsupported format
- `FileNotFoundError`: File doesn't exist
- `Exception`: General processing errors

---

## Performance Benchmarks

| Operation | Time | Memory |
|-----------|------|--------|
| Load T5 model | 10-20s | 2-3GB |
| Extract text (10 pages) | 5-10s | <100MB |
| Summarize text | 5-15s | +1GB |
| Index 100 chunks | 10-20s | +500MB |
| Search query | 1-3s | <100MB |

---

For more information, see the [User Guide](USER_GUIDE.md) or [README](../README.md).
