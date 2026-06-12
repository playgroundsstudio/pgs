'use client'
import {useRef, useEffect, useState} from 'react'
import type {Dispatch, SetStateAction} from 'react'
import {cn} from '@/app/lib/cn'
import {useSlotActions} from '@/app/hooks/useSlotActions'
import SlotPill from '@/app/components/SlotPill'

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
  siteTitle: string
  description: string
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
        <InlineSvg url={director.svgUrl} className='w-[200px] h-auto mb-[1rem] text-dark-1 [&_svg]:w-full [&_svg]:h-auto' />
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
  siteTitle,
  description,
  directors,
  index,
  isActive,
}: AboutContentProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const {toggleMode, closeSlot} = useSlotActions({mode, setMode, setActive, openProjectIds, setOpenProjectIds})

  return (
    <div className='relative h-full w-full bg-surface2 text-dark-1'>
      <SlotPill mode={mode} isVisible={isActive} onToggleMode={toggleMode} onClose={() => closeSlot('__about__')} />
      <div
        ref={scrollRef}
        className='absolute inset-0 overflow-auto scrollbar-none'
      >
      <div className={cn('pt-slotmargin w-[calc(100%-105px)] px-slotmargin')}>
        {description && <p className='text-2xl leading-snug mb-16'>{siteTitle} {description}</p>}

        {directors.length > 0 && (
          <div className='grid grid-cols-1 gap-gutter mb-16'>
            {directors.map((director) => (
              <DirectorCard key={director.name} director={director} />
            ))}
          </div>
        )}

      </div>
      </div>
    </div>
  )
}
