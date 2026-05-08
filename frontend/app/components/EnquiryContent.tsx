'use client'
import type {Dispatch, SetStateAction} from 'react'
import {cn} from '@/app/lib/cn'
import {useSlotActions} from '@/app/hooks/useSlotActions'
import ContactInquiryBlock from '@/app/components/ContactInquiryBlock'

type EnquiryContentProps = {
  mode: string
  setMode: (mode: string) => void
  setActive: Dispatch<SetStateAction<number>>
  openProjectIds: string[]
  setOpenProjectIds: Dispatch<SetStateAction<string[]>>
  services: string[]
  index: number
  isActive: boolean
}

export default function EnquiryContent({
  mode,
  setMode,
  setActive,
  openProjectIds,
  setOpenProjectIds,
  services,
  index,
  isActive,
}: EnquiryContentProps) {
  const {toggleMode, closeSlot} = useSlotActions({mode, setMode, setActive, openProjectIds, setOpenProjectIds})

  return (
    <div
      className={cn(
        'text-dark-1 h-full overflow-hidden hide-scrollbar bg-transparent',
        isActive ? 'overflow-scroll' : 'overflow-hidden pointer-events-none'
      )}
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
        <div className='w-px h-4 bg-divider hidden lg:block' />
        <button onClick={() => closeSlot('__enquiry__')} className='cursor-pointer hover:text-dark-2' aria-label='Close'>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className='flex flex-col gap-4 max-w-[var(--slot-content-max-width)] mx-auto w-full px-slotmargin pt-slotmargin'>
        <div className='flex flex-col gap-0 mb-sa'>
          <h3 className='font-sans text-dark-2'>Enquiry</h3>
          <h3 className='font-medium font-sans'>Kick off a project with us</h3>
        </div>
        <ContactInquiryBlock
          services={services}
          showContact={false}
          inquiryFullWidth
        />
      </div>
    </div>
  )
}
