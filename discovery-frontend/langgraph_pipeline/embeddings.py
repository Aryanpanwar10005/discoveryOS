"""
Semantic embeddings and similarity analysis.
Used for clustering and deduplication of atomic insights.
"""

from typing import List, Tuple
import numpy as np
from langchain_openai import OpenAIEmbeddings
from sklearn.metrics.pairwise import cosine_similarity
from .model import AtomicInsight


class SemanticEmbedder:
    """Handles semantic embeddings and similarity calculations."""
    
    def __init__(self, model: str = "text-embedding-3-small"):
        """Initialize the embedder."""
        self.embeddings = OpenAIEmbeddings(model=model)
        self.embed_cache = {}
    
    def embed_text(self, text: str) -> List[float]:
        """Embed a text string into vector space."""
        if text in self.embed_cache:
            return self.embed_cache[text]
        
        embedding = self.embeddings.embed_query(text)
        self.embed_cache[text] = embedding
        return embedding
    
    def embed_insights(self, insights: List[AtomicInsight]) -> List[List[float]]:
        """Embed multiple insights."""
        embeddings = []
        for insight in insights:
            embedding = self.embed_text(insight.text)
            embeddings.append(embedding)
        return embeddings
    
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate cosine similarity between two texts."""
        emb1 = self.embed_text(text1)
        emb2 = self.embed_text(text2)
        
        similarity = cosine_similarity([emb1], [emb2])[0][0]
        return float(similarity)
    
    def find_duplicates(
        self,
        insights: List[AtomicInsight],
        threshold: float = 0.85
    ) -> List[Tuple[int, int]]:
        """Find duplicate/highly similar insights."""
        embeddings = self.embed_insights(insights)
        embeddings_array = np.array(embeddings)
        
        # Calculate pairwise similarity
        similarity_matrix = cosine_similarity(embeddings_array)
        
        duplicates = []
        for i in range(len(insights)):
            for j in range(i + 1, len(insights)):
                if similarity_matrix[i][j] >= threshold:
                    duplicates.append((i, j))
        
        return duplicates
    
    def cluster_insights(
        self,
        insights: List[AtomicInsight],
        threshold: float = 0.7
    ) -> List[List[int]]:
        """Cluster similar insights together."""
        if not insights:
            return []
        
        embeddings = self.embed_insights(insights)
        embeddings_array = np.array(embeddings)
        
        # Calculate pairwise similarity
        similarity_matrix = cosine_similarity(embeddings_array)
        
        # Simple clustering: group by similarity
        clusters = []
        assigned = set()
        
        for i in range(len(insights)):
            if i in assigned:
                continue
            
            cluster = [i]
            assigned.add(i)
            
            for j in range(i + 1, len(insights)):
                if j not in assigned and similarity_matrix[i][j] >= threshold:
                    cluster.append(j)
                    assigned.add(j)
            
            clusters.append(cluster)
        
        return clusters
    
    def get_related_insights(
        self,
        target_insight: AtomicInsight,
        candidates: List[AtomicInsight],
        top_k: int = 3,
        threshold: float = 0.6
    ) -> List[int]:
        """Find top-k related insights to a target insight."""
        similarities = []
        
        for idx, candidate in enumerate(candidates):
            sim = self.calculate_similarity(
                target_insight.text,
                candidate.text
            )
            if sim >= threshold:
                similarities.append((idx, sim))
        
        # Sort by similarity and return top_k indices
        similarities.sort(key=lambda x: x[1], reverse=True)
        return [idx for idx, _ in similarities[:top_k]]
