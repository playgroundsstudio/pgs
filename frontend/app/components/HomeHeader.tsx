'use client'
import {useEffect, useState} from 'react'
import type {RefObject} from 'react'

type HomeHeaderProps = {
  title: string
  description: string
  hasOpenProject?: boolean
  scrollRef?: RefObject<HTMLDivElement | null>
}

export default function HomeHeader({
  title,
  description,
  hasOpenProject = false,
  scrollRef,
}: HomeHeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const container = scrollRef?.current

    if (container) {
      const onScroll = () => setScrolled(container.scrollTop > 0)
      onScroll()
      container.addEventListener('scroll', onScroll, {passive: true})
      return () => container.removeEventListener('scroll', onScroll)
    }

    const onWindowScroll = () => setScrolled(window.scrollY > 0)
    onWindowScroll()
    window.addEventListener('scroll', onWindowScroll, {passive: true})
    return () => window.removeEventListener('scroll', onWindowScroll)
  }, [scrollRef])

  return (
    <div className='sticky top-1 z-10 h-[var(--font-size-sm--line-height)] mt-1'>
      <div className={`px-2 ${scrolled ? '' : 'w-full md:w-1/2'}`}>
        <p className='text-sm'>
          {title}
          {!hasOpenProject && !scrolled && description ? ` ${description}` : ''}
        </p>
      </div>
    </div>
  )
}
