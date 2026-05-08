import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'

import StandaloneProjectPage from '@/app/components/StandaloneProjectPage'
import {sanityFetch} from '@/sanity/lib/live'
import {projectPagesSlugs, projectQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: projectPagesSlugs,
    perspective: 'published',
    stega: false,
  })
  return data
}

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const {data: project} = await sanityFetch({
    query: projectQuery,
    params,
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(project?.coverImage)

  return {
    title: project?.title,
    description: project?.excerpt,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

export default async function ProjectPage(props: Props) {
  const params = await props.params
  const [{data: project}] = await Promise.all([sanityFetch({query: projectQuery, params})])

  if (!project?._id) {
    return notFound()
  }

  return <StandaloneProjectPage project={project as any} />
}
