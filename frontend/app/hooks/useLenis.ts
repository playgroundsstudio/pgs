import {useEffect, useRef} from 'react'
import type {RefObject} from 'react'
import Lenis from 'lenis'

export function useLenis(wrapperRef: RefObject<HTMLDivElement | null>, isActive = true) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (!wrapperRef.current || !isActive) {
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
      return
    }

    const wrapper = wrapperRef.current
    const content = wrapper.firstElementChild as HTMLElement | null

    const lenis = new Lenis({
      wrapper,
      content: content ?? undefined,
      smoothWheel: true,
      lerp: 0.15,
      autoResize: true,
    })

    lenisRef.current = lenis

    let raf: number
    function animate(time: number) {
      lenis.raf(time)
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [wrapperRef, isActive])

  return lenisRef
}
