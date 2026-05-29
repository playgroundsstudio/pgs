import { useEffect } from 'react'

export interface UseKeyboardControlsProps {
  slots: number
  setActive: (value: number | ((prev: number) => number)) => void
  setMode: (mode: string) => void
}

export function useKeyboardControls({ slots, setActive, setMode }: UseKeyboardControlsProps) {
  useEffect(() => {
    if (slots <= 1) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        e.stopPropagation()
        if (e.key === 'ArrowLeft') {
          setActive((prev: number) => Math.max(0, prev - 1))
        } else {
          setActive((prev: number) => Math.min(slots - 1, prev + 1))
        }
      } else if (e.key === 'Enter') {
        setMode('col')
      } else if (e.key === 'Escape') {
        setMode('row')
      }
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [slots, setActive, setMode])
}