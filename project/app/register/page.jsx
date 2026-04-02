'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChefHat, Eye, EyeOff, AlertCircle, Users, UtensilsCrossed } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const { register } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: searchParams.get('role') === 'provider' ? 'provider' : 'customer',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function update(key) {
    return e => setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setError(null)
    setLoading(true)
    try {
      await register(form)
      router.push(form.role === 'provider' ? '/dashboard' : '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF7ED] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8" aria-label="Go to homepage">
          <div className="w-10 h-10 bg-[#EA580C] rounded-xl flex items-center justify-center">
            <ChefHat size={22} color="white" aria-hidden="true" />
          </div>
          <span className="font-heading font-bold text-2xl text-[#0F172A]">Mom&apos;s Magic</span>
        </Link>

        <div className="bg-white rounded-2xl border border-[#FCEAE1] shadow-sm p-8">
          <h1 className="font-heading font-bold text-2xl text-[#0F172A] mb-1">Create account</h1>
          <p className="text-sm text-[#64748B] mb-6">Start ordering home-cooked meals today</p>

          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-[#FDF4F0] rounded-xl" role="group" aria-label="Account type">
            {[
              { value: 'customer', label: 'Customer', Icon: Users },
              { value: 'provider', label: 'Home Cook', Icon: UtensilsCrossed },
            ].map(({ value, label, Icon }) => (
              <button key={value} type="button"
                onClick={() => setForm(p => ({ ...p, role: value }))}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  form.role === value ? 'bg-[#EA580C] text-white shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
                aria-pressed={form.role === value}>
                <Icon size={15} aria-hidden="true" /> {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5" role="alert">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                Full name <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input id="reg-name" type="text" autoComplete="name" required value={form.name} onChange={update('name')}
                placeholder="Kamala Devi"
                className="w-full text-sm border border-[#FCEAE1] rounded-xl px-4 py-3 text-[#0F172A] placeholder-[#64748B] outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 transition-all" />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                Email address <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input id="reg-email" type="email" autoComplete="email" required value={form.email} onChange={update('email')}
                placeholder="you@example.com"
                className="w-full text-sm border border-[#FCEAE1] rounded-xl px-4 py-3 text-[#0F172A] placeholder-[#64748B] outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 transition-all" />
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-sm font-semibold text-[#0F172A] mb-1.5">Phone (optional)</label>
              <input id="reg-phone" type="tel" autoComplete="tel" value={form.phone} onChange={update('phone')}
                placeholder="+91 98765 43210"
                className="w-full text-sm border border-[#FCEAE1] rounded-xl px-4 py-3 text-[#0F172A] placeholder-[#64748B] outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 transition-all" />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                Password <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input id="reg-password" type={showPass ? 'text' : 'password'} autoComplete="new-password" required minLength={8}
                  value={form.password} onChange={update('password')} placeholder="Min 8 characters"
                  className="w-full text-sm border border-[#FCEAE1] rounded-xl px-4 py-3 pr-11 text-[#0F172A] placeholder-[#64748B] outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 transition-all" />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] cursor-pointer p-1"
                  aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <p className="text-xs text-[#64748B] mt-1">At least 8 characters</p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#EA580C] text-white font-bold py-3 rounded-xl hover:bg-[#C2410C] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading ? 'Creating account…' : `Create ${form.role === 'provider' ? 'Cook' : 'Customer'} Account`}
            </button>
          </form>

          <p className="text-center text-sm text-[#64748B] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#EA580C] font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
