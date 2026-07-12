---
title: CineFind ML Service
emoji: 🎬
colorFrom: purple
colorTo: blue
sdk: docker
pinned: false
---

# CineFind ML Service

FastAPI recommendation microservice for CineFind film discovery app.

Endpoints:
- GET /health
- POST /recommend/tfidf
- POST /recommend/embedding  
- POST /recommend/hybrid
- GET /film/{tmdb_id}
