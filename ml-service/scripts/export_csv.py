"""
Phase 1: Export films from PostgreSQL to CSV for ML model training.
"""

import os
import pandas as pd
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")
OUTPUT_PATH = "../../data/films.csv"


def export_films():
    conn = psycopg2.connect(DB_URL)
    df = pd.read_sql("""
        SELECT tmdb_id, title, overview, genres, cast, director, keywords,
               soup, vote_count, vote_average, release_year, poster_path,
               original_language, budget, revenue, runtime, is_indie
        FROM films
        ORDER BY tmdb_id
    """, conn)
    conn.close()

    # Validate soup field quality
    null_soup = df[df['soup'].isna() | (df['soup'].str.strip() == '')].shape[0]
    print(f"Films with empty soup: {null_soup}")

    # Fill null soups with title
    df['soup'] = df['soup'].fillna(df['title'])

    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Exported {len(df)} films to {OUTPUT_PATH}")
    print(f"Indie films: {df['is_indie'].sum()} ({df['is_indie'].mean()*100:.1f}%)")


if __name__ == "__main__":
    export_films()
