import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import ContactInquiryBlock from '@/app/components/ContactInquiryBlock'
import HomeHeader from '@/app/components/HomeHeader'
import PgsLogoMark from '@/app/components/PgsLogoMark'
import Image from '@/app/components/SanityImage'
import {sanityFetch} from '@/sanity/lib/live'
import {aboutPgsQuery, tagPageQuery, tagPagesSlugs} from '@/sanity/lib/queries'

type Props = {
  params: Promise<{slug: string}>
}

type GalleryImage = {
  _key?: string
  asset?: {_ref?: string}
  alt?: string
  hotspot?: {x: number; y: number}
  crop?: {top: number; bottom: number; left: number; right: number}
}

type TagProject = {
  _id: string
  title?: string | null
  coverImage?: GalleryImage | null
  gallery?: GalleryImage[] | null
}

type GridImage = GalleryImage & {
  key: string
  projectTitle: string
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: tagPagesSlugs,
    perspective: 'published',
    stega: false,
  })
  return data
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const {data: tag} = (await sanityFetch({
    query: tagPageQuery,
    params,
    stega: false,
  })) as {data: Record<string, any> | null}

  if (!tag?._id) {
    return {
      title: 'Tag',
      description: 'Tagged work',
    }
  }

  const title = (tag as any).pageTitle || (tag as any).title || 'Tag'
  const description = (tag as any).description || `Explore work tagged ${title}.`
  const slug = (tag as any).slug || params.slug

  return {
    title: `${title} | Tag`,
    description,
    alternates: {
      canonical: `/tags/${slug}`,
    },
    openGraph: {
      title: `${title} | Tag`,
      description,
      type: 'website',
      url: `/tags/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Tag`,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function TagPage(props: Props) {
  const params = await props.params
  const [{data: tag}, {data: aboutPgs}] = (await Promise.all([
    sanityFetch({query: tagPageQuery, params}),
    sanityFetch({query: aboutPgsQuery}),
  ])) as [{data: Record<string, any> | null}, {data: Record<string, any> | null}]

  if (!tag?._id) {
    return notFound()
  }

  const projects: TagProject[] = Array.isArray((tag as any).projects) ? ((tag as any).projects as TagProject[]) : []

  const images: GridImage[] = projects.flatMap((project) => {
    const projectTitle = project.title ?? 'Untitled'
    const galleryImages: GalleryImage[] = Array.isArray(project.gallery) ? project.gallery : []
    const cover = project.coverImage?.asset?._ref ? [{...project.coverImage}] : []
    const combined = [...cover, ...galleryImages]

    return combined
      .filter((image) => image?.asset?._ref)
      .map((image, index) => ({
        ...image,
        key: `${project._id}-${image._key ?? image.asset?._ref ?? index}`,
        projectTitle,
      }))
  })

  const title = (tag as any).pageTitle || (tag as any).title || 'Tag'
  const headerTitle = (aboutPgs as any)?.title || ''
  const headerDescription = (aboutPgs as any)?.description || ''
  const services =
    Array.isArray((aboutPgs as any)?.services)
      ? ((aboutPgs as any).services as Array<{title?: string | null}>)
          .map((service) => service?.title)
          .filter((service): service is string => typeof service === 'string' && service.length > 0)
      : []
  const description = (tag as any).description || `Explore work tagged ${title}.`
  const slug = (tag as any).slug || params.slug
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: `/tags/${slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: images.map((image, index) => ({
        '@type': 'ImageObject',
        position: index + 1,
        name: image.projectTitle,
      })),
    },
  }

  return (
    <div className='h-full w-full overflow-auto bg-white'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{__html: JSON.stringify(itemListJsonLd)}}
      />
      <HomeHeader title={headerTitle} description={headerDescription} />
      <div className='px-3 pt-[200px] pb-4'>
        <h1 className='text-[100px] leading-[0.9] mb-8'>{title}</h1>
        <div className='grid grid-cols-8 gap-2'>
          {images.map((image) => (
            <div key={image.key} className='w-full bg-subtle'>
              <Image
                id={image.asset?._ref || ''}
                alt={image.alt || image.projectTitle}
                className='w-full h-auto'
                width={500}
                height={500}
                mode='contain'
                hotspot={image.hotspot}
                crop={image.crop}
              />
            </div>
          ))}
        </div>
        <ContactInquiryBlock services={services} className='mt-16' />
      </div>
      <footer className='h-[60vh] w-full flex items-end justify-start px-3 pb-4'>
        <div className='h-[40vh] w-[40vh] max-w-[90vw] max-h-[90vw] bg-black flex items-center justify-center'>
          <PgsLogoMark className='h-[45%] w-auto text-white' />
        </div>
      </footer>
    </div>
  )
}
