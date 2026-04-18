'use client'
import {useEffect, useRef} from 'react'
import type {Dispatch, SetStateAction} from 'react'
import {cn} from '@/app/lib/cn'

type SlotProps = {
  children: React.ReactNode
  index: number
  length: number
  setActive: (index: number) => void
  active: number
  mode: string
  hoveredSlotIndex: number | null
  setHoveredSlotIndex: Dispatch<SetStateAction<number | null>>
  isActive: boolean
  showDebugUi: boolean
  hasPadding: boolean
  blurred?: boolean
}

export default function Slot({
  children,
  index,
  length,
  setActive,
  active,
  mode,
  hoveredSlotIndex,
  setHoveredSlotIndex,
  isActive,
  showDebugUi,
  hasPadding,
  blurred,
}: SlotProps) {
  const ref = useRef<HTMLDivElement>(null)
  const numActive = Number(active)
  const slotActive = index === numActive
  const isRow = mode === 'row'
  const isVisable = slotActive || isRow
  const isRounded = isRow && length > 1

  console.log('---', slotActive, isRow, isVisable)

  useEffect(() => {
    const el = document.querySelector(`[data-index="${active}"]`)

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [active, length, mode])

  const handleClick = () => {
    if (active != index) {
      console.log('setting from slot')
      const nextIndex = Number(ref.current?.dataset.index)
      if (Number.isNaN(nextIndex)) {
        return
      }
      setActive(nextIndex)
      setHoveredSlotIndex(index)
      console.log(mode)
    }
  }

  return (
    <div
      data-index={index}
      ref={ref}
      onMouseEnter={() => {
        setHoveredSlotIndex(index)
      }}
      onMouseLeave={() => {
        if (hoveredSlotIndex === index) {
          setHoveredSlotIndex(null)
        }
      }}
      onClick={handleClick}
      className={cn(
        isRounded ? 'rounded-0' : '',
        isVisable ? 'block' : 'hidden',
        hasPadding && index === 0 && length > 0 && 'pl-0 pr-0',
        hasPadding && index != 0 && length > 0 && 'pl-0',
        'relative h-full flex justify-center transition-[filter] duration-400 ease-out',
        isRow ? 'w-full min-w-[80vw] lg:min-w-[50vw]' : 'w-full max-w-[var(--slot-max-width)] mx-auto',
        blurred && 'blur-[var(--overlay-blur)]',
        index > 0 && isRow && 'p-slotpadding'
      )}
    >
      {showDebugUi && (
        <div className='absolute top-2 left-2 z-10 pointer-events-none text-[10px] text-white bg-black/70 rounded px-2 py-1'>
          <p>slot: {index}</p>
          <p>active: {isActive ? 'yes' : 'no'}</p>
          <p>hover: {hoveredSlotIndex === index ? 'yes' : 'no'}</p>
        </div>
      )}
      <div className={cn('relative z-10 h-full w-full', !slotActive && 'cursor-pointer', index > 0 && 'rounded-lg overflow-hidden border', index > 0 && (slotActive ? 'bg-enabled border-border-enabled' : 'bg-disabled-slot border-border-disabled [&_img]:opacity-80'))}>
         {children}
         {index > 0 && !slotActive && (
           <div
             className='absolute inset-0 z-20 bg-disabled-slot hover:bg-hoverslot transition-colors pointer-events-auto cursor-pointer'
             onClick={handleClick}
           />
         )}
      </div>

    </div>
  )
}
