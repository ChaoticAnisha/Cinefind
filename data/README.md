# Data Directory

This directory contains the TMDB film dataset used by CineFind.

## films.csv

The main dataset file (excluded from git due to size).

### Schema

| Column | Type | Description |
|--------|------|-------------|
| tmdb_id | int | TMDB movie ID |
| title | str | Film title |
| overview | str | Plot overview |
| genres | str | Pipe-separated genre list |
| cast | str | Top 5 cast members |
| director | str | Director name |
| keywords | str | TMDB keywords |
| soup | str | Composite text field for NLP |
| vote_count | int | Number of TMDB votes |
| vote_average | float | Average rating (0-10) |
| release_year | int | Year of release |
| poster_path | str | TMDB poster path |
| original_language | str | ISO 639-1 language code |
| budget | int | Production budget (USD) |
| revenue | int | Box office revenue (USD) |
| runtime | int | Runtime in minutes |
| is_indie | bool | Indie classification heuristic |

## Collection

3,000 films were collected from TMDB API across 150 pages using the discover endpoint filtered for:
- vote_count >= 50
- English, Korean, French, Japanese, Spanish, German, Italian, Chinese
- Years 1970-2024
- Sorted by vote_count ascending (to capture more obscure films)

Result: 1,445 films classified as indie (48.2% of dataset)
