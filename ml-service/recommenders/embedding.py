# Embedding-Based Recommender using Sentence Transformers + numpy cosine similarity
#
# Replaces ChromaDB (which segfaults on Python 3.8/Windows with hnswlib 0.7.6)
# with a simple numpy matrix: 3000 films × 384 dims = ~4.6 MB, fast enough.

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pandas as pd
import os


class EmbeddingRecommender:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self.embeddings = None   # numpy array (n_films, 384)
        self.df = None
        self.tmdb_ids = None     # list aligned with embeddings rows

    def build(self, csv_path: str, chroma_dir: str):
        """
        Encode all films and save embeddings as .npy file.
        chroma_dir is kept as the save directory for backwards compat.
        """
        print(f"Loading Sentence Transformer model: {self.model_name}")
        self.model = SentenceTransformer(self.model_name)

        print("Loading films CSV...")
        self.df = pd.read_csv(csv_path)
        self.df = self.df[self.df['soup'].notna() & (self.df['soup'] != '')]
        self.df = self.df.reset_index(drop=True)

        print(f"Encoding {len(self.df)} films with Sentence Transformer...")
        print("This will take 2-5 minutes.")

        self.embeddings = self.model.encode(
            self.df['soup'].tolist(),
            show_progress_bar=True,
            batch_size=32
        )
        self.tmdb_ids = self.df['tmdb_id'].tolist()

        print(f"Embeddings shape: {self.embeddings.shape}")

        # Save to disk
        os.makedirs(chroma_dir, exist_ok=True)
        np.save(os.path.join(chroma_dir, "embeddings.npy"), self.embeddings)
        np.save(os.path.join(chroma_dir, "tmdb_ids.npy"), np.array(self.tmdb_ids))
        self.df.to_csv(os.path.join(chroma_dir, "emb_films.csv"), index=False)

        print(f"Embeddings saved to {chroma_dir}")

    def load(self, csv_path: str, chroma_dir: str):
        """Load model and saved embeddings from disk."""
        print("Loading Sentence Transformer model...")
        self.model = SentenceTransformer(self.model_name)

        emb_path = os.path.join(chroma_dir, "embeddings.npy")
        ids_path = os.path.join(chroma_dir, "tmdb_ids.npy")

        if not os.path.exists(emb_path):
            # Fallback: rebuild from CSV
            print(f"embeddings.npy not found — rebuilding from {csv_path}")
            self.build(csv_path, chroma_dir)
            return

        print("Loading pre-computed embeddings from disk...")
        self.embeddings = np.load(emb_path, mmap_mode='r')
        self.tmdb_ids = np.load(ids_path).tolist()

        self.df = pd.read_csv(os.path.join(chroma_dir, "emb_films.csv"))

        print(f"Embedding recommender loaded. {len(self.tmdb_ids)} films indexed.")

    def _format_film(self, row, similarity_score):
        return {
            "tmdb_id": int(row['tmdb_id']),
            "title": str(row['title']),
            "overview": str(row['overview'])[:200],
            "genres": str(row['genres']),
            "release_year": int(row['release_year']) if str(row['release_year']) != 'nan' else 0,
            "vote_average": float(row['vote_average']) if str(row['vote_average']) != 'nan' else 0.0,
            "vote_count": int(row['vote_count']) if str(row['vote_count']) != 'nan' else 0,
            "poster_path": str(row['poster_path']) if str(row['poster_path']) != 'nan' else '',
            "is_indie": bool(row['is_indie']),
            "similarity_score": float(similarity_score),
            "model": "embedding"
        }

    def recommend_by_text(self, query: str, n: int = 10, filters: dict = None) -> list:
        """Given a text query, find semantically similar films."""
        query_emb = self.model.encode([query])  # (1, 384)
        scores = cosine_similarity(query_emb, self.embeddings).flatten()  # (n_films,)

        # Sort descending
        top_indices = scores.argsort()[::-1]

        results = []
        for idx in top_indices:
            if scores[idx] < 0.01:
                break
            row = self.df.iloc[idx]

            # Apply filters if any
            if filters:
                skip = False
                for key, val in filters.items():
                    if str(row.get(key, '')) != str(val):
                        skip = True
                        break
                if skip:
                    continue

            results.append(self._format_film(row, scores[idx]))
            if len(results) >= n:
                break

        return results

    def recommend_by_id(self, tmdb_id: int, n: int = 10) -> list:
        """Given a film's TMDB ID, find similar films."""
        if tmdb_id not in self.tmdb_ids:
            return []

        idx = self.tmdb_ids.index(tmdb_id)
        film_emb = self.embeddings[idx:idx+1]  # (1, 384)
        scores = cosine_similarity(film_emb, self.embeddings).flatten()

        top_indices = scores.argsort()[::-1]

        results = []
        for i in top_indices:
            if int(self.df.iloc[i]['tmdb_id']) == tmdb_id:
                continue  # skip self
            if scores[i] < 0.01:
                break
            results.append(self._format_film(self.df.iloc[i], scores[i]))
            if len(results) >= n:
                break

        return results
