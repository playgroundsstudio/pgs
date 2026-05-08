'use client'
import {useRef, useEffect, useState} from 'react'
import type {Dispatch, SetStateAction} from 'react'
import {cn} from '@/app/lib/cn'
import {useSlotActions} from '@/app/hooks/useSlotActions'

type Director = {
  name: string
  jobTitle: string
  email: string
  svgUrl: string
}

type AboutContentProps = {
  mode: string
  setMode: (mode: string) => void
  setActive: Dispatch<SetStateAction<number>>
  openProjectIds: string[]
  setOpenProjectIds: Dispatch<SetStateAction<string[]>>
  directors: Director[]
  index: number
  isActive: boolean
}

function InlineSvg({url, className}: {url: string; className?: string}) {
  const [svg, setSvg] = useState('')
  useEffect(() => {
    fetch(url)
      .then((r) => r.text())
      .then((text) => {
        const cleaned = text.replace(/fill="[^"]*"/g, 'fill="currentColor"')
        setSvg(cleaned)
      })
      .catch(() => {})
  }, [url])
  if (!svg) return null
  return <div className={className} dangerouslySetInnerHTML={{__html: svg}} />
}

function DirectorCard({director}: {director: Director}) {
  return (
    <div className='flex flex-col'>
      {director.svgUrl && (
        <InlineSvg url={director.svgUrl} className='w-[400px] h-auto mb-[1rem] text-dark-1 [&_svg]:w-full [&_svg]:h-auto' />
      )}
      <div className='mt-auto'>
        <p>{director.name}</p>
        <p className='text-dark-2'>{director.jobTitle}</p>
        {director.email && (
          <div className='flex gap-2'>
            <p className='text-dark-2'>E</p>
            <p>{director.email}</p>
          </div>
        )}
      </div>
      <div className='pb-[4rem]' />
    </div>
  )
}

export default function AboutContent({
  mode,
  setMode,
  setActive,
  openProjectIds,
  setOpenProjectIds,
  directors,
  index,
  isActive,
}: AboutContentProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const {toggleMode, closeSlot} = useSlotActions({mode, setMode, setActive, openProjectIds, setOpenProjectIds})

  return (
    <div
      ref={scrollRef}
      className='relative h-full w-full overflow-auto bg-surface2 text-dark-1'
    >
      <div
        className={cn(
          'absolute top-4 right-4 z-40 flex items-center gap-3 px-4 py-2 rounded-full bg-pill backdrop-blur-[80px] shadow-[0_0_20px_rgba(0,0,0,0.08)] border border-border-subtle transition-all duration-300 ease-out',
          isActive ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'
        )}
      >
        <button onClick={toggleMode} className='cursor-pointer hover:text-dark-2 hidden lg:block' aria-label={mode === 'row' ? 'Expand' : 'Minimise'}>
          {mode === 'row' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          )}
        </button>
        <button onClick={() => closeSlot('__about__')} className='cursor-pointer hover:text-dark-2' aria-label='Close'>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div className={cn(' pt-slotmargin max-w-[var(--slot-content-max-width)] mx-auto w-full px-slotmargin')}>


        {directors.length > 0 && (
          <div className='grid grid-cols-1 gap-gutter mb-16'>
            {directors.map((director) => (
              <DirectorCard key={director.name} director={director} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
