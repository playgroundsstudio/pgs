'use client'
import {useRef, useState} from 'react'
import type {Dispatch, SetStateAction} from 'react'
import {cn} from '@/app/lib/cn'
import type {AllProjectsQueryResult} from '@/sanity.types'
import ContactInquiryBlock from '@/app/components/ContactInquiryBlock'
import HomeHeader from '@/app/components/HomeHeader'
import PgsLogoMark from '@/app/components/PgsLogoMark'

type HomeContentProps = {
  setActive: Dispatch<SetStateAction<number>>
  projects: AllProjectsQueryResult
  openProjectIds: string[]
  setOpenProjectIds: Dispatch<SetStateAction<string[]>>
  services: string[]
  siteTitle: string
  siteDescription: string
  mode: string
  setMode: (mode: string) => void
  isActive: boolean
}

export default function HomeContent({
  setActive,
  projects,
  openProjectIds,
  setOpenProjectIds,
  services,
  siteTitle,
  siteDescription,
  mode,
  setMode,
  isActive,
}: HomeContentProps) {
  const hasOpenProject = openProjectIds.length > 0
  const spaceAfterMeasurement = 'mb-16'

  function handleClick(projectId: string) {
    if (openProjectIds.includes(projectId)) {
      const existingIndex = openProjectIds.indexOf(projectId)
      setActive(existingIndex + 1)
      return
    }
    setOpenProjectIds((prev) => [projectId, ...prev])
    setActive(1)
  }

  function handleClose(e: React.MouseEvent, projectId: string) {
    e.stopPropagation()
    const projectIndex = openProjectIds.indexOf(projectId)
    setOpenProjectIds((prev) => prev.filter((id) => id !== projectId))
    setActive((prev: number) => {
      if (prev === projectIndex + 1) return Math.max(0, prev - 1)
      if (prev > projectIndex + 1) return prev - 1
      return prev
    })
  }

  const [expandedTagsId, setExpandedTagsId] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  const handleClickMode = () => {
    if (mode === 'row') {
      setMode('col')
    } else {
      setMode('row')
    }
  }

  return (
    <div ref={scrollRef} className='relative bg-white h-full w-full overflow-auto'>
      <div
        className={cn(
          'absolute top-4 right-4 z-40 flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 backdrop-blur-[80px] shadow-[0_0_20px_rgba(0,0,0,0.08)] border border-black/4 transition-all duration-300 ease-out',
          isActive ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'
        )}
      >
        <button onClick={handleClickMode} className='cursor-pointer hover:text-td2' aria-label={mode === 'row' ? 'Expand' : 'Minimise'}>
          {mode === 'row' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          )}
        </button>
      </div>
      <HomeHeader
        scrollRef={scrollRef}
        title={siteTitle}
        description={siteDescription}
        hasOpenProject={hasOpenProject}
      />




      <div className='pt-8 px-2'>

      {!hasOpenProject && (
        <div className={`h-[300px] flex items-center justify-center ${spaceAfterMeasurement}`}>
          <PgsLogoMark className='h-20 text-current' />
        </div>
      )}

      {!hasOpenProject && (
        <div className={`w-full px-[90px] ${spaceAfterMeasurement}`}>
          <div>
              <h3 className='font-sans text-sm text-td2'> Featured</h3>
              <p className='text-sm'>Robin Lambert</p>
          </div>
          <div className='mt-2 flex w-full items-start gap-[20px]'>
            <div className='flex-1'>
              <div className='w-full aspect-square bg-gradient-to-b from-[#0a1628] to-[#8a9bb5]' />
            </div>
            <div className='flex-1'>
              <div className='w-full aspect-[4/5] bg-gradient-to-b from-[#0a1628] to-[#8a9bb5]' />
            </div>
          </div>
        </div>
      )}
        <div className={spaceAfterMeasurement}>
          <h3 className='font-sans text-sm text-td2'> Projects </h3>

          <ul>
            {projects.map((project, i) => (
              <li
              key={project._id ?? i}
              onClick={() => handleClick(project._id)}
              className={`group flex py-0 cursor-pointer overflow-hidden ${openProjectIds.includes(project._id) ? 'bg-hoverslot text-black' : 'hover:text-td2'}`}
            >
                <div className='w-1/2 flex min-w-0'>
                  <div className='px-2 w-40 shrink-0'>
                    <p className='truncate'>{project.title ?? 'Untitled'}</p>
                  </div>
                  {!hasOpenProject && (
                    <div className='min-w-0 flex-1 flex'>
                      {(() => {
                        const tags = (project as any).tags?.filter(Boolean) || []
                        const isExpanded = expandedTagsId === project._id
                        if (!tags.length) return <p className='truncate text-td2'>No tags</p>
                        if (isExpanded) {
                          return (
                            <p className='truncate'>
                              {tags.map(function(t: any) { return t.title }).join(', ')}
                              <span className='ml-1 cursor-pointer hover:text-td2' onClick={function(e) { e.stopPropagation(); setExpandedTagsId(null) }}>X</span>
                            </p>
                          )
                        }
                        const first2 = tags.slice(0, 2)
                        const remaining = tags.length - 2
                        return (
                          <p className='truncate'>
                            {first2.map(function(t: any) { return t.title }).join(', ')}
                            {remaining > 0 && <span className='ml-1 cursor-pointer hover:text-td2 hover:bg-subtle' onClick={function(e) { e.stopPropagation(); setExpandedTagsId(project._id) }}>{' +' + remaining}</span>}
                          </p>
                        )
                      })()}
                    </div>
                  )}
                </div>
                {expandedTagsId === project._id ? (
                  <div className='w-1/2 flex min-w-0' />
                ) : (
                  <div className='w-1/2 flex min-w-0'>
                    <div className='flex-1 min-w-0'>
                      <p className='truncate'>{(project as any).location ?? 'London, UK'}</p>
                    </div>
                    <div className='px-2 shrink-0'>
                      <p className={`whitespace-nowrap ${(project as any).status === 'completed' ? 'group-hover:text-tgreen' : 'group-hover:text-tred'}`}>{(project as any).status === 'completed' ? 'Completed' : 'In Progress'}</p>
                    </div>
                    {!hasOpenProject && (
                      <div className='px-2 shrink-0'>
                        <p className='whitespace-nowrap'>{project.date ? new Date(project.date).getFullYear() : '—'}</p>
                      </div>
                    )}
                  </div>
                )}
              </li>  
            ))}
          </ul>
        </div>

        {(!hasOpenProject || (isActive && mode === 'row')) && (
          <ContactInquiryBlock
            services={services}
            showContact={!hasOpenProject}
            inquiryFullWidth={hasOpenProject}
            className={spaceAfterMeasurement}
          />
        )}

        {!hasOpenProject && (
          <div className={spaceAfterMeasurement}>
            <h3 className='font-sans text-sm text-td2'> Socials</h3>

            <ul>
              <li className='group flex py-0 cursor-pointer hover:text-td2 overflow-hidden'>
                <div className='w-40 shrink-0'>
                  <p className='truncate'>Instagram</p>
                </div>
                <div className='px-2 flex-1 min-w-0'>
                  <p className='truncate'>@play-grounds.studio</p>
                </div>
              </li>
              <li className='group flex py-0 cursor-pointer hover:text-td2 overflow-hidden'>
                <div className='w-40 shrink-0'>
                  <p className='truncate'>X</p>
                </div>
                <div className='px-2 flex-1 min-w-0'>
                  <p className='truncate'>play-grounds-studio</p>
                </div>
              </li>
              <li className='group flex py-0 cursor-pointer hover:text-td2 overflow-hidden'>
                <div className='w-40 shrink-0'>
                  <p className='truncate'>Behance</p>
                </div>
                <div className='px-2 flex-1 min-w-0'>
                  <p className='truncate'>play-grounds-studio</p>
                </div>
              </li>
              <li className='group flex py-0 cursor-pointer hover:text-td2 overflow-hidden'>
                <div className='w-40 shrink-0'>
                  <p className='truncate'>Are.na</p>
                </div>
                <div className='px-2 flex-1 min-w-0'>
                  <p className='truncate'>playgroundsstudio</p>
                </div>
              </li>
            </ul>
          </div>
        )}

        {!hasOpenProject && (
          <footer className='h-[60vh] w-full flex items-end justify-start pb-4'>
            <div className='h-[40vh] w-[40vh] max-w-[90vw] max-h-[90vw] bg-td1 flex items-center justify-center'>
              <PgsLogoMark className='h-[45%] w-auto text-white' />
            </div>
          </footer>
        )}
      </div>
    </div>
  )
}
