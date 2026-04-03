import './globals.css'
import 'leaflet/dist/leaflet.css'
import { AuthProvider } from '@/context/AuthContext'
import BottomNav from '@/components/BottomNav'
import InstallBanner from '@/components/InstallBanner'

export const metadata = {
  title: "Mom's Magic — Home-Cooked Food Delivered",
  description: 'Find verified home cooks near you and get freshly cooked meals delivered every day.',
  manifest: '/favicon/site.webmanifest',
  icons: [
    { rel: 'icon', url: '/favicon/favicon.ico', type: 'image/x-icon' },
    { rel: 'icon', url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    { rel: 'icon', url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { rel: 'apple-touch-icon', url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    { rel: 'icon', url: '/favicon/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    { rel: 'icon', url: '/favicon/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
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
