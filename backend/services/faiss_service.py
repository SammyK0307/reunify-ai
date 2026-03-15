"""
FAISS vector similarity search service
Loads all embeddings from MongoDB at startup, rebuilds index on additions
"""

import faiss
import numpy as np
import logging
from typing import List, Tuple

logger = logging.getLogger(__name__)
EMBEDDING_DIM = 512


class FAISSService:
    def __init__(self):
        self.index = None
        self.child_ids: List[str] = []  # Ordered list mapping FAISS index -> child_id

    async def initialize(self):
        """Build FAISS index from existing DB records"""
        self.index = faiss.IndexFlatL2(EMBEDDING_DIM)
        await self._load_from_db()
        logger.info(f"FAISS index initialized with {self.index.ntotal} embeddings")

    async def _load_from_db(self):
        """Pull all embeddings from MongoDB and populate index"""
        try:
            from models.child import MissingChild
            children = await MissingChild.find(MissingChild.case_status == "active").to_list()
            if not children:
                return
            embeddings = []
            for child in children:
                emb = np.array(child.embedding_vector, dtype=np.float32)
                if len(emb) == EMBEDDING_DIM:
                    embeddings.append(emb)
                    self.child_ids.append(child.child_id)
            if embeddings:
                matrix = np.vstack(embeddings)
                self.index.add(matrix)
        except Exception as e:
            logger.error(f"Failed to load embeddings from DB: {e}")

    def add_embedding(self, child_id: str, embedding: np.ndarray):
        """Add a new embedding to the FAISS index"""
        emb = embedding.reshape(1, -1).astype(np.float32)
        self.index.add(emb)
        self.child_ids.append(child_id)
        logger.info(f"Added embedding for {child_id}, total: {self.index.ntotal}")

    def search(self, query_embedding: np.ndarray, top_k: int = 3) -> List[Tuple[str, float]]:
        """
        Returns list of (child_id, confidence_score) tuples.
        Converts L2 distance -> confidence percentage (0-100).
        """
        if self.index.ntotal == 0:
            return []

        k = min(top_k, self.index.ntotal)
        query = query_embedding.reshape(1, -1).astype(np.float32)
        distances, indices = self.index.search(query, k)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1:
                continue
            child_id = self.child_ids[idx]
            # Convert L2 distance to confidence (0-100%)
            # L2 distance ~0 = very similar, ~4 = very different for normalized vecs
            confidence = max(0.0, min(100.0, (1.0 - dist / 4.0) * 100.0))
            results.append((child_id, round(confidence, 2)))

        return results

    async def rebuild_index(self):
        """Full rebuild from DB (call after bulk changes)"""
        self.index.reset()
        self.child_ids.clear()
        await self._load_from_db()


faiss_service = FAISSService()
