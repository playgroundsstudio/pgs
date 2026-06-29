'use client'

import {useRef, useState} from 'react'

const gridConfig = {
  totalCols: {default:12, md: 4, sm: 12},
  columns: {
    title: {default: 1, start: 7, md: 0, sm: 0, hidden: {md: false, sm: false}},
    label: {default: 4, start: 9, md: 0, sm: 0, hidden: {md: false, sm: false}},
    list:  {default: 4, start: 9, sm: 0, hidden: {md: false, sm: false}},

  },
} as const

type ColKey = keyof typeof gridConfig.columns

const cqColSpanMap: Record<number, string> = {
  1: '@min-[700px]:col-span-1', 2: '@min-[700px]:col-span-2', 3: '@min-[700px]:col-span-3',
  4: '@min-[700px]:col-span-4', 5: '@min-[700px]:col-span-5', 6: '@min-[700px]:col-span-6',
  7: '@min-[700px]:col-span-7', 8: '@min-[700px]:col-span-8', 9: '@min-[700px]:col-span-9',
}
const cqColStartMap: Record<number, string> = {
  1: '@min-[700px]:col-start-1', 2: '@min-[700px]:col-start-2', 3: '@min-[700px]:col-start-3',
  4: '@min-[700px]:col-start-4', 5: '@min-[700px]:col-start-5', 6: '@min-[700px]:col-start-6',
  7: '@min-[700px]:col-start-7', 8: '@min-[700px]:col-start-8', 9: '@min-[700px]:col-start-9',
}
const cqGridColsMap: Record<number, string> = {
  6: '@min-[700px]:grid-cols-6', 7: '@min-[700px]:grid-cols-7', 8: '@min-[700px]:grid-cols-8',
  9: '@min-[700px]:grid-cols-9', 10: '@min-[700px]:grid-cols-10', 11: '@min-[700px]:grid-cols-11',
  12: '@min-[700px]:grid-cols-12',
}

const gridCls = `mb-sa flex flex-col @min-[700px]:grid ${cqGridColsMap[gridConfig.totalCols.default]} gap-gutter`
const titleCls = `${cqColStartMap[gridConfig.columns.title.start]} ${cqColSpanMap[gridConfig.columns.title.default]}`
const labelCls = `${cqColStartMap[gridConfig.columns.label.start]} ${cqColSpanMap[gridConfig.columns.label.default]}`
const listCls = `${cqColStartMap[gridConfig.columns.list.start]} ${cqColSpanMap[gridConfig.columns.list.default]}`

type ListItem = {
  label: string
  onClick?: () => void
}

type StatementAndListBlockProps = {
  title: string
  statement?: string
  items: ListItem[]
}

export default function StatementAndListBlock({title, statement, items}: StatementAndListBlockProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const [highlight, setHighlight] = useState<{top: number; height: number} | null>(null)

  return (
    <div className={gridCls}>
      <div className={titleCls}>
        <h3 className='font-sans text-dark-1'>{title}</h3>
      </div>
      <div className={labelCls}>
        {statement && <p className='mb-4 text-dark-1 max-w-[275px]'>{statement}</p>}
      </div>
      <div className={listCls}>
        <ul ref={listRef} className='relative' onMouseLeave={() => setHighlight(null)}>
          {highlight && <div className='absolute left-0 w-full bg-hoverelement pointer-events-none transition-all duration-150 ease-out hidden lg:block' style={{top: highlight.top, height: highlight.height}} />}
          {items.map((item, index) => (
            <li
              key={item.label}
              className={`flex items-center py-[2px] border-b border-stroke cursor-pointer overflow-hidden ${index === 0 ? 'border-t' : ''}`}
              onMouseEnter={e => setHighlight({top: e.currentTarget.offsetTop, height: e.currentTarget.offsetHeight})}
              onClick={item.onClick}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
