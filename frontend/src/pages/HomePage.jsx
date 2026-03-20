import { useState } from 'react'
import { Search, MapPin, ChefHat, Users, Star, TrendingUp } from 'lucide-react'
import Navbar from '../components/Navbar'
import ProviderCard from '../components/ProviderCard'
import HowItWorks from '../components/HowItWorks'
import Footer from '../components/Footer'
import { PROVIDERS, CATEGORIES } from '../data/mockProviders'

const STATS = [
  { icon: ChefHat, value: '500+', label: 'Home Cooks', color: 'text-[#EA580C]' },
  { icon: Users, value: '12,000+', label: 'Happy Customers', color: 'text-[#2563EB]' },
  { icon: Star, value: '4.7', label: 'Avg Rating', color: 'text-amber-500' },
  { icon: TrendingUp, value: '₹60–₹100', label: 'Per Meal', color: 'text-green-600' },
]

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProviders = PROVIDERS.filter(provider => {
    const matchesCategory =
      activeCategory === 'all' || provider.tags.includes(activeCategory)
    const matchesSearch =
      searchQuery === '' ||
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
      <Navbar />

      <main id="main-content">

        {/* ── Hero ── */}
        <section
          className="bg-gradient-to-br from-[#FFF7ED] via-[#FFF1E0] to-[#FFE9CC] py-16 sm:py-20 px-4 sm:px-6 lg:px-8"
          aria-labelledby="hero-heading"
        >
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block bg-[#EA580C]/10 text-[#EA580C] text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
              Home-cooked. Delivered daily.
            </span>
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-[#0F172A] leading-tight mb-4">
              Taste of home, <br />
              <span className="text-[#EA580C]">right at your door</span>
            </h1>
            <p className="text-[#64748B] text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
              Find verified home cooks near you and get freshly cooked meals delivered every day — just like Ma used to make.
            </p>

            {/* Hero search */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="flex-1 flex items-center gap-2 bg-white border border-[#FCEAE1] rounded-xl px-4 py-3 shadow-sm focus-within:border-[#EA580C] focus-within:ring-2 focus-within:ring-[#EA580C]/20 transition-all">
                <MapPin size={18} className="text-[#EA580C] shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Your area or city…"
                  className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none"
                  aria-label="Enter your location"
                />
              </div>
              <button
                className="flex items-center justify-center gap-2 bg-[#EA580C] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#C2410C] active:scale-95 transition-all cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
                aria-label="Search for kitchens"
              >
                <Search size={18} aria-hidden="true" />
                Find Kitchens
              </button>
            </div>
          </div>
        </section>

        {/* ── Stats strip ── */}
        <section className="bg-white border-y border-[#FCEAE1]" aria-label="Platform stats">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#FCEAE1]">
              {STATS.map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="flex flex-col items-center py-6 px-4 gap-2">
                  <Icon size={22} className={color} aria-hidden="true" />
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-heading font-bold text-2xl text-[#0F172A]">{value}</dd>
                  <p className="text-xs text-[#64748B] text-center">{label}</p>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Provider listings ── */}
        <section
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
          aria-labelledby="kitchens-heading"
        >
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 id="kitchens-heading" className="font-heading font-bold text-2xl sm:text-3xl text-[#0F172A]">
              Kitchens near you
            </h2>

            {/* Search filter */}
            <div className="flex items-center gap-2 bg-white border border-[#FCEAE1] rounded-xl px-3 py-2 w-full sm:w-64 focus-within:border-[#EA580C] focus-within:ring-2 focus-within:ring-[#EA580C]/20 transition-all">
              <Search size={15} className="text-[#64748B] shrink-0" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter kitchens…"
                className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none"
                aria-label="Filter kitchens by name or location"
              />
            </div>
          </div>

          {/* Category chips */}
          <div
            className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none"
            role="group"
            aria-label="Filter by category"
          >
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 text-sm font-medium px-4 py-2 rounded-full border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C] ${
                  activeCategory === cat.id
                    ? 'bg-[#EA580C] text-white border-[#EA580C]'
                    : 'bg-white text-[#64748B] border-[#FCEAE1] hover:border-[#EA580C] hover:text-[#EA580C]'
                }`}
                aria-pressed={activeCategory === cat.id}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filteredProviders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProviders.map(provider => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16" role="status" aria-live="polite">
              <div className="w-16 h-16 bg-[#FDF4F0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-[#EA580C]" aria-hidden="true" />
              </div>
              <p className="font-heading font-bold text-xl text-[#0F172A] mb-2">No kitchens found</p>
              <p className="text-[#64748B] text-sm">Try a different search or category filter.</p>
            </div>
          )}
        </section>

        {/* ── How it works ── */}
        <HowItWorks />

        {/* ── Provider CTA banner ── */}
        <section
          className="bg-gradient-to-r from-[#EA580C] to-[#F97316] py-14 px-4 sm:px-6 lg:px-8"
          aria-labelledby="provider-cta-heading"
        >
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 id="provider-cta-heading" className="font-heading font-bold text-3xl sm:text-4xl mb-3">
              Cook from home. Earn every day.
            </h2>
            <p className="text-white/80 text-base sm:text-lg mb-8 leading-relaxed">
              Join 500+ home cooks already earning on Mom's Magic. No setup cost — list your kitchen for free and start getting orders today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/provider/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#EA580C] font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-orange-50 active:scale-95 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <ChefHat size={18} aria-hidden="true" />
                List your kitchen — it's free
              </a>
              <a
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/60 text-white font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                Learn how it works
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
