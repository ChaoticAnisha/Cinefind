import requests
import time
import os
import psycopg2
from dotenv import load_dotenv
from tqdm import tqdm

load_dotenv()

TOKEN = os.getenv("TMDB_TOKEN")
HEADERS = {"Authorization": f"Bearer {TOKEN}"}
BASE = "https://api.themoviedb.org/3"

def get_db():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )

def fetch_movie_details(movie_id):
    try:
        r = requests.get(f"{BASE}/movie/{movie_id}",
            headers=HEADERS,
            params={"append_to_response": "credits,keywords"},
            timeout=10
        )
        if r.status_code != 200:
            return None
        return r.json()
    except:
        return None

def extract_director(credits):
    for person in credits.get("crew", []):
        if person["job"] == "Director":
            return person["name"]
    return ""

def extract_cast(credits, n=5):
    cast = credits.get("cast", [])[:n]
    return ", ".join([p["name"] for p in cast])

def extract_keywords(keywords_data):
    kws = keywords_data.get("keywords", [])
    return ", ".join([k["name"] for k in kws[:15]])

def build_soup(row):
    parts = [
        row.get("genres", ""),
        row.get("keywords", ""),
        row.get("director", ""),
        row.get("cast_list", ""),
        row.get("overview", ""),
        row.get("tagline", "")
    ]
    return " ".join([p for p in parts if p])

def save_film(conn, film):
    sql = """
    INSERT INTO films (
        tmdb_id, title, overview, tagline, genres,
        release_year, original_language, vote_average, vote_count,
        runtime, director, cast_list, keywords, poster_path,
        production_countries, budget, revenue, soup, is_indie
    ) VALUES (
        %s, %s, %s, %s, %s,
        %s, %s, %s, %s,
        %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s
    ) ON CONFLICT (tmdb_id) DO NOTHING;
    """
    with conn.cursor() as cur:
        cur.execute(sql, (
            film["tmdb_id"], film["title"], film["overview"],
            film["tagline"], film["genres"], film["release_year"],
            film["original_language"], film["vote_average"],
            film["vote_count"], film["runtime"], film["director"],
            film["cast_list"], film["keywords"], film["poster_path"],
            film["production_countries"], film["budget"],
            film["revenue"], film["soup"], film["is_indie"]
        ))
    conn.commit()

def collect_movies():
    conn = get_db()
    print("Connected to database.")

    total_saved = 0

    for vote_max in [500, 2000, 5000]:
        for page in tqdm(range(1, 51), desc=f"Collecting (vote_max={vote_max})"):
            r = requests.get(f"{BASE}/discover/movie",
                headers=HEADERS,
                params={
                    "sort_by": "vote_count.desc",
                    "vote_count.gte": 10,
                    "vote_count.lte": vote_max,
                    "page": page,
                    "include_adult": False,
                },
                timeout=10
            )
            if r.status_code != 200:
                continue

            movies = r.json().get("results", [])
            for movie in movies:
                movie_id = movie["id"]
                details = fetch_movie_details(movie_id)
                if not details:
                    continue
                if not details.get("overview"):
                    continue

                genres = ", ".join([g["name"] for g in details.get("genres", [])])
                countries = ", ".join([c["name"] for c in details.get("production_countries", [])])
                release_year = None
                rd = details.get("release_date", "")
                if rd and len(rd) >= 4:
                    try:
                        release_year = int(rd[:4])
                    except:
                        pass

                credits = details.get("credits", {})
                keywords_data = details.get("keywords", {})

                director = extract_director(credits)
                cast_list = extract_cast(credits)
                keywords = extract_keywords(keywords_data)

                vc = details.get("vote_count", 0)
                budget = details.get("budget", 0)
                is_indie = vc < 1000 or budget < 5000000 or budget == 0

                film = {
                    "tmdb_id": movie_id,
                    "title": details.get("title", ""),
                    "overview": details.get("overview", ""),
                    "tagline": details.get("tagline", ""),
                    "genres": genres,
                    "release_year": release_year,
                    "original_language": details.get("original_language", ""),
                    "vote_average": details.get("vote_average", 0),
                    "vote_count": vc,
                    "runtime": details.get("runtime", 0),
                    "director": director,
                    "cast_list": cast_list,
                    "keywords": keywords,
                    "poster_path": details.get("poster_path", ""),
                    "production_countries": countries,
                    "budget": budget,
                    "revenue": details.get("revenue", 0),
                    "soup": "",
                    "is_indie": is_indie
                }
                film["soup"] = build_soup(film)

                save_film(conn, film)
                total_saved += 1
                time.sleep(0.05)

    conn.close()
    print(f"\nDone. Total films saved: {total_saved}")

if __name__ == "__main__":
    collect_movies()