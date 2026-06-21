export interface UseNavigationProps {
  slots: number
  effectiveMode: string
  isHoveringActiveSlot: boolean
  setActive: (value: number | ((prev: number) => number)) => void
  setOpenProjectIds: (value: string[] | ((prev: string[]) => string[])) => void
  scrollRef: React.RefObject<HTMLDivElement | null>
}

export function useNavigation({
  setActive,
  setOpenProjectIds,
}: UseNavigationProps) {
  const closeProjectTab = (tabIndex: number) => {
    if (tabIndex < 1) return
    const projectIndex = tabIndex - 1

    setOpenProjectIds((prev) => {
      const projectId = prev[projectIndex]
      if (!projectId) return prev
      return prev.filter((id) => id !== projectId)
    })

    setActive((prev: number) => {
      if (prev === tabIndex) return Math.max(0, prev - 1)
      if (prev > tabIndex) return prev - 1
      return prev
    })
  }

  return { closeProjectTab }
}
