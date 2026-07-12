# main.py — FastAPI Microservice
#
# This is the HTTP server that Node.js will call.
# It exposes three endpoints:
#   POST /recommend/tfidf      → TF-IDF recommendations
#   POST /recommend/embedding  → Embedding-based recommendations
#   POST /recommend/hybrid     → Hybrid recommendations
#
# Run with: uvicorn main:app --reload --port 8000

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from recommenders.tfidf import TFIDFRecommender
from recommenders.embedding import EmbeddingRecommender
from recommenders.hybrid import HybridRecommender

app = FastAPI(title="Film Discovery ML Service", version="1.0")

# --- Load models on startup ---
# These load from disk (fast, no recomputing)
SAVE_DIR = "./models"
CHROMA_DIR = "./chroma_db"
# CSV_PATH used as fallback only — embeddings.npy in chroma_dir takes priority
CSV_PATH = "./models/films_clean.csv"

print("Loading models...")
tfidf_rec = TFIDFRecommender()
tfidf_rec.load(SAVE_DIR)

emb_rec = EmbeddingRecommender()
emb_rec.load(CSV_PATH, CHROMA_DIR)

hybrid_rec = HybridRecommender(tfidf_rec, emb_rec)

print("All models loaded. Server ready.")


# --- Request/Response models ---
# Pydantic models define what JSON shape each endpoint accepts

class TFIDFRequest(BaseModel):
    tmdb_id: Optional[int] = None    # recommend similar to this film
    query: Optional[str] = None       # or find films matching this text
    n: Optional[int] = 10             # how many results

class EmbeddingRequest(BaseModel):
    query: str                         # text query (required)
    tmdb_id: Optional[int] = None
    n: Optional[int] = 10
    filters: Optional[dict] = None    # e.g. {"original_language": "ko"}

class HybridRequest(BaseModel):
    query: Optional[str] = None
    tmdb_id: Optional[int] = None
    n: Optional[int] = 10
    alpha: Optional[float] = 0.4     # TF-IDF weight
    beta: Optional[float] = 0.6      # Embedding weight
    filters: Optional[dict] = None


# --- Endpoints ---

@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "status": "running",
        "models": ["tfidf", "embedding", "hybrid"],
        "films_indexed": tfidf_rec.tfidf_matrix.shape[0]
    }

@app.get("/health")
def health():
    """Render health check — must return 200."""
    return {"status": "ok"}

@app.post("/recommend/tfidf")
def recommend_tfidf(req: TFIDFRequest):
    """
    TF-IDF based recommendations.
    
    Send either:
    { "tmdb_id": 550 }             → similar films to Fight Club
    { "query": "dark thriller" }   → films matching this query
    """
    if not req.tmdb_id and not req.query:
        raise HTTPException(400, "Provide either tmdb_id or query")

    if req.query:
        results = tfidf_rec.recommend_by_text(req.query, n=req.n)
    else:
        results = tfidf_rec.recommend_by_id(req.tmdb_id, n=req.n)

    return {"results": results, "count": len(results), "model": "tfidf"}

@app.post("/recommend/embedding")
def recommend_embedding(req: EmbeddingRequest):
    """
    Semantic embedding-based recommendations.
    
    Send:
    { "query": "emotional Korean family drama" }
    { "query": "indie horror social commentary", "filters": {"is_indie": 1} }
    """
    if req.tmdb_id and not req.query:
        results = emb_rec.recommend_by_id(req.tmdb_id, n=req.n)
    else:
        results = emb_rec.recommend_by_text(req.query, n=req.n, filters=req.filters)

    return {"results": results, "count": len(results), "model": "embedding"}

@app.post("/recommend/hybrid")
def recommend_hybrid(req: HybridRequest):
    """
    Hybrid recommendations combining TF-IDF + Embeddings + Indie bonus.
    
    Send:
    { "query": "dark psychological Korean thriller from the 2000s" }
    { "tmdb_id": 550, "alpha": 0.3, "beta": 0.7 }
    """
    if not req.query and not req.tmdb_id:
        raise HTTPException(400, "Provide either query or tmdb_id")

    results = hybrid_rec.recommend(
        query=req.query,
        tmdb_id=req.tmdb_id,
        n=req.n,
        alpha=req.alpha,
        beta=req.beta,
        filters=req.filters
    )

    return {"results": results, "count": len(results), "model": "hybrid"}

@app.get("/film/{tmdb_id}")
def get_film(tmdb_id: int):
    """Get details for a specific film by TMDB ID."""
    rows = tfidf_rec.df[tfidf_rec.df['tmdb_id'] == tmdb_id]
    if rows.empty:
        raise HTTPException(404, f"Film {tmdb_id} not found")

    film = rows.iloc[0]
    return {
        "tmdb_id": int(film['tmdb_id']),
        "title": film['title'],
        "overview": film['overview'],
        "genres": film['genres'],
        "release_year": film['release_year'],
        "vote_average": film['vote_average'],
        "vote_count": film['vote_count'],
        "poster_path": film['poster_path'],
        "director": film['director'],
        "cast_list": film['cast_list'],
        "is_indie": bool(film['is_indie'])
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)