import psycopg2
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD")
)

df = pd.read_sql("SELECT * FROM films WHERE soup IS NOT NULL AND soup != ''", conn)
conn.close()

os.makedirs("../data", exist_ok=True)
df.to_csv("../data/films.csv", index=False)
print(f"Exported {len(df)} films to ../data/films.csv")