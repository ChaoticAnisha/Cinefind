// lib/store.ts
//
// Global auth state using Zustand.
// Zustand is like a tiny Redux — stores state that any component can read.
//
// Why this? Without this, every page would need to
// re-fetch the user from the API to know if they're logged in.
// Instead, we store the user here once and share it everywhere.

import { create } from 'zustand'
import Cookies from 'js-cookie'
import { User } from './types'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  // Called after login or register
  setAuth: (user, token) => {
    // Store token in cookie — survives page refresh
    Cookies.set('token', token, { expires: 7 })
    set({ user, token, isLoading: false })
  },

  // Called when user clicks logout
  logout: () => {
    Cookies.remove('token')
    set({ user: null, token: null, isLoading: false })
  },

  setLoading: (loading) => set({ isLoading: loading }),
}))