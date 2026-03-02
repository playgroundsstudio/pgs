'use client'

import {useState} from 'react'
import {cn} from '@/app/lib/cn'
import Button from '@/app/components/Button'

type ContactInquiryBlockProps = {
  services: string[]
  showContact?: boolean
  inquiryFullWidth?: boolean
  className?: string
}

export default function ContactInquiryBlock({
  services,
  showContact = true,
  inquiryFullWidth = false,
  className,
}: ContactInquiryBlockProps) {
  const inquiryIsFullWidth = inquiryFullWidth || !showContact
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const form = e.currentTarget
    const data = new FormData(form)

    await fetch('https://formspree.io/f/xaqdgodp', {
      method: 'POST',
      body: data,
      headers: {Accept: 'application/json'},
    })

    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <div className={cn(showContact ? 'flex' : 'block', className)}>
      {showContact && (
        <div className='w-1/2'>
          <h3 className='font-sans text-sm text-td2'> Contact </h3>

          <ul>
            <li className='group flex py-0 cursor-pointer hover:text-td2 overflow-hidden'>
              <div className='w-40 shrink-0'>
                <p className='truncate'>Phone</p>
              </div>
              <div className='px-3 flex-1 min-w-0'>
                <p className='truncate'>+44 7778 4320 987</p>
              </div>
            </li>
            <li className='group flex py-0 cursor-pointer hover:text-td2 overflow-hidden'>
              <div className='w-40 shrink-0'>
                <p className='truncate'>Email</p>
              </div>
              <div className='px-3 flex-1 min-w-0'>
                <p className='truncate'>info@play-grounds.studio</p>
              </div>
            </li>
          </ul>
        </div>
      )}

      <div className={inquiryIsFullWidth ? 'w-full' : 'w-1/2'}>
        <h3 className='font-sans text-sm text-td2'>Enquiry</h3>
        {submitted ? (
          <p className='text-sm text-td1 mt-2'>Thank you for your enquiry. We'll be in touch soon.</p>
        ) : (
          <form onSubmit={handleSubmit} className='flex flex-col gap-px'>
            <div className='relative h-[var(--font-size-sm--line-height)] flex items-center border-b-[1.5px] border-solid border-[rgba(0,0,0,0.1)]'>
              <span className='text-sm text-td1 pointer-events-none absolute left-0'>Name</span>
              <input type='text' name='name' placeholder='John Doe' className='text-sm bg-transparent h-full w-full text-right outline-none placeholder:text-td2' />
            </div>
            <div className='relative h-[var(--font-size-sm--line-height)] flex items-center border-b-[1.5px] border-solid border-[rgba(0,0,0,0.1)]'>
              <span className='text-sm text-td1 pointer-events-none absolute left-0'>Role</span>
              <input type='text' name='role' placeholder='Creative Director' className='text-sm bg-transparent h-full w-full text-right outline-none placeholder:text-td2' />
            </div>
            <div className='relative h-[var(--font-size-sm--line-height)] flex items-center border-b-[1.5px] border-solid border-[rgba(0,0,0,0.1)]'>
              <span className='text-sm text-td1 pointer-events-none absolute left-0'>Services</span>
              <select name='service' className='text-sm bg-transparent h-full w-full text-right outline-none appearance-none cursor-pointer text-td2'>
                <option value=''>Select a service</option>
                {services.map((service) => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
            <div className='relative h-[var(--font-size-sm--line-height)] flex items-center border-b-[1.5px] border-solid border-[rgba(0,0,0,0.1)]'>
              <span className='text-sm text-td1 pointer-events-none absolute left-0'>Budget</span>
              <input type='text' name='budget' placeholder='£5,000 — £10,000' className='text-sm bg-transparent h-full w-full text-right outline-none placeholder:text-td2' />
            </div>
            <div className='min-h-[120px] flex border-b-[1.5px] border-solid border-[rgba(0,0,0,0.1)] py-2'>
              <textarea
                name='message'
                placeholder='message'
                className='text-sm bg-transparent w-full min-h-[104px] text-left outline-none placeholder:text-td2 resize-none'
              />
            </div>
            <div className='relative h-[var(--font-size-sm--line-height)] flex items-center border-b-[1.5px] border-solid border-[rgba(0,0,0,0.1)]'>
              <span className='text-sm text-td1 pointer-events-none absolute left-0'>Are you a social good company?</span>
              <select name='social-good' defaultValue='no' className='text-sm bg-transparent h-full w-full text-right outline-none appearance-none cursor-pointer text-td2'>
                <option value='no'>No</option>
                <option value='yes'>Yes</option>
              </select>
            </div>
            <Button type='submit' disabled={submitting} className='mt-[var(--font-size-sm--line-height)]'>
              {submitting ? 'Sending...' : 'Submit'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
