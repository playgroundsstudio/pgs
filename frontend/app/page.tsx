import {settingsQuery, allProjectsQuery, aboutPgsQuery, homepageQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import Home from '@/app/components/home'
import type {AllProjectsQueryResult} from '@/sanity.types'
export default async function Page() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })
  const {data: allProjects} = await sanityFetch({
    query: allProjectsQuery,
  })
  const {data: aboutPgs} = await sanityFetch({
    query: aboutPgsQuery,
  })
  const {data: homepage} = await sanityFetch({
    query: homepageQuery,
  })

  const about = (aboutPgs ?? null) as
    | {
        services?: Array<{title?: string | null}> | null
        industries?: Array<{title?: string | null}> | null
        socialProfiles?: Array<{title?: string | null; url?: string | null}> | null
        email?: string | null
        phone?: string | null
        title?: string | null
        description?: string | null
      }
    | null

  const services =
    about?.services
      ?.map((s: {title?: string | null}) => s.title)
      .filter((title: string | null | undefined): title is string => typeof title === 'string' && title.length > 0) ?? []
  const industries =
    about?.industries
      ?.map((s: {title?: string | null}) => s.title)
      .filter((title: string | null | undefined): title is string => typeof title === 'string' && title.length > 0) ?? []
  const socialProfiles =
    about?.socialProfiles
      ?.filter((s): s is {title: string; url: string} => typeof s.title === 'string' && typeof s.url === 'string') ?? []
  const email = about?.email ?? ''
  const phone = about?.phone ?? ''
  const siteTitle = about?.title ?? ''
  const siteDescription = about?.description ?? ''
  const homepageProjects = Array.isArray((homepage as {projectList?: AllProjectsQueryResult} | null)?.projectList)
    ? ((homepage as {projectList?: AllProjectsQueryResult}).projectList ?? [])
    : []
  const projects = homepageProjects.length > 0 ? homepageProjects : allProjects
  const showreel = (homepage as {showreel?: {asset?: {playbackId?: string}} | null} | null)?.showreel ?? null

  return (
    <>
      <Home
        projects={projects}
        showreel={showreel}
        settings={settings}
        services={services}
        industries={industries}
        socialProfiles={socialProfiles}
        email={email}
        phone={phone}
        siteTitle={siteTitle}
        siteDescription={siteDescription}
      />
    </>
  )
}
