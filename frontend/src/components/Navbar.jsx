import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, ChefHat, Menu, X, ShoppingBag, LayoutDashboard, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen]     = useState(false)

  function handleLogout() {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#FCEAE1] shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            aria-label="Mom's Magic home"
          >
            <div className="w-9 h-9 bg-[#EA580C] rounded-xl flex items-center justify-center">
              <ChefHat size={20} color="white" aria-hidden="true" />
            </div>
            <span className="font-heading font-bold text-xl text-[#0F172A] hidden sm:block">
              Mom's Magic
            </span>
          </Link>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md items-center gap-2 bg-[#FFF7ED] border border-[#FCEAE1] rounded-xl px-3 py-2 focus-within:border-[#EA580C] focus-within:ring-2 focus-within:ring-[#EA580C]/20 transition-all">
            <MapPin size={16} className="text-[#EA580C] shrink-0" aria-hidden="true" />
            <input
              type="text"
              placeholder="Area or city…"
              className="w-24 bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none border-r border-[#FCEAE1] pr-2"
              aria-label="Location"
            />
            <Search size={16} className="text-[#64748B] shrink-0 ml-1" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search kitchens, meals…"
              className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none"
              aria-label="Search kitchens or meals"
            />
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3" aria-label="Primary navigation">
            {!user && (
              <Link
                to="/register?role=provider"
                className="text-sm font-medium text-[#64748B] hover:text-[#EA580C] transition-colors px-3 py-2"
              >
                List your kitchen
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(p => !p)}
                  className="flex items-center gap-2 text-sm font-semibold text-[#0F172A] bg-[#FDF4F0] border border-[#FCEAE1] rounded-xl px-3 py-2 hover:border-[#EA580C] transition-all cursor-pointer"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-6 h-6 bg-[#EA580C] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.name.split(' ')[0]}
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-[#FCEAE1] shadow-lg z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#FCEAE1]">
                        <p className="text-sm font-semibold text-[#0F172A] truncate">{user.name}</p>
                        <p className="text-xs text-[#64748B] truncate">{user.email}</p>
                        <p className="text-xs text-[#EA580C] font-medium mt-0.5 capitalize">{user.role}</p>
                      </div>
                      {user.role === 'customer' && (
                        <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-[#FDF4F0] transition-colors cursor-pointer">
                          <ShoppingBag size={15} /> My Orders
                        </Link>
                      )}
                      {(user.role === 'provider' || user.role === 'admin') && (
                        <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-[#FDF4F0] transition-colors cursor-pointer">
                          <LayoutDashboard size={15} /> Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-t border-[#FCEAE1]"
                      >
                        <LogOut size={15} /> Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-[#EA580C] border-2 border-[#EA580C] rounded-xl px-4 py-2 hover:bg-[#EA580C] hover:text-white transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="text-sm font-semibold bg-[#EA580C] text-white rounded-xl px-4 py-2 hover:bg-[#C2410C] transition-colors">
                  Sign up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-[#64748B] hover:bg-[#FFF7ED] transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <div className="flex items-center gap-2 bg-[#FFF7ED] border border-[#FCEAE1] rounded-xl px-3 py-2.5 focus-within:border-[#EA580C] focus-within:ring-2 focus-within:ring-[#EA580C]/20 transition-all">
            <Search size={16} className="text-[#64748B] shrink-0" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search kitchens or meals…"
              className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none"
              aria-label="Search kitchens or meals"
            />
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#FCEAE1] px-4 py-4 flex flex-col gap-2">
          {user ? (
            <>
              <div className="flex items-center gap-2 py-2">
                <div className="w-8 h-8 bg-[#EA580C] rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{user.name}</p>
                  <p className="text-xs text-[#64748B] capitalize">{user.role}</p>
                </div>
              </div>
              {user.role === 'customer' && (
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm text-[#0F172A] py-2 cursor-pointer">
                  <ShoppingBag size={16} /> My Orders
                </Link>
              )}
              {(user.role === 'provider' || user.role === 'admin') && (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm text-[#0F172A] py-2 cursor-pointer">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-600 py-2 cursor-pointer">
                <LogOut size={16} /> Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/register?role=provider" className="text-sm font-medium text-[#64748B] py-2" onClick={() => setMobileMenuOpen(false)}>
                List your kitchen
              </Link>
              <Link to="/login" className="text-sm font-semibold text-center text-[#EA580C] border-2 border-[#EA580C] rounded-xl px-4 py-2.5" onClick={() => setMobileMenuOpen(false)}>
                Log in
              </Link>
              <Link to="/register" className="text-sm font-semibold text-center bg-[#EA580C] text-white rounded-xl px-4 py-2.5" onClick={() => setMobileMenuOpen(false)}>
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
