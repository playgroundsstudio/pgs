export const gridConfig = {
  totalCols: {default: 12, md: 10, sm: 10},
  columns: {
    index:    {default: 1, md: 2, sm: 2,  hidden: {md: false, sm: false}},
    project:  {default: 2, md: 3, sm: 5,  hidden: {md: false, sm: false}},
    tags:     {default: 3, md: 3, sm: 0,  hidden: {md: false, sm: true}},
    year:     {default: 2, md: 2, sm: 2,  hidden: {md: false,  sm: false}},
    location: {default: 2, md: 0, sm: 0,  hidden: {md: true,  sm: true}},
    status:   {default: 2, md: 4, sm: 3,  hidden: {md: false, sm: false}},
  },
} as const

export type ColKey = keyof typeof gridConfig.columns

// Tailwind needs full static class strings — can't use template interpolation
const colSpanMap: Record<number, string> = {
  1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
  5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
  9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12',
}
const mdColSpanMap: Record<number, string> = {
  1: '@max-[700px]:col-span-1', 2: '@max-[700px]:col-span-2', 3: '@max-[700px]:col-span-3',
  4: '@max-[700px]:col-span-4', 5: '@max-[700px]:col-span-5', 6: '@max-[700px]:col-span-6',
  7: '@max-[700px]:col-span-7', 8: '@max-[700px]:col-span-8', 9: '@max-[700px]:col-span-9',
  10: '@max-[700px]:col-span-10',
}
const smColSpanMap: Record<number, string> = {
  1: '@max-[550px]:col-span-1', 2: '@max-[550px]:col-span-2', 3: '@max-[550px]:col-span-3',
  4: '@max-[550px]:col-span-4', 5: '@max-[550px]:col-span-5', 6: '@max-[550px]:col-span-6',
  7: '@max-[550px]:col-span-7', 8: '@max-[550px]:col-span-8', 9: '@max-[550px]:col-span-9',
  10: '@max-[550px]:col-span-10',
}
const gridColsMap: Record<number, string> = {
  8: 'grid-cols-8', 9: 'grid-cols-9', 10: 'grid-cols-10', 11: 'grid-cols-11',
  12: 'grid-cols-12', 13: 'grid-cols-13', 14: 'grid-cols-14',
}

const colStartMap: Record<number, string> = {
  1: 'col-start-1', 2: 'col-start-2', 3: 'col-start-3', 4: 'col-start-4',
  5: 'col-start-5', 6: 'col-start-6', 7: 'col-start-7', 8: 'col-start-8',
  9: 'col-start-9', 10: 'col-start-10', 11: 'col-start-11', 12: 'col-start-12',
}

export function colClasses(key: ColKey, extra = '') {
  const col = gridConfig.columns[key]
  const classes: string[] = []

  if (col.default > 0) classes.push(colSpanMap[col.default])
  if (col.hidden.md) {
    classes.push('@max-[700px]:hidden')
  } else if (col.md > 0 && col.md !== col.default) {
    classes.push(mdColSpanMap[col.md])
  }
  if (col.hidden.sm) {
    classes.push('@max-[550px]:hidden')
  } else if (col.sm > 0 && col.sm !== (col.hidden.md ? 0 : col.md || col.default)) {
    classes.push(smColSpanMap[col.sm])
  }

  if (extra) classes.push(extra)
  return classes.join(' ')
}

export const gridCls = `grid ${gridColsMap[gridConfig.totalCols.default]} gap-gutter`

/** Returns the col-start position where the Tags column begins (1-indexed) */
export function getTagsColStart() {
  let start = 1
  const order: ColKey[] = ['index', 'project']
  for (const key of order) {
    start += gridConfig.columns[key].default
  }
  return start
}

/** Returns the number of cols from Tags onward */
export function getTagsColSpan() {
  return gridConfig.totalCols.default - getTagsColStart() + 1
}

export function tagsAlignClasses() {
  const start = getTagsColStart()
  const span = getTagsColSpan()
  return `${colStartMap[start]} ${colSpanMap[span]}`
}

// Container-query-prefixed versions for use inside @container wrappers
const cqColStartMap: Record<number, string> = {
  1: '@min-[700px]:col-start-1', 2: '@min-[700px]:col-start-2', 3: '@min-[700px]:col-start-3',
  4: '@min-[700px]:col-start-4', 5: '@min-[700px]:col-start-5', 6: '@min-[700px]:col-start-6',
  7: '@min-[700px]:col-start-7', 8: '@min-[700px]:col-start-8', 9: '@min-[700px]:col-start-9',
  10: '@min-[700px]:col-start-10', 11: '@min-[700px]:col-start-11', 12: '@min-[700px]:col-start-12',
}
const cqColSpanMap: Record<number, string> = {
  1: '@min-[700px]:col-span-1', 2: '@min-[700px]:col-span-2', 3: '@min-[700px]:col-span-3',
  4: '@min-[700px]:col-span-4', 5: '@min-[700px]:col-span-5', 6: '@min-[700px]:col-span-6',
  7: '@min-[700px]:col-span-7', 8: '@min-[700px]:col-span-8', 9: '@min-[700px]:col-span-9',
  10: '@min-[700px]:col-span-10', 11: '@min-[700px]:col-span-11', 12: '@min-[700px]:col-span-12',
}
const cqGridColsMap: Record<number, string> = {
  8: '@min-[700px]:grid-cols-8', 9: '@min-[700px]:grid-cols-9', 10: '@min-[700px]:grid-cols-10',
  11: '@min-[700px]:grid-cols-11', 12: '@min-[700px]:grid-cols-12', 13: '@min-[700px]:grid-cols-13',
  14: '@min-[700px]:grid-cols-14',
}

/** Grid class with @min-[700px] container query prefix */
export const gridClsCq = `@min-[700px]:grid ${cqGridColsMap[gridConfig.totalCols.default]} gap-gutter`

/** Tags-aligned col-start/span with @min-[700px] container query prefix */
export function tagsAlignClassesCq() {
  const start = getTagsColStart()
  const span = getTagsColSpan()
  return `${cqColStartMap[start]} ${cqColSpanMap[span]}`
}

/** Sub-grid class for content inside the tags-aligned area, with cq prefix */
export const subGridClsCq = `@min-[700px]:grid ${cqGridColsMap[getTagsColSpan()]} gap-gutter`

/** Label cols in the sub-grid (matches tags col width) */
export const subGridLabelCq = cqColSpanMap[gridConfig.columns.tags.default]

/** List area in the sub-grid: starts after label, spans the rest */
export function subGridListCq() {
  const labelCols = gridConfig.columns.tags.default
  const listStart = labelCols + 1
  const listSpan = getTagsColSpan() - labelCols
  return `${cqColStartMap[listStart]} ${cqColSpanMap[listSpan]}`
}
