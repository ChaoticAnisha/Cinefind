-- CineFind: PostgreSQL films table schema
-- Phase 1: Data Collection

CREATE DATABASE filmdb;

\c filmdb;

CREATE TABLE IF NOT EXISTS films (
    id              SERIAL PRIMARY KEY,
    tmdb_id         INTEGER UNIQUE NOT NULL,
    title           TEXT NOT NULL,
    overview        TEXT,
    genres          TEXT,
    cast            TEXT,
    director        TEXT,
    keywords        TEXT,
    soup            TEXT,
    vote_count      INTEGER DEFAULT 0,
    vote_average    FLOAT DEFAULT 0.0,
    release_year    INTEGER,
    poster_path     TEXT,
    original_language VARCHAR(10),
    budget          BIGINT DEFAULT 0,
    revenue         BIGINT DEFAULT 0,
    runtime         INTEGER DEFAULT 0,
    is_indie        BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_films_tmdb_id ON films(tmdb_id);
CREATE INDEX idx_films_language ON films(original_language);
CREATE INDEX idx_films_is_indie ON films(is_indie);
CREATE INDEX idx_films_vote_count ON films(vote_count);
