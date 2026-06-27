'use client'

import {useEffect, useState} from 'react'
import {getColorSync} from 'colorthief'

const colorCache = new Map<string, string>()

export function useMuxDominantColor(playbackId: string | undefined): string | undefined {
  const [color, setColor] = useState<string | undefined>(
    playbackId ? colorCache.get(playbackId) : undefined,
  )

  useEffect(() => {
    if (!playbackId) return

    const cached = colorCache.get(playbackId)
    if (cached) {
      setColor(cached)
      return
    }

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = `https://image.mux.com/${playbackId}/thumbnail.png?width=64`

    img.onload = () => {
      try {
        const result = getColorSync(img)
        if (result) {
          const hex = result.hex()
          colorCache.set(playbackId, hex)
          setColor(hex)
        }
      } catch {
        // extraction failed, leave undefined
      }
    }
  }, [playbackId])

  return color
}
