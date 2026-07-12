'use client'

import { useEffect, useState } from 'react'
import { Compass, RefreshCw, AlertCircle, Search } from 'lucide-react'
import { getPromptRecommendations, getPersonalisedRecommendations } from '@/lib/api'
import { RecommendedFilm } from '@/lib/types'
import FilmGrid from '@/components/FilmGrid'
import { SkeletonRow } from '@/components/LoadingSpinner'
import { useAuthStore } from '@/lib/store'
import Link from 'next/link'
import PosterCollage from '@/app/components/PosterCollage'

/* ── Mood config ────────────────────────────────────────────────────────── */
const MOODS = [
  { label: 'Hidden Gems',   query: 'obscure underrated indie hidden gem',          color: 'amber' },
  { label: 'World Cinema',  query: 'international foreign language arthouse',       color: 'blue' },
  { label: 'Dark & Intense',query: 'dark psychological intense thriller drama',     color: 'red' },
  { label: 'Feel Good',     query: 'uplifting heartwarming feel good indie',        color: 'green' },
  { label: 'Surreal',       query: 'surreal experimental avant garde abstract',     color: 'purple' },
  { label: 'Festival Picks',query: 'festival award cannes sundance indie',          color: 'sky' },
  { label: 'Cult Classics', query: 'cult classic midnight midnight-movie weird',    color: 'orange' },
  { label: 'Debut Films',   query: 'debut first film director breakout indie',      color: 'teal' },
]

const DECADES = ['1970s', '1980s', '1990s', '2000s', '2010s', '2020s']

const LANG_ROWS = [
  { label: '🇰🇷 Korean Cinema',  flag: '🇰🇷', query: 'Korean film drama thriller',      color: 'from-red-900/20' },
  { label: '🇫🇷 French Cinema',  flag: '🇫🇷', query: 'French film arthouse drama',      color: 'from-blue-900/20' },
  { label: '🇯🇵 Japanese Cinema',flag: '🇯🇵', query: 'Japanese film drama animation',   color: 'from-pink-900/20' },
]

const MOOD_COLORS: Record<string, string> = {
  amber:  'border-amber-500/50 text-amber-400 bg-amber-500/10',
  blue:   'border-blue-500/50 text-blue-400 bg-blue-500/10',
  red:    'border-red-500/50 text-red-400 bg-red-500/10',
  green:  'border-green-500/50 text-green-400 bg-green-500/10',
  purple: 'border-[#7c3aed]/50 text-[#a78bfa] bg-[#7c3aed]/10',
  sky:    'border-sky-500/50 text-sky-400 bg-sky-500/10',
  orange: 'border-orange-500/50 text-orange-400 bg-orange-500/10',
  teal:   'border-teal-500/50 text-teal-400 bg-teal-500/10',
}

