'use client'
import Link from 'next/link'
import type {Dispatch, SetStateAction} from 'react'
import {cn} from '@/app/lib/cn'
import {useSlotActions} from '@/app/hooks/useSlotActions'
import type {AllProjectsQueryResult} from '@/sanity.types'
import Image from '@/app/components/SanityImage'
import SlotPill from '@/app/components/SlotPill'
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
  standalone?: boolean
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
  standalone = false,
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

  const {toggleMode, closeSlot} = useSlotActions({mode, setMode, setActive, openProjectIds, setOpenProjectIds})

  return (
    <div
      className={cn(
        'text-dark-1 h-full overflow-hidden bg-transparent',
        isActive ? 'overflow-scroll scrollbar-none' : 'overflow-hidden pointer-events-none'
      )}
    >
      {!standalone && <SlotPill mode={mode} isVisible={isActive} onToggleMode={toggleMode} onClose={() => closeSlot(openProjectIds[index - 1])} />}
      <div className='flex flex-col gap-4 max-w-[var(--slot-content-max-width)] mx-auto w-full'>
        {project ? (
          <>
            <div className='flex flex-col gap-0'>
              {project.coverImage?.asset?._ref && (
                <Image
                  id={project.coverImage.asset._ref}
                  alt={project.coverImage?.alt || project.title || ''}
                  className='w-full h-full object-cover'
                  width={1600}
                  mode='cover'
                  hotspot={project.coverImage.hotspot}
                  crop={project.coverImage.crop}
                  palette={(project.coverImage as any).metadata?.palette}
                  isActive={isActive}
                  containerClassName={cn(
                    'aspect-square overflow-hidden',
                    mode === 'col' ? 'w-[150px] h-[150px] m-slotmargin' : 'w-full'
                  )}
                />
              )}
              <div className='flex flex-col pt-1 gap-0 px-slotmargin'>
                <div className='flex flex-col gap-0'>
                  <div className='flex gap-gutter'>
                    <h3 className='font-medium font-sans flex-1'>{project?.title ?? 'Project Title'}</h3>
                    <h3 className='font-medium font-sans flex-1'>
                      {project.description}
                    </h3>
                  </div>
                  <div className='flex gap-gutter'>
                    <h3 className='font-sans flex-1'>Tags</h3>
                    <h3 className='font-medium font-sans flex-1'>
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
                  <div className='flex gap-gutter'>
                    <h3 className='font-sans flex-1'>Date</h3>
                    <h3 className='font-medium font-sans flex-1'>
                      <DateComponent dateString={project.date} />
                    </h3>
                  </div>
                  <div className='flex gap-gutter'>
                    <h3 className='font-sans flex-1'>Link</h3>
                    <h3 className='font-medium font-sans flex-1'>
                      {(project as any).liveLink ? (
                        <a href={(project as any).liveLink} target='_blank' rel='noopener noreferrer' className='hover:text-dark-2'>
                          {(project as any).liveLink}
                        </a>
                      ) : (
                        <span className='text-dark-2'>No link</span>
                      )}
                    </h3>
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
                    isActive={isActive}
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
