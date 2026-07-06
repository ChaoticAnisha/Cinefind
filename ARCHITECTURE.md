# CineFind — System Architecture

## Three-Tier Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                 │
│              http://localhost:3000                   │
│  Pages: /, /discover, /search, /prompt, /film/[id]  │
│         /watchlist, /profile, /auth/login            │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (axios)
                       ▼
┌─────────────────────────────────────────────────────┐
│              Backend API (Express/Node.js)            │
│              http://127.0.0.1:3001                   │
│  Auth: JWT · DB: Prisma/PostgreSQL · Proxy to ML    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (axios, 60s timeout)
                       ▼
┌─────────────────────────────────────────────────────┐
│            ML Microservice (FastAPI/Python)           │
│              http://127.0.0.1:8000                   │
│  Models: TF-IDF · Embedding · Hybrid                 │
│  Storage: numpy .npy (3000×384 embedding matrix)     │
└─────────────────────────────────────────────────────┘
```

## Data Flow

1. User enters natural language query on /prompt page
2. Frontend POSTs to `/api/recommendations/prompt` (backend)
3. Backend calls `/recommend/hybrid` on ML service
4. ML service runs TF-IDF + Embedding cosine similarity, applies indie bonus
5. Results returned up the chain, displayed as film cards

## Database Schema (PostgreSQL filmdb)

- `users` — id, email, passwordHash, username, createdAt
- `user_preferences` — userId, preferredGenres[], preferredLanguages[], preferredEras[]
- `films` — tmdbId, title, overview, genres, cast, director, posterPath, releaseYear, voteAverage, isIndie, soup
- `watchlist` — userId, tmdbId, status (want_to_watch|watched|not_interested)
- `ratings` — userId, tmdbId, score (1-5)
- `recommendation_logs` — userId, query, model, results[], timestamp
