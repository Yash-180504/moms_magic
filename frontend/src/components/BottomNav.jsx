import { Link, useLocation } from 'react-router-dom'
import { Home, Search, ShoppingBag, User, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function BottomNav() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  const tabs = [
    { to: '/',          icon: Home,            label: 'Home',      roles: ['all'] },
    { to: '/?search=1', icon: Search,          label: 'Search',    roles: ['all'], isSearch: true },
    ...(user?.role === 'customer'
      ? [{ to: '/orders',     icon: ShoppingBag,   label: 'Orders',    roles: ['customer'] }]
      : []),
    ...(user?.role === 'provider' || user?.role === 'admin'
      ? [{ to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard', roles: ['provider', 'admin'] }]
      : []),
    { to: '/profile', icon: User, label: user ? user.name.split(' ')[0] : 'Log in', roles: ['all'] },
  ]

  function isActive(tab) {
    if (tab.isSearch) return false
    if (tab.to === '/') return pathname === '/'
    return pathname.startsWith(tab.to)
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#FCEAE1] safe-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Bottom navigation"
    >
      <div className="flex items-stretch justify-around h-14">
        {tabs.map((tab) => {
          const active = isActive(tab)
          return (
            <Link
              key={tab.label}
              to={tab.to}
              className={`flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-semibold transition-colors min-w-0 ${
                active
                  ? 'text-[#EA580C]'
                  : 'text-[#64748B]'
              }`}
              aria-current={active ? 'page' : undefined}
              aria-label={tab.label}
            >
              <tab.icon
                size={20}
                className={active ? 'text-[#EA580C]' : 'text-[#64748B]'}
                aria-hidden="true"
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className="truncate max-w-12.5 text-center">{tab.label}</span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#EA580C] rounded-full" aria-hidden="true" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
