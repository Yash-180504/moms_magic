import { useState } from 'react'
import { Search, MapPin, ChefHat, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#FCEAE1] shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2 shrink-0 cursor-pointer"
            aria-label="Mom's Magic home"
          >
            <div className="w-9 h-9 bg-[#EA580C] rounded-xl flex items-center justify-center">
              <ChefHat size={20} color="white" aria-hidden="true" />
            </div>
            <span className="font-heading font-bold text-xl text-[#0F172A] hidden sm:block">
              Mom's Magic
            </span>
          </a>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md items-center gap-2 bg-[#FFF7ED] border border-[#FCEAE1] rounded-xl px-3 py-2 focus-within:border-[#EA580C] focus-within:ring-2 focus-within:ring-[#EA580C]/20 transition-all">
            <MapPin size={16} className="text-[#EA580C] shrink-0" aria-hidden="true" />
            <input
              type="text"
              placeholder="Your area, city…"
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
            <a
              href="/provider/register"
              className="text-sm font-medium text-[#64748B] hover:text-[#EA580C] transition-colors cursor-pointer px-3 py-2"
            >
              List your kitchen
            </a>
            <a
              href="/login"
              className="text-sm font-semibold text-[#EA580C] border-2 border-[#EA580C] rounded-xl px-4 py-2 hover:bg-[#EA580C] hover:text-white transition-colors cursor-pointer"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="text-sm font-semibold bg-[#EA580C] text-white rounded-xl px-4 py-2 hover:bg-[#C2410C] transition-colors cursor-pointer"
            >
              Sign up
            </a>
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

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#FCEAE1] px-4 py-4 flex flex-col gap-2">
          <a
            href="/provider/register"
            className="text-sm font-medium text-[#64748B] py-2 cursor-pointer hover:text-[#EA580C] transition-colors"
          >
            List your kitchen
          </a>
          <a
            href="/login"
            className="text-sm font-semibold text-center text-[#EA580C] border-2 border-[#EA580C] rounded-xl px-4 py-2.5 hover:bg-[#EA580C] hover:text-white transition-colors cursor-pointer"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="text-sm font-semibold text-center bg-[#EA580C] text-white rounded-xl px-4 py-2.5 hover:bg-[#C2410C] transition-colors cursor-pointer"
          >
            Sign up
          </a>
        </div>
      )}
    </header>
  )
}
