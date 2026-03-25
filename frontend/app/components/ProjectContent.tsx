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
        'text-td1 h-full bg-white overflow-hidden hide-scrollbar ',
        isActive ? 'overflow-scroll' : 'overflow-hidden pointer-events-none'
      )}
    >
      <div
        className={cn(
          'absolute top-4 right-4 z-40 flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 backdrop-blur-[80px] shadow-[0_0_20px_rgba(0,0,0,0.08)] border border-black/4 transition-all duration-300 ease-out',
          isActive ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'
        )}
      >
        <button onClick={handleClickMode} className='cursor-pointer hover:text-td2' aria-label={mode == 'row' ? 'Expand' : 'Minimise'}>
          {mode == 'row' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          )}
        </button>
        <div className='w-px h-4 bg-black/10' />
        <button onClick={handleClose} className='cursor-pointer hover:text-td2' aria-label='Close'>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className='px-2 flex flex-col gap-4'>
        {project ? (
          <>
            {project.coverImage?.asset?._ref && (
              <div className='-mx-2 aspect-square overflow-hidden'>
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
            <div className='flex flex-col gap-0'>
              <h3 className='font-sans text-sm text-td2'>Title</h3>
              <h3 className='text-sm font-medium font-sans'>{project?.title ?? 'Project Title'}</h3>
            </div>
            <div className={spaceAfterMeasurement}>
              <div className='flex flex-col gap-2'>
                <div className='flex flex-col gap-0'>
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
                  <button
                    type='submit'
                    className='mt-[var(--font-size-sm--line-height)] text-sm w-full bg-td1 text-labelcolor h-[var(--font-size-sm--line-height)] hover:opacity-80 transition-opacity'
                  >
                    Sign Up
                  </button>
                </form>
              </div>
            )}
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
          <p className='text-td2'>Project not found.</p>
        )}
        <div className='h-32' />
      </div>
    </div>
  )
}
