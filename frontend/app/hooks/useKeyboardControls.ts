import { useEffect, useRef } from 'react'
import type { Dispatch, SetStateAction } from 'react'

export interface UseKeyboardControlsProps {
  slots: number
  active: number
  setActive: Dispatch<SetStateAction<number>>
  mode: string
  setMode: (mode: string) => void
  openProjectIds: string[]
  setOpenProjectIds: Dispatch<SetStateAction<string[]>>
}

export function useKeyboardControls({ slots, active, setActive, mode, setMode, openProjectIds, setOpenProjectIds }: UseKeyboardControlsProps) {
  const stateRef = useRef({ mode, active, openProjectIds })
  stateRef.current = { mode, active, openProjectIds }

  useEffect(() => {
    if (slots <= 1) return

    function handleKeyDown(e: KeyboardEvent) {
      const { mode: currentMode, active: currentActive, openProjectIds: currentIds } = stateRef.current

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
        if (currentMode === 'col') {
          setMode('row')
        } else if (currentActive > 0) {
          const projectId = currentIds[currentActive - 1]
          if (projectId) {
            setOpenProjectIds((prev) => prev.filter((id) => id !== projectId))
            setActive((prev: number) => Math.max(0, prev - 1))
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [slots, setActive, setMode, setOpenProjectIds])
}
