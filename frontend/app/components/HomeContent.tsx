'use client'
import type {Dispatch, SetStateAction} from 'react'
import type {AllProjectsQueryResult} from '@/sanity.types'

type HomeContentProps = {
  setActive: (index: number) => void
  projects: AllProjectsQueryResult
  openProjectIds: string[]
  setOpenProjectIds: Dispatch<SetStateAction<string[]>>
}

export default function HomeContent({
  setActive,
  projects,
  openProjectIds,
  setOpenProjectIds,
}: HomeContentProps) {
  function handleClick(projectId: string) {
    if (openProjectIds.includes(projectId)) {
      const existingIndex = openProjectIds.indexOf(projectId)
      setActive(existingIndex + 1)
      return
    }
    setOpenProjectIds((prev) => [projectId, ...prev])
    setActive(1)
  }

  return (
    <div className='p-2 pt-0 bg-white min-h-full'>

      <div className='h-fit flex pt-1'>

        <p className='w-full text-td2 leading-tight max-w-120'>
        <span className='flex w-full text-dt1'> Play Grounds Studio 🛝 </span> 
          Lorpsum is simply dummy text of the printing and typesetting 
          industry. Lorem Ipsum has been the industry's standard dummy 
          text ever since the 1500s, when an unknown printer took a galley 
          of type and scrambled it to make a type specimen book.
       
        </p> 
      </div>




      <div className='pt-8'>

      <div className='flex w-full '> 
          <div className='w-full'> 
              <h3 className='font-sans mb-4'> Featured Project </h3>
          </div>

          <div className='w-full aspect-square bg-black/10'>

          </div>


        </div>



        <h3 className='font-sans mb-4'> Projects </h3>

        <ul className='border-t  border-stroke-one mb-8'>
          {projects.map((project, i) => (
            <li
              key={project._id ?? i}
              onClick={() => handleClick(project._id)}
              className='flex  py-2 cursor-pointer hover:bg-blue-500/10 border-b border-stroke-one '
            >
              <div className='w-13 w-4 text-td2'>
                <p>0{i + 1} </p>
              </div>
              <div className='px-2  w-full '>
                <p> {project.title ?? 'Untitled'} </p>
              </div>
              <div className='px-2 w-full '>
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
          <li className='flex cursor-pointer hover:bg-blue-500/10 border-b '>
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
          <li className='flex cursor-pointer hover:bg-blue-500/10 border-b '>
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
