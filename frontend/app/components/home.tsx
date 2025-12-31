'use client'
import {useState, useRef,useEffect} from 'react'
import type {Dispatch, SetStateAction} from 'react'
import cn from 'classnames'
import type {AllProjectsQueryResult, SettingsQueryResult} from '@/sanity.types'
import Image from '@/app/components/SanityImage'
import Avatar from '@/app/components/Avatar'
import DateComponent from '@/app/components/Date'
 
export default function Home({
  projects,
  settings,
}: {
  projects: AllProjectsQueryResult
  settings: SettingsQueryResult
}) {
 
  const [mode ,setMode] = useState('row')
  const [openProjectIds, setOpenProjectIds] = useState<string[]>([])
  const [active, setActive ]=useState(0)
  const slots = 1 + openProjectIds.length

  const hasPadding = ( slots>1 && mode=='row' ) 
  console.log(hasPadding)

  return (
    <div className={cn("flex gap-2 md:gap-2", 
      mode === 'flex-row' && "flex",
      mode==='col' && "flex-col" ,
      hasPadding ? "p-2 md:p-2" :"p-0" ,
    
      'text-[12px] h-screen gap-1 transition-all relative font-mono')}>
     
      <div className='hidden flex pointer-events-none  overflow-hidden gap-2 md:p-4  fixed top-2 right-2 z-50 text-[100px] text-green-500'>
        {active}
        /{mode}
      </div>
        {Array.from({length:slots}).map((_, i) => (
          <Slot isActive={active === i}  key={i}     index={i} length={slots} setMode={setMode} setActive={setActive} active={active} mode={mode} >
                  
              { i < 1 ? (
                <HomeContent
                  setActive={setActive}
                  projects={projects}
                  openProjectIds={openProjectIds}
                  setOpenProjectIds={setOpenProjectIds}
                  isActive={ active === i } 
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
        <div className='bg-stone-300/80 backdrop-blur-2xl  flex gap-2 p-2 w-fit  overflow-scroll rounded-full  shadow-lg  hide-scrollbar  '> 
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


  const handleClick = () => {
    const nextIndex = Number(ref.current?.dataset.index)
    if (Number.isNaN(nextIndex)) {
      return
    }
    console.log('setting from  tab')
    setActive(nextIndex)
  }

  return(
    <div
      ref={ref}
      data-indextab={index} 
      onClick={()=>{setActive(index)}}
      className={ cn(`h-14 aspect-square bg-white rounded-full border-1 flex justify-center items-center shadow-lg border`,
             active == index ? "border-activeslot":"  hover:border-hoverslot "

      )}>
      {index === 0 && settings?.logo?.asset?._ref ? (
        <Image
          id={settings.logo.asset._ref}
          alt={settings.logo?.alt || 'Site logo'}
          className='h-full w-full rounded-full'
          width={80}
          height={80}
          mode='contain'
          hotspot={settings.logo.hotspot}
          crop={settings.logo.crop}
        />
      ) : project?.logo?.asset?._ref ? (
        <Image
          id={project.logo.asset._ref}
          alt={project.logo?.alt || project.title || ''}
          className='h-full w-full rounded-full'
          width={80}
          height={80}
          mode='contain'
          hotspot={project.logo.hotspot}
          crop={project.logo.crop}
        />
      ) : (
        <p>{index}</p>
      )} 
    </div>
  )
}

function Slot({children, index,length,setMode,setActive,active,mode }:{children:React.ReactNode, index:number, length:number, setMode:any, setActive:any, active:any, mode:any }){
 

  const ref = useRef<HTMLDivElement>(null)
  const numActive = Number(active)
  const slotActive = ( index=== numActive)
  const isRow = (mode==='row')
  const isVisable  = (slotActive || isRow )

  const isRounded = ( isRow && length > 1)

  console.log('---' ,slotActive, isRow, isVisable)
  
  const slotDynamicClass = cn({
        'hidden': isVisable
	});



  useEffect(() => {
    const el = document.querySelector(
      `[data-index="${active}"]`
    );

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest", // or "center"
        inline: "nearest",
      });
    }
  }, [active]);


  const handleClick = () => {

    if(active != index ){

      console.log('setting from slot')
      const nextIndex = Number(ref.current?.dataset.index)
      if (Number.isNaN(nextIndex)) {
        return
      }
      setActive(nextIndex)
      console.log( mode)
    }
  }

  


  return(
    <div
      data-index={index}
      ref={ref} 
      onClick={handleClick} 
      className={ cn(
                  
                  isRounded ? "rounded-sm":"",
                  slotActive ? " outline-1 outline-activeslot":" hover:outline-2 outline-hoverslot opacity-80 overflow-hidden ",
                  isVisable ? "block":"hidden",
                  "transition-radius h-full bg-white w-full min-w-[90vw] lg:min-w-[45vw] " )}>

        {children}
    </div>
  )
} 


function HomeContent({
  setActive,
  projects,
  openProjectIds,
  setOpenProjectIds,
}: {
  setActive: any
  projects: AllProjectsQueryResult
  openProjectIds: string[]
  setOpenProjectIds: Dispatch<SetStateAction<string[]>>
}){

  function handleClick(projectId: string) {
    if (openProjectIds.includes(projectId)) {
      const existingIndex = openProjectIds.indexOf(projectId)
      setActive(existingIndex + 1)
      return
    }
    setOpenProjectIds((prev) => [...prev, projectId])
    setActive(openProjectIds.length + 1)
  }

  return(
    <div className='p-2 pt-0'>
      <div className='h-6 flex items-center '> 
        <p className='flex '> Play Grounds Studio </p>
      </div> 
      <div className='pt-8'> 
        


        <h3 className='font-sans text-2xl mb-4'> Internal </h3>
       
         <ul className='border-t mb-8'> 
        {Array.from({length:3}).map((_,i)=>(
          <li  key={i} className=' flex cursor-pointer hover:bg-blue-500/10 border-b '>

            <div className='border-r w-13 w-4'> 
                <p> 00 </p>
            </div>
            <div className='px-2 border-r w-full '> 
              <p> About </p>
            </div>
            <div className='px-2 border-r w-full '> 
              <p> Website, Brand </p>
            </div>
            <div className='px-2 w-10 '> 
              <p> 2024 </p>
            </div>
          </li>
        ))}
        </ul>




        <h3 className='font-sans text-2xl mb-4'> Projects </h3>

        <ul className='border-t mb-8'> 
        {projects.map((project, i)=>(
          <li
            key={project._id ?? i}
            onClick={()=> handleClick(project._id)}
            className='flex cursor-pointer hover:bg-blue-500/10 border-b '
          >

            <div className='border-r w-13 w-4'> 
                <p> {i + 1} </p>
            </div>
            <div className='px-2 border-r w-full '> 
              <p> {project.title ?? 'Untitled'} </p>
            </div>
            <div className='px-2 border-r w-full '> 
              <p> {project.excerpt ?? 'Website, Brand'} </p>
            </div>
            <div className='px-2 w-10 '> 
              <p> {project.date ? new Date(project.date).getFullYear() : '—'} </p>
            </div>

          </li>

        ))}
        </ul>

        <h3 className='font-sans text-2xl mb-4'> Contact </h3>

        <ul className='border-t mb-8'> 

          <li  className='flex cursor-pointer hover:bg-blue-500/10 border-b '>
            <div className='border-r w-5 w-4'> 
                <p> T </p>
            </div>
            <div className='px-2 w-full '> 
              <p> +44 7778 4320 987 </p>
            </div>
          </li>
          <li className='flex cursor-pointer hover:bg-blue-500/10 border-b '>
            <div className='border-r w-5 w-4'> 
                <p> E </p>
            </div>
            <div className='px-2 w-full '> 
              <p> info@play-grounds.studio</p>
            </div>
          </li>


        </ul>

        <h3 className='font-sans text-2xl mb-4'> Socials</h3>

        <ul className='border-t mb-8'> 

          <li  className='flex cursor-pointer hover:bg-blue-500/10 border-b '>
            <div className='border-r w-5 w-4'> 
                <p> I </p>
            </div>
            <div className='px-2 w-full '> 
              <p>@play-grounds.studio</p>
            </div>
          </li>
          <li className='flex cursor-pointer hover:bg-blue-500/10 border-b '>
            <div className='border-r w-5 w-4'> 
                <p> X </p>
            </div>
            <div className='px-2 w-full '> 
              <p>play-grounds-studio</p>
            </div>
          </li>
            <li className='flex cursor-pointer hover:bg-blue-500/10 border-b '>
            <div className='border-r w-5 w-4'> 
                <p>BS  </p>
            </div>
            <div className='px-2 w-full '> 
              <p>play-grounds-studio</p>
            </div>
          </li>
            <li className='flex cursor-pointer hover:bg-blue-500/10 border-b '>
            <div className='border-r w-5 w-4'> 
                <p> A</p>
            </div>
            <div className='px-2 w-full '> 
              <p>playgroundsstudio</p>
            </div>
          </li>



        </ul>



        



      </div> 

    </div>
  )
}




function ProjectContent({
  mode,
  setMode,
  setActive,
  openProjectIds,
  setOpenProjectIds,
  project,
  index,
  isActive,
}: {
  mode: any
  setMode: any
  setActive: any
  openProjectIds: string[]
  setOpenProjectIds: Dispatch<SetStateAction<string[]>>
  project: AllProjectsQueryResult[number] | undefined
  index: number
  isActive: boolean
}){


  const handleClickMode =()=>{
    if(mode=='row'){
      setMode('col')
    }else{
    setMode('row')
    }
  }

  const handleClose = () => {
    const projectId = openProjectIds[index - 1]
    setOpenProjectIds((prev) => prev.filter((id) => id !== projectId))
    setActive((prevActive: number) => {
      if (prevActive === index) {
        return Math.max(0, prevActive - 1)
      }
      if (prevActive > index) {
        return prevActive - 1
      }
      return prevActive
    })
  }

  return(
      <div className={cn('text-white/80 h-full bg-black overflow-hidden hide-scrollbar ', isActive ? 'overflow-scroll':'overflow-hidden pointer-events-none')}> 
          <div className='header sticky top-0 gap-2 p-2 leading-none bg-black/20 flex justify-between'>
                <div className='w-full'> 
                    <p> {project?.title ?? 'Project Title'}</p>
                </div> 
                 <div className='w-full flex justify-center '> 
                    <p> [{index}] </p>
                </div> 
                <div className='flex w-full gap-2 flex justify-end'>
                  <p onClick={handleClickMode} className='hover:text-red-500'> {mode=="row" ? "Expand":"Minimise"} </p>
                  <p onClick={handleClose}> Close  </p>
                </div>
          </div>
          <div className='p-2 flex flex-col gap-4'>
          {project ? (
            <>
              <div className='flex flex-col gap-2'> 
                <h3 className='text-2xl leading-none font-bold font-sans'>
                  {project.description}
                </h3>
                {project.excerpt && (
                  <p className='opacity-80'>{project.excerpt}</p>
                )}
                {project.author?.firstName && project.author?.lastName ? (
                  <Avatar person={project.author} date={project.date} small />
                ) : (
                  <div className='text-sm text-white/50'>
                    <DateComponent dateString={project.date}/>
                  </div>
                )}
              </div>
              {project.gallery?.length ? (
                <div className='flex flex-col gap-4'>
                  {project.gallery.map((image, imageIndex) => {
                    if (!image?.asset?._ref) {
                      return null
                    }
                    return (
                      <div key={image._key ?? image.asset._ref ?? imageIndex} className='pc'>
                        <Image
                          id={image.asset._ref}
                          alt={image?.alt || ''}
                          className='rounded-sm w-full h-auto'
                          width={1200}
                          mode='contain'
                          hotspot={image.hotspot}
                          crop={image.crop}
                        />
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </>
          ) : (
            <p className='opacity-60'>Project not found.</p>
          )}
           
        </div>
      </div>
  )
}
