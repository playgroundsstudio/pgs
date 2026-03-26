'use client'
import {useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo} from 'react'
import gsap from 'gsap'
import type {MouseEvent} from 'react'
import {cn} from '@/app/lib/cn'
import type {AllProjectsQueryResult, SettingsQueryResult} from '@/sanity.types'
import Image from '@/app/components/SanityImage'
import HomeContent from '@/app/components/HomeContent'
import ProjectContent from '@/app/components/ProjectContent'
import AboutContent from '@/app/components/AboutContent'
import Slot from '@/app/components/Slot'
import PgsLogoMark from '@/app/components/PgsLogoMark'
 
type LogoImage = {
  asset?: { _ref?: string }
  alt?: string
  hotspot?: { x: number; y: number }
  crop?: { top: number; bottom: number; left: number; right: number }
}

export default function Home({
  projects,
  settings,
  services,
  siteTitle,
  siteDescription,
}: {
  projects: AllProjectsQueryResult
  settings: SettingsQueryResult
  services: string[]
  siteTitle: string
  siteDescription: string
}) {
 
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mode ,setMode] = useState('row')
  const [openProjectIds, setOpenProjectIds] = useState<string[]>([])
  const [active, setActive ]=useState(0)
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null)
  const hasInitializedFromUrlRef = useRef(false)
  const isHoveringActiveSlot = hoveredSlotIndex === active
  const slots = 1 + openProjectIds.length
  const showDebugUi = false
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)

  const hasPadding = ( slots>1 && mode=='row' ) 
  console.log(hasPadding)

  const idToSlug = useMemo(
    () =>
      new Map(
        projects
          .filter((project) => typeof project.slug === 'string' && project.slug.length > 0)
          .map((project) => [project._id, project.slug as string])
      ),
    [projects]
  )

  const slugToId = useMemo(
    () =>
      new Map(
        projects
          .filter((project) => typeof project.slug === 'string' && project.slug.length > 0)
          .map((project) => [project.slug as string, project._id])
      ),
    [projects]
  )

  const buildShareUrl = () => {
    if (typeof window === 'undefined') {
      return ''
    }

    const url = new URL(window.location.href)
    const panelSlugs = openProjectIds
      .map((projectId) => idToSlug.get(projectId))
      .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0)

    if (panelSlugs.length > 0) {
      url.searchParams.set('p', panelSlugs.join('~'))
      const safeActive = Math.min(Math.max(active, 0), panelSlugs.length)
      if (safeActive > 0) {
        url.searchParams.set('a', String(safeActive))
      } else {
        url.searchParams.delete('a')
      }
    } else {
      url.searchParams.delete('p')
      url.searchParams.delete('a')
    }

    // Remove legacy params if present.
    url.searchParams.delete('panels')
    url.searchParams.delete('active')

    return url.toString()
  }

  useEffect(() => {
    if (typeof window === 'undefined' || hasInitializedFromUrlRef.current) {
      return
    }

    const params = new URLSearchParams(window.location.search)
    const panelsParam = params.get('p') || params.get('panels')
    const activeParam = params.get('a') || params.get('active')

    if (panelsParam) {
      const nextOpenIds: string[] = []
      const panelSlugs = panelsParam
        .split(/[~,]/)
        .map((slug) => slug.trim())
        .filter(Boolean)

      panelSlugs.forEach((slug) => {
        const projectId = slugToId.get(slug)
        if (projectId && !nextOpenIds.includes(projectId)) {
          nextOpenIds.push(projectId)
        }
      })

      setOpenProjectIds(nextOpenIds)

      const parsedActive = Number(activeParam)
      if (Number.isInteger(parsedActive) && parsedActive >= 0 && parsedActive <= nextOpenIds.length) {
        setActive(parsedActive)
      } else if (nextOpenIds.length > 0) {
        setActive(1)
      }
    }

    hasInitializedFromUrlRef.current = true
  }, [slugToId])

  useEffect(() => {
    if (typeof window === 'undefined' || !hasInitializedFromUrlRef.current) {
      return
    }

    const nextUrl = buildShareUrl()
    if (!nextUrl) {
      return
    }

    const currentUrl = window.location.href
    if (nextUrl !== currentUrl) {
      window.history.replaceState({}, '', nextUrl)
    }
  }, [openProjectIds, active, idToSlug])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      if (mode !== 'row') {
        return
      }

      if (isHoveringActiveSlot) {
        return
      }

      const maxScrollLeft = el.scrollWidth - el.clientWidth
      if (maxScrollLeft <= 0) {
        return
      }

      if (event.deltaY === 0) {
        return
      }

      event.preventDefault()
      el.scrollLeft += event.deltaY
    }

    el.addEventListener('wheel', handleWheel, {passive: false})
    return () => {
      el.removeEventListener('wheel', handleWheel)
    }
  }, [mode, isHoveringActiveSlot])

  function closeProjectTab(tabIndex: number) {
    if (tabIndex < 1) return
    const projectIndex = tabIndex - 1
    const projectId = openProjectIds[projectIndex]
    if (!projectId) return

    setOpenProjectIds((prev) => prev.filter((id) => id !== projectId))
    setActive((prev: number) => {
      if (prev === tabIndex) return Math.max(0, prev - 1)
      if (prev > tabIndex) return prev - 1
      return prev
    })
  }

  async function handleShareConfiguration() {
    if (typeof window === 'undefined') return
    try {
      await navigator.clipboard.writeText(buildShareUrl())
    } catch {
      // no-op
    }
    setShareMenuOpen(false)
  }

  async function handleShareHomePage() {
    if (typeof window === 'undefined') return
    try {
      await navigator.clipboard.writeText(window.location.origin)
    } catch {
      // no-op
    }
    setShareMenuOpen(false)
  }

  function handleEnquire() {
    const activeProject = active > 0
      ? projects.find((p) => p._id === openProjectIds[active - 1])
      : null
    const subject = activeProject?.title
      ? `Enquiry about ${activeProject.title}`
      : 'Enquiry'
    window.open(`mailto:?subject=${encodeURIComponent(subject)}`, '_blank')
    setShareMenuOpen(false)
  }

  function handleShareClick(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    setShareMenuOpen((prev) => !prev)
  }

  useEffect(() => {
    if (!shareMenuOpen) return
    function handleClickOutside(e: globalThis.MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShareMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [shareMenuOpen])

  function handleCloseAllSlots(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    setOpenProjectIds([])
    setActive(0)
  }

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex gap-0 md:gap-0",
        mode === 'row' && "flex overflow-x-auto",
        mode === 'col' && "flex-col overflow-y-auto",
        hasPadding ? "  py-0 " : "p-0",

        "h-screen transition-all relative"
      )}
    >
     
      {showDebugUi && (
        <div className='pointer-events-none overflow-hidden fixed top-2 right-2 z-50 text-[11px] text-green-600 bg-black/70 rounded-md px-2 py-1'>
          <p>active: {active}</p>
          <p>mode: {mode}</p>
          <p>hoveringActive: {isHoveringActiveSlot ? 'yes' : 'no'}</p>
          <p>scrollLeft: {Math.round(scrollRef.current?.scrollLeft ?? 0)}</p>
        </div>
      )}
        {Array.from({length:slots}).map((_, i) => (
          <Slot
            isActive={active === i}
            key={i}
            index={i}
            length={slots}
            setActive={setActive}
            active={active}
            mode={mode}
            hoveredSlotIndex={hoveredSlotIndex}
            setHoveredSlotIndex={setHoveredSlotIndex}
            showDebugUi={showDebugUi}
            hasPadding={hasPadding}
          >
                  
              { i < 1 ? (
                <HomeContent
                  setActive={setActive}
                  projects={projects}
                  openProjectIds={openProjectIds}
                  setOpenProjectIds={setOpenProjectIds}
                  services={services}
                  siteTitle={siteTitle}
                  siteDescription={siteDescription}
                  mode={mode}
                  setMode={setMode}
                  isActive={active === i}
                />
              ) : openProjectIds[i - 1] === '__about__' ? (
                <AboutContent
                  mode={mode}
                  setMode={setMode}
                  setActive={setActive}
                  openProjectIds={openProjectIds}
                  setOpenProjectIds={setOpenProjectIds}
                  index={i}
                  isActive={active === i}
                />
              ) : (
                <ProjectContent
                  mode={mode}
                  setMode={setMode}
                  setActive={setActive}
                  openProjectIds={openProjectIds}
                  setOpenProjectIds={setOpenProjectIds}
                  project={projects.find((p) => p._id === openProjectIds[i - 1])}
                  index={i}
                  isActive={ active === i }
                />
              )}
          </Slot>

      ))}

     <div ref={shareMenuRef} className={` ${slots > 1 ? "bottom-4":"bottom-[-400px]"} group/nav transition-all flex justify-center items-center gap-2 w-full fixed left-0 right-0 z-50 hide-scrollbar `}>
        <NavBar
          slots={slots}
          active={active}
          setActive={setActive}
          projects={projects}
          openProjectIds={openProjectIds}
          settings={settings}
          closeProjectTab={closeProjectTab}
          shareMenuOpen={shareMenuOpen}
          onShareClick={handleShareClick}
          onCloseAll={handleCloseAllSlots}
          onShareConfiguration={handleShareConfiguration}
          onShareHomePage={handleShareHomePage}
          onEnquire={handleEnquire}
        />
    </div> 

    </div>
  )
}

