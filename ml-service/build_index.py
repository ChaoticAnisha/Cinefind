# build_index.py
#
# Run this ONCE to build and save both models.
# After this, the FastAPI server just loads them on startup.
# Takes 10-20 minutes total.

import os
import sys

# Add the ml-service directory to Python's path
sys.path.insert(0, os.path.dirname(__file__))

from recommenders.tfidf import TFIDFRecommender
from recommenders.embedding import EmbeddingRecommender

CSV_PATH = "../data/films.csv"
SAVE_DIR = "./models"
CHROMA_DIR = "./chroma_db"

def main():
    print("=" * 50)
    print("PHASE 1: Building TF-IDF model")
    print("=" * 50)

    tfidf = TFIDFRecommender()
    tfidf.build(CSV_PATH)
    tfidf.save(SAVE_DIR)

    print("\nTesting TF-IDF model...")
    # Quick sanity check — get recommendations for first film
    first_id = int(tfidf.df['tmdb_id'].iloc[0])
    results = tfidf.recommend_by_id(first_id, n=3)
    if results:
        print(f"TF-IDF test passed. Sample: {results[0]['title']}")
    else:
        print("Warning: TF-IDF returned no results for test film")

    print("\n" + "=" * 50)
    print("PHASE 2: Building Embedding model (slow step)")
    print("=" * 50)

    emb = EmbeddingRecommender()
    emb.build(CSV_PATH, CHROMA_DIR)

    print("\nTesting Embedding model...")
    results = emb.recommend_by_text("dark psychological thriller", n=3)
    if results:
        print(f"Embedding test passed. Sample: {results[0]['title']}")
    else:
        print("Warning: Embedding returned no results for test query")

    print("\n" + "=" * 50)
    print("ALL DONE — Both models built and saved.")
    print(f"TF-IDF saved to: {SAVE_DIR}/")
    print(f"ChromaDB saved to: {CHROMA_DIR}/")
    print("\nYou can now run: python main.py")
    print("=" * 50)

if __name__ == "__main__":
    main()