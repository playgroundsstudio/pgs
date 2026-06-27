'use client'

import {useEffect, useState} from 'react'

const colorCache = new Map<string, string>()

function getDominantColor(img: HTMLImageElement): string | null {
  try {
    const canvas = document.createElement('canvas')
    const size = 8
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, size, size)
    const data = ctx.getImageData(0, 0, size, size).data
    let r = 0, g = 0, b = 0, count = 0
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
      count++
    }
    r = Math.round(r / count)
    g = Math.round(g / count)
    b = Math.round(b / count)
    return `rgb(${r}, ${g}, ${b})`
  } catch {
    return null
  }
}

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
      const result = getDominantColor(img)
      if (result) {
        colorCache.set(playbackId, result)
        setColor(result)
      }
    }
  }, [playbackId])

  return color
}
