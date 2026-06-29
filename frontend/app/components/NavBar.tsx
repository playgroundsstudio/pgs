'use client'
import {useState, useRef, useEffect, useLayoutEffect, useCallback} from 'react'
import gsap from 'gsap'
import type {MouseEvent} from 'react'
import {cn} from '@/app/lib/cn'
import type {AllProjectsQueryResult, SettingsQueryResult} from '@/sanity.types'
import Image from '@/app/components/SanityImage'
import PgsLogoMark from '@/app/components/PgsLogoMark'

type LogoImage = {
  asset?: {_ref?: string}
  alt?: string
  hotspot?: {x: number; y: number}
  crop?: {top: number; bottom: number; left: number; right: number}
  metadata?: {palette?: {dominant?: {background?: string}}}
}

type NavBarProps = {
  slots: number
  active: number
  setActive: any
  projects: AllProjectsQueryResult
  openProjectIds: string[]
  settings: SettingsQueryResult
  closeProjectTab: (tabIndex: number) => void
  addMenuOpen: boolean
  setAddMenuOpen: (v: boolean) => void
  shareMenuOpen: boolean
  onShareClick: (e: MouseEvent<HTMLButtonElement>) => void
  onCloseAll: (e: MouseEvent<HTMLButtonElement>) => void
  onShareConfiguration: () => void
  onShareHomePage: () => void
  onEnquire: () => void
  enquiryTabImage?: any
  newsletterTabImage?: any
}

