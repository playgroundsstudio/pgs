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
  hoverClass?: string
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
  hoverClass,
}: SlotProps) {
  const ref = useRef<HTMLDivElement>(null)
  const numActive = Number(active)
  const slotActive = index === numActive
  const isRow = mode === 'row'
  const isVisable = true
  const isRounded = length > 1

  console.log('---', slotActive, isRow, isVisable)

  const prevMode = useRef(mode)
  const prevActive = useRef(active)
  useEffect(() => {
    prevMode.current = mode
  }, [mode])
  useEffect(() => {
    if (!slotActive) return
    const modeChanged = prevActive.current === active
      ? prevMode.current !== mode
      : false
    prevActive.current = active
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-index="${active}"]`)
      if (el) {
        el.scrollIntoView({
          behavior: modeChanged ? 'instant' : 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      }
    })
  }, [active, length, mode, slotActive])

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
        hasPadding && index === 0 && length > 0 && '',
        hasPadding && index != 0 && length > 0 && 'pl-0',
        'relative h-full flex justify-center transition-[filter] duration-400 ease-out',
        isRow
          ? 'w-full min-w-[80vw] lg:min-w-[50vw]'
          : 'w-full min-w-[90vw]',
        blurred && 'blur-[var(--overlay-blur)]',
        length > 1 && (isRow ? 'p-slotpadding' : index === 0 ? 'py-slotpadding pl-slotpadding pr-[calc(var(--slot-padding)/2)]' : 'py-slotpadding px-[calc(var(--slot-padding)/2)]'),
      )}
    >
      {showDebugUi && (
        <div className="absolute top-2 left-2 z-10 pointer-events-none text-[10px] text-white bg-black/70 rounded px-2 py-1">
          <p>slot: {index}</p>
          <p>active: {isActive ? 'yes' : 'no'}</p>
          <p>hover: {hoveredSlotIndex === index ? 'yes' : 'no'}</p>
        </div>
      )}
      <div
        className={cn(
          'relative z-10 h-full w-full',
          !slotActive && 'cursor-pointer',
          length > 1 && 'rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.08)] outline outline-1 outline-stroke',
          length > 1 &&
            'bg-enabled',
        )}
      >
        {children}
        {!slotActive && length > 1 && (
          <div
            className={cn("absolute inset-0 z-20 transition-colors pointer-events-auto cursor-pointer", hoverClass || "hover:bg-hoverslot")}
            onClick={handleClick}
          />
        )}
      </div>
    </div>
  )
}
