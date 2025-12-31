'use client'
import {useEffect, useRef} from 'react'
import type {Dispatch, SetStateAction} from 'react'
import cn from 'classnames'

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
        inline: 'nearest',
      })
    }
  }, [active])

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
        hasPadding && index === 0 && length > 0 &&  'pl-2 pr-2',
        hasPadding && index != 0 && length > 0 &&  'pl-0 pr-2',
        'relative transition-radius h-full w-full min-w-[90vw] lg:min-w-[45vw] '
      )}
    >
      {!slotActive && (
        <div className='absolute inset-0 z-0 flex items-center justify-center text-sm text-white/70'>
          <p>Click to activate</p>
        </div>
      )}
      {showDebugUi && (
        <div className='absolute top-2 left-2 z-10 pointer-events-none text-[10px] text-white bg-black/70 rounded px-2 py-1'>
          <p>slot: {index}</p>
          <p>active: {isActive ? 'yes' : 'no'}</p>
          <p>hover: {hoveredSlotIndex === index ? 'yes' : 'no'}</p>
        </div>
      )}
      {children}
    </div>
  )
}
