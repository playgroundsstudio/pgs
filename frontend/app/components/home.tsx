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
import IntroAnimation from '@/app/components/IntroAnimation'

type LogoImage = {
  asset?: { _ref?: string }
  alt?: string
  hotspot?: { x: number; y: number }
  crop?: { top: number; bottom: number; left: number; right: number }
}

export default function Home({
  projects,
  showreel,
  settings,
  services,
  siteTitle,
  siteDescription,
}: {
  projects: AllProjectsQueryResult
  showreel: {asset?: {playbackId?: string}} | null
  settings: SettingsQueryResult
  services: string[]
  siteTitle: string
  siteDescription: string
}) {

  const scrollRef = useRef<HTMLDivElement>(null)
  const wheelThrottledRef = useRef(false)
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
  const [isMobile, setIsMobile] = useState(false)
  const [introComplete, setIntroComplete] = useState(false)
  const handleIntroComplete = useCallback(() => setIntroComplete(true), [])

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1023px)')
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  // Reset mode to default when all projects close
  useEffect(() => {
    if (openProjectIds.length === 0) {
      setMode('row')
    }
  }, [openProjectIds.length])

  // Force col mode on mobile
  const effectiveMode = isMobile ? 'col' : mode

  // Change body bg when home panel not active
  useEffect(() => {
    const body = document.body
    if (active !== 0) {
      body.style.backgroundColor = 'var(--disabled)'
    } else {
      body.style.backgroundColor = 'var(--enabled)'
    }
    return () => { body.style.backgroundColor = '' }
  }, [active])

  const hasPadding = ( slots>1 && effectiveMode=='row' )
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
      if (effectiveMode === 'col') {
        // In col mode, only navigate panels with horizontal scroll
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || event.deltaX === 0) {
          return
        }
        event.preventDefault()
        if (wheelThrottledRef.current) return
        wheelThrottledRef.current = true
        setTimeout(() => { wheelThrottledRef.current = false }, 1000)
        setActive((prev: number) => Math.max(0, Math.min(slots - 1, prev + Math.sign(event.deltaX))))
        return
      }

      if (effectiveMode !== 'row') {
        return
      }

      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (delta === 0) {
        return
      }

      // Allow vertical scroll through to inner content when on active slot
      if (isHoveringActiveSlot && Math.abs(event.deltaY) >= Math.abs(event.deltaX)) {
        return
      }

      event.preventDefault()
      if (wheelThrottledRef.current) return
      wheelThrottledRef.current = true
      setTimeout(() => { wheelThrottledRef.current = false }, 1000)

      setActive((prev: number) => Math.max(0, Math.min(slots - 1, prev + Math.sign(delta))))
    }

    el.addEventListener('wheel', handleWheel, {passive: false})
    return () => {
      el.removeEventListener('wheel', handleWheel)
    }
  }, [effectiveMode, isHoveringActiveSlot])

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

  // Keyboard arrow navigation between open panels
  useEffect(() => {
    if (slots <= 1) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        e.stopPropagation()
        if (e.key === 'ArrowLeft') {
          setActive((prev: number) => Math.max(0, prev - 1))
        } else {
          setActive((prev: number) => Math.min(slots - 1, prev + 1))
        }
      } else if (e.key === 'Enter') {
        setMode('col')
      } else if (e.key === 'Escape') {
        setMode('row')
      }
    }
    window.addEventListener('keydown', handleKeyDown, {capture: true})
    return () => window.removeEventListener('keydown', handleKeyDown, {capture: true})
  }, [slots])

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
    <>
    {!introComplete && <IntroAnimation onComplete={handleIntroComplete} />}
    <div
      ref={scrollRef}
      className={cn(
        "flex gap-0 md:gap-0",
        effectiveMode === 'row' ? "flex overflow-x-auto" : "flex-col overflow-y-auto",
        hasPadding ? "  py-0 " : "p-0",

        "h-screen transition-[filter,opacity,padding,gap] duration-400 ease-out relative"
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
            key={i === 0 ? '__home__' : openProjectIds[i - 1]}
            index={i}
            length={slots}
            setActive={setActive}
            active={active}
            mode={effectiveMode}
            hoveredSlotIndex={hoveredSlotIndex}
            setHoveredSlotIndex={setHoveredSlotIndex}
            showDebugUi={showDebugUi}
            hasPadding={hasPadding}
            blurred={false}
          >

              { i < 1 ? (
                <HomeContent
                  setActive={setActive}
                  projects={projects}
                  showreel={showreel}
                  openProjectIds={openProjectIds}
                  setOpenProjectIds={setOpenProjectIds}
                  services={services}
                  siteTitle={siteTitle}
                  siteDescription={siteDescription}
                  mode={effectiveMode}
                  setMode={setMode}
                  isActive={active === i}
                />
              ) : openProjectIds[i - 1] === '__about__' ? (
                <AboutContent
                  mode={effectiveMode}
                  setMode={setMode}
                  setActive={setActive}
                  openProjectIds={openProjectIds}
                  setOpenProjectIds={setOpenProjectIds}
                  index={i}
                  isActive={active === i}
                />
              ) : (
                <ProjectContent
                  mode={effectiveMode}
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

      <div
        onClick={() => setShareMenuOpen(false)}
        className={cn(
          'fixed inset-0 bg-black/50 z-[49] transition-opacity duration-300',
          shareMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />
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
    </>
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
  const CLOSED_NAV_HEIGHT = 48
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
    const restoreHeight = CLOSED_NAV_HEIGHT
    const rootStyles = getComputedStyle(document.documentElement)
    const pillColor = rootStyles.getPropertyValue('--pill-bg').trim()

    if (shareMenuOpen) {
      // 1. Thumbnails disappear instantly (override CSS transition)
      tl.set(tabsRef.current!.children, {scale: 0, transition: 'none'})
      // 2. Width expands first
      tl.to(containerRef.current, {
        width: 300,
        duration: 0.22, ease: 'power2.out',
      })
      // 3. Radius changes second
      tl.to(containerRef.current, {
        borderRadius: '10px',
        duration: 0.18, ease: 'power2.out',
      })
      // 4. Height follows, with the visual rest state
      tl.to(containerRef.current, {
        height: 400, padding: 0,
        duration: 0.3, ease: 'power2.out',
      })
      // 5. Logo appears after the container finishes
      tl.fromTo(logoRef.current,
        {opacity: 0, y: -8},
        {opacity: 1, y: 0, duration: 0.4, ease: 'power2.out'}
      )
      // 6. Links stagger in after the logo starts
      tl.fromTo(menuItemsRef.current!.children,
        {opacity: 0, y: -8},
        {opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.07},
        '+=0.05'
      )
    } else {
      // 1. Logo and links disappear instantly
      tl.set(menuItemsRef.current!.children, {opacity: 0, y: -8})
      tl.set(logoRef.current, {opacity: 0, y: -8})
      // 2. Height collapses first
      tl.to(containerRef.current, {
        height: restoreHeight, backgroundColor: pillColor,
        duration: 0.3, ease: 'power2.out',
      })
      // 3. Radius restores second
      tl.to(containerRef.current, {
        borderRadius: '60px',
        duration: 0.18, ease: 'power2.out',
      })
      // 4. Width follows and restores the pill styling
      tl.to(containerRef.current, {
        width: restoreWidth, padding: 8,
        duration: 0.22, ease: 'power2.out',
      })
      // 5. Thumbnails stagger in
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
      className='relative bg-pill backdrop-blur-[80px] shadow-[0_0_20px_rgba(0,0,0,0.08)] flex overflow-hidden items-center gap-2 p-2'
      style={{
        borderRadius: '60px',
        height: CLOSED_NAV_HEIGHT,
      }}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-0 bg-surface2 backdrop-blur-[40px] transition-opacity duration-300 ease-out',
          shareMenuOpen ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        className={cn(
          'absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-hoverslot transition-all duration-300 ease-out aspect-square',
          shareMenuOpen && 'opacity-0 scale-0'
        )}
        style={{left: highlight.left - 4, width: highlight.width + 8}}
      />
      <div ref={tabsRef} className='relative z-10 flex items-center gap-2 origin-center'>
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
        <div className='ml-auto' />
        <div className='w-px h-6 bg-divider mx-1 self-center shrink-0' />
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
      <div ref={menuRef} className='absolute inset-0 z-10 flex flex-col w-full justify-start h-full pb-4' style={{pointerEvents: shareMenuOpen ? 'auto' : 'none'}}>
        <div ref={logoRef} className='flex justify-center items-center flex-1 w-full' style={{opacity: 0}}>
          <PgsLogoMark className='h-16 w-auto text-white dark:text-black' />
        </div>
        <div ref={menuItemsRef} className='flex flex-col w-full'>
          <button
            type='button'
            onClick={onShareConfiguration}
            className='cursor-pointer px-4 py-2 hover:bg-white/10 dark:hover:bg-black/10 transition-[background-color] duration-200 whitespace-nowrap text-left text-white dark:text-black flex items-center justify-between'
            style={{opacity: 0}}
          >
            <span>Share Configuration</span><span>&rarr;</span>
          </button>
          <div className='h-px w-full bg-white/20 dark:bg-black/20 shrink-0' style={{opacity: 0}} />
          <button
            type='button'
            onClick={onShareHomePage}
            className='cursor-pointer px-4 py-2 hover:bg-white/10 dark:hover:bg-black/10 transition-[background-color] duration-200 whitespace-nowrap text-left text-white dark:text-black flex items-center justify-between'
            style={{opacity: 0}}
          >
            <span>Share Home Page</span><span>&rarr;</span>
          </button>
          <div className='h-px w-full bg-white/20 dark:bg-black/20 shrink-0' style={{opacity: 0}} />
          <button
            type='button'
            onClick={onEnquire}
            className='cursor-pointer px-4 py-2 hover:bg-white/10 dark:hover:bg-black/10 transition-[background-color] duration-200 whitespace-nowrap text-left text-white dark:text-black flex items-center justify-between'
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
      className={ cn(`group relative rounded-full flex flex-col justify-center items-center shadow-[0_0_20px_rgba(0,0,0,0.08)] overflow-visible transition-all duration-200 cursor-pointer h-11 w-11`,
        active === index && ''
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
