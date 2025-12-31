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
      <div className='h-6 flex items-center '>
        <p className='flex '> Play Grounds Studio </p>
      </div>
      <div className='pt-8'>
        <h3 className='font-sans text-2xl mb-4'> Internal </h3>

        <ul className='border-t mb-8'>
          {Array.from({length: 3}).map((_, i) => (
            <li key={i} className=' flex cursor-pointer hover:bg-blue-500/10 border-b '>
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
          {projects.map((project, i) => (
            <li
              key={project._id ?? i}
              onClick={() => handleClick(project._id)}
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
