'use client'

import { useEffect, useRef } from 'react'

export function useAutoRefresh(onRefresh) {
  const callbackRef = useRef(onRefresh)
  callbackRef.current = onRefresh

  useEffect(() => {
    if (typeof window === 'undefined') return

    const source = new EventSource('/api/refresh')
    source.addEventListener('refresh', () => callbackRef.current())
    // EventSource auto-reconnects on error — no manual retry needed

    return () => source.close()
  }, [])
}
