'use client'

import { useEffect, useMemo, useState } from 'react'
import { admin } from '@/lib/api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const STORAGE_KEY = 'mm_admin_token'

export default function AdminPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [users, setUsers] = useState([])
  const [providers, setProviders] = useState([])
  const [orders, setOrders] = useState([])
  const [showPassword, setShowPassword] = useState(false)

  const isLoggedIn = useMemo(() => Boolean(token), [token])

  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('mm_admin_token') || localStorage.getItem('mm_token')
    if (savedToken) {
      setToken(savedToken)
    }
  }, [])

  useEffect(() => {
    if (!token) return

    async function fetchData() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/admin/data', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to load admin data')
        }

        const data = await res.json()
        setSummary(data.summary)
        setUsers(data.users || [])
        setProviders(data.providers || [])
        setOrders(data.orders || [])
        localStorage.setItem(STORAGE_KEY, token)
      } catch (err) {
        setError(err?.message || 'Could not fetch admin data')
        setToken('')
        localStorage.removeItem(STORAGE_KEY)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await admin.login({ email: email.trim(), password: password.trim() })
      if (!data?.token) throw new Error('Invalid response from admin login')
      setToken(data.token)
      localStorage.setItem(STORAGE_KEY, data.token)
      localStorage.setItem('mm_admin_token', data.token)
      // avoid conflicting regular user session while in admin mode
      localStorage.removeItem('mm_token')

      if (data.user) {
        setEmail('')
        setPassword('')
      }
    } catch (err) {
      setError(err?.message || 'Admin login failed')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    setToken('')
    setSummary(null)
    setUsers([])
    setProviders([])
    setOrders([])
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('mm_admin_token')
    localStorage.removeItem('mm_token')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">Admin Dashboard</h1>
            <p className="text-sm text-[#64748B] mt-1">Monitor providers, customers, orders, and system activity.</p>
          </div>

          {isLoggedIn && (
            <button onClick={handleLogout} className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
              Logout
            </button>
          )}
        </div>

        {!isLoggedIn ? (
          <div className="flex flex-col justify-center items-center min-h-[60vh]">
            <div className="w-full max-w-md p-6 bg-white border border-[#FCEAE1] rounded-2xl shadow-sm">
              <h2 className="font-semibold text-xl text-[#0F172A] mb-4">Admin Login (env credential)</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" className="w-full border border-[#FCEAE1] rounded-xl px-3 py-2" required />

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Admin password"
                    className="w-full border border-[#FCEAE1] rounded-xl px-3 py-2 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#64748B] hover:text-[#0F172A]"
                  >
                    {showPassword ? 'Hide' : 'View'}
                  </button>
                </div>

                <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-[#EA580C] text-white rounded-xl font-semibold hover:bg-[#C2410C] transition-colors disabled:opacity-70">
                  {loading ? 'Signing in…' : 'Sign in as admin'}
                </button>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </form>
              <p className="mt-3 text-xs text-[#64748B]">Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local for admin access</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#FCEAE1]">
                <div className="text-sm text-[#64748B]">Total Users</div>
                <div className="text-2xl font-bold text-[#0F172A]">{summary?.total_users ?? '-'}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#FCEAE1]">
                <div className="text-sm text-[#64748B]">Total Customers</div>
                <div className="text-2xl font-bold text-[#0F172A]">{summary?.total_customers ?? '-'}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#FCEAE1]">
                <div className="text-sm text-[#64748B]">Active Providers</div>
                <div className="text-2xl font-bold text-[#0F172A]">{summary?.active_providers ?? '-'}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#FCEAE1]">
                <div className="text-sm text-[#64748B]">Orders</div>
                <div className="text-2xl font-bold text-[#0F172A]">{summary?.total_orders ?? '-'}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <section className="bg-white border border-[#FCEAE1] rounded-2xl p-4 overflow-auto max-h-[400px]">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-3">Recent Orders</h3>
                {orders.length === 0 ? <p className="text-sm text-[#64748B]">No orders yet.</p> : (
                  <ul className="space-y-2 text-sm">
                    {orders.slice(0, 20).map(order => (
                      <li key={order.id} className="border-b border-[#FCEAE1] pb-2 last:border-0">
                        <div className="font-semibold text-[#0F172A]">Order #{order.id} — ₹{order.total_amount}</div>
                        <div className="text-[#64748B]">Customer: {order.customer_name} | Provider: {order.kitchen_name}</div>
                        <div className="text-[#64748B]">Status: {order.status || 'unknown'} | Created: {new Date(order.created_at).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="bg-white border border-[#FCEAE1] rounded-2xl p-4 overflow-auto max-h-[400px]">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-3">Providers</h3>
                {providers.length === 0 ? <p className="text-sm text-[#64748B]">No providers yet.</p> : (
                  <ul className="space-y-2 text-sm">
                    {providers.slice(0, 20).map(p => (
                      <li key={p.id} className="border-b border-[#FCEAE1] pb-2 last:border-0">
                        <div className="font-semibold text-[#0F172A]">{p.kitchen_name} ({p.city || 'N/A'})</div>
                        <div className="text-[#64748B]">Owner: {p.owner_name} ({p.owner_email})</div>
                        <div className="text-[#64748B]">Total Orders: {p.total_orders || 0}, Active: {p.is_active ? 'Yes' : 'No'}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="bg-white border border-[#FCEAE1] rounded-2xl p-4 overflow-auto max-h-[400px]">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-3">Recent Users</h3>
                {users.length === 0 ? <p className="text-sm text-[#64748B]">No users yet.</p> : (
                  <ul className="space-y-2 text-sm">
                    {users.slice(0, 20).map(u => (
                      <li key={u.id} className="border-b border-[#FCEAE1] pb-2 last:border-0">
                        <div className="font-semibold text-[#0F172A]">{u.name} ({u.role})</div>
                        <div className="text-[#64748B]">{u.email}</div>
                        <div className="text-[#64748B]">Joined: {new Date(u.created_at).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
