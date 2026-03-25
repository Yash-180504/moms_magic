import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('mm_token')
    if (!token) { setLoading(false); return }
    auth.me()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('mm_token'))
      .finally(() => setLoading(false))
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
