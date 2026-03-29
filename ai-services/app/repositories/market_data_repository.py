from __future__ import annotations
from typing import Optional, Union
from bson import ObjectId
from app.core.database import get_database


class MarketDataRepository:
    def __init__(self, database=None) -> None:
        self.database = database or get_database()
        self.market_data = self.database['market_data']
        self.ingestion_jobs = self.database['ingestion_jobs']
        self.backtest_results = self.database['backtest_results']
        self.rag_documents = self.database['rag_documents']

    def create_job(self, payload: dict) -> str:
        result = self.ingestion_jobs.insert_one(payload)
        return str(result.inserted_id)

    def update_job(self, job_id: str, payload: dict) -> None:
        self.ingestion_jobs.update_one({'_id': ObjectId(job_id)}, {'$set': payload})

    def bulk_insert_market_data(self, rows: list[dict]) -> int:
        if not rows:
            return 0
        result = self.market_data.insert_many(rows)
        return len(result.inserted_ids)

    def get_job(self, job_id: str) -> Optional[dict]:
        document = self.ingestion_jobs.find_one({'_id': ObjectId(job_id)})
        if not document:
            return None
        document['job_id'] = str(document.pop('_id'))
        return document

    def save_backtest_result(self, payload: dict) -> str:
        result = self.backtest_results.insert_one(payload)
        return str(result.inserted_id)

    def get_backtest_results(self, symbol: str) -> list[dict]:
        documents = list(self.backtest_results.find({'symbol': symbol.upper()}).sort('created_at', -1))
        for document in documents:
            document['id'] = str(document.pop('_id'))
        return documents

    def insert_rag_documents(self, documents: list[dict]) -> list[str]:
        if not documents:
            return []
        result = self.rag_documents.insert_many(documents)
        return [str(inserted_id) for inserted_id in result.inserted_ids]

    def get_rag_documents_by_ids(self, ids: list[str]) -> list[dict]:
        object_ids = [ObjectId(doc_id) for doc_id in ids]
        documents = list(self.rag_documents.find({'_id': {'$in': object_ids}}))
        serialized = []
        for document in documents:
            document['id'] = str(document.pop('_id'))
            serialized.append(document)
        return serialized
