import FilmCard from './FilmCard'
import { SkeletonGrid } from './LoadingSpinner'
import { Film } from 'lucide-react'

interface FilmGridProps {
  films?: any[]
  showScore?: boolean
  scoreField?: string
  emptyMessage?: string
  isLoading?: boolean
  onRetry?: () => void
}

export default function FilmGrid({
  films,
  showScore = false,
  scoreField = 'final_score',
  emptyMessage = 'No films found.',
  isLoading = false,
  onRetry,
}: FilmGridProps) {
  if (isLoading) return <SkeletonGrid count={12} />

  if (!films || films.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
        <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#222222] flex items-center justify-center">
          <Film size={28} className="text-[#333333]" />
        </div>
        <div>
          <p className="text-white font-semibold mb-1">No films found</p>
          <p className="text-[#52525b] text-sm">{emptyMessage}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 px-5 py-2 text-sm font-medium bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      {films.map((film) => (
        <FilmCard
          key={film.tmdbId || film.tmdb_id}
          tmdbId={film.tmdbId || film.tmdb_id}
          title={film.title}
          posterPath={film.posterPath || film.poster_path}
          voteAverage={film.voteAverage ?? film.vote_average}
          releaseYear={film.releaseYear}
          release_year={film.release_year}
          genres={film.genres}
          isIndie={film.isIndie}
          is_indie={film.is_indie}
          showScore={showScore}
          score={showScore ? film[scoreField] : undefined}
          scoreLabel={scoreField}
        />
      ))}
    </div>
  )
}