/* ── Horizontal film row ─────────────────────────────────────────────────── */
function FilmRow({ query }: { query: string }) {
  const [films, setFilms] = useState<RecommendedFilm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPromptRecommendations(query, 'hybrid', 10)
      .then(setFilms)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [query])

  if (loading) return <SkeletonRow count={8} />

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
      {films.map((film) => (
        <Link key={film.tmdb_id} href={`/film/${film.tmdb_id}`} className="flex-shrink-0 w-[120px] group">
          <div className="relative aspect-[2/3] bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#222222] group-hover:border-[#7c3aed] transition-all">
            {film.poster_path && film.poster_path !== 'nan' ? (
              <img
                src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${film.poster_path}`}
                alt={film.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-2">
                <span className="text-[#333333] text-xs text-center leading-tight">{film.title}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-1.5">
              <p className="text-white text-[9px] font-medium line-clamp-2 leading-tight">{film.title}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function DiscoverPage() {
  const { user } = useAuthStore()
  const [films, setFilms] = useState<RecommendedFilm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeMood, setActiveMood] = useState(MOODS[0])
  const [activeDecade, setActiveDecade] = useState<string | null>(null)

  const loadFilms = async (query: string) => {
    setLoading(true)
    setError(null)
    try {
      const results = await getPromptRecommendations(query, 'hybrid', 24)
      setFilms(results)
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.response?.data?.error || err?.message || 'Unknown error'
      setError(`Failed to load films: ${detail}`)
      setFilms([])
    } finally {
      setLoading(false)
    }
  }

  const handleMood = (mood: typeof MOODS[0]) => {
    setActiveMood(mood)
    setActiveDecade(null)
    loadFilms(mood.query)
  }

  const handleDecade = (decade: string) => {
    setActiveDecade(activeDecade === decade ? null : decade)
    const q = activeDecade === decade ? activeMood.query : `${activeMood.query} ${decade}`
    loadFilms(q)
  }

  useEffect(() => {
    // Always start with a general query — never call getPersonalisedRecommendations on mount
    // because it requires auth and fails for logged-out users.
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        if (user) {
          // Logged in: try personalised, fall back to generic
          try {
            const personalised = await getPersonalisedRecommendations(24)
            setFilms(personalised)
          } catch {
            const generic = await getPromptRecommendations(MOODS[0].query, 'hybrid', 24)
            setFilms(generic)
          }
        } else {
          const generic = await getPromptRecommendations(MOODS[0].query, 'hybrid', 24)
          setFilms(generic)
        }
      } catch (err: any) {
        const detail = err?.response?.data?.detail || err?.response?.data?.error || err?.message || 'Unknown error'
        setError(`Could not reach the recommendation service: ${detail}`)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [user])

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-[#1a1a1a]">
        <PosterCollage />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              <Compass size={30} className="text-[#a78bfa]" />
              Discover Indie Cinema
            </h1>
            <p className="text-[#a1a1aa] mt-1 text-sm">
              {user ? 'Personalised recommendations based on your taste' : 'Curated indie and non-mainstream films'}
            </p>
          </div>
          <Link
            href="/search"
            className="flex items-center gap-2 bg-[#111111] border border-[#333333] hover:border-[#7c3aed] text-[#a1a1aa] hover:text-white px-4 py-2.5 rounded-xl text-sm transition-all"
          >
            <Search size={14} />
            Search films
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Mood filter row ──────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-3">
          {MOODS.map((mood) => {
            const active = activeMood.label === mood.label
            const colors = MOOD_COLORS[mood.color]
            return (
              <button
                key={mood.label}
                onClick={() => handleMood(mood)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  active ? colors : 'border-[#222222] text-[#a1a1aa] hover:border-[#333333] hover:text-white bg-transparent'
                }`}
              >
                {mood.label}
              </button>
            )
          })}
        </div>

        {/* ── Decade filter ────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-6">
          {DECADES.map((decade) => (
            <button
              key={decade}
              onClick={() => handleDecade(decade)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeDecade === decade
                  ? 'border-[#7c3aed]/50 text-[#a78bfa] bg-[#7c3aed]/10'
                  : 'border-[#1a1a1a] text-[#52525b] hover:border-[#333333] hover:text-[#a1a1aa]'
              }`}
            >
              {decade}
            </button>
          ))}
        </div>

        {/* ── Section heading ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">
            {user && !activeMood ? 'Personalised for you' : activeMood.label}
          </h2>
          <button
            onClick={() => loadFilms(activeMood.query)}
            className="flex items-center gap-1.5 text-[#52525b] hover:text-white text-xs transition-colors"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>

        {/* ── Error state ──────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 text-sm font-medium">Could not load films</p>
              <p className="text-[#a1a1aa] text-xs mt-0.5">{error}</p>
              <button
                onClick={() => loadFilms(activeMood.query)}
                className="mt-2 text-xs text-[#7c3aed] hover:text-[#a78bfa] font-medium"
              >
                Retry →
              </button>
            </div>
          </div>
        )}

        {/* ── Main film grid ───────────────────────────────────────────── */}
        <FilmGrid
          films={films}
          isLoading={loading}
          emptyMessage="No films found for this mood. Try a different category."
          onRetry={() => loadFilms(activeMood.query)}
        />

        {/* ── Language rows ────────────────────────────────────────────── */}
        {!loading && !error && (
          <div className="mt-16 space-y-10">
            {LANG_ROWS.map(({ label, query, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold text-lg">{label}</h2>
                  <Link
                    href={`/search?q=${encodeURIComponent(label.replace(/[^a-zA-Z ]/g, '').trim())}`}
                    className="text-[#52525b] hover:text-[#a78bfa] text-xs transition-colors"
                  >
                    See all →
                  </Link>
                </div>
                <div className={`rounded-2xl bg-gradient-to-r ${color} to-transparent p-4 border border-[#1a1a1a]`}>
                  <FilmRow query={query} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
