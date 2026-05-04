import type {Dispatch, SetStateAction} from 'react'

type SlotActionsArgs = {
  mode: string
  setMode: (mode: string) => void
  setActive: Dispatch<SetStateAction<number>>
  openProjectIds: string[]
  setOpenProjectIds: Dispatch<SetStateAction<string[]>>
}

export function useSlotActions({mode, setMode, setActive, openProjectIds, setOpenProjectIds}: SlotActionsArgs) {
  function toggleMode() {
    setMode(mode === 'row' ? 'col' : 'row')
  }

  function closeSlot(projectId: string) {
    const projectIndex = openProjectIds.indexOf(projectId)
    setOpenProjectIds((prev) => prev.filter((id) => id !== projectId))
    setActive((prev: number) => {
      if (prev === projectIndex + 1) return Math.max(0, prev - 1)
      if (prev > projectIndex + 1) return prev - 1
      return prev
    })
  }

  return {toggleMode, closeSlot}
}
