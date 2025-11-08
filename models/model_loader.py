"""
Model loader utilities for legal document analysis.
Handles loading and caching of T5 and Llama3 models with memory constraints.
"""

import logging
from typing import Optional
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, AutoModelForCausalLM

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelLoader:
    """Manages loading and caching of ML models with memory constraints."""

    def __init__(self, max_memory_gb: float = 8.0):
        """
        Initialize model loader.

        Args:
            max_memory_gb: Maximum memory to use in GB (default: 8GB)
        """
        self.max_memory_gb = max_memory_gb
        self.t5_model = None
        self.t5_tokenizer = None
        self.llama_model = None
        self.llama_tokenizer = None

        # Set device
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")

    def load_t5_model(self, model_name: str = "t5-base") -> tuple:
        """
        Load T5 model for summarization.

        Args:
            model_name: HuggingFace model identifier

        Returns:
            Tuple of (model, tokenizer)
        """
        if self.t5_model is None:
            logger.info(f"Loading T5 model: {model_name}")
            try:
                self.t5_tokenizer = AutoTokenizer.from_pretrained(model_name)
                self.t5_model = AutoModelForSeq2SeqLM.from_pretrained(
                    model_name,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                    low_cpu_mem_usage=True,
                )
                self.t5_model.to(self.device)
                logger.info("T5 model loaded successfully")
            except Exception as e:
                logger.error(f"Error loading T5 model: {e}")
                raise

        return self.t5_model, self.t5_tokenizer

    def load_llama_model(self, model_name: str = "TinyLlama/TinyLlama-1.1B-Chat-v1.0") -> tuple:
        """
        Load Llama model for Q&A.
        Note: For production, use a legal-specific fine-tuned version.

        Args:
            model_name: HuggingFace model identifier

        Returns:
            Tuple of (model, tokenizer)
        """
        if self.llama_model is None:
            logger.info(f"Loading Llama model: {model_name}")
            try:
                self.llama_tokenizer = AutoTokenizer.from_pretrained(model_name)
                self.llama_model = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                    low_cpu_mem_usage=True,
                    device_map="auto",
                )
                logger.info("Llama model loaded successfully")
            except Exception as e:
                logger.error(f"Error loading Llama model: {e}")
                # Fallback to smaller model if main model fails
                logger.info("Attempting to load smaller fallback model...")
                raise

        return self.llama_model, self.llama_tokenizer

    def unload_models(self):
        """Unload models to free memory."""
        if self.t5_model is not None:
            del self.t5_model
            del self.t5_tokenizer
            self.t5_model = None
            self.t5_tokenizer = None

        if self.llama_model is not None:
            del self.llama_model
            del self.llama_tokenizer
            self.llama_model = None
            self.llama_tokenizer = None

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        logger.info("Models unloaded and memory cleared")


class Summarizer:
    """T5-based text summarization."""

    def __init__(self, model_loader: ModelLoader):
        """Initialize summarizer with model loader."""
        self.model_loader = model_loader

    def summarize(self, text: str, max_length: int = 150, min_length: int = 50) -> str:
        """
        Summarize text using T5 model.

        Args:
            text: Input text to summarize
            max_length: Maximum summary length
            min_length: Minimum summary length

        Returns:
            Summarized text
        """
        model, tokenizer = self.model_loader.load_t5_model()

        # Prepare input
        input_text = f"summarize: {text}"
        inputs = tokenizer(input_text, max_length=512, truncation=True, return_tensors="pt").to(
            self.model_loader.device
        )

        # Generate summary
        summary_ids = model.generate(
            inputs["input_ids"],
            max_length=max_length,
            min_length=min_length,
            length_penalty=2.0,
            num_beams=4,
            early_stopping=True,
        )

        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary


class QASystem:
    """Llama-based Q&A system for legal documents."""

    def __init__(self, model_loader: ModelLoader):
        """Initialize Q&A system with model loader."""
        self.model_loader = model_loader

    def answer_question(self, question: str, context: str, max_length: int = 200) -> str:
        """
        Answer a question based on context.

        Args:
            question: Question to answer
            context: Context/document text
            max_length: Maximum answer length

        Returns:
            Answer text
        """
        try:
            model, tokenizer = self.model_loader.load_llama_model()

            # Format prompt for legal Q&A
            prompt = f"""Based on the following legal document, answer the question concisely.

Document: {context[:2000]}

Question: {question}

Answer:"""

            inputs = tokenizer(prompt, return_tensors="pt").to(self.model_loader.device)

            outputs = model.generate(
                inputs["input_ids"],
                max_new_tokens=max_length,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
            )

            answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
            # Extract just the answer part
            if "Answer:" in answer:
                answer = answer.split("Answer:")[-1].strip()

            return answer
        except Exception as e:
            logger.error(f"Error in Q&A: {e}")
            return f"Error generating answer: {str(e)}"
