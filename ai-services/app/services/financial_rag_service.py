from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional
from app.repositories.market_data_repository import MarketDataRepository
from app.schemas.insights import RagIndexRequest, RagQueryRequest, RagQueryResponse, RagSource
from app.services.faiss_vector_store import FaissVectorStore
from app.services.cohere_client_service import CohereClientService


class FinancialRagService:
    def __init__(self, repository: Optional[MarketDataRepository] = None, vector_store: Optional[FaissVectorStore] = None, cohere_service: Optional[CohereClientService] = None) -> None:
        self.repository = repository or MarketDataRepository()
        self.vector_store = vector_store or FaissVectorStore()
        self.cohere_service = cohere_service or CohereClientService()

    def index_documents(self, payload: RagIndexRequest) -> dict:
        documents_to_store = []
        searchable_texts = []

        for document in payload.documents:
            stored_document = {
                'source_type': document.source_type,
                'symbol': document.symbol.upper() if document.symbol else None,
                'title': document.title,
                'text': document.text,
                'published_at': document.published_at,
                'metadata': document.metadata,
                'created_at': datetime.now(timezone.utc).isoformat(),
            }
            documents_to_store.append(stored_document)
            searchable_texts.append(f"{document.title}\n{document.text}")

        inserted_ids = self.repository.insert_rag_documents(documents_to_store)
        metadata_items = []
        for inserted_id, document in zip(inserted_ids, documents_to_store):
            metadata_items.append(
                {
                    'id': inserted_id,
                    'source_type': document['source_type'],
                    'title': document['title'],
                    'symbol': document['symbol'],
                    'published_at': document['published_at'],
                    'text': document['text'],
                }
            )

        embeddings = self.cohere_service.embed_texts(searchable_texts, input_type='search_document')
        self.vector_store.add_embeddings(embeddings, metadata_items)

        return {
            'indexed_documents': len(inserted_ids),
            'document_ids': inserted_ids,
        }

    def query(self, payload: RagQueryRequest) -> RagQueryResponse:
        query_embedding = self.cohere_service.embed_texts([payload.question], input_type='search_query')[0]
        retrieved_documents = self.vector_store.search(query_embedding, payload.top_k)
        if not retrieved_documents:
            return RagQueryResponse(answer='No relevant financial context found.', sources=[])

        reranked = self.cohere_service.rerank(payload.question, [doc['text'] for doc in retrieved_documents], top_n=min(payload.top_k, len(retrieved_documents)))

        final_documents = []
        for item in reranked:
            document = dict(retrieved_documents[item['index']])
            document['relevance_score'] = item['relevance_score']
            final_documents.append(document)

        answer = self.cohere_service.generate_answer(payload.question, final_documents)
        sources = [
            RagSource(
                id=doc['id'],
                source_type=doc['source_type'],
                title=doc['title'],
                symbol=doc.get('symbol'),
                published_at=doc.get('published_at'),
                relevance_score=round(float(doc['relevance_score']), 4),
            )
            for doc in final_documents
        ]
        return RagQueryResponse(answer=answer, sources=sources)


