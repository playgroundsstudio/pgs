'use client'
import {useState, useRef, useEffect} from 'react'
import cn from 'classnames'
import type {AllProjectsQueryResult, SettingsQueryResult} from '@/sanity.types'
import Image from '@/app/components/SanityImage'
import HomeContent from '@/app/components/HomeContent'
import ProjectContent from '@/app/components/ProjectContent'
import Slot from '@/app/components/Slot'
 
export default function Home({
  projects,
  settings,
}: {
  projects: AllProjectsQueryResult
  settings: SettingsQueryResult
}) {
 
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mode ,setMode] = useState('row')
  const [openProjectIds, setOpenProjectIds] = useState<string[]>([])
  const [active, setActive ]=useState(0)
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null)
  const isHoveringActiveSlot = hoveredSlotIndex === active
  const slots = 1 + openProjectIds.length
  const showDebugUi = false

  const hasPadding = ( slots>1 && mode=='row' ) 
  console.log(hasPadding)

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

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex gap-0 md:gap-0",
        mode === 'row' && "flex overflow-x-auto",
        mode === 'col' && "flex-col overflow-y-auto",
        hasPadding ? "  py-2 " : "p-0",

        "text-[12px] h-screen  transition-all relative font-mono"
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
        <div className='bg-stone-300/80 backdrop-blur-2xl border-1 border-black/50  flex gap-2 p-2 w-fit  overflow-scroll rounded-full  shadow-lg  hide-scrollbar  '> 
          {Array.from({length:slots}).map((_,i)=>(
            <Tab
              key={i}
              index={i}
              active={active}
              setActive={setActive}
              project={i > 0 ? projects.find((p) => p._id === openProjectIds[i - 1]) : undefined}
              settings={settings}
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
}: {
  index: number
  active: any
  setActive: any
  project?: AllProjectsQueryResult[number]
  settings: SettingsQueryResult
}){
  
  const ref= useRef<HTMLDivElement>(null)

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
      className={ cn(`h-14 aspect-square bg-white rounded-full border-1 flex justify-center items-center shadow-lg border overflow-hidden`,
             active === index ? "border-activeslot":"  hover:border-hoverslot "

      )}>
      {index === 0 && settings?.ogImage?.asset?._ref ? (
        <Image
          id={settings.ogImage.asset._ref}
          alt={settings.ogImage?.alt || 'Site image'}
          className='h-full w-full rounded-full'
          width={80}
          height={80}
          mode='contain'
          hotspot={settings.ogImage.hotspot}
          crop={settings.ogImage.crop}
        />
      ) : project?.coverImage?.asset?._ref ? (
        <Image
          id={project.coverImage.asset._ref}
          alt={project.coverImage?.alt || project.title || ''}
          className='h-full w-full rounded-full'
          width={80}
          height={80}
          mode='contain'
          hotspot={project.coverImage.hotspot}
          crop={project.coverImage.crop}
        />
      ) : (
        <p>{index}</p>
      )} 
    </div>
  )
}
