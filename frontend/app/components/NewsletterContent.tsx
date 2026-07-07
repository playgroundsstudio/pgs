'use client'
import {useRef, useState} from 'react'
import type {Dispatch, SetStateAction} from 'react'
import {cn} from '@/app/lib/cn'
import {useSlotActions} from '@/app/hooks/useSlotActions'
import SlotPill from '@/app/components/SlotPill'
import {useLenis} from '@/app/hooks/useLenis'

type NewsletterContentProps = {
  mode: string
  setMode: (mode: string) => void
  setActive: Dispatch<SetStateAction<number>>
  openProjectIds: string[]
  setOpenProjectIds: Dispatch<SetStateAction<string[]>>
  index: number
  isActive: boolean
}

export default function NewsletterContent({
  mode,
  setMode,
  setActive,
  openProjectIds,
  setOpenProjectIds,
  index,
  isActive,
}: NewsletterContentProps) {
  const {toggleMode, closeSlot} = useSlotActions({mode, setMode, setActive, openProjectIds, setOpenProjectIds})
  const scrollRef = useRef<HTMLDivElement>(null)
  useLenis(scrollRef, isActive)

  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

  const handleSubmit = () => {
    if (isValidEmail(email)) {
      setSubmitted(true)
      setEmail('')
    }
  }

  return (
    <div className='relative text-dark-1 h-full overflow-hidden bg-transparent'>
      <SlotPill mode={mode} isVisible={isActive} onToggleMode={toggleMode} onClose={() => closeSlot('__newsletter__')} />
      <div
        ref={scrollRef}
        className={cn(
          'absolute inset-0',
          isActive ? 'overflow-scroll scrollbar-none' : 'overflow-hidden pointer-events-none'
        )}
      >
        <div className='flex flex-col gap-4 max-w-[var(--slot-content-max-width)] mx-auto w-full px-slotmargin pt-slotmargin'>
          <div className='flex flex-col gap-0 mb-sa'>
            <h3 className='font-sans text-dark-2'>Newsletter</h3>
            <h3 className='font-medium font-sans'>Join our mailing list</h3>
          </div>
          <div className='flex flex-col gap-4'>
            {submitted ? (
              <p className='font-sans'>Thanks for subscribing.</p>
            ) : (
              <>
                <div className='flex items-center py-[2px] border-b border-stroke border-t overflow-hidden'>
                  <input
                    type='email'
                    placeholder='Enter your email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className='w-full bg-transparent border-none p-0 m-0 outline-none placeholder:text-dark-2 font-inherit text-inherit leading-inherit'
                  />
                </div>
                <button
                  type='button'
                  onClick={handleSubmit}
                  disabled={!isValidEmail(email)}
                  className={cn(
                    'self-start px-4 h-10 flex items-center transition-opacity',
                    isValidEmail(email)
                      ? 'bg-dark-1 text-labelcolor hover:opacity-80 cursor-pointer'
                      : 'bg-dark-1/30 text-labelcolor/50 cursor-not-allowed'
                  )}
                >
                  Subscribe
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
