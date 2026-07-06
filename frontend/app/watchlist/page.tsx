'use client'

import { useEffect, useState } from 'react'
import { BookMarked, Trash2, Eye, Clock, ThumbsDown, Star } from 'lucide-react'
import { getWatchlist, removeFromWatchlist } from '@/lib/api'
import { WatchlistItem } from '@/lib/types'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'

const TMDB_IMG = process.env.NEXT_PUBLIC_TMDB_IMAGE_URL || 'https://image.tmdb.org/t/p/w500'

type Tab = 'want_to_watch' | 'watched' | 'not_interested'

const TAB_CONFIG: Record<Tab, { label: string; icon: React.ReactNode; empty: string }> = {
  want_to_watch:  { label: 'Want to Watch', icon: <Clock size={14} />,      empty: 'Nothing saved yet. Head to Discover to find films to add.' },
  watched:        { label: 'Watched',        icon: <Eye size={14} />,        empty: 'No watched films yet. Mark a film as watched from its page.' },
  not_interested: { label: 'Not Interested', icon: <ThumbsDown size={14} />, empty: 'No ignored films.' },
}

export default function WatchlistPage() {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('want_to_watch')

  useEffect(() => {
    if (!isLoading && !user) { router.push('/auth/login'); return }
    if (user) {
      getWatchlist()
        .then(setWatchlist)
        .finally(() => setLoading(false))
    }
  }, [user, isLoading])

  const handleRemove = async (tmdbId: number) => {
    await removeFromWatchlist(tmdbId)
    setWatchlist((prev) => prev.filter((w) => w.film.tmdbId !== tmdbId))
  }

  if (loading) return <LoadingSpinner message="Loading watchlist..." />

  const filtered = watchlist.filter((w) => w.status === tab)
  const counts = {
    want_to_watch:  watchlist.filter(w => w.status === 'want_to_watch').length,
    watched:        watchlist.filter(w => w.status === 'watched').length,
    not_interested: watchlist.filter(w => w.status === 'not_interested').length,
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-[#111111] border-b border-[#1a1a1a] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <BookMarked size={22} className="text-[#a78bfa]" />
            My Watchlist
          </h1>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(TAB_CONFIG) as [Tab, typeof TAB_CONFIG[Tab]][]).map(([key, conf]) => (
              <div key={key} className="bg-[#1a1a1a] border border-[#222222] rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-[#a78bfa] mb-0.5">{counts[key]}</div>
                <div className="text-[#52525b] text-xs flex items-center justify-center gap-1">{conf.icon}{conf.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-[#111111] border border-[#1a1a1a] rounded-xl p-1 mb-6">
          {(Object.entries(TAB_CONFIG) as [Tab, typeof TAB_CONFIG[Tab]][]).map(([key, conf]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                tab === key
                  ? 'bg-[#7c3aed] text-white'
                  : 'text-[#52525b] hover:text-[#a1a1aa]'
              }`}
            >
              {conf.icon}
              {conf.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === key ? 'bg-white/20' : 'bg-[#1a1a1a]'}`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* ── List ─────────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border border-[#222222] flex items-center justify-center">
              {TAB_CONFIG[tab].icon}
            </div>
            <p className="text-[#52525b] text-sm max-w-xs">{TAB_CONFIG[tab].empty}</p>
            {tab === 'want_to_watch' && (
              <Link href="/discover" className="text-[#7c3aed] hover:text-[#a78bfa] text-sm font-medium transition-colors">
                Discover films →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => {
              const imgUrl = item.film.posterPath && item.film.posterPath !== 'nan'
                ? `${TMDB_IMG}${item.film.posterPath}`
                : null
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-[#111111] border border-[#1a1a1a] hover:border-[#222222] rounded-xl p-3 transition-colors group"
                >
                  {/* Poster thumbnail */}
                  <Link href={`/film/${item.film.tmdbId}`} className="flex-shrink-0">
                    <div className="w-10 h-14 bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#222222]">
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.film.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#333333]">
                          <BookMarked size={12} />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/film/${item.film.tmdbId}`}>
                      <h3 className="text-white text-sm font-medium hover:text-[#a78bfa] transition-colors truncate">
                        {item.film.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-[#52525b] mt-0.5">
                      <span>{item.film.releaseYear}</span>
                      <span className="flex items-center gap-0.5">
                        <Star size={9} className="text-[#fbbf24] fill-[#fbbf24]" />
                        {item.film.voteAverage?.toFixed(1)}
                      </span>
                      {item.film.isIndie && <span className="text-[#7c3aed]">Indie</span>}
                      <span className="hidden sm:block truncate">{item.film.genres}</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`hidden sm:block flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full font-medium ${
                    item.status === 'watched'        ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/20' :
                    item.status === 'not_interested' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-[#7c3aed]/10 text-[#a78bfa] border border-[#7c3aed]/20'
                  }`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item.film.tmdbId)}
                    className="flex-shrink-0 p-1.5 text-[#333333] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
