import './globals.css'
import 'leaflet/dist/leaflet.css'
import { AuthProvider } from '@/context/AuthContext'
import BottomNav from '@/components/BottomNav'
import InstallBanner from '@/components/InstallBanner'

export const metadata = {
  title: "Mom's Magic — Home-Cooked Food Delivered",
  description: 'Find verified home cooks near you and get freshly cooked meals delivered every day.',
  manifest: '/manifest.json',
  icons: [
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', url: '/icons/pwa-192x192.png' },
  ],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#EA580C',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          <div id="__next">
            {children}
          </div>
          <BottomNav />
          <InstallBanner />
        </AuthProvider>
      </body>
    </html>
  )
}
