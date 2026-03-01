'use client'
import {useState, useRef, useEffect, useMemo} from 'react'
import type {MouseEvent} from 'react'
import cn from 'classnames'
import type {AllProjectsQueryResult, SettingsQueryResult} from '@/sanity.types'
import Image from '@/app/components/SanityImage'
import HomeContent from '@/app/components/HomeContent'
import ProjectContent from '@/app/components/ProjectContent'
import Slot from '@/app/components/Slot'
 
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

  async function handleShareClick(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    if (typeof window === 'undefined') return
    try {
      await navigator.clipboard.writeText(buildShareUrl())
    } catch {
      // no-op: clipboard may be unavailable in some browser contexts
    }
  }

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex gap-0 md:gap-0",
        mode === 'row' && "flex overflow-x-auto",
        mode === 'col' && "flex-col overflow-y-auto",
        hasPadding ? "  py-0 " : "p-0",

        "text-[12px] h-screen  transition-all relative "
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
                />
              ):(
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

     <div className= {` ${slots > 1 ? "bottom-4":"bottom-[-400px]"} transition-all flex justify-center items-center w-full fixed  left-0 right-0 hide-scrollbar `}>
        <div className='bg-transparent flex items-end gap-1 p-2 w-fit overflow-visible rounded-xl'> 
          <button
            type='button'
            onClick={handleShareClick}
            aria-label='Share current page'
            className='h-[22px] w-[22px] bg-white rounded-full border-1 flex justify-center items-center shadow-lg border hover:border-hoverslot transition-colors'
          >
            <svg viewBox='0 0 24 24' aria-hidden='true' className='h-3 w-3 text-td1'>
              <path
                d='M16 5a3 3 0 1 0-2.83-4H13a3 3 0 0 0 .17 1L7.91 5.1a3 3 0 1 0 0 3.8l5.26 3.1A3 3 0 1 0 14 10a3 3 0 0 0-.83.12L7.91 7.02A3 3 0 0 0 8 6.5c0-.18-.03-.35-.05-.52l5.22-3.08A3 3 0 0 0 16 5z'
                fill='currentColor'
              />
            </svg>
          </button>
          {Array.from({length:slots}).map((_,i)=>(
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
    <div
      ref={ref}
      data-indextab={index} 
      onClick={()=>{setActive(index)}}
      className={ cn(`group relative bg-white rounded-full border-1 flex justify-center items-center shadow-lg border overflow-visible transition-[width,height,transform,border-color] duration-200`,
             active === index ? "border-activeslot h-14 w-14 -translate-y-[5px]":"hover:border-hoverslot h-11 w-11 translate-y-0"

      )}>
      {index > 0 && (
        <button
          type='button'
          aria-label='Close page'
          onClick={(e) => {
            e.stopPropagation()
            onClose(index)
          }}
          className='absolute top-0 right-0 z-20 h-[18px] w-[18px] translate-x-[10%] -translate-y-[10%] rounded-full bg-td1 text-labelcolor text-[13px] leading-[1] flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100'
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
  )
}
