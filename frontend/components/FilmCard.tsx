'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, Bookmark, Check, Film } from 'lucide-react'
import { addToWatchlist } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { SkeletonCard } from './LoadingSpinner'

interface FilmCardProps {
  tmdbId: number
  title: string
  posterPath?: string
  voteAverage?: number
  releaseYear?: number
  release_year?: number
  genres?: string
  isIndie?: boolean
  is_indie?: boolean
  showScore?: boolean
  score?: number
  scoreLabel?: string
  isLoading?: boolean
}

const TMDB_IMG = process.env.NEXT_PUBLIC_TMDB_IMAGE_URL || 'https://image.tmdb.org/t/p/w500'

export default function FilmCard({
  tmdbId,
  title,
  posterPath,
  voteAverage,
  releaseYear,
  release_year,
  genres,
  isIndie,
  is_indie,
  showScore = false,
  score,
  scoreLabel,
  isLoading = false,
}: FilmCardProps) {
  const { user } = useAuthStore()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  if (isLoading) return <SkeletonCard />

  const year = releaseYear || release_year
  const indie = isIndie || is_indie
  const imageUrl = posterPath && posterPath !== 'nan' && posterPath !== 'None' && posterPath !== ''
    ? `${TMDB_IMG}${posterPath}`
    : null

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { window.location.href = '/auth/login'; return }
    setSaving(true)
    try {
      await addToWatchlist(tmdbId, 'want_to_watch')
      setSaved(true)
    } catch {
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Link href={`/film/${tmdbId}`} className="block group">
      <div className="relative bg-[#111111] rounded-xl overflow-hidden border border-[#222222] transition-all duration-200 group-hover:border-[#7c3aed] group-hover:-translate-y-1 group-hover:shadow-[0_8px_32px_rgba(124,58,237,0.2)]">

        {/* Poster area */}
        <div className="relative aspect-[2/3] bg-[#1a1a1a] overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 text-center">
              <Film size={28} className="text-[#333333]" />
              <span className="text-[#52525b] text-xs leading-tight line-clamp-3">{title}</span>
            </div>
          )}

          {/* Bottom gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Title over poster */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <h3 className="text-white text-xs font-semibold leading-tight line-clamp-2 drop-shadow-lg">
              {title}
            </h3>
          </div>

          {/* Indie badge */}
          {indie && (
            <div className="absolute top-2 left-2 bg-[#7c3aed] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide">
              INDIE
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            aria-label="Add to watchlist"
            className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-150 opacity-0 group-hover:opacity-100 ${
              saved
                ? 'bg-[#7c3aed] text-white'
                : 'bg-black/70 text-white hover:bg-[#7c3aed]'
            }`}
          >
            {saved ? <Check size={12} /> : <Bookmark size={12} />}
          </button>

          {/* Score badge */}
          {showScore && score !== undefined && (
            <div className="absolute bottom-8 right-2 bg-black/80 text-[#fbbf24] text-[9px] px-1.5 py-0.5 rounded font-mono">
              {(scoreLabel || '').replace('_score', '').replace('_', '-')}: {score.toFixed(3)}
            </div>
          )}
        </div>

        {/* Below poster: rating + year */}
        <div className="px-2.5 py-2 flex items-center justify-between">
          <span className="text-[#52525b] text-[10px]">{year || '—'}</span>
          {voteAverage && voteAverage > 0 ? (
            <div className="flex items-center gap-0.5">
              <Star size={9} className="text-[#fbbf24] fill-[#fbbf24]" />
              <span className="text-[#a1a1aa] text-[10px]">{Number(voteAverage).toFixed(1)}</span>
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
