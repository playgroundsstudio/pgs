import {useEffect, useRef} from 'react'
import type {RefObject} from 'react'
import Lenis from 'lenis'

export function useLenis(wrapperRef: RefObject<HTMLDivElement | null>, contentRef?: RefObject<HTMLDivElement | null>) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (!wrapperRef.current) return

    const lenis = new Lenis({
      wrapper: wrapperRef.current,
      content: contentRef?.current ?? undefined,
      smoothWheel: true,
      lerp: 0.15,
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
  }, [wrapperRef, contentRef])

  return lenisRef
}
