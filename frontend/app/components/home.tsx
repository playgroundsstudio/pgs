'use client'
import {useState, useRef,useEffect} from 'react'
import cn from 'classnames'
import type {AllProjectsQueryResult} from '@/sanity.types'
 
export default function Home({projects}: {projects: AllProjectsQueryResult}) {
 
  const [mode ,setMode] = useState('row')
  const [slots, setSlots]= useState(1)
  const [index, setIndex]= useState(1)
  const [active, setActive ]=useState(0)

  const hasPadding = ( slots>1 && mode=='row' ) 
  console.log(hasPadding)

  return (
    <div className={cn("flex gap-2 md:gap-4", 
      mode === 'flex-row' && "flex",
      mode==='col' && "flex-col" ,
      hasPadding ? "p-2 md:p-4" :"p-0" ,
    
      'text-[12px] h-screen gap-1 transition-all relative font-mono')}>
     
      <div className='hidden flex pointer-events-none  overflow-hidden gap-2 md:p-4  fixed top-2 right-2 z-50 text-[100px] text-green-500'>
        {active}
        /{mode}
      </div>
        {Array.from({length:slots}).map((_, i) => (
          <Slot key={i} index={i} length={slots} setMode={setMode} setActive={setActive} active={active} mode={mode}>
              { i < 1 ? (
                <HomeContent
                  slots={slots}
                  setSlots={setSlots}
                  setActive={setActive}
                  projects={projects}
                />
              ):(
                <ProjectContent mode={mode} setMode={setMode} setSlots={setSlots} index={i}/> 
              )}
          </Slot>

      ))}

     <div className= {` ${slots > 1 ? "bottom-4":"bottom-[-400px]"} transition-all flex justify-center items-center w-full fixed  left-0 right-0 hide-scrollbar `}>
        <div className='bg-white/80 backdrop-blur-2xl shadow-lg flex gap-2 p-2 w-fit bg-white overflow-scroll rounded-full  shadow-lg  hide-scrollbar  '> 

          {Array.from({length:slots}).map((_,i)=>(
            <Tab key={i} index={i} active={active} setActive={setActive}/>
          ))}
           
        </div>
    </div> 

    </div>
  )
}

function Tab({index, active, setActive}:{index:number, active:any, setActive:any}){
  
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
    
    console.log('setting from  tab')
    setActive( ref.current?.dataset.index )

  }

  return(
    <div
      ref={ref}
      data-indextab={index} 
      onClick={()=>{setActive(index)}}
      className={ cn(`h-14 aspect-square bg-white rounded-full border-2 flex justify-center items-center shadow-lg border`,
             active == index ? "border-activeslot":" border-stroke-one hover:border-hoverslot"

      )}>
      <p>{index}</p> 
    </div>
  )
}

function Slot({children, index,length,setMode,setActive,active,mode }:{children:React.ReactNode, index:number, length:number, setMode:any, setActive:any, active:any, mode:any }){
 

  const ref = useRef<HTMLDivElement>(null)
  const numActive = parseInt(active)
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
      setActive( ref.current?.dataset.index )
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
                  slotActive ? " outline-2 outline-activeslot":" hover:outline-2 outline-hoverslot opacity-90 ",
                  isVisable ? "block":"hidden",
                  "transition-radius h-full bg-white w-full min-w-[90vw] lg:min-w-[45vw] overflow-hidden" )}>

        {children}
    </div>
  )
} 


function HomeContent({
  setSlots,
  setActive,
  slots,
  projects,
}: {
  slots: number
  setSlots: any
  setActive: any
  projects: AllProjectsQueryResult
}){





  function handleClick( index: number) {
    console.log(setActive)
    setSlots((prev :number) => prev + 1)
    setActive(slots)

    console.log( 'changed from home client')
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
            onClick={()=> handleClick(i)}
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




function ProjectContent({mode, setMode, setSlots, index}:{mode:any, setMode:any, setSlots:any , index:number}){


  const handleClickMode =()=>{
    

    if(mode=='row'){
      setMode('col')
    }else{
    setMode('row')
  }

  }


  return(
      <div className=' text-white/80 h-full bg-black overflow-scroll hide-scrollbar '> 
          <div className='header sticky top-0 gap-2 p-2 leading-none bg-black/20 flex justify-between '>
        
                <div className='w-full'> 
                    <p> Project Title</p>
                </div> 
                 <div className='w-full flex justify-center '> 
                    <p> [{index}] </p>
                </div> 
                <div className='flex w-full gap-2 flex justify-end'>
                  <p onClick={handleClickMode} className='hover:text-red-500'> {mode=="row" ? "Expand":"Minimise"} </p>
                  <p onClick={()=>{setSlots ((prev:number) =>( prev-1))}}> Close  </p>
                </div>
          </div>

          <div className='p-2 flex flex-col gap-4'>

          <div> 
            <h3 className='text-2xl leading-none font-bold font-sans'>
              Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim
            </h3>
          </div>
          <div className='pc'> 
           <div className='bg-white/5 aspect-video'/>
            <p className='italic opacity-50'> Logo Mark</p>
          </div>
          <div className='pc'> 
           <div className='bg-white/5 aspect-square'/>
            <p className='italic opacity-50'> Logos Set </p>
          </div>
           <div className='pc'> 
           <div className='bg-white/5 aspect-square'/>
            <p className='italic opacity-50'> Website </p>
          </div>
           
        </div>
      </div>
  )
}
