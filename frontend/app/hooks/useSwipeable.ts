import {useEffect, useRef} from 'react'
import type {RefObject, Dispatch, SetStateAction} from 'react'
import {useDrag} from '@use-gesture/react'

export function useSwipeable({
  ref,
  slots,
  active,
  setActive,
}: {
  ref: RefObject<HTMLDivElement | null>
  slots: number
  active: number
  setActive: Dispatch<SetStateAction<number>>
}) {
  const slotsRef = useRef(slots)
  slotsRef.current = slots
  const activeRef = useRef(active)
  activeRef.current = active
  const lockUntilRef = useRef(0)

  // Touch swipe
  useDrag(
    ({swipe: [swipeX]}) => {
      if (slotsRef.current <= 1) return
      if (swipeX === -1) {
        setActive((prev) => Math.min(slotsRef.current - 1, prev + 1))
      } else if (swipeX === 1) {
        setActive((prev) => Math.max(0, prev - 1))
      }
    },
    {
      target: ref,
      axis: 'x',
      swipe: {distance: 30, velocity: 0.1},
      filterTaps: true,
      eventOptions: {passive: false},
      pointer: {touch: true},
    },
  )

  // Prevent native horizontal scroll on touch
  useEffect(() => {
    const el = ref.current
    if (!el) return

    let startX = 0
    let startY = 0

    function onTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    function onTouchMove(e: TouchEvent) {
      const dx = Math.abs(e.touches[0].clientX - startX)
      const dy = Math.abs(e.touches[0].clientY - startY)
      if (dx > dy) {
        e.preventDefault()
      }
    }

    el.addEventListener('touchstart', onTouchStart, {passive: true})
    el.addEventListener('touchmove', onTouchMove, {passive: false})

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
    }
  }, [ref])

  // Trackpad horizontal scroll only to navigate slots
  useEffect(() => {
    const el = ref.current
    if (!el) return

    let throttled = false

    function onWheel(e: WheelEvent) {
      if (slotsRef.current <= 1) return
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return

      if (Date.now() < lockUntilRef.current) {
        e.preventDefault()
        return
      }

      e.preventDefault()
      if (throttled) return
      throttled = true
      lockUntilRef.current = Date.now() + 600
      setTimeout(() => { throttled = false }, 800)

      if (e.deltaX > 0) {
        setActive((prev) => Math.min(slotsRef.current - 1, prev + 1))
      } else {
        setActive((prev) => Math.max(0, prev - 1))
      }
    }

    el.addEventListener('wheel', onWheel, {passive: false})
    return () => el.removeEventListener('wheel', onWheel)
  }, [ref, setActive])
}
