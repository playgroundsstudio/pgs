'use client'
import type {Dispatch, SetStateAction} from 'react'
import {cn} from '@/app/lib/cn'
import {useSlotActions} from '@/app/hooks/useSlotActions'
import SlotPill from '@/app/components/SlotPill'
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
    <div className='relative text-dark-1 h-full overflow-hidden bg-transparent'>
      <SlotPill mode={mode} isVisible={isActive} onToggleMode={toggleMode} onClose={() => closeSlot('__enquiry__')} />
      <div
        className={cn(
          'absolute inset-0',
          isActive ? 'overflow-scroll scrollbar-none' : 'overflow-hidden pointer-events-none'
        )}
      >
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
    </div>
  )
}
