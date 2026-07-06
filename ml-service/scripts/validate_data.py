"""
Phase 1: Validate soup field quality across a sample of films.
"""

import pandas as pd

CSV_PATH = "../../data/films.csv"


def validate():
    df = pd.read_csv(CSV_PATH)
    sample = df.sample(100, random_state=42)

    print(f"Total films: {len(df)}")
    print(f"Indie films: {df['is_indie'].sum()} ({df['is_indie'].mean()*100:.1f}%)")
    print(f"\nSoup field quality check (sample of 100):")
    print(f"  Empty/null: {sample['soup'].isna().sum() + (sample['soup'].str.strip() == '').sum()}")
    print(f"  Avg length: {sample['soup'].str.len().mean():.0f} chars")
    print(f"  Min length: {sample['soup'].str.len().min()} chars")

    print(f"\nLanguage distribution:")
    print(df['original_language'].value_counts().head(10))

    # Add validation checks for null soup fields
    null_soup_ids = df[df['soup'].isna() | (df['soup'].str.strip() == '')]['tmdb_id'].tolist()
    if null_soup_ids:
        print(f"\nWARNING: {len(null_soup_ids)} films have empty soup fields")
        print(f"Film IDs: {null_soup_ids[:10]}")
    else:
        print(f"\nAll {len(df)} films have valid soup fields")


if __name__ == "__main__":
    validate()
