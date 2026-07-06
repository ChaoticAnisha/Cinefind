'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Film, X, Eye, EyeOff } from 'lucide-react'
import { login } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      setAuth(data.user, data.token)
      router.push('/discover')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#0a0a0a]">

      {/* ── Left: branding ──────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-[linear-gradient(135deg,#1e1b4b_0%,#0f0f0f_100%)] border-r border-[#1a1a1a]">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-[#7c3aed] flex items-center justify-center">
            <Film size={16} className="text-white" />
          </div>
          CineFind
        </Link>

        <div>
          <p className="text-[#a78bfa] text-xs uppercase tracking-widest mb-4 font-medium">Discover · Explore · Save</p>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Your personal<br />indie film curator
          </h2>
          <p className="text-[#52525b] text-sm leading-relaxed max-w-xs">
            3,000+ indie films. Three AI models. One purpose — finding the film that fits exactly what you're in the mood for.
          </p>
        </div>

        <p className="text-[#333333] text-xs">© 2025 CineFind · BSc Dissertation Project</p>
      </div>

      {/* ── Right: form ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <Link href="/" className="md:hidden flex items-center justify-center gap-2 text-white font-bold text-xl mb-8">
            <div className="w-7 h-7 rounded-md bg-[#7c3aed] flex items-center justify-center">
              <Film size={14} className="text-white" />
            </div>
            CineFind
          </Link>

          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-[#52525b] text-sm mb-8">Sign in to your CineFind account</p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
              <X size={14} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#a1a1aa] text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-[#111111] border border-[#222222] focus:border-[#7c3aed] text-white rounded-xl px-4 py-3 outline-none transition-colors text-sm placeholder:text-[#333333]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[#a1a1aa] text-xs font-medium mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#111111] border border-[#222222] focus:border-[#7c3aed] text-white rounded-xl px-4 py-3 pr-11 outline-none transition-colors text-sm placeholder:text-[#333333]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#333333] hover:text-[#a1a1aa] transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all text-sm shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_30px_rgba(124,58,237,0.35)] mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-[#52525b] text-sm mt-6">
            No account?{' '}
            <Link href="/auth/register" className="text-[#a78bfa] hover:text-white transition-colors font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
