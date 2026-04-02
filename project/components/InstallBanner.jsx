'use client'

import { ChefHat, Download, X } from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

export default function InstallBanner() {
  const { showBanner, installed, install, dismiss } = useInstallPrompt()

  if (!showBanner || installed) return null

  return (
    <div
      className="fixed bottom-[env(safe-area-inset-bottom,0px)] left-0 right-0 z-50 mx-3 mb-3 sm:mx-auto sm:max-w-md"
      role="complementary"
      aria-label="Install app prompt"
    >
      <div className="bg-white border border-[#FCEAE1] rounded-2xl shadow-xl px-4 py-3.5 flex items-center gap-3">
        <div className="w-11 h-11 bg-[#EA580C] rounded-xl flex items-center justify-center shrink-0">
          <ChefHat size={22} color="white" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#0F172A] leading-tight">Install Mom&apos;s Magic</p>
          <p className="text-xs text-[#64748B] mt-0.5">Add to home screen for the full app experience</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={install}
            className="flex items-center gap-1.5 bg-[#EA580C] text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-[#C2410C] active:scale-95 transition-all cursor-pointer"
            aria-label="Install app"
          >
            <Download size={13} aria-hidden="true" />
            Install
          </button>
          <button
            onClick={dismiss}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#FDF4F0] rounded-lg transition-colors cursor-pointer"
            aria-label="Dismiss install prompt"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
