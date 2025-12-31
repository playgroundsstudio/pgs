'use client'
import type {Dispatch, SetStateAction} from 'react'
import cn from 'classnames'
import type {AllProjectsQueryResult} from '@/sanity.types'
import Image from '@/app/components/SanityImage'
import Avatar from '@/app/components/Avatar'
import DateComponent from '@/app/components/Date'

type ProjectContentProps = {
  mode: string
  setMode: (mode: string) => void
  setActive: (index: number) => void
  openProjectIds: string[]
  setOpenProjectIds: Dispatch<SetStateAction<string[]>>
  project: AllProjectsQueryResult[number] | undefined
  index: number
  isActive: boolean
}

export default function ProjectContent({
  mode,
  setMode,
  setActive,
  openProjectIds,
  setOpenProjectIds,
  project,
  index,
  isActive,
}: ProjectContentProps) {
  const handleClickMode = () => {
    if (mode == 'row') {
      setMode('col')
    } else {
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

  return (
    <div
      className={cn(
        'text-white/80 h-full bg-black overflow-hidden hide-scrollbar ',
        isActive ? 'overflow-scroll' : 'overflow-hidden pointer-events-none'
      )}
    >
      <div className='header sticky top-0 gap-2 p-2 leading-none bg-black/20 flex justify-between'>
        <div className='w-full'>
          <p> {project?.title ?? 'Project Title'}</p>
        </div>
        <div className='w-full flex justify-center '>
          <p> [{index}] </p>
        </div>
        <div className='flex w-full gap-2 flex justify-end'>
          <p onClick={handleClickMode} className='hover:text-red-500'>
            {' '}
            {mode == 'row' ? 'Expand' : 'Minimise'}{' '}
          </p>
          <p onClick={handleClose}> Close </p>
        </div>
      </div>
      <div className='p-2 flex flex-col gap-4'>
        {project ? (
          <>
            <div className='flex flex-col gap-2'>
              <h3 className='text-2xl leading-none font-bold font-sans'>
                {project.description}
              </h3>
              {project.excerpt && <p className='opacity-80'>{project.excerpt}</p>}
              {project.author?.firstName && project.author?.lastName ? (
                <Avatar person={project.author} date={project.date} small />
              ) : (
                <div className='text-sm text-white/50'>
                  <DateComponent dateString={project.date} />
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
