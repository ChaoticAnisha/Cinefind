"""
Phase 2: Build and save all ML models (TF-IDF, Embedding, Hybrid).
Run this once to generate model files before starting the FastAPI service.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from recommenders.tfidf import TFIDFRecommender
from recommenders.embedding import EmbeddingRecommender

CSV_PATH = "./models/films_clean.csv"
MODELS_DIR = "./models"
CHROMA_DIR = "./chroma_db"


def build_all():
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(CHROMA_DIR, exist_ok=True)

    print("=" * 50)
    print("Building TF-IDF model...")
    tfidf = TFIDFRecommender()
    tfidf.build(CSV_PATH)
    tfidf.save(MODELS_DIR)
    print(f"TF-IDF matrix shape: {tfidf.tfidf_matrix.shape}")
    print("TF-IDF model saved to models/")

    print("=" * 50)
    print("Building Embedding model (this takes ~5 minutes)...")
    emb = EmbeddingRecommender()
    emb.build(CSV_PATH, CHROMA_DIR)
    print(f"Embedding matrix shape: {emb.embeddings.shape}")
    print("Embedding model saved to chroma_db/")

    print("=" * 50)
    print("Testing models with sample queries...")

    # Test TF-IDF
    results = tfidf.recommend_by_text("dark psychological thriller", n=3)
    print(f"TF-IDF test: {[r['title'] for r in results]}")

    # Test Embedding
    emb.load(CSV_PATH, CHROMA_DIR)
    results = emb.recommend_by_text("emotional Korean family drama", n=3)
    print(f"Embedding test: {[r['title'] for r in results]}")

    print("=" * 50)
    print("All models built successfully!")


if __name__ == "__main__":
    build_all()
