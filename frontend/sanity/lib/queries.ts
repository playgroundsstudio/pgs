import {defineQuery} from 'next-sanity'

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

const projectFields = /* groq */ `
  _id,
  "draftStatus": select(_originalId in path("drafts.**") => "draft", "published"),
  "title": coalesce(title, "Untitled"),
  "slug": slug.current,
  excerpt,
  description,
  logo,
  contentBlocks[]{
    ...,
    _type == "sideBySideMedia" => {
      ...,
      leftMedia { ..., video { ..., "asset": asset-> } },
      rightMedia { ..., video { ..., "asset": asset-> } }
    },
    _type == "centerMedia" => {
      ...,
      media { ..., video { ..., "asset": asset-> } }
    },
    _type == "textCta" => {
      ...,
      button {
        ...,
        link {
          ...,
          _type == "link" => {
            "page": page->slug.current,
            "project": project->slug.current
          }
        }
      }
    }
  },
  coverImage,
  location,
  status,
  "tags": tags[]->{ title, "slug": slug.current },
  "date": coalesce(date, _updatedAt),
  "author": author->{firstName, lastName, picture},
`

const linkReference = /* groq */ `
  _type == "link" => {
    "page": page->slug.current,
    "project": project->slug.current
  }
`

const linkFields = /* groq */ `
  link {
      ...,
      ${linkReference}
      }
`

export const getPageQuery = defineQuery(`
  *[_type == 'page' && slug.current == $slug][0]{
    _id,
    _type,
    name,
    description,
    slug,
    heading,
    subheading,
    "pageBuilder": pageBuilder[]{
      ...,
      _type == "callToAction" => {
        ...,
        button {
          ...,
          ${linkFields}
        }
      },
      _type == "infoSection" => {
        content[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference}
          }
        }
      },
    },
  }
`)

export const sitemapData = defineQuery(`
  *[(_type == "page" || _type == "project" || _type == "tag") && defined(slug.current)] | order(_type asc) {
    "slug": slug.current,
    _type,
    _updatedAt,
  }
`)

export const allProjectsQuery = defineQuery(`
  *[_type == "project" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    ${projectFields}
  }
`)

export const homepageQuery = defineQuery(`
  *[_type == "homepage"][0]{
    "showreel": showreel { ..., "asset": asset-> },
    "projectList": projectList[]->{
      ${projectFields}
    }
  }
`)

export const moreProjectsQuery = defineQuery(`
  *[_type == "project" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
    ${projectFields}
  }
`)

export const projectQuery = defineQuery(`
  *[_type == "project" && slug.current == $slug] [0] {
    content[]{
    ...,
    markDefs[]{
      ...,
      ${linkReference}
    }
  },
    ${projectFields}
  }
`)

export const projectPagesSlugs = defineQuery(`
  *[_type == "project" && defined(slug.current)]
  {"slug": slug.current}
`)

export const pagesSlugs = defineQuery(`
  *[_type == "page" && defined(slug.current)]
  {"slug": slug.current}
`)

export const tagPagesSlugs = defineQuery(`
  *[_type == "tag" && defined(slug.current)]
  {"slug": slug.current}
`)

export const tagPageQuery = defineQuery(`
  *[_type == "tag" && slug.current == $slug][0]{
    _id,
    title,
    pageTitle,
    description,
    "slug": slug.current,
    "projects": *[_type == "project" && references(^._id)] | order(date desc, _updatedAt desc) {
      _id,
      "title": coalesce(title, "Untitled"),
      "slug": slug.current,
      coverImage,
      contentBlocks
    }
  }
`)

export const aboutPgsQuery = defineQuery(`
  *[_type == "aboutPgs"][0]{
    title,
    description,
    services[]{title},
    industries[]{title},
    socialProfiles[]{title, url},
    directors[]{name, jobTitle, email, "svgUrl": svg.asset->url},
    email,
    phone
  }
`)
