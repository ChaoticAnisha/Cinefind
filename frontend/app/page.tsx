import Link from 'next/link'
import { Sparkles, Compass, Search, ChevronRight, Film, Globe, Star, Zap } from 'lucide-react'
import PosterCollage from './components/PosterCollage'


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 overflow-hidden">

        {/* Poster collage background — client component for hover interactivity */}
        <PosterCollage />

        <div className="relative z-10 max-w-4xl mx-auto fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#7c3aed]/10 border border-[#7c3aed]/30 text-[#a78bfa] text-xs px-4 py-2 rounded-full mb-8 font-medium tracking-wide uppercase">
            <Sparkles size={12} />
            AI-Powered Discovery
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.08] tracking-tight">
            Discover films that
            <br />
            <span className="gradient-text">actually excite you</span>
          </h1>

          <p className="text-lg md:text-xl text-[#a1a1aa] mb-10 max-w-2xl mx-auto leading-relaxed">
            Indie gems, international cinema, and festival favourites — buried by
            algorithms, found by you. Describe what you want in plain English.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/prompt"
              className="group flex items-center justify-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-4 rounded-xl text-base font-semibold transition-all shadow-[0_0_24px_rgba(124,58,237,0.3)] hover:shadow-[0_0_36px_rgba(124,58,237,0.5)]"
            >
              <Sparkles size={18} />
              Try AI Discovery
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/discover"
              className="flex items-center justify-center gap-2 border border-[#333333] hover:border-[#7c3aed] text-[#a1a1aa] hover:text-white px-8 py-4 rounded-xl text-base font-medium transition-all"
            >
              Browse Films
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#52525b] text-xs">
          <div className="w-5 h-8 border border-[#333333] rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-1.5 bg-[#7c3aed] rounded-full" style={{ animation: 'float 1.5s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <section className="bg-[#111111] border-y border-[#222222]">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '3,000+', label: 'Films indexed' },
            { value: '3',      label: 'AI models' },
            { value: '15+',    label: 'Languages' },
            { value: '100%',   label: 'Free to use' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-bold text-[#a78bfa] mb-1">{value}</div>
              <div className="text-[#52525b] text-sm uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-14">
          <p className="text-[#7c3aed] text-xs font-semibold uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Three steps to your next favourite film</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector lines on desktop */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-[#7c3aed]/50 via-[#a78bfa]/50 to-[#7c3aed]/50" />

          {[
            { icon: <Sparkles size={22} className="text-[#a78bfa]" />, color: 'bg-[#7c3aed]/15 border-[#7c3aed]/30', title: 'Describe It', desc: 'Type anything in plain English — "dark Korean thriller with a twist" — no special syntax needed.' },
            { icon: <Zap size={22} className="text-blue-400" />, color: 'bg-blue-500/10 border-blue-500/20', title: 'AI Analyses', desc: 'Three AI models scan 3,000 films using keyword matching, semantic embeddings, and a hybrid approach.' },
            { icon: <Film size={22} className="text-[#10b981]" />, color: 'bg-emerald-500/10 border-emerald-500/20', title: 'Discover', desc: 'Get ranked results with similarity scores. Switch models to see how each AI interprets your request.' },
          ].map(({ icon, color, title, desc }, i) => (
            <div key={title} className="relative flex flex-col items-center text-center p-8 bg-[#111111] border border-[#222222] rounded-2xl hover:border-[#333333] transition-colors">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-5 ${color}`}>
                {icon}
              </div>
              <div className="absolute -top-3 -right-3 hidden md:flex w-7 h-7 rounded-full bg-[#0a0a0a] border border-[#222222] items-center justify-center text-xs text-[#52525b] font-mono">
                {i + 1}
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              <p className="text-[#a1a1aa] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature highlights ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-2 gap-6">
          {/* AI Prompt */}
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 hover:border-[#7c3aed]/40 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/30 flex items-center justify-center">
                <Sparkles size={18} className="text-[#a78bfa]" />
              </div>
              <h3 className="text-white font-bold text-xl">AI Prompt Discovery</h3>
            </div>
            <p className="text-[#a1a1aa] text-sm leading-relaxed mb-5">
              Our hybrid AI model combines TF-IDF keyword matching with semantic embeddings to understand
              what you actually mean — not just the words you type.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['dark Korean thriller', 'emotional indie drama', 'surrealist arthouse'].map((p) => (
                <span key={p} className="text-xs bg-[#1a1a1a] border border-[#333333] text-[#a1a1aa] px-3 py-1.5 rounded-full">{p}</span>
              ))}
            </div>
            <Link href="/prompt" className="inline-flex items-center gap-1.5 text-[#a78bfa] hover:text-white text-sm font-medium transition-colors">
              Try it now <ChevronRight size={14} />
            </Link>
          </div>

          {/* Curated */}
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 hover:border-blue-500/40 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Compass size={18} className="text-blue-400" />
              </div>
              <h3 className="text-white font-bold text-xl">Curated Discovery</h3>
            </div>
            <p className="text-[#a1a1aa] text-sm leading-relaxed mb-5">
              Browse by mood and genre. From hidden gems to world cinema — filter by language, era,
              and style to surface films the mainstream overlooked.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['Hidden Gems', 'World Cinema', 'Festival Picks', 'Cult Classics'].map((m) => (
                <span key={m} className="text-xs bg-[#1a1a1a] border border-[#333333] text-[#a1a1aa] px-3 py-1.5 rounded-full">{m}</span>
              ))}
            </div>
            <Link href="/discover" className="inline-flex items-center gap-1.5 text-blue-400 hover:text-white text-sm font-medium transition-colors">
              Start discovering <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white font-bold">
            <div className="w-6 h-6 rounded-md bg-[#7c3aed] flex items-center justify-center">
              <Film size={12} className="text-white" />
            </div>
            CineFind
          </div>
          <div className="flex items-center gap-6 text-sm text-[#52525b]">
            <Link href="/discover" className="hover:text-white transition-colors">Discover</Link>
            <Link href="/search" className="hover:text-white transition-colors">Search</Link>
            <Link href="/prompt" className="hover:text-white transition-colors">AI Discovery</Link>
          </div>
          <p className="text-[#52525b] text-xs">© 2025 CineFind · BSc Dissertation Project</p>
        </div>
      </footer>
    </div>
  )
}
