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
  const homepageProjects = Array.isArray((homepage as {projectList?: AllProjectsQueryResult} | null)?.projectList)
    ? ((homepage as {projectList?: AllProjectsQueryResult}).projectList ?? [])
    : []
  const projects = homepageProjects.length > 0 ? homepageProjects : allProjects
  const featuredProject =
    ((homepage as {featuredProject?: AllProjectsQueryResult[number] | null} | null)?.featuredProject ?? null) ||
    projects[0] ||
    null

  return (
    <>
      <Home
        projects={projects}
        featuredProject={featuredProject}
        settings={settings}
        services={services}
        siteTitle={siteTitle}
        siteDescription={siteDescription}
      />
    </>
  )
}
