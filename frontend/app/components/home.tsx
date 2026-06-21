'use client'
import {useState, useRef, useEffect, useCallback} from 'react'
import type {MouseEvent} from 'react'
import {cn} from '@/app/lib/cn'
import type {AllProjectsQueryResult, SettingsQueryResult} from '@/sanity.types'
import HomeContent from '@/app/components/HomeContent'
import ProjectContent from '@/app/components/ProjectContent'
import AboutContent from '@/app/components/AboutContent'
import EnquiryContent from '@/app/components/EnquiryContent'
import Slot from '@/app/components/Slot'
import NavBar from '@/app/components/NavBar'
import IntroAnimation from '@/app/components/IntroAnimation'
import {useKeyboardControls} from '@/app/hooks/useKeyboardControls'
import {useNavigation} from '@/app/hooks/useNavigation'
import {useUrlSync} from '@/app/utils/urlBuilder'
import {useSwipeable} from '@/app/hooks/useSwipeable'

export default function Home({
  projects,
  showreel,
  settings,
  services,
  industries,
  socialProfiles,
  directors,
  email,
  phone,
  siteTitle,
  siteDescription,
  siteIntro,
}: {
  projects: AllProjectsQueryResult
  showreel: {asset?: {playbackId?: string}} | null
  settings: SettingsQueryResult
  services: string[]
  industries: string[]
  socialProfiles: Array<{title: string; url: string}>
  directors: Array<{name: string; jobTitle: string; email: string; svgUrl: string}>
  email: string
  phone: string
  siteTitle: string
  siteDescription: string
  siteIntro: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState('row')
  const [openProjectIds, setOpenProjectIds] = useState<string[]>([])
  const [active, setActive] = useState(0)
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null)
  const isHoveringActiveSlot = hoveredSlotIndex === active
  const slots = 1 + openProjectIds.length
  const showDebugUi = false
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const addMenuRef = useRef<HTMLDivElement>(null)
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

  // Set body bg
  useEffect(() => {
    document.body.style.backgroundColor = 'var(--disabled-page)'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  const hasPadding = slots > 1 && effectiveMode == 'row'
  console.log(hasPadding)

  // Use custom hooks
  useKeyboardControls({slots, active, setActive, mode, setMode, openProjectIds, setOpenProjectIds})
  useSwipeable({ref: scrollRef, slots, setActive})
  const {closeProjectTab} = useNavigation({
    slots,
    effectiveMode,
    isHoveringActiveSlot,
    setActive,
    setOpenProjectIds,
    scrollRef,
  })
  const {buildShareUrl} = useUrlSync({
    projects,
    openProjectIds,
    active,
    setOpenProjectIds,
    setActive,
  })

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
    const activeProject =
      active > 0 ? projects.find((p) => p._id === openProjectIds[active - 1]) : null
    const subject = activeProject?.title ? `Enquiry about ${activeProject.title}` : 'Enquiry'
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

  useEffect(() => {
    if (!addMenuOpen) return
    function handleClickOutside(e: globalThis.MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [addMenuOpen])

  function handleAddProject(projectId: string) {
    if (openProjectIds.includes(projectId)) {
      const existingIndex = openProjectIds.indexOf(projectId)
      setActive(existingIndex + 1)
    } else {
      setOpenProjectIds((prev) => [...prev, projectId])
      setActive(openProjectIds.length + 1)
    }
    setAddMenuOpen(false)
  }

  function handleCloseAllSlots(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    setOpenProjectIds([])
    setActive(0)
  }

  return (
    <>
      {!introComplete && (
        <IntroAnimation text={(settings as any)?.introText} onComplete={handleIntroComplete} />
      )}
      <div
        ref={scrollRef}
        className={cn(
          'flex gap-0 md:gap-0',
          'flex overflow-x-auto scrollbar-none touch-pan-y',
          hasPadding ? '  py-0 ' : 'p-0',

          'h-screen transition-[filter,opacity,padding,gap] duration-400 ease-out relative',
        )}
      >
                {Array.from({length: slots}).map((_, i) => (
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
            bgClass={i > 0 && openProjectIds[i - 1] === '__about__' ? 'bg-surface2' : undefined}
          >
            {i < 1 ? (
              <HomeContent
                setActive={setActive}
                projects={projects}
                showreel={showreel}
                openProjectIds={openProjectIds}
                setOpenProjectIds={setOpenProjectIds}
                services={services}
                industries={industries}
                socialProfiles={socialProfiles}
                email={email}
                phone={phone}
                siteTitle={siteTitle}
                siteDescription={siteDescription}
                siteIntro={siteIntro}
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
                siteTitle={siteTitle}
                description={siteDescription}
                directors={directors}
                showreel={showreel}
                index={i}
                isActive={active === i}
              />
            ) : openProjectIds[i - 1] === '__enquiry__' ? (
              <EnquiryContent
                mode={effectiveMode}
                setMode={setMode}
                setActive={setActive}
                openProjectIds={openProjectIds}
                setOpenProjectIds={setOpenProjectIds}
                services={services}
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
                isActive={active === i}
              />
            )}
          </Slot>
        ))}

        {openProjectIds.length > 0 && (
          <Slot
            isActive={active === slots}
            key="__add__"
            index={slots}
            length={slots + 1}
            setActive={setActive}
            active={active}
            mode={effectiveMode}
            hoveredSlotIndex={hoveredSlotIndex}
            setHoveredSlotIndex={setHoveredSlotIndex}
            showDebugUi={showDebugUi}
            hasPadding={hasPadding}
            blurred={false}
            hoverClass="hover:bg-transparent"
            bgClass="bg-transparent"
            halfWidth
          >
            <div
              ref={addMenuRef}
              className='h-full w-full flex items-center justify-center cursor-pointer relative'
              onClick={() => setAddMenuOpen((prev) => !prev)}
            >
              <div className="h-[32px] w-[32px] flex items-center justify-center rounded-full bg-surface shadow-[0_1px_6px_rgba(0,0,0,0.08)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-dark-2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              {addMenuOpen && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-pill backdrop-blur-xl rounded-lg shadow-lg p-2 min-w-[200px] max-h-[300px] overflow-y-auto">
                  {projects.map((project) => (
                    <button
                      key={project._id}
                      className={cn("w-full text-left px-3 py-2 rounded-md text-sm hover:bg-hoverelement transition-colors truncate", openProjectIds.includes(project._id) && "bg-hoverelement")}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddProject(project._id)
                      }}
                    >
                      {project.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Slot>
        )}

        <div
          onClick={() => setShareMenuOpen(false)}
          className={cn(
            'fixed inset-0 bg-black/50 z-[49] transition-opacity duration-300',
            shareMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
          )}
        />
        <div
          ref={shareMenuRef}
          className={` ${slots > 1 ? 'bottom-4' : 'bottom-[-400px]'} group/nav transition-all flex justify-center items-center gap-2 w-full fixed left-0 right-0 z-50 hide-scrollbar `}
        >
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