function NavBar({
  slots,
  active,
  setActive,
  projects,
  openProjectIds,
  settings,
  closeProjectTab,
  shareMenuOpen,
  onShareClick,
  onCloseAll,
  onShareConfiguration,
  onShareHomePage,
  onEnquire,
}: {
  slots: number
  active: number
  setActive: any
  projects: AllProjectsQueryResult
  openProjectIds: string[]
  settings: SettingsQueryResult
  closeProjectTab: (tabIndex: number) => void
  shareMenuOpen: boolean
  onShareClick: (e: MouseEvent<HTMLButtonElement>) => void
  onCloseAll: (e: MouseEvent<HTMLButtonElement>) => void
  onShareConfiguration: () => void
  onShareHomePage: () => void
  onEnquire: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const menuItemsRef = useRef<HTMLDivElement>(null)
  const [highlight, setHighlight] = useState({left: 0, width: 0})
  const [tabsSize, setTabsSize] = useState({width: 0, height: 0})

  const updateHighlight = useCallback(() => {
    if (shareMenuOpen) return
    const container = containerRef.current
    if (!container) return
    const activeEl = container.querySelector(`[data-indextab="${active}"]`) as HTMLElement | null
    if (!activeEl) return
    const borderLeft = parseFloat(getComputedStyle(container).borderLeftWidth)
    const containerRect = container.getBoundingClientRect()
    const activeRect = activeEl.getBoundingClientRect()
    setHighlight({
      left: activeRect.left - containerRect.left - borderLeft,
      width: activeRect.width,
    })
  }, [active, shareMenuOpen])

  useLayoutEffect(() => {
    updateHighlight()
  }, [updateHighlight, slots])

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      updateHighlight()
      if (tabsRef.current && !shareMenuOpen) {
        setTabsSize({
          width: tabsRef.current.scrollWidth + 16,
          height: tabsRef.current.scrollHeight + 16,
        })
      }
    })
    if (containerRef.current) observer.observe(containerRef.current)
    if (tabsRef.current) observer.observe(tabsRef.current)
    return () => observer.disconnect()
  }, [updateHighlight, shareMenuOpen])

  const prevShareMenuOpen = useRef(false)
  const savedTabsSize = useRef({width: 0, height: 0})

  // Always keep savedTabsSize up to date when menu is closed
  useEffect(() => {
    if (!shareMenuOpen && tabsSize.width > 0) {
      savedTabsSize.current = tabsSize
    }
  }, [tabsSize, shareMenuOpen])

  useEffect(() => {
    // Skip initial render
    if (prevShareMenuOpen.current === shareMenuOpen) return
    prevShareMenuOpen.current = shareMenuOpen

    const tl = gsap.timeline()
    const restoreWidth = savedTabsSize.current.width || 'auto'
    const restoreHeight = savedTabsSize.current.height || 'auto'

    if (shareMenuOpen) {
      // 1. Thumbnails disappear instantly (override CSS transition)
      tl.set(tabsRef.current!.children, {scale: 0, transition: 'none'})
      // 2. Height, width and bg color change
      tl.to(containerRef.current, {
        width: 300, height: 400, borderRadius: '10px', padding: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        duration: 0.3, ease: 'power2.out',
      })
      // 3. Logo staggers in
      tl.fromTo(logoRef.current,
        {opacity: 0, y: -8},
        {opacity: 1, y: 0, duration: 0.4, ease: 'power2.out'},
        '+=0.1'
      )
      // 4. Links stagger in
      tl.fromTo(menuItemsRef.current!.children,
        {opacity: 0, y: -8},
        {opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.07},
        '-=0.1'
      )
    } else {
      // 1. Logo and links disappear instantly
      tl.set(menuItemsRef.current!.children, {opacity: 0, y: -8})
      tl.set(logoRef.current, {opacity: 0, y: -8})
      // 2. Height, width and bg color change
      tl.to(containerRef.current, {
        width: restoreWidth, height: restoreHeight,
        borderRadius: '50px', padding: 8,
        backgroundColor: 'var(--pill-bg)',
        duration: 0.3, ease: 'power2.out',
      })
      // 3. Thumbnails stagger in
      tl.call(() => {
        gsap.set(containerRef.current, {clearProps: 'width,height,padding,backgroundColor'})
      })
      tl.add(() => {
        const children = Array.from(tabsRef.current!.children) as HTMLElement[]
        children.forEach((child, i) => {
          gsap.set(child, {clearProps: 'scale,transition'})
          gsap.set(child, {opacity: 0, transition: 'none'})
          gsap.delayedCall(i * 0.05, () => {
            gsap.set(child, {opacity: 1})
          })
        })
      }, '+=0.05')
    }

    return () => { tl.kill() }
  }, [shareMenuOpen])

  return (
    <div
      ref={containerRef}
      className='relative backdrop-blur-[80px] shadow-[0_0_20px_rgba(0,0,0,0.08)] border border-border-subtle flex overflow-hidden items-center gap-2 p-2'
      style={{
        borderRadius: '50px',
        backgroundColor: 'var(--pill-bg)',
      }}
    >
      <div
        className={cn(
          'absolute top-1/2 -translate-y-1/2 rounded-full bg-hoverslot transition-all duration-300 ease-out aspect-square',
          shareMenuOpen && 'opacity-0 scale-0'
        )}
        style={{left: highlight.left - 4, width: highlight.width + 8}}
      />
      <div ref={tabsRef} className='flex items-center gap-2 origin-center'>
        {Array.from({length: slots}).map((_, i) => (
          <Tab
            key={i}
            index={i}
            active={active}
            setActive={setActive}
            project={i > 0 ? projects.find((p) => p._id === openProjectIds[i - 1]) : undefined}
            settings={settings}
            onClose={closeProjectTab}
          />
        ))}
        <div className='w-px h-6 bg-divider mx-1 self-center shrink-0' />
        <button
          type='button'
          onClick={onShareClick}
          aria-label='Share current page'
          className='cursor-pointer h-11 w-11 bg-button-solid rounded-full flex justify-center items-center shrink-0'
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='h-4 w-4 text-button-solid-text'>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
        <button
          type='button'
          onClick={onCloseAll}
          aria-label='Close all open pages'
          className='cursor-pointer h-11 w-11 bg-button-solid text-button-solid-text rounded-full flex justify-center items-center shrink-0'
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='h-4 w-4 text-button-solid-text'>
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div ref={menuRef} className='absolute inset-0 flex flex-col w-full justify-start h-full pb-4' style={{pointerEvents: shareMenuOpen ? 'auto' : 'none'}}>
        <div ref={logoRef} className='flex justify-center items-center flex-1 w-full' style={{opacity: 0}}>
          <PgsLogoMark className='h-16 w-auto text-white' />
        </div>
        <div ref={menuItemsRef} className='flex flex-col w-full'>
          <button
            type='button'
            onClick={onShareConfiguration}
            className='cursor-pointer px-4 py-2 hover:bg-white/10 transition-[background-color] duration-200 whitespace-nowrap text-left text-white flex items-center justify-between'
            style={{opacity: 0}}
          >
            <span>Share Configuration</span><span>&rarr;</span>
          </button>
          <div className='h-px w-full bg-white/20 shrink-0' style={{opacity: 0}} />
          <button
            type='button'
            onClick={onShareHomePage}
            className='cursor-pointer px-4 py-2 hover:bg-white/10 transition-[background-color] duration-200 whitespace-nowrap text-left text-white flex items-center justify-between'
            style={{opacity: 0}}
          >
            <span>Share Home Page</span><span>&rarr;</span>
          </button>
          <div className='h-px w-full bg-white/20 shrink-0' style={{opacity: 0}} />
          <button
            type='button'
            onClick={onEnquire}
            className='cursor-pointer px-4 py-2 hover:bg-white/10 transition-[background-color] duration-200 whitespace-nowrap text-left text-white flex items-center justify-between'
            style={{opacity: 0}}
          >
            <span>Enquire About Selected Project</span><span>&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function Tab({
  index,
  active,
  setActive,
  project,
  settings,
  onClose,
}: {
  index: number
  active: any
  setActive: any
  project?: AllProjectsQueryResult[number]
  settings: SettingsQueryResult
  onClose: (tabIndex: number) => void
}){
  
  const ref= useRef<HTMLDivElement>(null)
  const settingsLogo = (settings as unknown as {logo?: LogoImage})?.logo
  const projectLogo = (project as unknown as {logo?: LogoImage})?.logo
  const projectFallbackImage = project?.coverImage

  useEffect(() => {
    const el = document.querySelector(
      `[data-indextab="${active}"]`
    );
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center", // or "center"
        inline: "nearest",
      });
    }
  }, [active]);


  return(
    <>
    {index === 1 && (
      <div className='w-px h-6 bg-divider mx-1 self-center shrink-0' />
    )}
    <div
      ref={ref}
      data-indextab={index}
      onClick={()=>{setActive(index)}}
      className={ cn(`group relative bg-surface rounded-full flex flex-col justify-center items-center shadow-[0_0_20px_rgba(0,0,0,0.08)] overflow-visible transition-all duration-200 cursor-pointer h-11 w-11`,
        active === index && 'scale-[1.18] ring-1 ring-dark-1'
      )}>
      {index > 0 && (
        <button
          type='button'
          aria-label='Close page'
          onClick={(e) => {
            e.stopPropagation()
            onClose(index)
          }}
          className='absolute top-0 right-0 z-20 h-[18px] w-[18px] translate-x-[10%] -translate-y-[10%] rounded-full bg-hoverslot backdrop-blur-[10px] text-dark-1 text-[11px] leading-none flex items-center justify-center pb-[1px] opacity-0 transition-opacity group-hover:opacity-100'
        >
          ×
        </button>
      )}
      {index === 0 && settingsLogo?.asset?._ref ? (
        <Image
          id={settingsLogo.asset._ref}
          alt={settingsLogo?.alt || 'Site logo'}
          className='h-full w-full rounded-full'
          width={80}
          height={80}
          mode='contain'
          hotspot={settingsLogo.hotspot}
          crop={settingsLogo.crop}
        />
      ) : projectLogo?.asset?._ref ? (
        <Image
          id={projectLogo.asset._ref}
          alt={projectLogo?.alt || project?.title || ''}
          className='h-full w-full rounded-full'
          width={80}
          height={80}
          mode='contain'
          hotspot={projectLogo.hotspot}
          crop={projectLogo.crop}
        />
      ) : projectFallbackImage?.asset?._ref ? (
        <Image
          id={projectFallbackImage.asset._ref}
          alt={projectFallbackImage?.alt || project?.title || ''}
          className='h-full w-full rounded-full'
          width={80}
          height={80}
          mode='contain'
          hotspot={projectFallbackImage.hotspot}
          crop={projectFallbackImage.crop}
        />
      ) : (
        <p>{index}</p>
      )}
    </div>
    </>
  )
}
