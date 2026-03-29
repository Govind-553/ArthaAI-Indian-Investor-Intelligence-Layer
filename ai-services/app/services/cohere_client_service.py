from __future__ import annotations
import cohere
from app.core.config import get_settings


class CohereClientService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.client = cohere.ClientV2(api_key=self.settings.cohere_api_key) if self.settings.cohere_api_key else None

    def embed_texts(self, texts: list[str], input_type: str) -> list[list[float]]:
        if not self.client:
            return [[0.001 * (index + 1) for index in range(1536)] for _ in texts]

        inputs = [{'content': [{'type': 'text', 'text': text}]} for text in texts]
        response = self.client.embed(
            inputs=inputs,
            model=self.settings.cohere_embed_model,
            input_type=input_type,
            embedding_types=['float'],
        )
        return response.embeddings.float

    def rerank(self, query: str, documents: list[str], top_n: int) -> list[dict]:
        if not self.client:
            return [{'index': index, 'relevance_score': 1.0 - (index * 0.05)} for index in range(min(top_n, len(documents)))]

        response = self.client.rerank(
            model=self.settings.cohere_rerank_model,
            query=query,
            documents=documents,
            top_n=top_n,
        )
        return [{'index': result.index, 'relevance_score': float(result.relevance_score)} for result in response.results]

    def generate_answer(self, question: str, context_documents: list[dict]) -> str:
        if not self.client:
            joined_context = ' '.join(document['text'][:180] for document in context_documents)
            return f"Answer based on retrieved context: {joined_context[:400]}"

        context_text = '\n\n'.join(
            [f"[{index + 1}] {doc['title']} ({doc['source_type']}): {doc['text']}" for index, doc in enumerate(context_documents)]
        )
        response = self.client.chat(
            model=self.settings.cohere_chat_model,
            messages=[
                {'role': 'system', 'content': 'Answer financial questions using only the supplied context. Keep the answer concise and factual.'},
                {'role': 'user', 'content': f"Question: {question}\n\nContext:\n{context_text}"},
            ],
        )
        return response.message.content[0].text
