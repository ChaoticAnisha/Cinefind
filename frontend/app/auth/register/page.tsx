'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Film, X, Eye, EyeOff } from 'lucide-react'
import { register } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import PosterCollage from '@/app/components/PosterCollage'

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '', username: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await register(form.email, form.password, form.username)
      setAuth(data.user, data.token)
      router.push('/profile')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Try a different email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#0a0a0a]">

      {/* ── Left: branding ──────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden border-r border-[#1a1a1a]">
        <PosterCollage />

        <Link href="/" className="relative z-10 flex items-center gap-2 text-white font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-[#7c3aed] flex items-center justify-center">
            <Film size={16} className="text-white" />
          </div>
          CineFind
        </Link>

        <div className="relative z-10">
          <p className="text-[#a78bfa] text-xs uppercase tracking-widest mb-4 font-medium">Start your collection</p>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Join thousands of<br />indie film fans
          </h2>
          <ul className="space-y-2 text-[#a1a1aa] text-sm">
            {[
              'AI-powered film discovery',
              'Save films to your watchlist',
              'Set your taste preferences',
              'Compare 3 AI recommendation models',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-[#52525b] text-xs">© 2025 CineFind · BSc Dissertation Project</p>
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

          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-[#52525b] text-sm mb-8">Start discovering indie films today — free forever</p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
              <X size={14} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#a1a1aa] text-xs font-medium mb-1.5 uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={set('username')}
                className="w-full bg-[#111111] border border-[#222222] focus:border-[#7c3aed] text-white rounded-xl px-4 py-3 outline-none transition-colors text-sm placeholder:text-[#333333]"
                placeholder="cinephile99"
              />
            </div>

            <div>
              <label className="block text-[#a1a1aa] text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
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
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full bg-[#111111] border border-[#222222] focus:border-[#7c3aed] text-white rounded-xl px-4 py-3 pr-11 outline-none transition-colors text-sm placeholder:text-[#333333]"
                  placeholder="At least 6 characters"
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
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-[#52525b] text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#a78bfa] hover:text-white transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
