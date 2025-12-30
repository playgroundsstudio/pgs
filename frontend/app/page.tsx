import {Suspense} from 'react'
import Link from 'next/link'
import {PortableText} from '@portabletext/react'

import GetStartedCode from '@/app/components/GetStartedCode'
import SideBySideIcons from '@/app/components/SideBySideIcons'
import {settingsQuery, allProjectsQuery} from '@/sanity/lib/queries'
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

console.log(projects)

  return (
    <>
      <Home projects={projects} />
    </>
  )
}
