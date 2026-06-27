'use client'
import {useEffect, useRef, useState} from 'react'
import type {Dispatch, SetStateAction} from 'react'
import {createPortal} from 'react-dom'
import gsap from 'gsap'
import {cn} from '@/app/lib/cn'
import {useSlotActions} from '@/app/hooks/useSlotActions'
import SlotPill from '@/app/components/SlotPill'
import type {AllProjectsQueryResult} from '@/sanity.types'
import HomeHeader from '@/app/components/HomeHeader'
import PgsLogoMark from '@/app/components/PgsLogoMark'
import ProjectList from '@/app/components/ProjectList'
import MuxPlayer from '@mux/mux-player-react'
import '@mux/mux-player/themes/minimal'
import {useLenis} from '@/app/hooks/useLenis'
import {gridClsCq, tagsAlignClassesCq} from '@/app/lib/projectGrid'
import StatementAndListBlock from '@/app/components/StatementAndListBlock'
import Footer from '@/app/components/Footer'

type HomeContentProps = {
  setActive: Dispatch<SetStateAction<number>>
  projects: AllProjectsQueryResult
  showreel: {asset?: {playbackId?: string}} | null
  openProjectIds: string[]
  setOpenProjectIds: Dispatch<SetStateAction<string[]>>
  services: string[]
  industries: string[]
  socialProfiles: Array<{title: string; url: string}>
  email: string
  phone: string
  siteTitle: string
  siteDescription: string
  siteIntro: string
  servicesStatement: string
  industryStatement: string
  actionsStatement: string
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
  industries,
  socialProfiles,
  email,
  phone,
  siteTitle,
  siteDescription,
  siteIntro,
  servicesStatement,
  industryStatement,
  actionsStatement,
  mode,
  setMode,
  isActive,
}: HomeContentProps) {
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

  const {toggleMode, closeSlot} = useSlotActions({mode, setMode, setActive, openProjectIds, setOpenProjectIds})

  const [mounted, setMounted] = useState(false)
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
  const footerRef = useRef<HTMLDivElement>(null)
  const [footerInView, setFooterInView] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  useLenis(scrollRef, isActive)

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
  }, [])

  // IntersectionObserver for footer
  useEffect(() => {
    const el = footerRef.current
    if (!el) return
    const root = scrollRef.current
    const observer = new IntersectionObserver(
      ([entry]) => setFooterInView(entry.isIntersecting),
      {threshold: 0.1, root}
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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

    const pipShouldPlay = pipVisible && !showreelExpanded && !pipHidden
    const expandedShouldPlay = showreelExpanded
    const inlineShouldPlay = inlineInView && !showreelExpanded

    toggle(inlinePlayerRef, inlineShouldPlay)
    toggle(pipPlayerRef, pipShouldPlay)
    toggle(expandedPlayerRef, expandedShouldPlay)
  }, [inlineInView, pipVisible, showreelExpanded, pipHidden])

  // Desktop-only PiP: slide in on mount, hide when a project is open or footer is in view
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    if (!mq.matches) return

    if (openProjectIds.length > 0 || footerInView) {
      setPipVisible(false)
    } else {
      const timeout = setTimeout(() => setPipVisible(true), 500)
      return () => clearTimeout(timeout)
    }
  }, [openProjectIds, footerInView])



  // GSAP animation for PiP slide in/out
  useEffect(() => {
    const el = pipRef.current
    if (!el) return
    if (pipHidden) return

    if (pipVisible) {
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


  const showreelPlaybackId = showreel?.asset?.playbackId



  return (
    <div className='relative h-full w-full'>
      <SlotPill mode={mode} isVisible={isActive && openProjectIds.length > 0} onToggleMode={toggleMode} />
    <div ref={scrollRef} className='h-full w-full overflow-auto scrollbar-none'>
      <HomeHeader
        scrollRef={scrollRef}
        title={siteTitle}
        description={siteIntro || siteDescription}
        onAboutClick={() => handleClick('__about__')}
      />




      <div className='pt-32 pb-0 px-slotmargin max-w-[var(--slot-content-max-width)] mx-auto w-full'>
        <div className='relative z-0 mb-16 flex w-full items-start justify-start lg:h-auto'>
          <div className='relative z-0 w-full max-w-[550px]'>
            <PgsLogoMark className='w-full h-auto text-dark-1' />
          </div>
        </div>
        <div className='relative flex flex-col w-full'>
            {/* Projects — full width */}
            <div className='w-full mb-sa'>
              <ProjectList
                projects={projects}
                openProjectIds={openProjectIds}
                onProjectClick={handleClick}
                isActive={isActive}
              />
            </div>

            <div className={`@container flex flex-col ${gridClsCq}`}>
              <div className={tagsAlignClassesCq()}>
                <StatementAndListBlock
                  title='Services'
                  statement={servicesStatement}
                  items={services.map(s => ({label: s}))}
                />
                <StatementAndListBlock
                  title='Sectors'
                  statement={industryStatement}
                  items={industries.map(s => ({label: s}))}
                />
                <StatementAndListBlock
                  title='Actions'
                  statement={actionsStatement}
                  items={[
                    {label: 'Kick off a project', onClick: () => handleClick('__enquiry__')},
                    {label: 'Join the newsletter', onClick: () => handleClick('__newsletter__')},
                    ...(email ? [{label: 'Say Hi', onClick: () => window.open(`mailto:${email}?subject=Saying Hi`, '_blank')}] : []),
                  ]}
                />
              </div>
            </div>

            <div ref={footerRef}>
              <Footer socialProfiles={socialProfiles} phone={phone} email={email} />
            </div>
          </div>

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
              style={{bottom: 24, left: -400, width: 250, visibility: (showreelExpanded || pipHidden) ? 'hidden' : 'visible'}}
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
    </div>
  )
}
