'use client'

import { useState, useEffect } from 'react'

const DISMISS_KEY = 'mm_pwa_dismiss_until'
const INSTALLED_KEY = 'mm_pwa_installed'

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(INSTALLED_KEY)) { setInstalled(true); return }
    const until = Number(localStorage.getItem(DISMISS_KEY) || 0)
    if (Date.now() < until) return

    const onPrompt = (e) => { e.preventDefault(); setDeferredPrompt(e); setShowBanner(true) }
    const onInstalled = () => { setInstalled(true); setShowBanner(false); localStorage.setItem(INSTALLED_KEY, 'true') }

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') { setInstalled(true); setShowBanner(false); localStorage.setItem(INSTALLED_KEY, 'true') }
    setDeferredPrompt(null)
  }

  function dismiss() {
    setShowBanner(false)
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 3 * 24 * 60 * 60 * 1000))
  }

  return { showBanner, installed, install, dismiss }
}
