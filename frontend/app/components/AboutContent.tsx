'use client'
import {useRef} from 'react'
import type {Dispatch, SetStateAction} from 'react'
import {cn} from '@/app/lib/cn'
import {useSlotActions} from '@/app/hooks/useSlotActions'

type AboutContentProps = {
  mode: string
  setMode: (mode: string) => void
  setActive: Dispatch<SetStateAction<number>>
  openProjectIds: string[]
  setOpenProjectIds: Dispatch<SetStateAction<string[]>>
  index: number
  isActive: boolean
}

function PersonCard({initials, name, role, phone, email}: {initials: string, name: string, role: string, phone: string, email: string}) {
  return (
    <div className='flex flex-col'>
      <p className='text-[clamp(18rem,35vw,30rem)] font-medium leading-[0.85] tracking-[-0.08em] mb-8'>{initials}</p>
      <div className='mt-auto'>
        <p>{name}</p>
        <p className='text-dark-2'>{role}</p>
        <div className='flex gap-2'>
          <p className='text-dark-2'>P</p>
          <p>{phone}</p>
        </div>
        <div className='flex gap-2'>
          <p className='text-dark-2'>E</p>
          <p>{email}</p>
        </div>
      </div>
    </div>
  )
}

export default function AboutContent({
  mode,
  setMode,
  setActive,
  openProjectIds,
  setOpenProjectIds,
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


        <div className='grid grid-cols-1 gap-gutter mb-16'>
          <PersonCard initials='JH' name='James Hartwell' role='Designer & Director' phone='+44 7778 432 098' email='james@play-grounds.studio' />
          <PersonCard initials='RK' name='Riley Karl' role='Designer & Director' phone='+44 7778 543689' email='riley@play-grounds.studio' />
        </div>

      </div>
    </div>
  )
}
