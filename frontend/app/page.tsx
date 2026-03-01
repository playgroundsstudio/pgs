import {Suspense} from 'react'
import Link from 'next/link'
import {PortableText} from '@portabletext/react'

import GetStartedCode from '@/app/components/GetStartedCode'
import SideBySideIcons from '@/app/components/SideBySideIcons'
import {settingsQuery, allProjectsQuery, aboutPgsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {dataAttr} from '@/sanity/lib/utils'
import Home from '@/app/components/home'
export default async function Page() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })
 const {data: projects} = await sanityFetch({
    query: allProjectsQuery,
  })
  const {data: aboutPgs} = await sanityFetch({
    query: aboutPgsQuery,
  })

  const about = (aboutPgs ?? null) as
    | {
        services?: Array<{title?: string | null}> | null
        title?: string | null
        description?: string | null
      }
    | null

  const services =
    about?.services
      ?.map((s: {title?: string | null}) => s.title)
      .filter((title: string | null | undefined): title is string => typeof title === 'string' && title.length > 0) ?? []
  const siteTitle = about?.title ?? ''
  const siteDescription = about?.description ?? ''

  return (
    <>
      <Home projects={projects} settings={settings} services={services} siteTitle={siteTitle} siteDescription={siteDescription} />
    </>
  )
}
