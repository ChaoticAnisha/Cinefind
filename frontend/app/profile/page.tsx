'use client'

import { useEffect, useState } from 'react'
import { Save, Check, User } from 'lucide-react'
import { updatePreferences, getMe } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'

const ALL_GENRES   = ['Drama', 'Thriller', 'Horror', 'Comedy', 'Romance', 'Documentary', 'Animation', 'Crime', 'Mystery', 'Sci-Fi', 'Fantasy', 'Action']
const ALL_LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'ko', label: 'Korean' },
  { code: 'fr', label: 'French' },  { code: 'ja', label: 'Japanese' },
  { code: 'es', label: 'Spanish' }, { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' }, { code: 'zh', label: 'Chinese' },
]
const ALL_ERAS = ['1970s', '1980s', '1990s', '2000s', '2010s', '2020s']

type ActiveTab = 'preferences' | 'activity' | 'settings'

export default function ProfilePage() {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()
  const [genres, setGenres]     = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [eras, setEras]         = useState<string[]>([])
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [tab, setTab]           = useState<ActiveTab>('preferences')
  const [toast, setToast]       = useState<string | null>(null)
  const [memberSince] = useState(() => new Date().getFullYear())

  useEffect(() => {
    if (!isLoading && !user) { router.push('/auth/login'); return }
    if (user) {
      getMe().then((data) => {
        if (data.preferences) {
          setGenres(data.preferences.preferredGenres || [])
          setLanguages(data.preferences.preferredLanguages || [])
          setEras(data.preferences.preferredEras || [])
        }
      }).catch(() => {})
    }
  }, [user, isLoading])

  const toggle = (val: string, list: string[], setList: (v: string[]) => void) =>
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updatePreferences({ preferredGenres: genres, preferredLanguages: languages, preferredEras: eras })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  if (isLoading) return null
  if (!user) return null

  const initials = (user.username || user.email || 'U')[0].toUpperCase()

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── User header ─────────────────────────────────────────────────── */}
      <div className="bg-[#111111] border-b border-[#1a1a1a] py-8 px-4">
        <div className="max-w-3xl mx-auto flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#7c3aed]/20 border-2 border-[#7c3aed]/40 flex items-center justify-center text-2xl font-bold text-[#a78bfa]">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user.username || 'Film fan'}</h1>
            <p className="text-[#52525b] text-sm">{user.email}</p>
            <p className="text-[#333333] text-xs mt-0.5">Member since {memberSince}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-3xl mx-auto mt-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Preferences set', value: genres.length + languages.length + eras.length },
            { label: 'Genres liked', value: genres.length },
            { label: 'Languages', value: languages.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#1a1a1a] border border-[#222222] rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-[#a78bfa]">{value}</div>
              <div className="text-[#52525b] text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* ── Tab switcher ─────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-[#111111] border border-[#1a1a1a] rounded-xl p-1 mb-8">
          {(['preferences', 'activity', 'settings'] as ActiveTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                tab === t ? 'bg-[#7c3aed] text-white' : 'text-[#52525b] hover:text-[#a1a1aa]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Preferences tab ──────────────────────────────────────────── */}
        {tab === 'preferences' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Favourite Genres</h2>
              <div className="flex flex-wrap gap-2">
                {ALL_GENRES.map((g) => (
                  <button key={g} onClick={() => toggle(g, genres, setGenres)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      genres.includes(g)
                        ? 'bg-[#7c3aed] border-[#7c3aed] text-white'
                        : 'border-[#222222] text-[#a1a1aa] hover:border-[#333333] hover:text-white'
                    }`}
                  >{g}</button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Preferred Languages</h2>
              <div className="flex flex-wrap gap-2">
                {ALL_LANGUAGES.map((l) => (
                  <button key={l.code} onClick={() => toggle(l.code, languages, setLanguages)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      languages.includes(l.code)
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-[#222222] text-[#a1a1aa] hover:border-[#333333] hover:text-white'
                    }`}
                  >{l.label}</button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Preferred Eras</h2>
              <div className="flex flex-wrap gap-2">
                {ALL_ERAS.map((era) => (
                  <button key={era} onClick={() => toggle(era, eras, setEras)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      eras.includes(era)
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-[#222222] text-[#a1a1aa] hover:border-[#333333] hover:text-white'
                    }`}
                  >{era}</button>
                ))}
              </div>
            </section>

            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              {saved ? <Check size={15} /> : <Save size={15} />}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
            </button>
          </div>
        )}

        {/* ── Activity tab ─────────────────────────────────────────────── */}
        {tab === 'activity' && (
          <div className="text-center py-20 text-[#52525b]">
            <User size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Activity history coming soon</p>
            <p className="text-xs mt-1">Your recently saved and rated films will appear here</p>
          </div>
        )}

        {/* ── Settings tab ─────────────────────────────────────────────── */}
        {tab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Change Username</h3>
              <input
                type="text"
                defaultValue={user.username || ''}
                placeholder="New username"
                className="w-full bg-[#0a0a0a] border border-[#222222] focus:border-[#7c3aed] text-white rounded-lg px-4 py-2.5 text-sm outline-none mb-3 transition-colors"
              />
              <button
                onClick={() => showToast('Username update coming soon')}
                className="px-4 py-2 bg-[#1a1a1a] border border-[#222222] text-[#a1a1aa] hover:text-white rounded-lg text-xs transition-colors"
              >
                Update username
              </button>
            </div>

            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Change Password</h3>
              <div className="space-y-2 mb-3">
                <input type="password" placeholder="Current password" className="w-full bg-[#0a0a0a] border border-[#222222] focus:border-[#7c3aed] text-white rounded-lg px-4 py-2.5 text-sm outline-none transition-colors" />
                <input type="password" placeholder="New password" className="w-full bg-[#0a0a0a] border border-[#222222] focus:border-[#7c3aed] text-white rounded-lg px-4 py-2.5 text-sm outline-none transition-colors" />
              </div>
              <button
                onClick={() => showToast('Password change coming soon')}
                className="px-4 py-2 bg-[#1a1a1a] border border-[#222222] text-[#a1a1aa] hover:text-white rounded-lg text-xs transition-colors"
              >
                Update password
              </button>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
              <h3 className="text-red-400 font-semibold text-sm mb-2">Danger Zone</h3>
              <p className="text-[#52525b] text-xs mb-4">This will remove all your preferences, watchlist, and ratings.</p>
              <button
                onClick={() => { if (confirm('Clear all data? This cannot be undone.')) showToast('Data clearing coming soon') }}
                className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg text-xs transition-colors"
              >
                Clear all data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#111111] border border-[#333333] text-white text-sm px-5 py-3 rounded-xl shadow-xl z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
