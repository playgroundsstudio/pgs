'use client'
import {useEffect, useMemo, useRef, useState} from 'react'
import type {Dispatch, SetStateAction} from 'react'
import {cn} from '@/app/lib/cn'
import type {AllProjectsQueryResult} from '@/sanity.types'
import HomeHeader from '@/app/components/HomeHeader'
import PgsLogoMark from '@/app/components/PgsLogoMark'
import Image from '@/app/components/SanityImage'

type HomeContentProps = {
  setActive: Dispatch<SetStateAction<number>>
  projects: AllProjectsQueryResult
  featuredProject: AllProjectsQueryResult[number] | null
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
  featuredProject,
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
  const isExpanded = !hasOpenProject || (hasOpenProject && mode === 'col')
  console.log('HomeContent:', { isExpanded, hasOpenProject, mode, isActive })
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
  const [hoveredProjectIndex, setHoveredProjectIndex] = useState<number | null>(null)
  const [featuredPage, setFeaturedPage] = useState(0)
  const projectListRef = useRef<HTMLUListElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleClickMode = () => {
    if (mode === 'row') {
      setMode('col')
    } else {
      setMode('row')
    }
  }

  const featuredSlides = useMemo(() => {
    const blocks = Array.isArray(featuredProject?.contentBlocks)
      ? featuredProject.contentBlocks.slice(0, 3)
      : []

    const blockSlides = blocks.map((block) => {
      if (block?._type === 'centerMedia') {
        return block.media ?? null
      }

      if (block?._type === 'sideBySideMedia') {
        if (block.highlighted === 'right') return block.rightMedia ?? block.leftMedia ?? null
        return block.leftMedia ?? block.rightMedia ?? null
      }

      return null
    })

    if (featuredProject?.coverImage) {
      return [
        {
          mediaType: 'image',
          image: featuredProject.coverImage,
        },
        ...blockSlides.filter(Boolean),
      ]
    }

    return blockSlides.filter(Boolean)
  }, [featuredProject])

  const activeFeaturedSlide = featuredSlides[featuredPage] ?? featuredSlides[0] ?? null

  useEffect(() => {
    if (featuredPage >= featuredSlides.length) {
      setFeaturedPage(0)
    }
  }, [featuredPage, featuredSlides.length])

  const featuredContent = (
    <div className='mb-14'>
      <h3 className='font-sans text-dark-2 text-center'>Featured</h3>
      <div className='mt-2 w-full px-[10%]'>
        <div className='flex w-full aspect-[3/4] items-start justify-center overflow-hidden'>
          {activeFeaturedSlide?.image?.asset?._ref ? (
            <Image
              id={activeFeaturedSlide.image.asset._ref}
              alt={activeFeaturedSlide.image?.alt || featuredProject?.title || ''}
              className='h-full w-auto max-w-full object-contain'
              width={1200}
              mode='contain'
              hotspot={activeFeaturedSlide.image.hotspot}
              crop={activeFeaturedSlide.image.crop}
            />
          ) : null}
        </div>
      </div>
      <div className='mt-1 flex items-center justify-center gap-3 px-[10%]'>
        {featuredSlides.map((_, index) => (
          <button
            key={index}
            type='button'
            className={cn(
              'transition-colors',
              featuredPage === index ? 'text-dark-1' : 'text-dark-2 hover:text-dark-1'
            )}
            onClick={(e) => {
              e.stopPropagation()
              setFeaturedPage(index)
            }}
          >
            {`${index + 1}.`}
          </button>
        ))}
      </div>
    </div>
  )

  const sidebarMetaContent = (
    <>
      <div className='mb-14'>
        <h3 className='font-sans text-dark-2'>Socials</h3>
        <ul>
          <li className='group flex items-center py-0 cursor-pointer hover:text-dark-2 overflow-hidden'>
            <div className='w-[100px] shrink-0'><p className='truncate'>Instagram</p></div>

            <div className='flex-1 min-w-0'><p className='truncate'>@play-grounds.studio</p></div>
            <div className='shrink-0 ml-1 w-4 h-4 flex items-center justify-center'><div className='w-2 h-2 bg-current group-hover:hidden' /><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='hidden group-hover:block'><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></div>
          </li>
          <li className='group flex items-center py-0 cursor-pointer hover:text-dark-2 overflow-hidden'>
            <div className='w-[100px] shrink-0'><p className='truncate'>X</p></div>

            <div className='flex-1 min-w-0'><p className='truncate'>play-grounds-studio</p></div>
            <div className='shrink-0 ml-1 w-4 h-4 flex items-center justify-center'><div className='w-2 h-2 bg-current group-hover:hidden' /><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='hidden group-hover:block'><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></div>
          </li>
          <li className='group flex items-center py-0 cursor-pointer hover:text-dark-2 overflow-hidden'>
            <div className='w-[100px] shrink-0'><p className='truncate'>Behance</p></div>

            <div className='flex-1 min-w-0'><p className='truncate'>play-grounds-studio</p></div>
            <div className='shrink-0 ml-1 w-4 h-4 flex items-center justify-center'><div className='w-2 h-2 bg-current group-hover:hidden' /><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='hidden group-hover:block'><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></div>
          </li>
          <li className='group flex items-center py-0 cursor-pointer hover:text-dark-2 overflow-hidden'>
            <div className='w-[100px] shrink-0'><p className='truncate'>Are.na</p></div>

            <div className='flex-1 min-w-0'><p className='truncate'>playgroundsstudio</p></div>
            <div className='shrink-0 ml-1 w-4 h-4 flex items-center justify-center'><div className='w-2 h-2 bg-current group-hover:hidden' /><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='hidden group-hover:block'><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></div>
          </li>
        </ul>
      </div>

      <div className='mb-14'>
        <h3 className='font-sans text-dark-2'>Contact</h3>
        <ul>
          <li className='group flex items-center py-0 cursor-pointer hover:text-dark-2 overflow-hidden' onClick={() => navigator.clipboard.writeText('+44 7778 4320 987')}>
            <div className='w-[100px] shrink-0'><p className='truncate'>Phone</p></div>

            <div className='flex-1 min-w-0'><p className='truncate'>+44 7778 4320 987</p></div>
            <div className='shrink-0 ml-1 w-4 h-4 flex items-center justify-center'><div className='w-2 h-2 bg-current group-hover:hidden' /><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='hidden group-hover:block'><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </li>
          <li className='group flex items-center py-0 cursor-pointer hover:text-dark-2 overflow-hidden' onClick={() => navigator.clipboard.writeText('info@play-grounds.studio')}>
            <div className='w-[100px] shrink-0'><p className='truncate'>Email</p></div>

            <div className='flex-1 min-w-0'><p className='truncate'>info@play-grounds.studio</p></div>
            <div className='shrink-0 ml-1 w-4 h-4 flex items-center justify-center'><div className='w-2 h-2 bg-current group-hover:hidden' /><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='hidden group-hover:block'><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </li>
        </ul>
      </div>

      <div className='mb-14'>
        <h3 className='font-sans text-dark-2'>Forms</h3>
        <ul>
          <li className='group flex items-center py-0 cursor-pointer hover:text-dark-2 overflow-hidden'>
            <div className='w-[100px] shrink-0'><p className='truncate'>Enquire</p></div>

            <div className='flex-1 min-w-0'><p className='truncate'>Kick off a project</p></div>
            <div className='shrink-0 ml-1 w-4 h-4 flex items-center justify-center'><div className='w-2 h-2 bg-current group-hover:hidden' /><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='hidden group-hover:block'><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></div>
          </li>
          <li className='group flex items-center py-0 cursor-pointer hover:text-dark-2 overflow-hidden'>
            <div className='w-[100px] shrink-0'><p className='truncate'>Newsletter</p></div>

            <div className='flex-1 min-w-0'><p className='truncate'>Keep in touch</p></div>
            <div className='shrink-0 ml-1 w-4 h-4 flex items-center justify-center'><div className='w-2 h-2 bg-current group-hover:hidden' /><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='hidden group-hover:block'><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
          </li>
        </ul>
      </div>
    </>
  )

  return (
    <div ref={scrollRef} className='relative h-full w-full overflow-auto'>
      <div
        className={cn(
          'absolute top-4 right-4 z-40 flex items-center gap-3 px-4 py-2 rounded-full bg-pill backdrop-blur-[80px] shadow-[0_0_20px_rgba(0,0,0,0.08)] border border-border-subtle transition-all duration-300 ease-out',
          isActive && hasOpenProject ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'
        )}
      >
        <button onClick={handleClickMode} className='cursor-pointer hover:text-dark-2' aria-label={mode === 'row' ? 'Expand' : 'Minimise'}>
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
        onAboutClick={() => handleClick('__about__')}
      />




      <div className='pt-32 px-2'>
        {isExpanded && (
          <div className='relative z-0 mb-16 flex h-[70vh] w-full items-center justify-center lg:h-auto'>
            <div className='relative z-0 w-full'>
              <PgsLogoMark className='w-full h-auto text-dark-1' />
            </div>
          </div>
        )}
        {isExpanded ? (
          <div className='relative z-10 flex flex-col w-full gap-[20px] lg:flex-row'>
            <div className='w-full shrink-0 border-t border-dark-1 pt-2 lg:hidden'>
              {featuredContent}
            </div>

            <div className='hidden shrink-0 lg:block lg:w-[350px] xl:w-[550px]'>
              <div className='flex flex-col gap-2 border-t border-dark-1 pt-2 self-start lg:sticky lg:top-12'>
                {featuredContent}
                {sidebarMetaContent}
              </div>
            </div>

            {/* Right column — fills remaining space */}
            <div className='flex-1 min-w-0 flex flex-col gap-2'>
              <div className='mb-14'>
                <div className='flex items-center justify-between sticky top-12 z-20 border-t border-dark-1 pt-2'>
                  <h3 className='font-sans text-dark-2'>Projects</h3>
                </div>

                <ul
                  ref={projectListRef}
                  className='relative'
                  onMouseLeave={() => setHoveredProjectIndex(null)}
                >
                  {hoveredProjectIndex !== null && projectListRef.current && (() => {
                    const li = projectListRef.current.children[hoveredProjectIndex + 1] as HTMLElement | undefined
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
                      onClick={() => handleClick(project._id)}
                      onMouseEnter={() => setHoveredProjectIndex(i)}
                      className={`group relative flex py-0 cursor-pointer overflow-hidden ${openProjectIds.includes(project._id) ? 'bg-hoverslot text-black' : ''}`}
                    >
                      <div className='w-[40px] shrink-0'>
                        <p>{String(i + 1).padStart(2, '0')}</p>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='truncate'>{project.title ?? 'Untitled'}</p>
                      </div>
                      <div className='hidden min-w-0 lg:flex-1 lg:block'>
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
                      <div className='w-[100px] shrink-0'>
                        <p className='truncate'>{project.date ? new Date(project.date).getFullYear() : '—'}</p>
                      </div>
                      <div className='hidden min-w-0 text-center lg:flex-1 lg:block'>
                        <p className='truncate'>{(project as any).location ?? 'London, UK'}</p>
                      </div>
                      <div className={`w-[100px] shrink-0 text-right ${(project as any).status === 'completed' ? 'border-tgreen group-hover:text-tgreen' : 'border-tred group-hover:text-tred'}`}>
                        <p className='truncate'>{(project as any).status === 'completed' ? 'Completed' : 'In Progress'}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className='w-full border-t border-dark-1 pt-2 lg:hidden'>
              {sidebarMetaContent}
            </div>
          </div>
        ) : (
          /* Collapsed state — projects only, full width */
          <div className='w-full flex flex-col gap-2'>
            <div className='mb-14'>
              <h3 className='font-sans text-dark-2'>Projects</h3>
              <ul
                ref={projectListRef}
                className='relative'
                onMouseLeave={() => setHoveredProjectIndex(null)}
              >
                {hoveredProjectIndex !== null && projectListRef.current && (() => {
                  const li = projectListRef.current.children[hoveredProjectIndex + 1] as HTMLElement | undefined
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
                    onClick={() => handleClick(project._id)}
                    onMouseEnter={() => setHoveredProjectIndex(i)}
                    className={`group relative flex py-0 cursor-pointer overflow-hidden ${openProjectIds.includes(project._id) ? 'bg-hoverslot text-black' : ''}`}
                  >
                    <div className='w-[40px] shrink-0'>
                      <p>{String(i + 1).padStart(2, '0')}</p>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='truncate'>{project.title ?? 'Untitled'}</p>
                    </div>
                    <div className='hidden min-w-0 lg:flex-1 lg:block'>
                      {(() => {
                        const tags = (project as any).tags?.filter(Boolean) || []
                        if (!tags.length) return <p className='truncate text-dark-2'>No tags</p>
                        const first2 = tags.slice(0, 2)
                        const remaining = tags.length - 2
                        return (
                          <p className='truncate'>
                            {first2.map(function(t: any) { return t.title }).join(', ')}
                            {remaining > 0 && <span className='ml-1 text-dark-2'>{' +' + remaining}</span>}
                          </p>
                        )
                      })()}
                    </div>
                    <div className='w-[100px] shrink-0'>
                      <p className='truncate'>{project.date ? new Date(project.date).getFullYear() : '—'}</p>
                    </div>
                    <div className='hidden min-w-0 text-center lg:flex-1 lg:block'>
                      <p className='truncate'>{(project as any).location ?? 'London, UK'}</p>
                    </div>
                    <div className={`w-[100px] shrink-0 text-right ${(project as any).status === 'completed' ? 'border-tgreen group-hover:text-tgreen' : 'border-tred group-hover:text-tred'}`}>
                      <p className='truncate'>{(project as any).status === 'completed' ? 'Completed' : 'In Progress'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
