# TF-IDF Recommender
# 
# What this does:
# 1. Loads all films from the CSV
# 2. Converts each film's "soup" text into a TF-IDF vector
#    (a list of numbers representing how important each word is)
# 3. When asked for recommendations for a film,
#    it finds the films whose vectors are most similar

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os

class TFIDFRecommender:
    def __init__(self):
        # These will be filled when we call build() or load()
        self.df = None           # our films dataframe
        self.tfidf_matrix = None # the big matrix of TF-IDF vectors
        self.vectorizer = None   # the TF-IDF tool itself
        self.indices = None      # maps tmdb_id → row number in matrix

    def build(self, csv_path: str):
        """
        Reads the CSV and builds the TF-IDF matrix.
        Only needs to run once — then we save and reload.
        """
        print("Loading films CSV...")
        self.df = pd.read_csv(csv_path)

        # Drop rows where soup is empty — we can't vectorise nothing
        self.df = self.df[self.df['soup'].notna() & (self.df['soup'] != '')]
        self.df = self.df.reset_index(drop=True)

        print(f"Building TF-IDF matrix for {len(self.df)} films...")

        # TfidfVectorizer turns text into numbers
        # stop_words='english' removes words like "the", "a", "is"
        # because those words appear in every film and tell us nothing
        # max_features=10000 limits the vocabulary to 10,000 most useful words
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=10000,
            ngram_range=(1, 2)  # also consider 2-word phrases like "psychological thriller"
        )

        # fit_transform does two things:
        # fit = learns the vocabulary from all our films
        # transform = converts each film's soup into a vector
        # Result: a matrix of shape (num_films × 10000)
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['soup'])

        # Create a lookup: tmdb_id → index in matrix
        # So when someone asks for film 12345, we know it's row 47
        self.indices = pd.Series(self.df.index, index=self.df['tmdb_id']).to_dict()

        print("TF-IDF matrix built successfully.")
        print(f"Matrix shape: {self.tfidf_matrix.shape}")

    def save(self, save_dir: str):
        """Save the built model to disk so we don't rebuild every time."""
        os.makedirs(save_dir, exist_ok=True)

        # Save the matrix as a pickle file (Python's way of saving objects)
        with open(os.path.join(save_dir, "tfidf_matrix.pkl"), "wb") as f:
            pickle.dump(self.tfidf_matrix, f)

        with open(os.path.join(save_dir, "tfidf_vectorizer.pkl"), "wb") as f:
            pickle.dump(self.vectorizer, f)

        with open(os.path.join(save_dir, "tfidf_indices.pkl"), "wb") as f:
            pickle.dump(self.indices, f)

        # Save the dataframe too (we need film info to return results)
        self.df.to_csv(os.path.join(save_dir, "films_clean.csv"), index=False)

        print(f"Model saved to {save_dir}")

    def load(self, save_dir: str):
        """Load a previously built model from disk."""
        print("Loading TF-IDF model from disk...")

        with open(os.path.join(save_dir, "tfidf_matrix.pkl"), "rb") as f:
            self.tfidf_matrix = pickle.load(f)

        with open(os.path.join(save_dir, "tfidf_vectorizer.pkl"), "rb") as f:
            self.vectorizer = pickle.load(f)

        with open(os.path.join(save_dir, "tfidf_indices.pkl"), "rb") as f:
            self.indices = pickle.load(f)

        self.df = pd.read_csv(os.path.join(save_dir, "films_clean.csv"))

        print(f"TF-IDF model loaded. {len(self.df)} films ready.")

    def recommend_by_id(self, tmdb_id: int, n: int = 10) -> list:
        """
        Given a film's TMDB ID, return n most similar films.
        
        Example: recommend_by_id(550, 10)
        Returns the 10 most similar films to film with tmdb_id=550
        """
        # Check the film exists in our dataset
        if tmdb_id not in self.indices:
            return []

        # Get the row index of this film in our matrix
        idx = self.indices[tmdb_id]

        # Get this film's TF-IDF vector (one row of the matrix)
        film_vector = self.tfidf_matrix[idx]

        # Compare this vector against ALL other films
        # cosine_similarity returns a score between 0 and 1
        # 1 = identical, 0 = nothing in common
        sim_scores = cosine_similarity(film_vector, self.tfidf_matrix).flatten()

        # Sort films by similarity score, highest first
        # argsort() gives us the indices sorted by score (ascending)
        # [::-1] reverses it to descending
        sorted_indices = sim_scores.argsort()[::-1]

        # Skip index 0 — that's the film itself (similarity = 1.0)
        # Take the next n films
        top_indices = sorted_indices[1:n+1]

        # Build the results list
        results = []
        for i in top_indices:
            film = self.df.iloc[i]
            results.append({
                "tmdb_id": int(film['tmdb_id']),
                "title": film['title'],
                "overview": str(film['overview'])[:200],  # truncate for API response
                "genres": film['genres'],
                "release_year": film['release_year'],
                "vote_average": film['vote_average'],
                "vote_count": film['vote_count'],
                "poster_path": film['poster_path'],
                "is_indie": bool(film['is_indie']),
                "similarity_score": float(sim_scores[i]),
                "model": "tfidf"
            })

        return results

    def recommend_by_text(self, query: str, n: int = 10) -> list:
        """
        Given a text query (like "dark psychological thriller"),
        find the most similar films.
        
        This transforms the query into a TF-IDF vector
        using the same vocabulary the model learned during build(),
        then compares it against all films.
        """
        # Transform the query using the SAME vectorizer
        # (must use transform, not fit_transform — we're not relearning)
        query_vector = self.vectorizer.transform([query])

        # Compare against all films
        sim_scores = cosine_similarity(query_vector, self.tfidf_matrix).flatten()

        # Get top n
        sorted_indices = sim_scores.argsort()[::-1][:n]

        results = []
        for i in sorted_indices:
            if sim_scores[i] < 0.01:  # skip films with near-zero similarity
                continue
            film = self.df.iloc[i]
            results.append({
                "tmdb_id": int(film['tmdb_id']),
                "title": film['title'],
                "overview": str(film['overview'])[:200],
                "genres": film['genres'],
                "release_year": film['release_year'],
                "vote_average": film['vote_average'],
                "vote_count": film['vote_count'],
                "poster_path": film['poster_path'],
                "is_indie": bool(film['is_indie']),
                "similarity_score": float(sim_scores[i]),
                "model": "tfidf"
            })

        return results