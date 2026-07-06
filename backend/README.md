# CineFind Backend API

Express.js TypeScript REST API connecting the Next.js frontend to PostgreSQL and the Python ML microservice.

## Setup

```bash
npm install
cp .env.example .env  # fill in DATABASE_URL, JWT_SECRET, ML_SERVICE_URL
npm run dev
```

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string for filmdb
- `JWT_SECRET` — Secret for signing JWT tokens
- `ML_SERVICE_URL` — Must be `http://127.0.0.1:8000` (not localhost — IPv6 issue on Node 22)
- `PORT` — Default 3001

## API Reference

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login, returns JWT
- `GET /api/auth/me` — Get current user (auth required)

### Films
- `GET /api/films/search?q=&genre=&language=&year=&indie=` — Search films
- `GET /api/films/:id` — Get film details

### Recommendations
- `POST /api/recommendations/prompt` — Natural language query (no auth needed)
  - Body: `{ query, model: "tfidf"|"embedding"|"hybrid", n }`
- `GET /api/recommendations/similar/:filmId?model=hybrid` — Similar films
- `GET /api/recommendations/personalised` — Based on user preferences (auth required)
- `POST /api/recommendations/compare` — Compare all three models

### Watchlist (auth required)
- `GET /api/user/watchlist`
- `POST /api/user/watchlist` — Body: `{ tmdbId, status }`
- `DELETE /api/user/watchlist/:tmdbId`

### Preferences (auth required)
- `PUT /api/user/preferences` — Body: `{ preferredGenres, preferredLanguages, preferredEras }`

### Debug
- `GET /health` — Health check
- `GET /debug/ml` — Test backend → ML service chain
