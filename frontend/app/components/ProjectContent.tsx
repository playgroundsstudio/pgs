'use client'
import Link from 'next/link'
import type {Dispatch, SetStateAction} from 'react'
import {cn} from '@/app/lib/cn'
import type {AllProjectsQueryResult} from '@/sanity.types'
import Image from '@/app/components/SanityImage'
import Button from '@/app/components/Button'
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
  const spaceAfterMeasurement = 'mb-16'
  const tagItems = Array.isArray((project as any)?.tags)
    ? ((project as any).tags as Array<{title?: string | null; slug?: string | null}>)
        .map((tag) => ({title: tag?.title, slug: tag?.slug}))
        .filter(
          (tag): tag is {title: string; slug: string} =>
            typeof tag.title === 'string' &&
            tag.title.length > 0 &&
            typeof tag.slug === 'string' &&
            tag.slug.length > 0
        )
    : []
  const normalizedStatus = String((project as any)?.status ?? '')
    .replace(/\s+/g, '')
    .toLowerCase()

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
      <div className='header sticky top-0 h-[var(--font-size-sm--line-height)] gap-2 px-3 z-30 flex items-center justify-between'>
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
      <div className='px-3 flex flex-col gap-4'>
        {project ? (
          <>
            {project.coverImage?.asset?._ref && (
              <div className='-mx-3 aspect-square overflow-hidden'>
                <Image
                  id={project.coverImage.asset._ref}
                  alt={project.coverImage?.alt || project.title || ''}
                  className='w-full h-full object-cover'
                  width={1600}
                  mode='cover'
                  hotspot={project.coverImage.hotspot}
                  crop={project.coverImage.crop}
                />
              </div>
            )}
            <div className={spaceAfterMeasurement}>
              <div className='flex flex-col gap-2'>
                <div className='flex flex-col gap-0 pt-8'>
                  <h3 className='font-sans text-sm text-td2'>Description</h3>
                  <h3 className='text-sm font-medium font-sans'>
                    {project.description}
                  </h3>
                </div>
                <div className='flex gap-2'>
                <div className='w-full flex flex-col gap-0'>
                  <h3 className='font-sans text-sm text-td2'>Tags</h3>
                  <h3 className='text-sm font-medium font-sans'>
                    {tagItems.length ? (
                      tagItems.map((tag, tagIndex) => (
                        <span key={tag.slug}>
                          <Link href={`/tags/${tag.slug}`} className='hover:text-td2'>
                            {tag.title}
                          </Link>
                          {tagIndex < tagItems.length - 1 ? ', ' : ''}
                        </span>
                      ))
                    ) : (
                      'No tags'
                    )}
                  </h3>
                </div>
                  <div className='w-full flex flex-col gap-0'>
                    <h3 className='font-sans text-sm text-td2'>Date</h3>
                    <h3 className='text-sm font-medium font-sans'>
                      <DateComponent dateString={project.date} />
                    </h3>
                  </div>
                </div>
                {project.excerpt && <p className='opacity-80 text-sm'>{project.excerpt}</p>}
                {project.author?.firstName && project.author?.lastName && (
                  <div className='text-sm text-td2'>
                    By {project.author.firstName} {project.author.lastName}
                  </div>
                )}
              </div>
            </div>
            {normalizedStatus !== 'completed' && (
              <div>
                <h3 className='font-sans text-sm text-td2'>Newsletter</h3>
                <form className='flex flex-col gap-px'>
                  <div className='relative h-[var(--font-size-sm--line-height)] flex items-center border-b-[1.5px] border-solid border-[rgba(0,0,0,0.1)]'>
                    <span className='text-sm text-td1 pointer-events-none absolute left-0'>Email</span>
                    <input
                      type='email'
                      placeholder='your@email.com'
                      className='text-sm bg-transparent h-full w-full text-right outline-none placeholder:text-td2'
                    />
                  </div>
                  <Button type='submit' className='mt-[var(--font-size-sm--line-height)]'>
                    Sign Up
                  </Button>
                </form>
              </div>
            )}
            {normalizedStatus === 'completed' && galleryItems.length ? (
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
        <div className='h-32' />
      </div>
    </div>
  )
}
