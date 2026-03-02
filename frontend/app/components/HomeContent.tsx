'use client'
import {useRef, useState} from 'react'
import type {Dispatch, SetStateAction} from 'react'
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
}

export default function HomeContent({
  setActive,
  projects,
  openProjectIds,
  setOpenProjectIds,
  services,
  siteTitle,
  siteDescription,
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

  return (
    <div ref={scrollRef} className='relative bg-white h-full w-full overflow-auto'>
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
                  <div className='w-6 shrink-0' onClick={openProjectIds.includes(project._id) ? (e) => handleClose(e, project._id) : undefined}>
                    <p>{openProjectIds.includes(project._id) ? 'X' : i + 1}</p>
                  </div>
                  <div className='px-2 w-40 shrink-0'>
                    <p className='truncate'>{project.title ?? 'Untitled'}</p>
                  </div>
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
                    <div className='px-2 shrink-0'>
                      <p className='whitespace-nowrap'>{project.date ? new Date(project.date).getFullYear() : '—'}</p>
                    </div>
                  </div>
                )}
              </li>  
            ))}
          </ul>
        </div>

        <ContactInquiryBlock
          services={services}
          showContact={!hasOpenProject}
          inquiryFullWidth={hasOpenProject}
          className={spaceAfterMeasurement}
        />

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

        <footer className='h-[60vh] w-full flex items-end justify-start pb-4'>
          <div className='h-[40vh] w-[40vh] max-w-[90vw] max-h-[90vw] bg-td1 flex items-center justify-center'>
            <PgsLogoMark className='h-[45%] w-auto text-white' />
          </div>
        </footer>
      </div>
    </div>
  )
}
