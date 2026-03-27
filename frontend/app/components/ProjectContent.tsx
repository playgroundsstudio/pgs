'use client'
import Link from 'next/link'
import type {Dispatch, SetStateAction} from 'react'
import {cn} from '@/app/lib/cn'
import type {AllProjectsQueryResult} from '@/sanity.types'
import Image from '@/app/components/SanityImage'
import DateComponent from '@/app/components/Date'
import ProjectContentBlockRenderer from '@/app/components/contentBlocks/ProjectContentBlockRenderer'

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
  const contentBlocks: any[] = Array.isArray((project as any)?.contentBlocks)
    ? (project as any).contentBlocks
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
        'text-dark-1 h-full overflow-hidden hide-scrollbar ',
        isActive ? 'overflow-scroll' : 'overflow-hidden pointer-events-none'
      )}
    >
      <div
        className={cn(
          'absolute top-4 right-4 z-40 flex items-center gap-3 px-4 py-2 rounded-full bg-pill backdrop-blur-[80px] shadow-[0_0_20px_rgba(0,0,0,0.08)] border border-border-subtle transition-all duration-300 ease-out',
          isActive ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'
        )}
      >
        <button onClick={handleClickMode} className='cursor-pointer hover:text-dark-2' aria-label={mode == 'row' ? 'Expand' : 'Minimise'}>
          {mode == 'row' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          )}
        </button>
        <div className='w-px h-4 bg-divider' />
        <button onClick={handleClose} className='cursor-pointer hover:text-dark-2' aria-label='Close'>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className='px-2 flex flex-col gap-4'>
        {project ? (
          <>
            <div className={cn(
              'flex flex-col gap-4',
              mode === 'col' && 'md:flex-row md:justify-between'
            )}>
              {project.coverImage?.asset?._ref && (
                <div className={cn(
                  '-mx-2 aspect-square overflow-hidden',
                  mode === 'col' && 'md:mx-0 md:w-1/2 md:shrink-0 md:order-last'
                )}>
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
              <div className='flex flex-col gap-4 max-w-[550px]'>
                <div className='flex flex-col gap-0'>
                  <h3 className='font-sans text-dark-2'>Title</h3>
                  <h3 className='font-medium font-sans'>{project?.title ?? 'Project Title'}</h3>
                </div>
                <div className='flex flex-col gap-2'>
                  <div className='flex flex-col gap-0'>
                    <h3 className='font-sans text-dark-2'>Description</h3>
                    <h3 className='font-medium font-sans'>
                      {project.description}
                    </h3>
                  </div>
                  <div className='flex gap-2'>
                    <div className='w-full flex flex-col gap-0'>
                      <h3 className='font-sans text-dark-2'>Tags</h3>
                      <h3 className='font-medium font-sans'>
                        {tagItems.length ? (
                          tagItems.map((tag, tagIndex) => (
                            <span key={tag.slug}>
                              <Link href={`/tags/${tag.slug}`} className='hover:text-dark-2'>
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
                      <h3 className='font-sans text-dark-2'>Date</h3>
                      <h3 className='font-medium font-sans'>
                        <DateComponent dateString={project.date} />
                      </h3>
                    </div>
                  </div>
                  {project.excerpt && <p className='opacity-80'>{project.excerpt}</p>}
                </div>
              </div>
            </div>
            {contentBlocks.length > 0 && (
              <div className='flex flex-col gap-2'>
                {contentBlocks.map((block, blockIndex) => (
                  <ProjectContentBlockRenderer
                    key={block._key ?? blockIndex}
                    block={block}
                    mode={mode}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <p className='text-dark-2'>Project not found.</p>
        )}
        <div className='h-32' />
      </div>
    </div>
  )
}