export default function NavBar({
  slots,
  active,
  setActive,
  projects,
  openProjectIds,
  settings,
  closeProjectTab,
  addMenuOpen,
  setAddMenuOpen,
  shareMenuOpen,
  onShareClick,
  onCloseAll,
  onShareConfiguration,
  onShareHomePage,
  onEnquire,
  enquiryTabImage,
  newsletterTabImage,
}: NavBarProps) {
  const CLOSED_NAV_HEIGHT = 47
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
          width: tabsRef.current.scrollWidth + 12,
          height: tabsRef.current.scrollHeight + 12,
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
        duration: 0.22,
        ease: 'power2.out',
      })
      // 3. Radius changes second
      tl.to(containerRef.current, {
        borderRadius: '10px',
        duration: 0.18,
        ease: 'power2.out',
      })
      // 4. Height follows, with the visual rest state
      tl.to(containerRef.current, {
        height: 400,
        padding: 0,
        duration: 0.3,
        ease: 'power2.out',
      })
      // 5. Logo appears after the container finishes
      tl.fromTo(
        logoRef.current,
        {opacity: 0, y: -8},
        {opacity: 1, y: 0, duration: 0.4, ease: 'power2.out'},
      )
      // 6. Links stagger in after the logo starts
      tl.fromTo(
        menuItemsRef.current!.children,
        {opacity: 0, y: -8},
        {opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.07},
        '+=0.05',
      )
    } else {
      // 1. Logo and links disappear instantly
      tl.set(menuItemsRef.current!.children, {opacity: 0, y: -8})
      tl.set(logoRef.current, {opacity: 0, y: -8})
      // 2. Height collapses first
      tl.to(containerRef.current, {
        height: restoreHeight,
        backgroundColor: pillColor,
        duration: 0.3,
        ease: 'power2.out',
      })
      // 3. Radius restores second
      tl.to(containerRef.current, {
        borderRadius: '60px',
        duration: 0.18,
        ease: 'power2.out',
      })
      // 4. Width follows and restores the pill styling
      tl.to(containerRef.current, {
        width: restoreWidth,
        padding: 6,
        duration: 0.22,
        ease: 'power2.out',
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

    return () => {
      tl.kill()
    }
  }, [shareMenuOpen])

  return (
    <div
      ref={containerRef}
      className="group/navbar relative  bg-pill backdrop-blur-[80px] shadow-[0_0_20px_rgba(0,0,0,0.08)] flex overflow-hidden items-center gap-1.5 py-1.5 pr-[7px] pl-[7px]"
      style={{
        borderRadius: '60px',
        height: CLOSED_NAV_HEIGHT,
      }}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0  z-0 bg-surface2 backdrop-blur-[40px] transition-opacity duration-300 ease-out',
          shareMenuOpen ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        className={cn(
          'absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-selected-tab-highlight transition-all duration-300 ease-out aspect-square',
          shareMenuOpen && 'opacity-0 scale-0',
        )}
        style={{left: highlight.left - 4, width: highlight.width + 8}}
      />
      <div ref={tabsRef} className="relative z-10 flex items-center gap-2 origin-center">
        {Array.from({length: slots}).map((_, i) => (
          <Tab
            key={i}
            index={i}
            active={active}
            setActive={setActive}
            project={i > 0 ? projects.find((p) => p._id === openProjectIds[i - 1]) : undefined}
            slotId={i > 0 ? openProjectIds[i - 1] : undefined}
            settings={settings}
            onClose={closeProjectTab}
            enquiryTabImage={enquiryTabImage}
            newsletterTabImage={newsletterTabImage}
          />
        ))}
        {openProjectIds.length > 0 && (
          <>
            <div className="w-px h-6 bg-divider mx-1 self-center shrink-0" />
            <div
              data-indextab={slots}
              onClick={() => {
                setActive(slots)
                setAddMenuOpen(true)
              }}
              className="relative rounded-full flex flex-col justify-center items-center cursor-pointer h-[35px] w-[35px] bg-surface shadow-[0_0_20px_rgba(0,0,0,0.08)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-dark-1">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </>
        )}
        <div className="w-px h-6 bg-divider mx-1 self-center shrink-0 hidden" />
        <button
          type="button"
          onClick={onCloseAll}
          aria-label="Close all open pages"
          className="cursor-pointer h-[35px] w-[35px] bg-button-solid text-button-solid-text rounded-full flex justify-center items-center shrink-0 hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-button-solid-text"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div
        ref={menuRef}
        className="absolute inset-0 z-10 flex flex-col w-full justify-start h-full pb-4"
        style={{pointerEvents: shareMenuOpen ? 'auto' : 'none'}}
      >
        <div
          ref={logoRef}
          className="flex justify-center items-center flex-1 w-full"
          style={{opacity: 0}}
        >
          <PgsLogoMark className="h-16 w-auto text-white dark:text-black" />
        </div>
        <div ref={menuItemsRef} className="flex flex-col w-full">
          <button
            type="button"
            onClick={onShareConfiguration}
            className="cursor-pointer px-4 py-2 hover:bg-white/10 dark:hover:bg-black/10 transition-[background-color] duration-200 whitespace-nowrap text-left text-white dark:text-black flex items-center justify-between"
            style={{opacity: 0}}
          >
            <span>Share Configuration</span>
            <span>&rarr;</span>
          </button>
          <div className="h-px w-full bg-white/20 dark:bg-black/20 shrink-0" style={{opacity: 0}} />
          <button
            type="button"
            onClick={onShareHomePage}
            className="cursor-pointer px-4 py-2 hover:bg-white/10 dark:hover:bg-black/10 transition-[background-color] duration-200 whitespace-nowrap text-left text-white dark:text-black flex items-center justify-between"
            style={{opacity: 0}}
          >
            <span>Share Home Page</span>
            <span>&rarr;</span>
          </button>
          <div className="h-px w-full bg-white/20 dark:bg-black/20 shrink-0" style={{opacity: 0}} />
          <button
            type="button"
            onClick={onEnquire}
            className="cursor-pointer px-4 py-2 hover:bg-white/10 dark:hover:bg-black/10 transition-[background-color] duration-200 whitespace-nowrap text-left text-white dark:text-black flex items-center justify-between"
            style={{opacity: 0}}
          >
            <span>Enquire About Selected Project</span>
            <span>&rarr;</span>
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
  slotId,
  settings,
  onClose,
  enquiryTabImage,
  newsletterTabImage,
}: {
  index: number
  active: any
  setActive: any
  project?: AllProjectsQueryResult[number]
  slotId?: string
  settings: SettingsQueryResult
  onClose: (tabIndex: number) => void
  enquiryTabImage?: any
  newsletterTabImage?: any
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isDark, setIsDark] = useState(false)
  const settingsLogo = (settings as unknown as {logo?: LogoImage})?.logo
  const projectLogo = (project as unknown as {logo?: LogoImage})?.logo
  const projectFallbackImage = project?.coverImage

  useEffect(() => {
    if (index === 0) return
    const el = ref.current
    if (!el) return
    const img = el.querySelector('img') as HTMLImageElement | null
    if (!img) return
    function analyze() {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 8
        canvas.height = 8
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img!, 0, 0, 8, 8)
        const data = ctx.getImageData(0, 0, 8, 8).data
        let total = 0
        for (let i = 0; i < data.length; i += 4) {
          total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        }
        const avg = total / (data.length / 4)
        setIsDark(avg < 140)
      } catch {}
    }
    if (img.complete) {
      analyze()
    } else {
      img.addEventListener('load', analyze, {once: true})
    }
  }, [index, project])

  useEffect(() => {
    const el = document.querySelector(`[data-indextab="${active}"]`)
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center', // or "center"
        inline: 'nearest',
      })
    }
  }, [active])

  return (
    <>
      {index === 1 && <div className="w-px h-6 bg-divider mx-1 self-center shrink-0" />}
      <div
        ref={ref}
        data-indextab={index}
        onClick={() => {
          setActive(index)
        }}
        className={cn(
          `group relative rounded-full flex flex-col justify-center items-center shadow-[0_0_20px_rgba(0,0,0,0.08)] overflow-visible transition-all duration-200 cursor-pointer h-[35px] w-[35px]`,
          active === index && '',
        )}
      >
        {index > 0 && active === index && (
          <button
            type="button"
            aria-label="Close page"
            onClick={(e) => {
              e.stopPropagation()
              onClose(index)
            }}
            className="absolute inset-2 z-20 rounded-full bg-button-bg backdrop-blur-[10px] flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-button-text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        {index === 0 && settingsLogo?.asset?._ref ? (
          <Image
            draggable={false}
            id={settingsLogo.asset._ref}
            alt={settingsLogo?.alt || 'Site logo'}
            className="h-full w-full rounded-full"
            width={80}
            height={80}
            mode="contain"
            hotspot={settingsLogo.hotspot}
            crop={settingsLogo.crop}
            fadeIn={false}
          />
        ) : projectLogo?.asset?._ref ? (
            <Image
              draggable={false}
            id={projectLogo.asset._ref}
            alt={projectLogo?.alt || project?.title || ''}
            className="h-full w-full rounded-full"
            width={80}
            height={80}
            mode="contain"
            hotspot={projectLogo.hotspot}
            crop={projectLogo.crop}
            fadeIn={false}
          />
        ) : projectFallbackImage?.asset?._ref ? (
          <Image
            id={projectFallbackImage.asset._ref}
            alt={projectFallbackImage?.alt || project?.title || ''}
            className="h-full w-full rounded-full"
            width={80}
            height={80}
            mode="contain"
            hotspot={projectFallbackImage.hotspot}
            crop={projectFallbackImage.crop}
            fadeIn={false}
          />
        ) : slotId === '__about__' ? (
          <div className="h-full w-full rounded-full bg-surface2" />
        ) : slotId === '__enquiry__' && enquiryTabImage?.asset?._ref ? (
          <Image
            draggable={false}
            id={enquiryTabImage.asset._ref}
            alt="Enquiry"
            className="h-full w-full rounded-full"
            width={80}
            height={80}
            mode="cover"
            hotspot={enquiryTabImage.hotspot}
            crop={enquiryTabImage.crop}
            fadeIn={false}
          />
        ) : slotId === '__enquiry__' ? (
          <div className="h-full w-full rounded-full bg-surface" />
        ) : slotId === '__newsletter__' && newsletterTabImage?.asset?._ref ? (
          <Image
            draggable={false}
            id={newsletterTabImage.asset._ref}
            alt="Newsletter"
            className="h-full w-full rounded-full"
            width={80}
            height={80}
            mode="cover"
            hotspot={newsletterTabImage.hotspot}
            crop={newsletterTabImage.crop}
            fadeIn={false}
          />
        ) : slotId === '__newsletter__' ? (
          <div className="h-full w-full rounded-full bg-surface" />
        ) : (
          <p>{index}</p>
        )}
      </div>
    </>
  )
}
