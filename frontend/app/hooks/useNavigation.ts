import { useEffect, useRef } from 'react'

export interface UseNavigationProps {
  slots: number
  effectiveMode: string
  isHoveringActiveSlot: boolean
  setActive: (value: number | ((prev: number) => number)) => void
  setOpenProjectIds: (value: string[] | ((prev: string[]) => string[])) => void
  scrollRef: React.RefObject<HTMLDivElement | null>
}

export function useNavigation({
  slots,
  effectiveMode,
  isHoveringActiveSlot,
  setActive,
  setOpenProjectIds,
  scrollRef
}: UseNavigationProps) {
  const wheelThrottledRef = useRef(false)

  const closeProjectTab = (tabIndex: number) => {
    if (tabIndex < 1) return
    const projectIndex = tabIndex - 1
    
    setOpenProjectIds((prev) => {
      const projectId = prev[projectIndex]
      if (!projectId) return prev
      return prev.filter((id) => id !== projectId)
    })
    
    setActive((prev: number) => {
      if (prev === tabIndex) return Math.max(0, prev - 1)
      if (prev > tabIndex) return prev - 1
      return prev
    })
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleWheel = (event: WheelEvent) => {
      // Only one slot — no panel navigation needed, allow normal scroll
      if (slots <= 1) return

      if (effectiveMode === 'col') {
        // In col mode, only navigate panels with horizontal scroll
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || event.deltaX === 0) {
          return
        }
        event.preventDefault()
        if (wheelThrottledRef.current) return
        wheelThrottledRef.current = true
        setTimeout(() => { wheelThrottledRef.current = false }, 1000)
        setActive((prev: number) => Math.max(0, Math.min(slots - 1, prev + Math.sign(event.deltaX))))
        return
      }

      if (effectiveMode !== 'row') {
        return
      }

      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (delta === 0) {
        return
      }

      // Allow vertical scroll through to inner content when on active slot
      if (isHoveringActiveSlot && Math.abs(event.deltaY) >= Math.abs(event.deltaX)) {
        return
      }

      event.preventDefault()
      if (wheelThrottledRef.current) return
      wheelThrottledRef.current = true
      setTimeout(() => { wheelThrottledRef.current = false }, 1000)

      setActive((prev: number) => Math.max(0, Math.min(slots - 1, prev + Math.sign(delta))))
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleWheel)
    }
  }, [slots, effectiveMode, isHoveringActiveSlot, setActive, scrollRef])

  return { closeProjectTab }
}