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

  const services = aboutPgs?.services?.map((s) => s.title).filter(Boolean) as string[] ?? []
  const siteTitle = aboutPgs?.title ?? ''
  const siteDescription = aboutPgs?.description ?? ''

  return (
    <>
      <Home projects={projects} settings={settings} services={services} siteTitle={siteTitle} siteDescription={siteDescription} />
    </>
  )
}
