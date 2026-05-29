import { useEffect, useRef, useMemo } from 'react'
import type { AllProjectsQueryResult } from '@/sanity.types'

export interface UrlMappings {
  idToSlug: Map<string, string>
  slugToId: Map<string, string>
}

export function createUrlMappings(projects: AllProjectsQueryResult): UrlMappings {
  const idToSlug = new Map(
    projects
      .filter((project) => typeof project.slug === 'string' && project.slug.length > 0)
      .map((project) => [project._id, project.slug as string])
  )

  const slugToId = new Map(
    projects
      .filter((project) => typeof project.slug === 'string' && project.slug.length > 0)
      .map((project) => [project.slug as string, project._id])
  )

  return { idToSlug, slugToId }
}

export function buildShareUrl(
  openProjectIds: string[],
  active: number,
  idToSlug: Map<string, string>
): string {
  if (typeof window === 'undefined') {
    return ''
  }

  const url = new URL(window.location.href)
  const specialIds = ['__about__', '__enquiry__']
  const panelSlugs = openProjectIds
    .map((projectId) => specialIds.includes(projectId) ? projectId : idToSlug.get(projectId))
    .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0)

  if (panelSlugs.length > 0) {
    url.searchParams.set('p', panelSlugs.join('~'))
    const safeActive = Math.min(Math.max(active, 0), panelSlugs.length)
    if (safeActive > 0) {
      url.searchParams.set('a', String(safeActive))
    } else {
      url.searchParams.delete('a')
    }
  } else {
    url.searchParams.delete('p')
    url.searchParams.delete('a')
  }

  // Remove legacy params if present.
  url.searchParams.delete('panels')
  url.searchParams.delete('active')

  return url.toString()
}

export function parseUrlParams(slugToId: Map<string, string>) {
  if (typeof window === 'undefined') {
    return { openProjectIds: [], active: 0 }
  }

  const params = new URLSearchParams(window.location.search)
  const panelsParam = params.get('p') || params.get('panels')
  const activeParam = params.get('a') || params.get('active')

  if (!panelsParam) {
    return { openProjectIds: [], active: 0 }
  }

  const nextOpenIds: string[] = []
  const panelSlugs = panelsParam
    .split(/[~,]/)
    .map((slug) => slug.trim())
    .filter(Boolean)

  const specialIds = ['__about__', '__enquiry__']
  panelSlugs.forEach((slug) => {
    if (specialIds.includes(slug)) {
      if (!nextOpenIds.includes(slug)) nextOpenIds.push(slug)
    } else {
      const projectId = slugToId.get(slug)
      if (projectId && !nextOpenIds.includes(projectId)) {
        nextOpenIds.push(projectId)
      }
    }
  })

  const parsedActive = Number(activeParam)
  const active = Number.isInteger(parsedActive) && parsedActive >= 0 && parsedActive <= nextOpenIds.length
    ? parsedActive
    : nextOpenIds.length > 0 ? 1 : 0

  return { openProjectIds: nextOpenIds, active }
}

export interface UseUrlSyncProps {
  projects: AllProjectsQueryResult
  openProjectIds: string[]
  active: number
  setOpenProjectIds: (value: string[] | ((prev: string[]) => string[])) => void
  setActive: (value: number | ((prev: number) => number)) => void
}

export function useUrlSync({
  projects,
  openProjectIds,
  active,
  setOpenProjectIds,
  setActive
}: UseUrlSyncProps) {
  const hasInitializedFromUrlRef = useRef(false)
  
  const { idToSlug, slugToId } = useMemo(
    () => createUrlMappings(projects),
    [projects]
  )

  // Initialize from URL on first load
  useEffect(() => {
    if (typeof window === 'undefined' || hasInitializedFromUrlRef.current) {
      return
    }

    const { openProjectIds: urlOpenIds, active: urlActive } = parseUrlParams(slugToId)
    
    if (urlOpenIds.length > 0) {
      setOpenProjectIds(urlOpenIds)
      setActive(urlActive)
    }

    hasInitializedFromUrlRef.current = true
  }, [slugToId, setOpenProjectIds, setActive])

  // Update URL when state changes
  useEffect(() => {
    if (typeof window === 'undefined' || !hasInitializedFromUrlRef.current) {
      return
    }

    const nextUrl = buildShareUrl(openProjectIds, active, idToSlug)
    if (!nextUrl) {
      return
    }

    const currentUrl = window.location.href
    if (nextUrl !== currentUrl) {
      window.history.replaceState({}, '', nextUrl)
    }
  }, [openProjectIds, active, idToSlug])

  return { idToSlug, slugToId, buildShareUrl: () => buildShareUrl(openProjectIds, active, idToSlug) }
}