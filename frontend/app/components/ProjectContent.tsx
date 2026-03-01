'use client'
import type {Dispatch, SetStateAction} from 'react'
import {cn} from '@/app/lib/cn'
import type {AllProjectsQueryResult} from '@/sanity.types'
import Image from '@/app/components/SanityImage'
import Avatar from '@/app/components/Avatar'
import DateComponent from '@/app/components/Date'

type ProjectContentProps = {
  mode: string
  setMode: (mode: string) => void
  setActive: Dispatch<SetStateAction<number>>
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
  type GalleryItem = {
    _key?: string
    asset?: { _ref?: string }
    alt?: string
    hotspot?: { x: number; y: number }
    crop?: { top: number; bottom: number; left: number; right: number }
  }
  const galleryItems: GalleryItem[] = Array.isArray(project?.gallery)
    ? (project?.gallery as GalleryItem[])
    : []

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
        'text-td1 h-full bg-white overflow-hidden hide-scrollbar ',
        isActive ? 'overflow-scroll' : 'overflow-hidden pointer-events-none'
      )}
    >
      <div className='header sticky top-0 h-[var(--font-size-sm--line-height)] gap-2 px-2 bg-white/90 flex items-center justify-between'>
        <div className='w-full'>
          <p> {project?.title ?? 'Project Title'}</p>
        </div>
        <div className='flex w-full gap-2 flex justify-end'>
          <p onClick={handleClickMode} className='cursor-pointer hover:text-td2'>
            {' '}
            {mode == 'row' ? 'Expand' : 'Minimise'}{' '}
          </p>
          <p onClick={handleClose} className='cursor-pointer hover:text-td2'> Close </p>
        </div>
      </div>
      <div className='px-2 flex flex-col gap-4'>
        {project ? (
          <>
            <div className='flex flex-col gap-2'>
              <h3 className='text-sm font-medium font-sans'>
                {project.description}
              </h3>
              {project.excerpt && <p className='opacity-80 text-sm'>{project.excerpt}</p>}
              {project.author?.firstName && project.author?.lastName ? (
                <Avatar person={project.author} date={project.date} small />
              ) : (
                <div className='text-sm text-td2'>
                  <DateComponent dateString={project.date} />
                </div>
              )}
            </div>
            {galleryItems.length ? (
              <div className='flex flex-col gap-4'>
                {galleryItems.map((image, imageIndex) => {
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
          <p className='text-td2'>Project not found.</p>
        )}
      </div>
    </div>
  )
}
