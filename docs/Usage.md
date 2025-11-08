# User Guide - Project Absola

## Table of Contents
1. [Getting Started](#getting-started)
2. [Document Upload](#document-upload)
3. [Summarization](#summarization)
4. [RAG Q&A](#rag-qa)
5. [Legal Scraper](#legal-scraper)
6. [Settings](#settings)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### First Time Setup

1. Install Python 3.10+ and required dependencies
2. Run `streamlit run app.py`
3. Navigate to http://localhost:8501

### System Requirements

- **RAM**: Minimum 8GB
- **Storage**: ~5GB for models
- **Internet**: Only needed for web scraping feature

## Document Upload

### Supported Formats

- **PDF**: Any PDF with text (not scanned images)
- **DOCX**: Microsoft Word documents

### Upload Process

1. Click "Browse files" or drag and drop
2. Wait for text extraction (typically 20-40s per page)
3. Review extracted text in preview
4. Proceed to summarization or indexing

### Tips

- For best results, use text-based PDFs (not scanned images)
- Large documents (>100 pages) may take longer to process
- Processing happens entirely on your device

## Summarization

### Generating Summaries

1. Upload a document first
2. Click "Generate Summary (T5)"
3. Wait 10-20 seconds for AI processing
4. Review the generated summary

### Summary Options

- Summaries are automatically optimized for clarity
- Length is balanced between brevity and completeness
- Multiple summaries can be generated

### Export Summary

- Click "Download Summary" to save as TXT file

## RAG Q&A

### Indexing Documents

Before asking questions:
1. Upload and process a document
2. Click "Index Document for Q&A"
3. Wait for FAISS indexing (~15-25s)
4. Navigate to "RAG Q&A" tab

### Asking Questions

1. Type your question in the text input
2. Press Enter or click outside the box
3. View retrieved context and answer
4. Response time: 3-8 seconds

### Question Tips

- Be specific: "What are the payment terms?" vs "Tell me about this"
- Reference specific sections if known
- Ask one question at a time for best results

## Legal Scraper

### TLDR Legal - License Information

1. Navigate to "Legal Scraper" tab
2. Select "License Information" tab
3. Click "Scrape License Information"
4. Browse popular software licenses (MIT, Apache, GPL, etc.)
5. View permissions, limitations, and conditions

### Indian Kanoon - Case Law

1. Select "Indian Case Law" tab
2. Enter search query (e.g., "contract law")
3. Click "Search Cases"
4. Browse search results
5. Click on cases to view excerpts

### Scraping Ethics

- Built-in delays respect server resources
- Scraping is read-only, no data modification
- For personal research use only

## Settings

### Privacy Settings

- **Data Clearing**: Remove all processed documents
- **Model Cache**: Clear loaded AI models
- **No Telemetry**: Confirmed no usage tracking

### Memory Management

- Adjust max memory usage (4-16GB)
- Clear model cache if running low on RAM
- Models load on-demand to save memory

### Performance

Monitor performance metrics:
- Processing times
- Memory usage
- Index statistics

## Troubleshooting

### Common Issues

**Problem**: "Out of memory" error
- **Solution**: Reduce memory limit in settings, clear model cache, close other applications

**Problem**: PDF text extraction fails
- **Solution**: Try with a different PDF, ensure it's text-based (not scanned)

**Problem**: Slow processing
- **Solution**: Normal for first run (model downloads), ensure no other heavy applications running

**Problem**: Streamlit won't start
- **Solution**: Check Python version (3.10+), reinstall dependencies: `pip install -r requirements.txt`

**Problem**: Web scraping fails
- **Solution**: Check internet connection, some sites may be temporarily unavailable

### Getting Help

- Check GitHub Issues for known problems
- Review error messages carefully
- Ensure all dependencies are installed

## Best Practices

### Document Processing

- Process one document at a time for best results
- Clear previous data before processing new documents
- Export summaries you want to keep

### Performance

- Close unused applications to free RAM
- Use GPU if available (CUDA-compatible)
- Clear model cache periodically

### Privacy

- Remember: everything stays local
- No internet needed except for web scraping
- Clear all data when done for maximum privacy

---

For more information, see the [README](../README.md) or [API Documentation](API.md).
