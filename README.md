# CineFind — AI-Powered Indie Film Discovery

CineFind is a BSc Computing dissertation project built for Softwarica College / Coventry University. It is a full-stack web application that uses three AI recommendation models to help users discover indie and non-mainstream films.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, Zustand |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| ML Service | Python 3.8, FastAPI, scikit-learn, Sentence Transformers |
| Database | PostgreSQL (filmdb) |
| Dataset | 3,000 films from TMDB API |

## Project Structure

```
film-discovery/
├── ml-service/      Python FastAPI ML microservice (port 8000)
├── backend/         Node.js Express TypeScript API (port 3001)
├── frontend/        Next.js React application (port 3000)
└── data/            TMDB film dataset (CSV)
```

## AI Recommendation Models

1. **TF-IDF** — Keyword-based matching using TfidfVectorizer (10,000 terms, ngram 1-2)
2. **Semantic Embedding** — Meaning-based search using Sentence Transformer `all-MiniLM-L6-v2` (384-dim vectors, numpy storage)
3. **Hybrid** — Weighted fusion: `0.4 × TF-IDF + 0.6 × Embedding + indie_bonus`

### Indie Bonus Tiers
- vote_count < 200: +0.15
- vote_count < 500: +0.10
- vote_count < 1000: +0.05

## Quick Start

### 1. ML Service
```bash
cd ml-service
venv\Scripts\activate
uvicorn main:app --host 127.0.0.1 --port 8000
```

### 2. Backend
```bash
cd backend
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm run dev
```

## Key Implementation Notes

- ML service uses `127.0.0.1` not `localhost` — Node.js v22 on Windows resolves `localhost` to IPv6 (`::1`) but uvicorn binds to IPv4
- ChromaDB was replaced with numpy `.npy` storage due to hnswlib C++ segfault on Python 3.8 + Windows
- TF-IDF pickles were rebuilt with Python 3.8 / numpy 1.24.4 after numpy version mismatch
- Discover page always starts with `getPromptRecommendations` to avoid auth-required personalised endpoint for logged-out users

## Dataset

- 3,000 films collected from TMDB API
- 1,445 classified as indie (48.2% of dataset)
- Fields: title, overview, genres, cast, director, keywords, soup (composite text), vote_count, budget, is_indie

## API Endpoints

### ML Service (port 8000)
- `GET /` — Health check
- `POST /recommend/tfidf` — TF-IDF recommendations
- `POST /recommend/embedding` — Semantic embedding recommendations
- `POST /recommend/hybrid` — Hybrid recommendations
- `GET /film/{tmdb_id}` — Film details

### Backend (port 3001)
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user
- `GET /api/films/search` — Search films
- `GET /api/films/:id` — Film details
- `POST /api/recommendations/prompt` — Natural language query
- `GET /api/recommendations/personalised` — Personalised (auth required)
- `POST /api/recommendations/compare` — Compare all three models
- `GET /api/user/watchlist` — Get watchlist
- `POST /api/user/watchlist` — Add to watchlist
- `PUT /api/user/preferences` — Update preferences

## Dissertation Context

**Student:** Anisha  
**Programme:** BSc (Hons) Computing  
**Institution:** Softwarica College of IT & E-Commerce (Coventry University Affiliated)  
**Project:** AI-powered recommender system comparison — TF-IDF vs Semantic Embedding vs Hybrid for indie film discovery
