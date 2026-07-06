'use client'

import { useState } from 'react'
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react'
import { getPromptRecommendations, compareModels } from '@/lib/api'
import { RecommendedFilm } from '@/lib/types'
import FilmGrid from '@/components/FilmGrid'

const EXAMPLES = [
  'Dark psychological Korean thriller from the 2000s',
  'Emotional indie film about family relationships',
  'Surrealist European arthouse cinema',
  'Low budget horror with social commentary',
  'Coming of age story set in a small town',
  'Documentary about music subcultures',
  'Italian neorealist drama',
  'Japanese animation for adults',
]

type ModelType = 'tfidf' | 'embedding' | 'hybrid'

const MODEL_INFO: Record<ModelType, { label: string; desc: string; color: string }> = {
  tfidf:     { label: 'TF-IDF',    desc: 'Keyword matching — fast and precise',            color: 'blue' },
  embedding: { label: 'Semantic',  desc: 'Meaning-based — understands context',            color: 'green' },
  hybrid:    { label: 'Hybrid',    desc: 'Best of both — recommended ★',                  color: 'purple' },
}

const MODEL_BORDER: Record<string, string> = {
  blue:   'border-blue-500/50 bg-blue-500/10 text-blue-400',
  green:  'border-green-500/50 bg-green-500/10 text-green-400',
  purple: 'border-[#7c3aed]/50 bg-[#7c3aed]/10 text-[#a78bfa]',
}

export default function PromptPage() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState<ModelType>('hybrid')
  const [results, setResults] = useState<RecommendedFilm[]>([])
  const [compareResults, setCompareResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'single' | 'compare'>('single')
  const [lastQuery, setLastQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e?: React.FormEvent, override?: string) => {
    e?.preventDefault()
    const q = override || prompt
    if (!q.trim()) return
    setLoading(true)
    setLastQuery(q)
    setCompareResults(null)
    setError(null)
    try {
      if (mode === 'compare') {
        const data = await compareModels(q, 6)
        setCompareResults(data)
        setResults([])
      } else {
        const data = await getPromptRecommendations(q, model, 12)
        setResults(data)
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-[linear-gradient(135deg,#1e1b4b_0%,#0f0f0f_60%)] border-b border-[#1a1a1a] py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#7c3aed]/10 border border-[#7c3aed]/30 text-[#a78bfa] text-xs px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider font-medium">
            <Sparkles size={11} /> AI Film Discovery
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
            Describe your perfect film
          </h1>
          <p className="text-[#a1a1aa] text-sm leading-relaxed">
            Our AI understands mood, genre, era, language, and style — not just keywords.
            Try something like <span className="text-white italic">"a slow burn thriller set in rural Ireland"</span>.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Search form ─────────────────────────────────────────────── */}
        <form onSubmit={handleSearch} className="bg-[#111111] border border-[#222222] rounded-2xl p-5 mb-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Dark psychological Korean thriller from the 2000s with a haunting atmosphere..."
            rows={3}
            className="w-full bg-[#0a0a0a] border border-[#222222] focus:border-[#7c3aed] text-white rounded-xl px-4 py-3 outline-none resize-none mb-4 placeholder:text-[#333333] transition-colors text-sm"
          />

          {/* Model selector */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-1">
              {(Object.entries(MODEL_INFO) as [ModelType, typeof MODEL_INFO[ModelType]][]).map(([m, info]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setModel(m); setMode('single') }}
                  title={info.desc}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    model === m && mode === 'single'
                      ? m === 'tfidf' ? 'bg-blue-600 text-white' : m === 'embedding' ? 'bg-green-600 text-white' : 'bg-[#7c3aed] text-white'
                      : 'text-[#52525b] hover:text-[#a1a1aa]'
                  }`}
                >
                  {info.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setMode('compare')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === 'compare'
                    ? 'bg-amber-500 text-white'
                    : 'text-[#52525b] hover:text-[#a1a1aa]'
                }`}
              >
                Compare All
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-40 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(124,58,237,0.25)] hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]"
            >
              Discover
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Model description */}
          {mode === 'single' && (
            <p className="text-[#52525b] text-xs mt-3">{MODEL_INFO[model].desc}</p>
          )}
        </form>

        {/* ── Example prompts ─────────────────────────────────────────── */}
        <div className="mb-8">
          <p className="text-[#52525b] text-xs uppercase tracking-wider mb-3">Try an example</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => { setPrompt(ex); handleSearch(undefined, ex) }}
                className="text-xs bg-[#111111] border border-[#222222] hover:border-[#7c3aed] text-[#a1a1aa] hover:text-white px-3 py-1.5 rounded-full transition-all"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* ── Error ───────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* ── Results ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {loading ? (
          <FilmGrid isLoading films={[]} />
        ) : mode === 'compare' && compareResults ? (
          <div className="space-y-12">
            <p className="text-center text-[#a1a1aa] text-sm">
              Comparing 3 models for: <span className="text-white font-medium">"{lastQuery}"</span>
            </p>
            {([
              { key: 'tfidf',     label: 'TF-IDF — Keyword Match',      colorKey: 'blue',   scoreField: 'similarity_score' },
              { key: 'embedding', label: 'Semantic — Meaning-Based',     colorKey: 'green',  scoreField: 'similarity_score' },
              { key: 'hybrid',    label: 'Hybrid — Recommended ★',       colorKey: 'purple', scoreField: 'final_score' },
            ] as const).map(({ key, label, colorKey, scoreField }) => (
              <div key={key}>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-4 ${MODEL_BORDER[colorKey]}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${colorKey === 'blue' ? 'bg-blue-400' : colorKey === 'green' ? 'bg-green-400' : 'bg-[#a78bfa]'}`} />
                  {label}
                  <span className="opacity-60">· {compareResults[key]?.count} results</span>
                </div>
                <FilmGrid
                  films={compareResults[key]?.results || []}
                  showScore
                  scoreField={scoreField}
                />
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div>
            <p className="text-[#52525b] text-xs text-center mb-6 uppercase tracking-wider">
              {results.length} films · "{lastQuery}" · {MODEL_INFO[model].label} model
            </p>
            <FilmGrid films={results} />
          </div>
        ) : lastQuery && !loading ? (
          <div className="text-center py-20 text-[#52525b]">
            No results. Try rephrasing your prompt.
          </div>
        ) : null}
      </div>
    </div>
  )
}
