'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth } from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const adminToken = localStorage.getItem('mm_admin_token')
    const userToken = localStorage.getItem('mm_token')

    const token = adminToken || userToken
    if (!token) { setLoading(false); return }

    const fetchMe = async () => {
      try {
        const prevToken = localStorage.getItem('mm_token')
        if (adminToken) {
          // Temporarily use admin token for /api/auth/me
          localStorage.setItem('mm_token', adminToken)
        }

        const { user } = await auth.me()
        setUser(user)
      } catch (err) {
        if (adminToken) localStorage.removeItem('mm_admin_token')
        else localStorage.removeItem('mm_token')
        setUser(null)
      } finally {
        if (adminToken && userToken) {
          localStorage.setItem('mm_token', userToken)
        } else if (adminToken) {
          localStorage.removeItem('mm_token')
        }
        setLoading(false)
      }
    }

    fetchMe()
  }, [])

  const login = useCallback(async (email, password) => {
    const { token, user } = await auth.login({ email, password })
    localStorage.setItem('mm_token', token)
    setUser(user)
    return user
  }, [])

  const register = useCallback(async (body) => {
    const { token, user } = await auth.register(body)
    localStorage.setItem('mm_token', token)
    setUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('mm_token')
    setUser(null)
  }, [])

  const updateUser = useCallback((updated) => setUser(updated), [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
