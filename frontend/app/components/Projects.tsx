import Link from 'next/link'

import {studioUrl} from '@/sanity/lib/api'
import {sanityFetch} from '@/sanity/lib/live'
import {moreProjectsQuery, allProjectsQuery} from '@/sanity/lib/queries'
import {Project as ProjectType, AllProjectsQueryResult} from '@/sanity.types'
import DateComponent from '@/app/components/Date'
import OnBoarding from '@/app/components/Onboarding'
import Avatar from '@/app/components/Avatar'
import {dataAttr} from '@/sanity/lib/utils'

const Project = ({project}: {project: AllProjectsQueryResult[number]}) => {
  const {_id, title, slug, excerpt, date, author} = project

  return (
    <article
      data-sanity={dataAttr({id: _id, type: 'project', path: 'title'}).toString()}
      key={_id}
      className="border border-gray-200 rounded-sm p-6 bg-gray-50 flex flex-col justify-between transition-colors hover:bg-white relative"
    >
      <Link className="hover:text-brand underline transition-colors" href={`/projects/${slug}`}>
        <span className="absolute inset-0 z-10" />
      </Link>
      <div>
        <h3 className="text-2xl mb-4">{title}</h3>

        <p className="line-clamp-3 text-sm leading-6 text-gray-600 max-w-[70ch]">{excerpt}</p>
      </div>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        {author && author.firstName && author.lastName && (
          <div className="flex items-center">
            <Avatar person={author} small={true} />
          </div>
        )}
        <time className="text-gray-500 text-xs font-mono" dateTime={date}>
          <DateComponent dateString={date} />
        </time>
      </div>
    </article>
  )
}

const Projects = ({
  children,
  heading,
  subHeading,
}: {
  children: React.ReactNode
  heading?: string
  subHeading?: string
}) => (
  <div>
    {heading && <h2 className="text-3xl text-gray-900 sm:text-4xl lg:text-5xl">{heading}</h2>}
    {subHeading && <p className="mt-2 text-lg leading-8 text-gray-600">{subHeading}</p>}
    <div className="pt-6 space-y-6">{children}</div>
  </div>
)

export const MoreProjects = async ({skip, limit}: {skip: string; limit: number}) => {
  const {data} = await sanityFetch({
    query: moreProjectsQuery,
    params: {skip, limit},
  })

  if (!data || data.length === 0) {
    return null
  }

  return (
    <Projects heading={`Recent Projects (${data?.length})`}>
      {data?.map((project: any) => (
        <Project key={project._id} project={project} />
      ))}
    </Projects>
  )
}

export const AllProjects = async () => {
  const {data} = await sanityFetch({query: allProjectsQuery})

  if (!data || data.length === 0) {
    return <OnBoarding />
  }

  return (
    <Projects
      heading="Recent Projects"
      subHeading={`${data.length === 1 ? 'This blog project is' : `These ${data.length} blog projects are`} populated from your Sanity Studio.`}
    >
      {data.map((project: any) => (
        <Project key={project._id} project={project} />
      ))}
    </Projects>
  )
}
