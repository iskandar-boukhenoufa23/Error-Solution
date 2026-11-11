
from functools import lru_cache

from langchain_groq import ChatGroq

from app.core.config import settings


@lru_cache()
def get_agent() -> ChatGroq:
    """Get the Groq LLM instance."""
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=settings.LLM_MODEL_NAME,
        temperature=0,
    )
