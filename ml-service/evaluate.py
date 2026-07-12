import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer
import requests
import random

BASE = "http://127.0.0.1:8000"
CSV  = "../data/films.csv"

print("Loading dataset...")
df = pd.read_csv(CSV)
df = df[df['soup'].notna() & (df['soup'] != '')].reset_index(drop=True)
print(f"Loaded {len(df)} films.")

seed_ids = random.sample(df['tmdb_id'].tolist(), 100)

def get_relevant_ids(seed_row):
    seed_genres = set(str(seed_row.get('genres', '')).split(', '))
    seed_dir    = str(seed_row.get('director', ''))
    relevant    = set()
    for _, row in df.iterrows():
        if row['tmdb_id'] == seed_row['tmdb_id']:
            continue
        row_genres = set(str(row.get('genres', '')).split(', '))
        if seed_genres & row_genres - {'', 'nan'}:
            relevant.add(int(row['tmdb_id']))
        if seed_dir and seed_dir != 'nan' and row.get('director') == seed_dir:
            relevant.add(int(row['tmdb_id']))
    return relevant

def precision_at_k(rec_ids, relevant, k=10):
    hits = sum(1 for r in rec_ids[:k] if r in relevant)
    return hits / k

def ndcg_at_k(rec_ids, relevant, k=10):
    dcg  = sum(1/np.log2(i+2) for i, r in enumerate(rec_ids[:k]) if r in relevant)
    idcg = sum(1/np.log2(i+2) for i in range(min(len(relevant), k)))
    return dcg / idcg if idcg > 0 else 0.0

def diversity_score(rec_ids):
    films = df[df['tmdb_id'].isin(rec_ids)]
    if len(films) < 2:
        return 0.0
    try:
        cv     = CountVectorizer()
        matrix = cv.fit_transform(films['genres'].fillna('').tolist()).toarray()
        sims   = cosine_similarity(matrix)
        n      = len(sims)
        pairs  = n * (n - 1) / 2
        total  = sum(1 - sims[i][j] for i in range(n) for j in range(i+1, n))
        return float(total / pairs) if pairs > 0 else 0.0
    except Exception:
        return 0.0

results  = {m: [] for m in ['tfidf', 'embedding', 'hybrid']}
covered  = {m: set() for m in ['tfidf', 'embedding', 'hybrid']}

print("Running evaluation on 100 seed films...")

for idx, seed_id in enumerate(seed_ids):
    rows = df[df['tmdb_id'] == seed_id]
    if rows.empty:
        continue
    seed_row = rows.iloc[0]
    relevant = get_relevant_ids(seed_row)
    if not relevant:
        continue

    seed_text = str(seed_row.get('soup', str(seed_row.get('title', ''))))[:300]

    # --- TF-IDF: send tmdb_id ---
    try:
        r = requests.post(f"{BASE}/recommend/tfidf",
            json={"tmdb_id": int(seed_id), "n": 10}, timeout=30)
        if r.status_code == 200:
            recs    = r.json().get('results', [])
            rec_ids = [int(x['tmdb_id']) for x in recs]
            results['tfidf'].append({
                'precision': precision_at_k(rec_ids, relevant),
                'ndcg':      ndcg_at_k(rec_ids, relevant),
                'diversity': diversity_score(rec_ids),
            })
            covered['tfidf'].update(rec_ids)
        else:
            print(f"  tfidf {seed_id}: HTTP {r.status_code} — {r.text[:100]}")
    except Exception as e:
        print(f"  tfidf {seed_id}: {e}")

    # --- Embedding: send soup text as query ---
    try:
        r = requests.post(f"{BASE}/recommend/embedding",
            json={"query": seed_text, "n": 10}, timeout=60)
        if r.status_code == 200:
            recs    = r.json().get('results', [])
            rec_ids = [int(x['tmdb_id']) for x in recs]
            results['embedding'].append({
                'precision': precision_at_k(rec_ids, relevant),
                'ndcg':      ndcg_at_k(rec_ids, relevant),
                'diversity': diversity_score(rec_ids),
            })
            covered['embedding'].update(rec_ids)
        else:
            print(f"  embedding {seed_id}: HTTP {r.status_code} — {r.text[:100]}")
    except Exception as e:
        print(f"  embedding {seed_id}: {e}")

    # --- Hybrid: send tmdb_id ---
    try:
        r = requests.post(f"{BASE}/recommend/hybrid",
            json={"tmdb_id": int(seed_id), "n": 10}, timeout=60)
        if r.status_code == 200:
            recs    = r.json().get('results', [])
            rec_ids = [int(x['tmdb_id']) for x in recs]
            results['hybrid'].append({
                'precision': precision_at_k(rec_ids, relevant),
                'ndcg':      ndcg_at_k(rec_ids, relevant),
                'diversity': diversity_score(rec_ids),
            })
            covered['hybrid'].update(rec_ids)
        else:
            print(f"  hybrid {seed_id}: HTTP {r.status_code} — {r.text[:100]}")
    except Exception as e:
        print(f"  hybrid {seed_id}: {e}")

    if (idx + 1) % 10 == 0:
        print(f"Progress: {idx+1}/100")

print("\n=== FINAL RESULTS ===")
for model in ['tfidf', 'embedding', 'hybrid']:
    r = results[model]
    if r:
        p   = np.mean([x['precision'] for x in r])
        n   = np.mean([x['ndcg'] for x in r])
        d   = np.mean([x['diversity'] for x in r])
        cov = len(covered[model]) / len(df)
        print(f"{model.upper():12s}: P@10={p:.3f} | NDCG@10={n:.3f} | Diversity={d:.3f} | Coverage={cov:.3f}")
    else:
        print(f"{model.upper():12s}: no results collected")

print("\n=== MEAN VOTE COUNT OF RECOMMENDATIONS ===")
for model in ['tfidf', 'embedding', 'hybrid']:
    all_ids = list(covered[model])
    if all_ids:
        avg = df[df['tmdb_id'].isin(all_ids)]['vote_count'].mean()
        print(f"{model}: {avg:.0f}")
    else:
        print(f"{model}: no data")
