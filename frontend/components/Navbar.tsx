'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Film, Search, Compass, BookMarked, User, LogOut, Sparkles, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { getMe } from '@/lib/api'
import Cookies from 'js-cookie'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, setAuth, logout, setLoading } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const token = Cookies.get('token')
    if (token && !user) {
      getMe()
        .then((data) => setAuth(data, token))
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const isActive = (path: string) =>
    pathname === path
      ? 'text-white relative after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[#7c3aed] after:rounded-full'
      : 'text-[#a1a1aa] hover:text-white transition-colors'

  const navLinks = [
    { href: '/discover', label: 'Discover', icon: <Compass size={14} /> },
    { href: '/search',   label: 'Search',   icon: <Search size={14} /> },
    { href: '/prompt',   label: 'AI Discovery', icon: <Sparkles size={14} /> },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#7c3aed] flex items-center justify-center">
              <Film size={15} className="text-white" />
            </div>
            <span>CineFind</span>
            <span className="text-[#7c3aed] text-xl leading-none" aria-hidden>·</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 text-sm">
            {navLinks.map(({ href, label, icon }) => (
              <Link key={href} href={href} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md ${isActive(href)}`}>
                {icon}{label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3 text-sm">
            {user ? (
              <>
                <Link href="/watchlist" className={`flex items-center gap-1.5 ${isActive('/watchlist')}`}>
                  <BookMarked size={14} /> Watchlist
                </Link>
                <Link href="/profile" className={`flex items-center gap-1.5 ${isActive('/profile')}`}>
                  <div className="w-6 h-6 rounded-full bg-[#7c3aed]/30 border border-[#7c3aed]/50 flex items-center justify-center text-[10px] font-bold text-[#a78bfa]">
                    {(user.username || user.email || 'U')[0].toUpperCase()}
                  </div>
                  {user.username || 'Profile'}
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-[#a1a1aa] hover:text-red-400 transition-colors">
                  <LogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-[#a1a1aa] hover:text-white transition-colors">
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-1.5 rounded-full font-medium transition-colors text-sm"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#a1a1aa] hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#1a1a1a] bg-[#0a0a0a] px-4 py-4 space-y-1">
            {navLinks.map(({ href, label, icon }) => (
              <Link key={href} href={href} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#111111] transition-colors">
                {icon}<span className="text-sm">{label}</span>
              </Link>
            ))}
            <div className="border-t border-[#1a1a1a] pt-3 mt-3 space-y-1">
              {user ? (
                <>
                  <Link href="/watchlist" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#111111] transition-colors">
                    <BookMarked size={14} /><span className="text-sm">Watchlist</span>
                  </Link>
                  <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#111111] transition-colors">
                    <User size={14} /><span className="text-sm">{user.username || 'Profile'}</span>
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#a1a1aa] hover:text-red-400 hover:bg-[#111111] transition-colors w-full text-left">
                    <LogOut size={14} /><span className="text-sm">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#111111] transition-colors">
                    <span className="text-sm">Login</span>
                  </Link>
                  <Link href="/auth/register" className="block text-center bg-[#7c3aed] text-white px-4 py-2.5 rounded-lg text-sm font-medium">
                    Sign up free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
