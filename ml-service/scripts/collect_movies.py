"""
Phase 1: TMDB Data Collection Script
Collects 3,000 films from TMDB API and saves to PostgreSQL filmdb database.
"""

import os
import time
import requests
import psycopg2
from psycopg2.extras import execute_values
from tqdm import tqdm
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
DB_URL = os.getenv("DATABASE_URL")
BASE_URL = "https://api.themoviedb.org/3"

LANGUAGES = ["en", "ko", "fr", "ja", "es", "de", "it", "zh"]
TARGET_FILMS = 3000


def fetch_movie_details(movie_id: int) -> dict:
    """Fetch full movie details including credits and keywords."""
    details = requests.get(
        f"{BASE_URL}/movie/{movie_id}",
        params={"api_key": TMDB_API_KEY, "append_to_response": "credits,keywords"}
    ).json()
    return details


def extract_director(credits: dict) -> str:
    """Extract director name from credits data."""
    crew = credits.get("crew", [])
    directors = [m["name"] for m in crew if m.get("job") == "Director"]
    return directors[0] if directors else ""


def extract_cast(credits: dict) -> str:
    """Extract top 5 cast members from credits data."""
    cast = credits.get("cast", [])
    return " ".join([m["name"] for m in cast[:5]])


def extract_keywords(keywords_data: dict) -> str:
    """Extract keyword names from TMDB keywords endpoint response."""
    keywords = keywords_data.get("keywords", [])
    return " ".join([k["name"] for k in keywords])


def build_soup(title: str, overview: str, genres: str, cast: str,
               director: str, keywords: str) -> str:
    """Build composite text field for NLP models."""
    return f"{title} {overview} {genres} {cast} {director} {keywords}".lower()


def classify_indie(vote_count: int, budget: int) -> bool:
    """Indie classification heuristic based on vote count and budget thresholds."""
    if vote_count < 1000:
        return True
    if budget > 0 and budget < 10_000_000:
        return True
    return False


def save_film(conn, film: dict) -> None:
    """Save film to PostgreSQL with upsert on tmdb_id."""
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO films (
                tmdb_id, title, overview, genres, cast, director,
                keywords, soup, vote_count, vote_average, release_year,
                poster_path, original_language, budget, revenue, runtime, is_indie
            ) VALUES (
                %(tmdb_id)s, %(title)s, %(overview)s, %(genres)s, %(cast)s, %(director)s,
                %(keywords)s, %(soup)s, %(vote_count)s, %(vote_average)s, %(release_year)s,
                %(poster_path)s, %(original_language)s, %(budget)s, %(revenue)s, %(runtime)s, %(is_indie)s
            )
            ON CONFLICT (tmdb_id) DO UPDATE SET
                soup = EXCLUDED.soup,
                is_indie = EXCLUDED.is_indie
        """, film)
    conn.commit()


def collect_movies():
    """Main collection loop with pagination and rate limiting."""
    conn = psycopg2.connect(DB_URL)
    collected = 0
    page = 1

    with tqdm(total=TARGET_FILMS, desc="Collecting films") as pbar:
        while collected < TARGET_FILMS:
            for lang in LANGUAGES:
                resp = requests.get(
                    f"{BASE_URL}/discover/movie",
                    params={
                        "api_key": TMDB_API_KEY,
                        "with_original_language": lang,
                        "vote_count.gte": 50,
                        "sort_by": "vote_count.asc",
                        "page": page,
                    }
                ).json()

                for movie in resp.get("results", []):
                    try:
                        details = fetch_movie_details(movie["id"])
                        credits = details.get("credits", {})
                        keywords_data = details.get("keywords", {})

                        director = extract_director(credits)
                        cast = extract_cast(credits)
                        keywords = extract_keywords(keywords_data)
                        genres = " ".join([g["name"] for g in details.get("genres", [])])
                        soup = build_soup(
                            details.get("title", ""), details.get("overview", ""),
                            genres, cast, director, keywords
                        )

                        release_year = int(details.get("release_date", "0000")[:4]) if details.get("release_date") else 0
                        film = {
                            "tmdb_id": details["id"],
                            "title": details.get("title", ""),
                            "overview": details.get("overview", ""),
                            "genres": genres,
                            "cast": cast,
                            "director": director,
                            "keywords": keywords,
                            "soup": soup,
                            "vote_count": details.get("vote_count", 0),
                            "vote_average": details.get("vote_average", 0.0),
                            "release_year": release_year,
                            "poster_path": details.get("poster_path", ""),
                            "original_language": details.get("original_language", ""),
                            "budget": details.get("budget", 0),
                            "revenue": details.get("revenue", 0),
                            "runtime": details.get("runtime", 0),
                            "is_indie": classify_indie(details.get("vote_count", 0), details.get("budget", 0)),
                        }

                        save_film(conn, film)
                        collected += 1
                        pbar.update(1)
                        time.sleep(0.05)  # 50ms rate limit

                        if collected >= TARGET_FILMS:
                            break
                    except Exception as e:
                        print(f"Error processing movie {movie.get('id')}: {e}")
                        continue

                if collected >= TARGET_FILMS:
                    break
            page += 1

    conn.close()
    print(f"\nCollection complete: {collected} films saved to PostgreSQL filmdb")


if __name__ == "__main__":
    collect_movies()
