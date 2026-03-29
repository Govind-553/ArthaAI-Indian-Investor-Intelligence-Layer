from __future__ import annotations
import json
import os
import faiss
import numpy as np
from app.core.config import get_settings


class FaissVectorStore:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.index_path = self.settings.faiss_index_path
        self.metadata_path = self.settings.faiss_metadata_path
        self.dimension = 1536
        self.index = None
        self.metadata = []
        self._ensure_loaded()

    def _ensure_loaded(self) -> None:
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        if os.path.exists(self.index_path):
            self.index = faiss.read_index(self.index_path)
        else:
            self.index = faiss.IndexFlatIP(self.dimension)

        if os.path.exists(self.metadata_path):
            with open(self.metadata_path, 'r', encoding='utf-8') as file:
                self.metadata = json.load(file)
        else:
            self.metadata = []

    def add_embeddings(self, embeddings: list[list[float]], metadata_items: list[dict]) -> None:
        matrix = np.array(embeddings, dtype='float32')
        faiss.normalize_L2(matrix)
        self.index.add(matrix)
        self.metadata.extend(metadata_items)
        faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, 'w', encoding='utf-8') as file:
            json.dump(self.metadata, file)

    def search(self, embedding: list[float], top_k: int) -> list[dict]:
        if self.index.ntotal == 0:
            return []

        vector = np.array([embedding], dtype='float32')
        faiss.normalize_L2(vector)
        scores, indices = self.index.search(vector, top_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.metadata):
                continue
            result = dict(self.metadata[idx])
            result['relevance_score'] = float(score)
            results.append(result)
        return results
