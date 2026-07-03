'use client'
import {useRef} from 'react'
import type {Dispatch, SetStateAction} from 'react'
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

  const footerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  useLenis(scrollRef, isActive)



  return (
    <div className='relative h-full w-full'>
      <div className='hidden lg:block'>
        <SlotPill mode={mode} isVisible={isActive && openProjectIds.length > 0} onToggleMode={toggleMode} />
      </div>
    <div ref={scrollRef} className='h-full w-full overflow-auto scrollbar-none'>
      <HomeHeader
        scrollRef={scrollRef}
        title={siteTitle}
        description={siteIntro || siteDescription}
        onAboutClick={() => handleClick('__about__')}
      />




      <div className='pt-[120px] lg:pt-32 pb-0 px-slotmargin max-w-[var(--slot-content-max-width)] mx-auto w-full'>
        <div className='relative z-0 mb-16 flex w-full items-start justify-start lg:h-auto'>
          <div className='relative z-0 w-[30vw] lg:w-[25vw]'>
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

            <div className='flex flex-col lg:flex-row gap-gutter'>
              {showreel?.asset?.playbackId && (
                <div className='lg:w-1/2 lg:self-end lg:sticky lg:bottom-0 p-4 pb-sa lg:pb-4'>
                  <div className='overflow-hidden rounded-lg w-[250px] mx-auto lg:mx-0'>
                    <MuxPlayer
                      theme='minimal'
                      playbackId={showreel.asset.playbackId}
                      streamType='on-demand'
                      autoPlay='muted'
                      loop
                      muted
                      style={{width: '100%', display: 'block', borderRadius: 0, '--controls': 'none', '--media-object-fit': 'cover', '--media-time-display-display': 'none', '--media-volume-range-display': 'none', '--media-mute-button-display': 'none'} as any}
                    />
                  </div>
                </div>
              )}
              <div className='@container lg:w-1/2'>
                <div>
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
            </div>

            <div ref={footerRef}>
              <Footer socialProfiles={socialProfiles} phone={phone} email={email} />
            </div>
          </div>

      </div>
    </div>
    </div>
  )
}
