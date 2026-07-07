'use client'
import {useRef} from 'react'
import type {Dispatch, SetStateAction} from 'react'
import {cn} from '@/app/lib/cn'
import {useSlotActions} from '@/app/hooks/useSlotActions'
import SlotPill from '@/app/components/SlotPill'
import {PortableText} from 'next-sanity'
import {useLenis} from '@/app/hooks/useLenis'

type Director = {
  name: string
  jobTitle: string
  email: string
  svgUrl: string
}

type Client = {
  name: string
  url: string
}

type AboutContentProps = {
  mode: string
  setMode: (mode: string) => void
  setActive: Dispatch<SetStateAction<number>>
  openProjectIds: string[]
  setOpenProjectIds: Dispatch<SetStateAction<string[]>>
  siteTitle: string
  description: any
  directors: Director[]
  clients: Client[]
  email: string
  internshipEmail: string
  showreel: {asset?: {playbackId?: string}} | null
  index: number
  isActive: boolean
}

const INDENT = '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'

export default function AboutContent({
  mode,
  setMode,
  setActive,
  openProjectIds,
  setOpenProjectIds,
  siteTitle,
  description,
  directors,
  clients,
  email,
  internshipEmail,
  showreel,
  index,
  isActive,
}: AboutContentProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useLenis(scrollRef, isActive)
  const {toggleMode, closeSlot} = useSlotActions({mode, setMode, setActive, openProjectIds, setOpenProjectIds})

  return (
    <div className='relative h-full w-full bg-surface2'>
      <SlotPill mode={mode} isVisible={isActive} onToggleMode={toggleMode} onClose={() => closeSlot('__about__')} />
      <div
        ref={scrollRef}
        className='absolute inset-0 overflow-auto scrollbar-none'
      >
        <div className={cn('pt-slotmargin px-slotmargin text-white text-[29px] leading-[1.1] tracking-[-0.29px] w-[calc(100%-60px)]')}>
          <div className='flex flex-col gap-[50px]'>

            {/* Opening Statement */}
            {description && (
              <div className='whitespace-pre-wrap'>
                <span className='text-white'>{siteTitle}</span>
                {' '}
                {Array.isArray(description) ? (
                  <PortableText
                    value={description}
                    components={{
                      block: {
                        normal: ({children}) => <><br />{INDENT}  {children}</>,
                      },
                    }}
                  />
                ) : (
                  <span><br />{INDENT}  {description}</span>
                )}
              </div>
            )}

            {/* We've worked with */}
            {clients.length > 0 && (
              <div className='whitespace-pre-wrap'>
                <p className='mb-0'>{INDENT}We&apos;ve worked with</p>
                <p className='text-white/40'>
                  {clients.map((client, i) => (
                    <span key={client.name}>
                      {client.url ? (
                        <a
                          href={client.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-white/40 hover:text-white transition-colors'
                        >
                          {client.name}
                        </a>
                      ) : (
                        <span>{client.name}</span>
                      )}
                      {i < clients.length - 1 && ', '}
                      {i === clients.length - 1 && '.'}
                    </span>
                  ))}
                </p>
              </div>
            )}

            {/* New Business */}
            {email && (
              <div className='whitespace-pre'>
                <p className='mb-0'>{INDENT}New Business </p>
                <p className='mb-0'>Kick Off Project</p>
                <a href={`mailto:${email}`} className='text-white/40'>{email}</a>
              </div>
            )}

            {/* Directors */}
            {directors.map((director) => (
              <div key={director.name} className='whitespace-pre-wrap'>
                <p className='mb-0'>{INDENT}{director.name} </p>
                <p className='mb-0'>{director.jobTitle}</p>
                {director.email && (
                  <a href={`mailto:${director.email}`} className='block text-white/40'>{director.email}</a>
                )}
              </div>
            ))}

            {/* Internships */}
            {internshipEmail && (
              <div className='whitespace-pre'>
                <p className='mb-0'>{INDENT}Internships </p>
                <p className='mb-0'>Say Hi</p>
                <a href={`mailto:${internshipEmail}`} className='text-white/40'>{internshipEmail}</a>
              </div>
            )}

          </div>
          <div className='pb-[4rem]' />
        </div>
      </div>
    </div>
  )
}
