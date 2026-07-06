'use client'

// SkeletonCard — one shimmer placeholder in film-card shape
export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-[#222222]">
      {/* Poster skeleton */}
      <div className="aspect-[2/3] skeleton" />
      {/* Info skeleton */}
      <div className="p-3 bg-[#111111] space-y-2">
        <div className="skeleton h-3 rounded w-4/5" />
        <div className="skeleton h-2.5 rounded w-2/5" />
      </div>
    </div>
  )
}

// SkeletonGrid — grid of shimmer placeholders
export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

// SkeletonRow — horizontal scroll row of shimmer placeholders
export function SkeletonRow({ count = 8 }: { count?: number }) {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-32 rounded-xl overflow-hidden border border-[#222222]">
          <div className="aspect-[2/3] skeleton" />
          <div className="p-2 bg-[#111111]">
            <div className="skeleton h-2.5 rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Classic spinner — kept for inline use
export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
      <p className="text-[#a1a1aa] text-sm">{message}</p>
    </div>
  )
}
