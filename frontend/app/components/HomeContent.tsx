'use client'
import {useEffect, useRef, useState} from 'react'
import type {Dispatch, SetStateAction} from 'react'
import {createPortal} from 'react-dom'
import gsap from 'gsap'
import {cn} from '@/app/lib/cn'
import type {AllProjectsQueryResult} from '@/sanity.types'
import HomeHeader from '@/app/components/HomeHeader'
import PgsLogoMark from '@/app/components/PgsLogoMark'
import MuxPlayer from '@mux/mux-player-react'
import '@mux/mux-player/themes/minimal'

type HomeContentProps = {
  setActive: Dispatch<SetStateAction<number>>
  projects: AllProjectsQueryResult
  showreel: {asset?: {playbackId?: string}} | null
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
  showreel,
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

  const [mounted, setMounted] = useState(false)
  const [expandedTagsId, setExpandedTagsId] = useState<string | null>(null)
  const [hoveredProjectIndex, setHoveredProjectIndex] = useState<number | null>(null)
  const [socialsHighlight, setSocialsHighlight] = useState<{top: number, height: number} | null>(null)
  const [contactHighlight, setContactHighlight] = useState<{top: number, height: number} | null>(null)
  const [servicesHighlight, setServicesHighlight] = useState<{top: number, height: number} | null>(null)
  const [actionsHighlight, setActionsHighlight] = useState<{top: number, height: number} | null>(null)
  const [showreelExpanded, setShowreelExpanded] = useState(false)
  const [expandSource, setExpandSource] = useState<'inline' | 'pip'>('inline')
  const [pipVisible, setPipVisible] = useState(false)
  const showreelContainerRef = useRef<HTMLDivElement>(null)
  const pipRef = useRef<HTMLDivElement>(null)
  const lastPipRectRef = useRef<DOMRect | null>(null)
  const [pipHidden, setPipHidden] = useState(false)
  const [inlineInView, setInlineInView] = useState(false)
  const inlinePlayerRef = useRef<any>(null)
  const pipPlayerRef = useRef<any>(null)
  const expandedPlayerRef = useRef<any>(null)
  const showreelWrapperRef = useRef<HTMLDivElement>(null)
  const portalShowreelRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const projectListRef = useRef<HTMLUListElement>(null)
  const socialsListRef = useRef<HTMLUListElement>(null)
  const contactListRef = useRef<HTMLUListElement>(null)
  const servicesListRef = useRef<HTMLUListElement>(null)
  const actionsListRef = useRef<HTMLUListElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  // IntersectionObserver for inline showreel
  useEffect(() => {
    const el = showreelContainerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setInlineInView(entry.isIntersecting),
      {threshold: 0.1}
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isExpanded])

  // Playback control — only play the visible player
  useEffect(() => {
    const toggle = (ref: React.RefObject<any>, shouldPlay: boolean) => {
      const el = ref.current
      if (!el) return
      // MuxPlayer wraps a media element
      const media = el.media?.nativeEl ?? el
      if (shouldPlay) {
        media.play?.()?.catch?.(() => {})
      } else {
        media.pause?.()
      }
    }

    const pipShouldPlay = pipVisible && !hasOpenProject && !showreelExpanded && !pipHidden
    const expandedShouldPlay = showreelExpanded
    const inlineShouldPlay = inlineInView && !showreelExpanded

    toggle(inlinePlayerRef, inlineShouldPlay)
    toggle(pipPlayerRef, pipShouldPlay)
    toggle(expandedPlayerRef, expandedShouldPlay)
  }, [inlineInView, pipVisible, hasOpenProject, showreelExpanded, pipHidden])

  // Desktop-only PiP: slide in on mount, respond to scroll
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    if (!mq.matches) return

    const timeout = setTimeout(() => setPipVisible(true), 500)

    const el = scrollRef.current
    if (!el) return

    const onScroll = () => {
      if (el.scrollTop > 0) {
        setPipVisible(false)
      } else {
        setPipVisible(true)
      }
    }

    el.addEventListener('scroll', onScroll, {passive: true})
    return () => {
      clearTimeout(timeout)
      el.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Hide PiP when projects open
  useEffect(() => {
    if (hasOpenProject) setPipVisible(false)
  }, [hasOpenProject])

  // GSAP animation for PiP slide in/out
  useEffect(() => {
    const el = pipRef.current
    if (!el) return
    if (pipHidden) return

    if (pipVisible && !hasOpenProject) {
      gsap.to(el, {
        left: 24,
        duration: 0.5,
        ease: 'power3.out',
      })
    } else {
      gsap.to(el, {
        left: -400,
        duration: 0.4,
        ease: 'power3.in',
      })
    }
  }, [pipVisible, pipHidden])

  useEffect(() => {
    const inlineEl = showreelContainerRef.current
    const portalEl = portalShowreelRef.current
    const overlay = overlayRef.current
    if (!overlay) return

    if (showreelExpanded) {
      if (!portalEl) return

      // Pick source rect based on what was clicked
      const rect = expandSource === 'pip'
        ? lastPipRectRef.current
        : inlineEl?.getBoundingClientRect()
      if (!rect) return

      // Preserve wrapper height so layout doesn't collapse (inline only)
      if (expandSource === 'inline' && inlineEl) {
        const wrapper = showreelWrapperRef.current
        if (wrapper) wrapper.style.minHeight = `${wrapper.offsetHeight}px`
        inlineEl.style.visibility = 'hidden'
      }

      // Position portal at source's location, then animate to center
      gsap.set(portalEl, {
        visibility: 'visible',
        top: rect.top,
        left: rect.left,
        width: rect.width,
      })
      gsap.to(portalEl, {
        top: '50%',
        left: '50%',
        xPercent: -50,
        yPercent: -50,
        width: '60vw',
        duration: 0.5,
        ease: 'power3.out',
      })

      // Fade in overlay
      gsap.to(overlay, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
        onStart: () => { overlay.style.pointerEvents = 'auto' },
      })
    } else {
      // Animate portal back to source position
      const rect = expandSource === 'pip'
        ? lastPipRectRef.current
        : inlineEl?.getBoundingClientRect()
      if (portalEl && rect) {
        gsap.to(portalEl, {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          xPercent: 0,
          yPercent: 0,
          duration: 0.4,
          ease: 'power3.inOut',
          onComplete: () => {
            portalEl.style.visibility = 'hidden'
            gsap.set(portalEl, {clearProps: 'top,left,width,xPercent,yPercent'})
            // Show inline again (only if it was the source)
            if (expandSource === 'inline' && inlineEl) {
              inlineEl.style.visibility = 'visible'
            }
            // PiP collapse done — snap PiP visible immediately in DOM, then sync state
            if (expandSource === 'pip') {
              const pipEl = pipRef.current
              if (pipEl) {
                gsap.set(pipEl, {left: pipVisible ? 24 : -400})
                pipEl.style.visibility = 'visible'
              }
              setPipHidden(false)
            }
            // Clear preserved height
            const wrapper = showreelWrapperRef.current
            if (wrapper) wrapper.style.minHeight = ''
          },
        })
      }

      // Fade out overlay
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => { overlay.style.pointerEvents = 'none' },
      })
    }
  }, [showreelExpanded, expandSource])

  const handleClickMode = () => {
    if (mode === 'row') {
      setMode('col')
    } else {
      setMode('row')
    }
  }

  const showreelPlaybackId = showreel?.asset?.playbackId

  const showreelContent = showreelPlaybackId ? (
    <div className='mb-[25.5px]'>
      <h3 className='font-sans text-dark-1'>Showreel</h3>
      <div ref={showreelWrapperRef}>
        <div
          ref={showreelContainerRef}
          onClick={() => { setExpandSource('inline'); setShowreelExpanded((v) => !v) }}
          className='group/showreel relative w-[250px] overflow-hidden rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] cursor-pointer'
        >
          <MuxPlayer
            ref={inlinePlayerRef}
            theme='minimal'
            playbackId={showreelPlaybackId}
            streamType='on-demand'
            autoPlay='muted'
            loop
            muted
            style={{width: '100%', display: 'block', borderRadius: 0, '--controls': 'none', '--media-object-fit': 'cover', '--media-time-display-display': 'none', '--media-volume-range-display': 'none', '--media-mute-button-display': 'none'} as any}
          />
          <div className='absolute inset-0 bg-black/10 group-hover/showreel:bg-black/20 transition-colors duration-200 pointer-events-none rounded-lg' />
        </div>
      </div>
    </div>
  ) : null

  const sidebarMetaContent = (
    <>
      <div className='mb-[25.5px]'>
        <h3 className='font-sans text-dark-2'>Socials</h3>
        <ul ref={socialsListRef} className='relative' onMouseLeave={() => setSocialsHighlight(null)}>
          {socialsHighlight && <div className='absolute left-0 w-full bg-hoverslot pointer-events-none transition-all duration-150 ease-out' style={{top: socialsHighlight.top, height: socialsHighlight.height}} />}
          <li className='group flex items-center py-0 cursor-pointer overflow-hidden text-white' onMouseEnter={e => setSocialsHighlight({top: e.currentTarget.offsetTop, height: e.currentTarget.offsetHeight})}>
            <div className='flex-1 min-w-0'><p className='truncate'>Instagram</p></div>
            <div className='shrink-0 ml-1 w-4 h-4 flex items-center justify-center'><div className='w-2 h-2 bg-current group-hover:hidden' /><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='hidden group-hover:block'><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></div>
          </li>
          <li className='group flex items-center py-0 cursor-pointer overflow-hidden text-white' onMouseEnter={e => setSocialsHighlight({top: e.currentTarget.offsetTop, height: e.currentTarget.offsetHeight})}>
            <div className='flex-1 min-w-0'><p className='truncate'>X</p></div>
            <div className='shrink-0 ml-1 w-4 h-4 flex items-center justify-center'><div className='w-2 h-2 bg-current group-hover:hidden' /><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='hidden group-hover:block'><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></div>
          </li>
          <li className='group flex items-center py-0 cursor-pointer overflow-hidden text-white' onMouseEnter={e => setSocialsHighlight({top: e.currentTarget.offsetTop, height: e.currentTarget.offsetHeight})}>
            <div className='flex-1 min-w-0'><p className='truncate'>Behance</p></div>
            <div className='shrink-0 ml-1 w-4 h-4 flex items-center justify-center'><div className='w-2 h-2 bg-current group-hover:hidden' /><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='hidden group-hover:block'><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></div>
          </li>
          <li className='group flex items-center py-0 cursor-pointer overflow-hidden text-white' onMouseEnter={e => setSocialsHighlight({top: e.currentTarget.offsetTop, height: e.currentTarget.offsetHeight})}>
            <div className='flex-1 min-w-0'><p className='truncate'>Are.na</p></div>
            <div className='shrink-0 ml-1 w-4 h-4 flex items-center justify-center'><div className='w-2 h-2 bg-current group-hover:hidden' /><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='hidden group-hover:block'><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></div>
          </li>
        </ul>
      </div>

      <div className='mb-[25.5px]'>
        <h3 className='font-sans text-dark-2'>Contact</h3>
        <ul ref={contactListRef} className='relative' onMouseLeave={() => setContactHighlight(null)}>
          {contactHighlight && <div className='absolute left-0 w-full bg-hoverslot pointer-events-none transition-all duration-150 ease-out' style={{top: contactHighlight.top, height: contactHighlight.height}} />}
          <li className='group flex items-center py-0 cursor-pointer overflow-hidden' onMouseEnter={e => setContactHighlight({top: e.currentTarget.offsetTop, height: e.currentTarget.offsetHeight})} onClick={() => navigator.clipboard.writeText('+44 7778 4320 987')}>
            <div className='flex-1 min-w-0'><p className='truncate'>+44 7778 4320 987</p></div>
            <div className='shrink-0 ml-1 w-4 h-4 flex items-center justify-center'><div className='w-2 h-2 bg-current group-hover:hidden' /><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='hidden group-hover:block'><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </li>
          <li className='group flex items-center py-0 cursor-pointer overflow-hidden' onMouseEnter={e => setContactHighlight({top: e.currentTarget.offsetTop, height: e.currentTarget.offsetHeight})} onClick={() => navigator.clipboard.writeText('info@play-grounds.studio')}>
            <div className='flex-1 min-w-0'><p className='truncate'>info@play-grounds.studio</p></div>
            <div className='shrink-0 ml-1 w-4 h-4 flex items-center justify-center'><div className='w-2 h-2 bg-current group-hover:hidden' /><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='hidden group-hover:block'><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </li>
        </ul>
      </div>

      <div className='mb-[25.5px]'>
        <h3 className='font-sans text-dark-2'>Actions</h3>
        <ul ref={actionsListRef} className='relative' onMouseLeave={() => setActionsHighlight(null)}>
          {actionsHighlight && <div className='absolute left-0 w-full bg-hoverslot pointer-events-none transition-all duration-150 ease-out' style={{top: actionsHighlight.top, height: actionsHighlight.height}} />}
          <li className='flex items-center py-0 cursor-pointer overflow-hidden' onMouseEnter={e => setActionsHighlight({top: e.currentTarget.offsetTop, height: e.currentTarget.offsetHeight})}>Kick off a project</li>
          <li className='flex items-center py-0 cursor-pointer overflow-hidden' onMouseEnter={e => setActionsHighlight({top: e.currentTarget.offsetTop, height: e.currentTarget.offsetHeight})}>Say Hi</li>
        </ul>
      </div>

      <div className='mb-[25.5px]'>
        <h3 className='font-sans text-dark-2'>Newsletter</h3>
        <p>Stay up to date with recent releases and upcoming opportunities.</p>
        <input
          type='email'
          placeholder='Enter your email'
          className='w-full bg-transparent border-none p-0 m-0 outline-none placeholder:text-dark-2 font-inherit text-inherit leading-inherit'
        />
      </div>

    </>
  )

  return (
    <div ref={scrollRef} className='relative h-full w-full overflow-auto'>
      <div
        className={cn(
          'absolute top-4 right-4 z-40 flex items-center justify-center w-9 h-9 rounded-full bg-pill backdrop-blur-[80px] shadow-[0_0_20px_rgba(0,0,0,0.08)] border border-border-subtle transition-all duration-300 ease-out',
          isActive && hasOpenProject ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'
        )}
      >
        <button onClick={handleClickMode} className='cursor-pointer hover:text-dark-2 hidden lg:block' aria-label={mode === 'row' ? 'Expand' : 'Minimise'}>
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




      <div className='pt-32 max-w-[var(--slot-content-max-width)] mx-auto w-full px-slotmargin'>
        {isExpanded && (
          <div className='relative z-0 mb-16 flex h-[70vh] w-full items-center justify-center lg:h-auto'>
            <div className='relative z-0 w-full'>
              <PgsLogoMark className='w-full h-auto text-dark-1' />
            </div>
          </div>
        )}
        {isExpanded ? (
          <div className='relative flex flex-col w-full'>
            {/* Projects — full width */}
            <div className='mb-[25.5px] w-full pb-[100px]'>
              <div className='grid grid-cols-14 gap-gutter sticky top-12 z-20 pt-2'>
                <div className='col-span-1'><h3 className='font-sans text-dark-2'>#</h3></div>
                <div className='col-span-3'><h3 className='font-sans text-dark-2'>Project</h3></div>
                <div className='col-span-3'><h3 className='font-sans text-dark-2'>Tags</h3></div>
                <div className='col-span-1 text-center'><h3 className='font-sans text-dark-2'>Year</h3></div>
                <div className='col-span-4 text-center'><h3 className='font-sans text-dark-2'>Location</h3></div>
                <div className='col-span-2 text-right'><h3 className='font-sans text-dark-2'>Status</h3></div>
              </div>

              <ul
                ref={projectListRef}
                className={cn('relative', !isActive && 'pointer-events-none opacity-[var(--disabled-text)]')}
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
                    className={`group relative grid grid-cols-14 gap-gutter py-0 cursor-pointer overflow-hidden ${openProjectIds.includes(project._id) ? 'bg-hoverslot' : ''}`}
                  >
                    <div className='col-span-1'>
                      <p>{String(i + 1).padStart(2, '0')}</p>
                    </div>
                    <div className='col-span-3 min-w-0'>
                      <p className='truncate'>{project.title ?? 'Untitled'}</p>
                    </div>
                    <div className='col-span-3 min-w-0'>
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
                    <div className='col-span-1 text-center'>
                      <p className='truncate'>{project.date ? new Date(project.date).getFullYear() : '—'}</p>
                    </div>
                    <div className='col-span-4 text-center min-w-0'>
                      <p className='truncate'>{(project as any).location ?? 'London, UK'}</p>
                    </div>
                    <div className={`col-span-2 text-right ${(project as any).status === 'completed' ? 'border-tgreen group-hover:text-tgreen' : 'border-tred group-hover:text-tred'}`}>
                      <p className='truncate'>{(project as any).status === 'completed' ? 'Completed' : 'In Progress'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className='grid grid-cols-14 gap-gutter'>
              <div className='col-span-4'>
                {showreelContent}
              </div>
              <div className='col-span-5'>
                <div className='mb-[25.5px]'>
                  <h3 className='font-sans text-dark-2'>Services</h3>
                  <ul ref={servicesListRef} className='relative' onMouseLeave={() => setServicesHighlight(null)}>
                    {servicesHighlight && <div className='absolute left-0 w-full bg-hoverslot pointer-events-none transition-all duration-150 ease-out' style={{top: servicesHighlight.top, height: servicesHighlight.height}} />}
                    <li className='flex items-center py-0 cursor-pointer overflow-hidden' onMouseEnter={e => setServicesHighlight({top: e.currentTarget.offsetTop, height: e.currentTarget.offsetHeight})}>Graphic Design</li>
                    <li className='flex items-center py-0 cursor-pointer overflow-hidden' onMouseEnter={e => setServicesHighlight({top: e.currentTarget.offsetTop, height: e.currentTarget.offsetHeight})}>Product Design</li>
                    <li className='flex items-center py-0 cursor-pointer overflow-hidden' onMouseEnter={e => setServicesHighlight({top: e.currentTarget.offsetTop, height: e.currentTarget.offsetHeight})}>Web Design</li>
                    <li className='flex items-center py-0 cursor-pointer overflow-hidden' onMouseEnter={e => setServicesHighlight({top: e.currentTarget.offsetTop, height: e.currentTarget.offsetHeight})}>Development</li>
                    <li className='flex items-center py-0 cursor-pointer overflow-hidden' onMouseEnter={e => setServicesHighlight({top: e.currentTarget.offsetTop, height: e.currentTarget.offsetHeight})}>Motion</li>
                    <li className='flex items-center py-0 cursor-pointer overflow-hidden' onMouseEnter={e => setServicesHighlight({top: e.currentTarget.offsetTop, height: e.currentTarget.offsetHeight})}>Brand Identity</li>
                    <li className='flex items-center py-0 cursor-pointer overflow-hidden' onMouseEnter={e => setServicesHighlight({top: e.currentTarget.offsetTop, height: e.currentTarget.offsetHeight})}>Art Direction</li>
                    <li className='flex items-center py-0 cursor-pointer overflow-hidden' onMouseEnter={e => setServicesHighlight({top: e.currentTarget.offsetTop, height: e.currentTarget.offsetHeight})}>Strategy</li>
                  </ul>
                </div>
              </div>
              <div className='col-span-5'>
                {sidebarMetaContent}
              </div>
            </div>
          </div>
        ) : (
          /* Collapsed state — projects only, full width */
          <div className='w-full flex flex-col gap-2'>
            <div className='mb-[25.5px]'>
              <h3 className='font-sans text-dark-2'>Projects</h3>
              <ul
                ref={projectListRef}
                className={cn('relative', !isActive && 'pointer-events-none opacity-[var(--disabled-text)]')}
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
                    className={`group relative grid grid-cols-14 gap-gutter py-0 cursor-pointer overflow-hidden ${openProjectIds.includes(project._id) ? 'bg-hoverslot' : ''}`}
                  >
                    <div className='col-span-1'>
                      <p>{String(i + 1).padStart(2, '0')}</p>
                    </div>
                    <div className='col-span-3 min-w-0'>
                      <p className='truncate'>{project.title ?? 'Untitled'}</p>
                    </div>
                    <div className='col-span-3 min-w-0'>
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
                    <div className='col-span-1 text-center'>
                      <p className='truncate'>{project.date ? new Date(project.date).getFullYear() : '—'}</p>
                    </div>
                    <div className='col-span-4 text-center min-w-0'>
                      <p className='truncate'>{(project as any).location ?? 'London, UK'}</p>
                    </div>
                    <div className={`col-span-2 text-right ${(project as any).status === 'completed' ? 'border-tgreen group-hover:text-tgreen' : 'border-tred group-hover:text-tred'}`}>
                      <p className='truncate'>{(project as any).status === 'completed' ? 'Completed' : 'In Progress'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

      </div>
      {mounted && createPortal(
        <>
          <div
            ref={overlayRef}
            onClick={() => setShowreelExpanded(false)}
            className='fixed inset-0 bg-black/50 z-[9998]'
            style={{opacity: 0, pointerEvents: 'none'}}
          />
          {showreelPlaybackId && (
            <div
              ref={pipRef}
              onClick={() => { lastPipRectRef.current = pipRef.current?.getBoundingClientRect() ?? null; setExpandSource('pip'); setPipHidden(true); setShowreelExpanded(true) }}
              className='fixed z-[9997] overflow-hidden rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] cursor-pointer group/pip hidden lg:block'
              style={{bottom: 24, left: -400, width: 250, visibility: (showreelExpanded || pipHidden || hasOpenProject) ? 'hidden' : 'visible'}}
            >
              <MuxPlayer
                ref={pipPlayerRef}
                theme='minimal'
                playbackId={showreelPlaybackId}
                streamType='on-demand'
                autoPlay='muted'
                loop
                muted
                style={{width: '100%', display: 'block', borderRadius: 0, '--controls': 'none', '--media-object-fit': 'cover', '--media-time-display-display': 'none', '--media-volume-range-display': 'none', '--media-mute-button-display': 'none'} as any}
              />
              <div className='absolute inset-0 bg-black/10 group-hover/pip:bg-black/20 transition-colors duration-200 pointer-events-none rounded-lg' />
            </div>
          )}
          <div
            ref={portalShowreelRef}
            onClick={() => setShowreelExpanded(false)}
            className='fixed z-[9999] overflow-hidden rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] cursor-pointer'
            style={{visibility: 'hidden'}}
          >
            {showreelPlaybackId && (
              <MuxPlayer
                ref={expandedPlayerRef}
                theme='minimal'
                playbackId={showreelPlaybackId}
                streamType='on-demand'
                autoPlay='muted'
                loop
                muted
                style={{width: '100%', display: 'block', '--media-time-display-display': 'none', '--media-volume-range-display': 'none', '--media-mute-button-display': 'none'} as any}
              />
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
