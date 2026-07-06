'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { searchFilms } from '@/lib/api'
import FilmGrid from '@/components/FilmGrid'

const GENRES = ['Drama', 'Thriller', 'Horror', 'Comedy', 'Documentary', 'Animation', 'Crime', 'Romance']
const LANGUAGES = [
  { code: 'ko', label: '🇰🇷 Korean' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'ja', label: '🇯🇵 Japanese' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'de', label: '🇩🇪 German' },
  { code: 'it', label: '🇮🇹 Italian' },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedLang, setSelectedLang] = useState('')
  const [indieOnly, setIndieOnly] = useState(false)
  const [films, setFilms] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const toggleGenre = (g: string) =>
    setSelectedGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])

  const handleSearch = async (e?: React.FormEvent, overridePage = 1) => {
    e?.preventDefault()
    setLoading(true)
    setSearched(true)
    setError(null)
    setPage(overridePage)
    try {
      const data = await searchFilms({
        q: query || undefined,
        genre: selectedGenres[0] || undefined,
        language: selectedLang || undefined,
        indie: indieOnly || undefined,
        page: overridePage,
      })
      setFilms(data.films)
      setTotal(data.pagination?.total || 0)
    } catch (err: any) {
      setError(err?.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSelectedGenres([])
    setSelectedLang('')
    setIndieOnly(false)
  }

  const hasFilters = selectedGenres.length > 0 || selectedLang || indieOnly
  const totalPages = Math.ceil(total / 20)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── Search header ────────────────────────────────────────────────── */}
      <div className="bg-[linear-gradient(180deg,#111111_0%,#0a0a0a_100%)] border-b border-[#1a1a1a] py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-white text-center mb-6 flex items-center justify-center gap-2">
            <Search size={22} className="text-[#a78bfa]" />
            Search Films
          </h1>

          <form onSubmit={handleSearch} className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, director, actor, keyword..."
              className="w-full bg-[#111111] border border-[#333333] focus:border-[#7c3aed] text-white rounded-xl pl-11 pr-32 py-3.5 outline-none transition-colors placeholder:text-[#52525b]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-[#52525b] text-xs font-medium uppercase tracking-wider">
              <SlidersHorizontal size={12} /> Genre
            </span>
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => toggleGenre(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedGenres.includes(g)
                    ? 'bg-[#7c3aed] border-[#7c3aed] text-white'
                    : 'border-[#222222] text-[#a1a1aa] hover:border-[#333333] hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#52525b] text-xs font-medium uppercase tracking-wider">Language</span>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setSelectedLang(selectedLang === l.code ? '' : l.code)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedLang === l.code
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-[#222222] text-[#a1a1aa] hover:border-[#333333] hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Indie toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setIndieOnly(!indieOnly)}
                className={`relative w-9 h-5 rounded-full transition-colors ${indieOnly ? 'bg-[#7c3aed]' : 'bg-[#222222]'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${indieOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-[#a1a1aa] text-xs">Indie Only</span>
            </label>

            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-[#52525b] hover:text-white text-xs transition-colors">
                <X size={12} /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ── Results header ───────────────────────────────────────────── */}
        {searched && !loading && (
          <p className="text-[#52525b] text-sm mb-5">
            {error ? '' : `Found ${total.toLocaleString()} films`}
            {selectedGenres.length > 0 && ` · ${selectedGenres.join(', ')}`}
            {selectedLang && ` · ${LANGUAGES.find(l => l.code === selectedLang)?.label}`}
            {indieOnly && ' · Indie only'}
          </p>
        )}

        {/* ── Grid / states ────────────────────────────────────────────── */}
        {!searched ? (
          <div className="flex flex-col items-center justify-center py-28 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center">
              <Search size={24} className="text-[#333333]" />
            </div>
            <p className="text-white font-semibold">Search for films</p>
            <p className="text-[#52525b] text-sm">Enter a title, director, or use the filters above</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400 mb-3">{error}</p>
            <button onClick={() => handleSearch()} className="text-[#7c3aed] hover:text-[#a78bfa] text-sm">Retry</button>
          </div>
        ) : (
          <FilmGrid
            films={films}
            isLoading={loading}
            emptyMessage="No films match your search. Try different filters."
          />
        )}

        {/* ── Pagination ───────────────────────────────────────────────── */}
        {searched && !loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => handleSearch(undefined, page - 1)}
              disabled={page === 1}
              className="px-4 py-2 text-sm border border-[#222222] text-[#a1a1aa] rounded-lg hover:border-[#7c3aed] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  onClick={() => handleSearch(undefined, p)}
                  className={`w-9 h-9 text-sm rounded-lg border transition-colors ${
                    p === page
                      ? 'bg-[#7c3aed] border-[#7c3aed] text-white'
                      : 'border-[#222222] text-[#a1a1aa] hover:border-[#333333] hover:text-white'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => handleSearch(undefined, page + 1)}
              disabled={page >= totalPages}
              className="px-4 py-2 text-sm border border-[#222222] text-[#a1a1aa] rounded-lg hover:border-[#7c3aed] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
