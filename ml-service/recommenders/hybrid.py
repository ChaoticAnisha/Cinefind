# Hybrid Recommender
#
# Combines TF-IDF and Embedding scores with a weighted formula:
#
# FinalScore = α × tfidf_score + β × embedding_score + indie_bonus
#
# Default weights: α=0.4, β=0.6
# Films with low vote counts get an extra indie_bonus
# to actively surface hidden gems

from .tfidf import TFIDFRecommender
from .embedding import EmbeddingRecommender

class HybridRecommender:
    def __init__(self, tfidf: TFIDFRecommender, embedding: EmbeddingRecommender):
        # Both models are passed in — they're already built/loaded
        self.tfidf = tfidf
        self.embedding = embedding

    def _indie_bonus(self, vote_count) -> float:
        """
        Films with fewer votes are less mainstream.
        We reward them slightly to surface hidden gems.
        """
        try:
            vc = int(vote_count)
        except:
            return 0.0

        if vc < 200:
            return 0.15
        elif vc < 500:
            return 0.10
        elif vc < 1000:
            return 0.05
        elif vc < 5000:
            return 0.02
        return 0.0

    def recommend(
        self,
        query: str = None,
        tmdb_id: int = None,
        n: int = 10,
        alpha: float = 0.4,   # weight for TF-IDF
        beta: float = 0.6,    # weight for Embedding
        filters: dict = None
    ) -> list:
        """
        Get hybrid recommendations.
        
        Can take either:
        - a text query: "dark Korean psychological thriller"
        - a tmdb_id: 550 (look up similar films to this one)
        - or both
        """
        if not query and not tmdb_id:
            return []

        # Get more results than needed from each model
        # so we have enough overlap to merge
        fetch_n = max(n * 3, 30)

        # --- Get TF-IDF results ---
        if query:
            tfidf_results = self.tfidf.recommend_by_text(query, n=fetch_n)
        else:
            tfidf_results = self.tfidf.recommend_by_id(tmdb_id, n=fetch_n)

        # --- Get Embedding results ---
        if query:
            emb_results = self.embedding.recommend_by_text(query, n=fetch_n, filters=filters)
        else:
            emb_results = self.embedding.recommend_by_id(tmdb_id, n=fetch_n)

        # --- Build score dictionaries ---
        # Key = tmdb_id, Value = score from that model
        tfidf_scores = {r['tmdb_id']: r['similarity_score'] for r in tfidf_results}
        emb_scores = {r['tmdb_id']: r['similarity_score'] for r in emb_results}

        # Film details (use embedding results as they tend to be richer)
        film_details = {r['tmdb_id']: r for r in emb_results}
        for r in tfidf_results:
            if r['tmdb_id'] not in film_details:
                film_details[r['tmdb_id']] = r

        # --- Combine all film IDs from both models ---
        all_ids = set(tfidf_scores.keys()) | set(emb_scores.keys())

        # --- Calculate hybrid score for each film ---
        scored = []
        for tid in all_ids:
            if tid == tmdb_id:  # exclude the seed film
                continue

            t_score = tfidf_scores.get(tid, 0.0)    # 0 if not in TF-IDF results
            e_score = emb_scores.get(tid, 0.0)       # 0 if not in embedding results

            film = film_details.get(tid, {})
            vote_count = film.get('vote_count', 9999)
            bonus = self._indie_bonus(vote_count)

            # The hybrid formula
            final_score = (alpha * t_score) + (beta * e_score) + bonus

            scored.append({
                **film,
                "tfidf_score": round(t_score, 4),
                "embedding_score": round(e_score, 4),
                "indie_bonus": round(bonus, 4),
                "final_score": round(final_score, 4),
                "model": "hybrid"
            })

        # Sort by final score, highest first
        scored.sort(key=lambda x: x['final_score'], reverse=True)

        return scored[:n]