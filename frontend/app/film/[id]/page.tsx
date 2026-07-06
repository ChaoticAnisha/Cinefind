'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Star, Clock, Globe, Bookmark, Check, Film, ChevronDown, ChevronUp } from 'lucide-react'
import { getFilm, getSimilarFilms, addToWatchlist, removeFromWatchlist, rateFilm } from '@/lib/api'
import { Film as FilmType, RecommendedFilm } from '@/lib/types'
import FilmGrid from '@/components/FilmGrid'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuthStore } from '@/lib/store'

const TMDB_IMG = process.env.NEXT_PUBLIC_TMDB_IMAGE_URL || 'https://image.tmdb.org/t/p/w500'

const MODEL_LABELS = { tfidf: 'TF-IDF', embedding: 'Semantic', hybrid: 'Hybrid' }
const MODEL_DESCS  = {
  tfidf:     'Finds films with similar keywords and vocabulary.',
  embedding: 'Finds films with similar themes and meaning.',
  hybrid:    'Combines both methods for the best results.',
}

export default function FilmDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [film, setFilm] = useState<FilmType | null>(null)
  const [similar, setSimilar] = useState<RecommendedFilm[]>([])
  const [loading, setLoading] = useState(true)
  const [similarLoading, setSimilarLoading] = useState(false)
  const [watchStatus, setWatchStatus] = useState<string | null>(null)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [activeModel, setActiveModel] = useState<'tfidf' | 'embedding' | 'hybrid'>('hybrid')
  const [showWhyExpanded, setShowWhyExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tmdbId = parseInt(id as string)

  useEffect(() => {
    Promise.all([
      getFilm(tmdbId),
      getSimilarFilms(tmdbId, 'hybrid', 12),
    ])
      .then(([filmData, similarData]) => {
        setFilm(filmData)
        setSimilar(similarData)
      })
      .catch((err) => setError(err?.message || 'Failed to load film'))
      .finally(() => setLoading(false))
  }, [tmdbId])

  const handleModelChange = async (m: 'tfidf' | 'embedding' | 'hybrid') => {
    setActiveModel(m)
    setSimilarLoading(true)
    try {
      const data = await getSimilarFilms(tmdbId, m, 12)
      setSimilar(data)
    } finally {
      setSimilarLoading(false)
    }
  }

  const handleWatchlist = async () => {
    if (!user) { window.location.href = '/auth/login'; return }
    if (watchStatus) {
      await removeFromWatchlist(tmdbId)
      setWatchStatus(null)
    } else {
      await addToWatchlist(tmdbId, 'want_to_watch')
      setWatchStatus('want_to_watch')
    }
  }

  const handleRate = async (rating: number) => {
    if (!user) { window.location.href = '/auth/login'; return }
    await rateFilm(tmdbId, rating)
    setUserRating(rating)
  }

  if (loading) return <LoadingSpinner message="Loading film..." />
  if (error) return (
    <div className="text-center py-32 text-[#a1a1aa]">
      <p className="text-red-400 mb-2">{error}</p>
    </div>
  )
  if (!film) return <div className="text-center py-32 text-[#a1a1aa]">Film not found</div>

  const posterUrl = film.posterPath && film.posterPath !== 'nan'
    ? `${TMDB_IMG}${film.posterPath}`
    : null

  const genreList = film.genres ? film.genres.split(', ') : []

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── Hero backdrop ────────────────────────────────────────────────── */}
      <div className="relative">
        {/* Blurred background poster */}
        {posterUrl && (
          <div
            className="absolute inset-0 opacity-10 bg-center bg-cover"
            style={{ backgroundImage: `url(${posterUrl})`, filter: 'blur(60px)' }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/40 via-[#0a0a0a]/80 to-[#0a0a0a]" />

        <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-12">
          <div className="flex flex-col md:flex-row gap-8">

            {/* Poster */}
            <div className="flex-shrink-0">
              <div className="w-48 md:w-64 aspect-[2/3] bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[#222222]">
                {posterUrl ? (
                  <img src={posterUrl} alt={film.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#333333]">
                    <Film size={32} />
                    <span className="text-xs text-center px-3 leading-tight">{film.title}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{film.title}</h1>
                {film.isIndie && (
                  <span className="mt-1.5 bg-[#7c3aed]/20 border border-[#7c3aed]/40 text-[#a78bfa] text-xs px-3 py-1 rounded-full font-medium">
                    INDIE
                  </span>
                )}
              </div>

              {film.tagline && (
                <p className="text-[#a78bfa] italic text-base mb-4">"{film.tagline}"</p>
              )}

              {/* Metadata row */}
              <div className="flex flex-wrap gap-4 text-sm text-[#a1a1aa] mb-5">
                {film.releaseYear && <span className="text-white font-medium">{film.releaseYear}</span>}
                {film.runtime && (
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-[#52525b]" /> {film.runtime} min
                  </span>
                )}
                {film.originalLanguage && (
                  <span className="flex items-center gap-1 bg-[#1a1a1a] border border-[#222222] px-2 py-0.5 rounded text-xs">
                    <Globe size={11} className="text-[#52525b]" /> {film.originalLanguage.toUpperCase()}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star size={13} className="text-[#fbbf24] fill-[#fbbf24]" />
                  <span className="text-[#fbbf24] font-medium">{film.voteAverage?.toFixed(1)}</span>
                  <span className="text-[#52525b] text-xs">({film.voteCount?.toLocaleString()} votes)</span>
                </span>
              </div>

              {/* Genres */}
              {genreList.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {genreList.map((g) => (
                    <span key={g} className="bg-[#1a1a1a] border border-[#222222] text-[#a1a1aa] px-3 py-1 rounded-full text-xs">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              {film.overview && (
                <p className="text-[#a1a1aa] leading-relaxed text-sm mb-6 max-w-2xl">{film.overview}</p>
              )}

              {/* Director / Cast */}
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                {film.director && (
                  <div>
                    <span className="text-[#52525b] text-xs uppercase tracking-wider">Director</span>
                    <p className="text-white mt-1 font-medium">{film.director}</p>
                  </div>
                )}
                {film.castList && (
                  <div>
                    <span className="text-[#52525b] text-xs uppercase tracking-wider">Cast</span>
                    <p className="text-[#a1a1aa] mt-1 text-xs leading-relaxed">{film.castList}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleWatchlist}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    watchStatus
                      ? 'bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400'
                      : 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]'
                  }`}
                >
                  {watchStatus ? <Check size={15} /> : <Bookmark size={15} />}
                  {watchStatus ? 'Saved' : 'Add to Watchlist'}
                </button>

                {/* Star rating */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-2xl leading-none transition-all hover:scale-110"
                    >
                      <span className={star <= (hoverRating || userRating) ? 'text-[#fbbf24]' : 'text-[#222222]'}>★</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats row */}
              {(film.budget || film.revenue) && (
                <div className="mt-6 pt-5 border-t border-[#1a1a1a] flex gap-8 text-sm">
                  {film.budget && (
                    <div>
                      <span className="text-[#52525b] text-xs uppercase tracking-wider">Budget</span>
                      <p className="text-white mt-0.5 font-medium">{film.budget}</p>
                    </div>
                  )}
                  {film.revenue && (
                    <div>
                      <span className="text-[#52525b] text-xs uppercase tracking-wider">Revenue</span>
                      <p className="text-white mt-0.5 font-medium">{film.revenue}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Similar films ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Similar Films</h2>
          <div className="flex bg-[#111111] border border-[#222222] rounded-xl p-1 gap-1">
            {(['tfidf', 'embedding', 'hybrid'] as const).map((m) => (
              <button
                key={m}
                onClick={() => handleModelChange(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeModel === m
                    ? 'bg-[#7c3aed] text-white'
                    : 'text-[#52525b] hover:text-[#a1a1aa]'
                }`}
              >
                {MODEL_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        <FilmGrid films={similar} isLoading={similarLoading} emptyMessage="No similar films found." />

        {/* Why these recommendations */}
        <div className="mt-8 bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowWhyExpanded(!showWhyExpanded)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors"
          >
            <span>Why these recommendations?</span>
            {showWhyExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showWhyExpanded && (
            <div className="px-5 pb-5 text-[#a1a1aa] text-sm leading-relaxed border-t border-[#1a1a1a] pt-4">
              <p className="font-medium text-white mb-2">
                Active model: <span className="text-[#a78bfa]">{MODEL_LABELS[activeModel]}</span>
              </p>
              <p>{MODEL_DESCS[activeModel]}</p>
              <p className="mt-2 text-[#52525b] text-xs">
                Switch models above to see how different AI approaches interpret similarity.
                This is a key feature for dissertation evaluation of recommendation quality.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
