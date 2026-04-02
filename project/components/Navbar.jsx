'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ChefHat, ShoppingBag, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    setUserMenuOpen(false)
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#FCEAE1] shadow-sm"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 h-14 md:h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Home">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-[#EA580C] rounded-xl flex items-center justify-center">
              <ChefHat size={18} color="white" aria-hidden="true" />
            </div>
            <span className="font-heading font-bold text-lg md:text-xl text-[#0F172A]">Mom&apos;s Magic</span>
          </Link>

          <div className="flex-1 flex items-center gap-2 bg-[#FFF7ED] border border-[#FCEAE1] rounded-xl px-3 py-2 focus-within:border-[#EA580C] focus-within:ring-2 focus-within:ring-[#EA580C]/20 transition-all">
            <Search size={15} className="text-[#64748B] shrink-0" aria-hidden="true" />
            <input type="search" placeholder="Search kitchens or meals…"
              className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none min-w-0"
              aria-label="Search kitchens or meals" />
          </div>

          <nav className="hidden md:flex items-center gap-2 shrink-0" aria-label="Account">
            {!user && (
              <Link href="/register?role=provider"
                className="text-sm font-medium text-[#64748B] hover:text-[#EA580C] transition-colors px-3 py-2 whitespace-nowrap">
                List your kitchen
              </Link>
            )}
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(p => !p)}
                  className="flex items-center gap-2 text-sm font-semibold text-[#0F172A] bg-[#FDF4F0] border border-[#FCEAE1] rounded-xl px-3 py-2 hover:border-[#EA580C] transition-all cursor-pointer"
                  aria-expanded={userMenuOpen}>
                  <div className="w-6 h-6 bg-[#EA580C] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name.split(' ')[0]}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-[#FCEAE1] shadow-xl z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#FCEAE1]">
                        <p className="text-sm font-bold text-[#0F172A] truncate">{user.name}</p>
                        <p className="text-xs text-[#64748B] truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-xs font-semibold text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded-full capitalize">{user.role}</span>
                      </div>
                      {user.role === 'customer' && (
                        <Link href="/orders" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#0F172A] hover:bg-[#FDF4F0] transition-colors">
                          <ShoppingBag size={15} className="text-[#64748B]" /> My Orders
                        </Link>
                      )}
                      {(user.role === 'provider' || user.role === 'admin') && (
                        <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#0F172A] hover:bg-[#FDF4F0] transition-colors">
                          <LayoutDashboard size={15} className="text-[#64748B]" /> Dashboard
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-[#FCEAE1] cursor-pointer">
                        <LogOut size={15} /> Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-[#EA580C] border-2 border-[#EA580C] rounded-xl px-4 py-2 hover:bg-[#EA580C] hover:text-white transition-colors">Log in</Link>
                <Link href="/register" className="text-sm font-semibold bg-[#EA580C] text-white rounded-xl px-4 py-2 hover:bg-[#C2410C] transition-colors">Sign up</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
