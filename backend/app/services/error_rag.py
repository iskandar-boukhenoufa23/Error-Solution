
from functools import lru_cache

from app.services.error_search import search
from app.services.llm import get_agent


def ask_error_assistant(query: str, top_k: int = 5):
    # 1. Retrieve relevant errors from FAISS
    retrieved_results = search(query, top_k=top_k)

    if not retrieved_results:
        return {
            "answer": "I couldn't find relevant information in the error knowledge base.",
            "sources": [],
        }

    # 2. Prepare retrieved context
    context = "\n\n".join(
        [
            f"Error {i + 1} (similarity: {result['score']:.3f}):\n"
            f"{result['data']}"
            for i, result in enumerate(retrieved_results)
        ]
    )

    # 3. Get Groq LLM
    llm = get_agent()

    # 4. Build the prompt
    prompt = f"""
You are an expert software debugging assistant.

Answer the user's question using the retrieved error knowledge base.

Instructions:
- Explain the cause of the error.
- Provide a practical solution.
- Include corrected code when appropriate.
- Do not invent information that is not supported by the context.
- If the retrieved information is insufficient, clearly say so.

Retrieved knowledge:
{context}

User question:
{query}
"""

    # 5. Generate response
    response = llm.invoke(prompt)

    return {
        "answer": response.content,
        "sources": retrieved_results,
    }
