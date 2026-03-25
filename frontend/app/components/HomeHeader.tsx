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
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function setTheme(theme: 'light' | 'dark') {
    const dark = theme === 'dark'
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', theme)
    setIsDark(dark)
  }

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
        <p className=''>
          {title}
          {!hasOpenProject && !scrolled && description ? ` ${description}` : ''}
        </p>
      </div>
      <div className='px-2 flex gap-1 mt-0.5'>
        <button
          type='button'
          aria-label='Light mode'
          onClick={() => setTheme('light')}
          className={`w-2 h-2 rounded-[1px] bg-white border border-black/10 cursor-pointer ${!isDark ? 'ring-1 ring-black/30 ring-offset-1' : ''}`}
        />
        <button
          type='button'
          aria-label='Dark mode'
          onClick={() => setTheme('dark')}
          className={`w-2 h-2 rounded-[1px] bg-[#0b0b0b] cursor-pointer ${isDark ? 'ring-1 ring-white/30 ring-offset-1 ring-offset-surface' : ''}`}
        />
      </div>
    </div>
  )
}
