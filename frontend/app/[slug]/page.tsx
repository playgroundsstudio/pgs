import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'

import PageBuilderPage from '@/app/components/PageBuilder'
import StandaloneProjectPage from '@/app/components/StandaloneProjectPage'
import {sanityFetch} from '@/sanity/lib/live'
import {getPageQuery, pagesSlugs, projectQuery, projectPagesSlugs} from '@/sanity/lib/queries'
import {GetPageQueryResult} from '@/sanity.types'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  const [{data: pages}, {data: projects}] = await Promise.all([
    sanityFetch({query: pagesSlugs, perspective: 'published', stega: false}),
    sanityFetch({query: projectPagesSlugs, perspective: 'published', stega: false}),
  ])
  return [...pages, ...projects]
}

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const [{data: page}, {data: project}] = await Promise.all([
    sanityFetch({query: getPageQuery, params, stega: false}),
    sanityFetch({query: projectQuery, params, stega: false}),
  ])

  if (page?._id) {
    return {
      title: page.name,
      description: page.heading,
      alternates: {canonical: `/${params.slug}`},
      openGraph: {
        title: page.name ?? undefined,
        description: page.heading ?? undefined,
        url: `/${params.slug}`,
      },
    }
  }

  if (project?._id) {
    const previousImages = (await parent).openGraph?.images || []
    const ogImage = resolveOpenGraphImage(project?.coverImage)
    return {
      title: project.title,
      description: project.excerpt,
      alternates: {canonical: `/${params.slug}`},
      openGraph: {
        title: project.title ?? undefined,
        description: project.excerpt ?? undefined,
        url: `/${params.slug}`,
        images: ogImage ? [ogImage, ...previousImages] : previousImages,
      },
    }
  }

  return {}
}

export default async function Page(props: Props) {
  const params = await props.params
  const [{data: page}, {data: project}] = await Promise.all([
    sanityFetch({query: getPageQuery, params}),
    sanityFetch({query: projectQuery, params}),
  ])

  if (page?._id) {
    return (
      <div className="my-12 lg:my-24">
        <div className="">
          <div className="container">
            <div className="pb-6 border-b border-gray-100">
              <div className="max-w-3xl">
                <h1 className="">{page.heading}</h1>
                <p className="mt-4 uppercase font-medium">
                  {page.subheading}
                </p>
              </div>
            </div>
          </div>
        </div>
        <PageBuilderPage page={page as GetPageQueryResult} />
      </div>
    )
  }

  if (project?._id) {
    const projectJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.title,
      description: project.excerpt ?? project.description ?? undefined,
      datePublished: project.date ?? undefined,
    }
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(projectJsonLd)}}
        />
        <StandaloneProjectPage project={project as any} />
      </>
    )
  }

  return notFound()
}
