'use client'

import {useRef, useState} from 'react'
import {cn} from '@/app/lib/cn'
import type {AllProjectsQueryResult} from '@/sanity.types'

type ProjectListProps = {
  projects: AllProjectsQueryResult
  openProjectIds: string[]
  onProjectClick: (projectId: string) => void
  isActive: boolean
  title?: string
}

export default function ProjectList({
  projects,
  openProjectIds,
  onProjectClick,
  isActive,
  title,
}: ProjectListProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [expandedTagsId, setExpandedTagsId] = useState<string | null>(null)

  return (
    <div className='@container'>
      {title && <h3 className='font-sans text-dark-2'>{title}</h3>}
      <div className='grid grid-cols-14 gap-gutter sticky top-12 z-20 pt-2 border-b border-stroke'>
        <div className='col-span-1'><h3 className='font-sans text-dark-2'>#</h3></div>
        <div className='col-span-3 @max-[600px]:col-span-4 @max-[450px]:col-span-6 @max-[300px]:col-span-11'><h3 className='font-sans text-dark-2'>Project</h3></div>
        <div className='col-span-3 @max-[600px]:col-span-5 @max-[300px]:hidden'><h3 className='font-sans text-dark-2'>Tags</h3></div>
        <div className='col-span-1 @max-[600px]:col-span-2 @max-[450px]:hidden'><h3 className='font-sans text-dark-2 text-center'>Year</h3></div>
        <div className='col-span-4 @max-[600px]:hidden'><h3 className='font-sans text-dark-2 text-center'>Location</h3></div>
        <div className='col-span-2 text-right'><h3 className='font-sans text-dark-2'>Status</h3></div>
      </div>

      <ul
        ref={listRef}
        className={cn('relative', !isActive && 'pointer-events-none opacity-[var(--disabled-text)]')}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {hoveredIndex !== null && listRef.current && (() => {
          const li = listRef.current.children[hoveredIndex + 1] as HTMLElement | undefined
          if (!li) return null
          return (
            <div
              className='absolute left-0 w-full bg-hoverslot pointer-events-none transition-all duration-150 ease-out'
              style={{top: li.offsetTop, height: li.offsetHeight}}
            />
          )
        })()}
        {projects.map((project, i) => (
          <li
            key={project._id ?? i}
            onClick={() => onProjectClick(project._id)}
            onMouseEnter={() => setHoveredIndex(i)}
            className={`group py-[2px] border-b border-stroke relative grid grid-cols-14 gap-gutter cursor-pointer overflow-hidden ${openProjectIds.includes(project._id) ? 'bg-hoverslot' : ''}`}
          >
            <div className='col-span-1'>
              <p>{String(i + 1).padStart(2, '0')}</p>
            </div>
            <div className='col-span-3 min-w-0 @max-[600px]:col-span-4 @max-[450px]:col-span-6 @max-[300px]:col-span-11'>
              <p className='truncate'>{project.title ?? 'Untitled'}</p>
            </div>
            <div className='col-span-3 min-w-0 @max-[600px]:col-span-5 @max-[300px]:hidden'>
              {(() => {
                const tags = (project as any).tags?.filter(Boolean) || []
                const isTagExpanded = expandedTagsId === project._id
                if (!tags.length) return <p className='truncate text-dark-2'>No tags</p>
                if (isTagExpanded) {
                  return (
                    <p className='truncate'>
                      {tags.map(function(t: any) { return t.title }).join(', ')}
                      <span className='ml-1 cursor-pointer hover:text-dark-2' onClick={function(e) { e.stopPropagation(); setExpandedTagsId(null) }}>X</span>
                    </p>
                  )
                }
                const first2 = tags.slice(0, 2)
                const remaining = tags.length - 2
                return (
                  <p className='truncate'>
                    {first2.map(function(t: any) { return t.title }).join(', ')}
                    {remaining > 0 && <span className='ml-1 cursor-pointer hover:text-dark-2 hover:bg-subtle' onClick={function(e) { e.stopPropagation(); setExpandedTagsId(project._id) }}>{' +' + remaining}</span>}
                  </p>
                )
              })()}
            </div>
            <div className='col-span-1 text-center @max-[600px]:col-span-2 @max-[450px]:hidden'>
              <p className='truncate'>{project.date ? new Date(project.date).getFullYear() : '—'}</p>
            </div>
            <div className='col-span-4 text-center min-w-0 @max-[600px]:hidden'>
              <p className='truncate'>{(project as any).location ?? 'London, UK'}</p>
            </div>
            <div className={`col-span-2 text-right ${(project as any).status === 'completed' ? 'border-tgreen group-hover:text-tgreen' : 'border-tred group-hover:text-tred'}`}>
              <p className='truncate'>{(project as any).status === 'completed' ? 'Completed' : 'In Progress'}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
