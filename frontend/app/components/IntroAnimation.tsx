'use client'
import {useState, useRef, useLayoutEffect, useCallback} from 'react'
import gsap from 'gsap'

const INTRO_TEXT = 'Place holder intro animation text should be about this long'
const SESSION_KEY = 'pgs-intro-seen'

export default function IntroAnimation({onComplete}: {onComplete: () => void}) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(true)

  const runAnimation = useCallback(() => {
    const overlay = overlayRef.current
    const textEl = textRef.current
    if (!overlay || !textEl) return

    // Wrap each word in a span
    const words = INTRO_TEXT.split(' ')
    textEl.innerHTML = ''
    words.forEach((word, i) => {
      const span = document.createElement('span')
      span.textContent = i < words.length - 1 ? word + ' ' : word
      span.style.opacity = '0'
      span.style.display = 'inline'
      textEl.appendChild(span)
    })

    const wordEls = textEl.querySelectorAll('span')

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem(SESSION_KEY, '1')
        setVisible(false)
        onComplete()
      },
    })

    // Stagger fade in each word
    tl.to(wordEls, {
      opacity: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power1.inOut',
    })

    // Hold
    tl.to({}, {duration: 1.2})

    // Fade out text first
    tl.to(textEl, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
    })

    // Then fade out background
    tl.to(overlay, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
    })
  }, [onComplete])

  useLayoutEffect(() => {
    // TODO: re-enable session check after debugging
    // if (sessionStorage.getItem(SESSION_KEY)) {
    //   setVisible(false)
    //   onComplete()
    //   return
    // }
    runAnimation()
  }, [runAnimation, onComplete])

  if (!visible) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface"
    >
      <span
        ref={textRef}
        className="font-sans text-dark-1 text-center max-w-[600px] px-8"
      />

    </div>
  )
}
