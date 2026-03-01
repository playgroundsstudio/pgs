'use client'
import {useRef, useState, useEffect} from 'react'
import type {Dispatch, SetStateAction} from 'react'
import type {AllProjectsQueryResult} from '@/sanity.types'

function HomeHeader({
  scrollRef,
  title,
  description,
  hasOpenProject,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>
  title: string
  description: string
  hasOpenProject: boolean
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => setScrolled(el.scrollTop > 0)
    el.addEventListener('scroll', onScroll, {passive: true})
    return () => el.removeEventListener('scroll', onScroll)
  }, [scrollRef])

  return (
    <div className='sticky top-1 z-10 h-[var(--font-size-sm--line-height)] mt-1'>
      <div className={`px-2 ${scrolled ? '' : 'w-full md:w-1/2'}`}>
        <p className='text-sm'>
          {title}{!hasOpenProject && !scrolled && description ? ` ${description}` : ''}
        </p>
      </div>
    </div>
  )
}

type HomeContentProps = {
  setActive: Dispatch<SetStateAction<number>>
  projects: AllProjectsQueryResult
  openProjectIds: string[]
  setOpenProjectIds: Dispatch<SetStateAction<string[]>>
  services: string[]
  siteTitle: string
  siteDescription: string
}

export default function HomeContent({
  setActive,
  projects,
  openProjectIds,
  setOpenProjectIds,
  services,
  siteTitle,
  siteDescription,
}: HomeContentProps) {
  const hasOpenProject = openProjectIds.length > 0
  const spaceAfterMeasurement = 'mb-16'

  function handleClick(projectId: string) {
    if (openProjectIds.includes(projectId)) {
      const existingIndex = openProjectIds.indexOf(projectId)
      setActive(existingIndex + 1)
      return
    }
    setOpenProjectIds((prev) => [projectId, ...prev])
    setActive(1)
  }

  function handleClose(e: React.MouseEvent, projectId: string) {
    e.stopPropagation()
    const projectIndex = openProjectIds.indexOf(projectId)
    setOpenProjectIds((prev) => prev.filter((id) => id !== projectId))
    setActive((prev: number) => {
      if (prev === projectIndex + 1) return Math.max(0, prev - 1)
      if (prev > projectIndex + 1) return prev - 1
      return prev
    })
  }

  const [expandedTagsId, setExpandedTagsId] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={scrollRef} className='relative bg-white h-full w-full overflow-auto'>
      <HomeHeader
        scrollRef={scrollRef}
        title={siteTitle}
        description={siteDescription}
        hasOpenProject={hasOpenProject}
      />




      <div className='pt-8 px-2'>

      {!hasOpenProject && (
        <div className={`h-[300px] flex items-center justify-center ${spaceAfterMeasurement}`}>
          <svg className='h-20' viewBox="0 0 3865 4084" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1334.65 3766.16C1108.33 3661.5 950.432 3529.76 860.947 3370.92C773.746 3211.24 770.025 3039.01 849.785 2854.23L1266.53 3046.93C1210.08 3214.07 1282.53 3344.19 1483.88 3437.3C1558.8 3471.94 1628.51 3487.12 1693 3482.85C1759.79 3477.73 1806.89 3445.51 1834.31 3386.2C1853.08 3345.62 1852.21 3304.49 1831.7 3262.8C1811.91 3219.54 1787.38 3184.52 1758.09 3157.71C1730.37 3131.63 1675.09 3085.23 1592.27 3018.51C1588.31 3014.79 1585.55 3012.56 1583.99 3011.84C1583.15 3009.56 1581.17 3007.7 1578.04 3006.25C1575.64 3003.25 1572.88 3001.03 1569.76 2999.58C1505.9 2949.21 1453.45 2906.96 1412.4 2872.82C1373.63 2837.84 1330.72 2793.38 1283.68 2739.42C1238.92 2684.62 1206.95 2632.89 1187.77 2584.23C1168.59 2535.58 1158.78 2478.94 1158.34 2414.33C1160.19 2348.87 1176.63 2282.59 1207.67 2215.47C1287.06 2043.78 1407.47 1943.16 1568.91 1913.61C1731.91 1884.78 1912.53 1916.19 2110.75 2007.85C2301.17 2095.9 2436.27 2211.42 2516.03 2354.4C2597.36 2498.1 2602.95 2656.04 2532.81 2828.22L2127.78 2640.93C2149.56 2573.33 2144.98 2511.53 2114.04 2455.54C2083.81 2397.99 2029.68 2351.17 1951.64 2315.08C1879.84 2281.89 1814.45 2269.65 1755.47 2278.37C1698.78 2286.26 1659.61 2313.62 1637.95 2360.44C1613.42 2413.51 1621.91 2464.8 1663.43 2514.31C1705.67 2562.26 1792.57 2636.55 1924.13 2737.17C2006.12 2801.6 2071.71 2858.46 2120.92 2907.74C2170.85 2955.45 2217.23 3012.89 2260.06 3080.06C2304.45 3147.95 2327.04 3219.97 2327.82 3296.12C2330.89 3371.42 2312.58 3452 2272.88 3537.85C2194.22 3707.98 2067.73 3811.48 1893.44 3848.34C1720.7 3885.93 1534.44 3858.54 1334.65 3766.16Z" fill="currentColor"/>
            <path d="M2787.59 2199.37C2527.73 2171.16 2328.45 2063.04 2189.72 1875.01C2045.09 1677.69 1988.18 1437.14 2018.98 1153.35C2051.09 857.589 2167.58 628.939 2368.47 467.395C2545.09 322.245 2763.33 263.773 3023.18 291.981C3253.97 317.034 3433.25 394.44 3561 524.199C3688.94 652.248 3757.62 816.244 3767.05 1016.19L3325.98 968.306C3317.23 889.519 3283.83 822.759 3225.78 768.024C3169.61 711.766 3093.66 678.441 2997.93 668.048C2850.9 652.088 2732.23 693.692 2641.89 792.858C2553.27 892.211 2499.5 1029.08 2480.57 1203.45C2462.01 1374.41 2488.68 1519.14 2560.57 1637.65C2632.46 1756.15 2738.5 1823.02 2878.68 1838.23C2991.52 1850.48 3086.41 1828.78 3163.37 1773.14C3242.04 1717.68 3291.23 1646.91 3310.96 1560.83L3311.51 1555.71L2967.89 1518.4L3004.08 1185.04L3768.26 1267.99L3661.36 2252.71L3343.38 2218.19L3341.68 1994.87L3336.55 1994.31C3204.79 2156.44 3021.8 2224.79 2787.59 2199.37Z" fill="currentColor"/>
            <path d="M726.73 2293.74L0 598.663L763.375 271.38C962.517 186.002 1138.98 172.092 1292.75 229.649C1451.95 286.754 1568.47 401.444 1642.33 573.717C1712.8 738.087 1717.11 894.338 1655.26 1042.47C1595 1189.92 1478.73 1300.58 1306.45 1374.44L910.541 1544.18L1153.46 2110.78L726.73 2293.74ZM768.244 1212.28L1078.81 1079.13C1153.09 1047.28 1201.97 1002 1225.45 943.29C1250.5 883.902 1248.46 820.227 1219.32 752.266C1190.19 684.305 1146.15 640.507 1087.22 620.87C1029.18 598.976 963.025 603.952 888.742 635.8L578.176 768.949L768.244 1212.28Z" fill="currentColor"/>
          </svg>
        </div>
      )}

      {!hasOpenProject && (
        <div className={`flex w-full ${spaceAfterMeasurement}`}>
          <div className='w-full'>
              <h3 className='font-sans text-sm text-td2'> Featured</h3>
              <p className='text-sm'>Robin Lambert</p>
          </div>

          <div className='w-full aspect-video bg-black/10'>

          </div>
        </div>
      )}
        <div className={spaceAfterMeasurement}>
          <h3 className='font-sans text-sm text-td2'> Projects </h3>

          <ul>
            {projects.map((project, i) => (
              <li
                key={project._id ?? i}
                onClick={() => handleClick(project._id)}
                className={`group flex py-0 cursor-pointer overflow-hidden ${openProjectIds.includes(project._id) ? 'bg-td1 text-white' : 'hover:text-td2'}`}
              >
                <div className='w-1/2 flex min-w-0'>
                  <div className='w-6 shrink-0' onClick={openProjectIds.includes(project._id) ? (e) => handleClose(e, project._id) : undefined}>
                    <p>{openProjectIds.includes(project._id) ? 'X' : i + 1}</p>
                  </div>
                  <div className='px-2 w-40 shrink-0'>
                    <p className='truncate'>{project.title ?? 'Untitled'}</p>
                  </div>
                  <div className='min-w-0 flex-1 flex'>
                    {(() => {
                      const tags = (project as any).tags?.filter(Boolean) || []
                      const isExpanded = expandedTagsId === project._id
                      if (!tags.length) return <p className='truncate text-td2'>No tags</p>
                      if (isExpanded) {
                        return (
                          <p className='truncate'>
                            {tags.map(function(t: any) { return t.title }).join(', ')}
                            <span className='ml-1 cursor-pointer hover:text-td2' onClick={function(e) { e.stopPropagation(); setExpandedTagsId(null) }}>X</span>
                          </p>
                        )
                      }
                      const first2 = tags.slice(0, 2)
                      const remaining = tags.length - 2
                      return (
                        <p className='truncate'>
                          {first2.map(function(t: any) { return t.title }).join(', ')}
                          {remaining > 0 && <span className='ml-1 cursor-pointer hover:text-td2 hover:bg-subtle' onClick={function(e) { e.stopPropagation(); setExpandedTagsId(project._id) }}>{' +' + remaining}</span>}
                        </p>
                      )
                    })()}
                  </div>
                </div>
                {expandedTagsId === project._id ? (
                  <div className='w-1/2 flex min-w-0' />
                ) : (
                  <div className='w-1/2 flex min-w-0'>
                    <div className='flex-1 min-w-0'>
                      <p className='truncate'>{(project as any).location ?? 'London, UK'}</p>
                    </div>
                    <div className='px-2 shrink-0'>
                      <p className={`whitespace-nowrap ${(project as any).status === 'completed' ? 'group-hover:text-tgreen' : 'group-hover:text-tred'}`}>{(project as any).status === 'completed' ? 'Completed' : 'In Progress'}</p>
                    </div>
                    <div className='px-2 shrink-0'>
                      <p className='whitespace-nowrap'>{project.date ? new Date(project.date).getFullYear() : '—'}</p>
                    </div>
                  </div>
                )}
              </li>  
            ))}
          </ul>
        </div>

        <div className={`${hasOpenProject ? 'block' : 'flex'} ${spaceAfterMeasurement}`}>
          {!hasOpenProject && (
            <div className='w-1/2'>
            <h3 className='font-sans text-sm text-td2'> Contact </h3>

            <ul>
              <li className='group flex py-0 cursor-pointer hover:text-td2 overflow-hidden'>
                <div className='w-40 shrink-0'>
                  <p className='truncate'>Phone</p>
                </div>
                <div className='px-2 flex-1 min-w-0'>
                  <p className='truncate'>+44 7778 4320 987</p>
                </div>
              </li>
              <li className='group flex py-0 cursor-pointer hover:text-td2 overflow-hidden'>
                <div className='w-40 shrink-0'>
                  <p className='truncate'>Email</p>
                </div>
                <div className='px-2 flex-1 min-w-0'>
                  <p className='truncate'>info@play-grounds.studio</p>
                </div>
              </li>
            </ul>
            </div>
          )}

          <div className={hasOpenProject ? 'w-full' : 'w-1/2'}>
            <h3 className='font-sans text-sm text-td2'>Enquiry</h3>
            <form className='flex flex-col gap-px'>
              <div className='relative h-[var(--font-size-sm--line-height)] flex items-center border-b-[1.5px] border-solid border-[rgba(0,0,0,0.1)]'>
                <span className='text-sm text-td1 pointer-events-none absolute left-0'>Name</span>
                <input type='text' placeholder='John Doe' className='text-sm bg-transparent h-full w-full text-right outline-none placeholder:text-td2' />
              </div>
              <div className='relative h-[var(--font-size-sm--line-height)] flex items-center border-b-[1.5px] border-solid border-[rgba(0,0,0,0.1)]'>
                <span className='text-sm text-td1 pointer-events-none absolute left-0'>Role</span>
                <input type='text' placeholder='Creative Director' className='text-sm bg-transparent h-full w-full text-right outline-none placeholder:text-td2' />
              </div>
              <div className='relative h-[var(--font-size-sm--line-height)] flex items-center border-b-[1.5px] border-solid border-[rgba(0,0,0,0.1)]'>
                <span className='text-sm text-td1 pointer-events-none absolute left-0'>Services</span>
                <select className='text-sm bg-transparent h-full w-full text-right outline-none appearance-none cursor-pointer text-td2'>
                  <option value=''>Select a service</option>
                  {services.map((service) => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
              <div className='relative h-[var(--font-size-sm--line-height)] flex items-center border-b-[1.5px] border-solid border-[rgba(0,0,0,0.1)]'>
                <span className='text-sm text-td1 pointer-events-none absolute left-0'>Budget</span>
                <input type='text' placeholder='£5,000 — £10,000' className='text-sm bg-transparent h-full w-full text-right outline-none placeholder:text-td2' />
              </div>
              <div className='min-h-[120px] flex border-b-[1.5px] border-solid border-[rgba(0,0,0,0.1)] py-2'>
                <textarea
                  placeholder='message'
                  className='text-sm bg-transparent w-full min-h-[104px] text-left outline-none placeholder:text-td2 resize-none'
                />
              </div>
              <div className='relative h-[var(--font-size-sm--line-height)] flex items-center border-b-[1.5px] border-solid border-[rgba(0,0,0,0.1)]'>
                <span className='text-sm text-td1 pointer-events-none absolute left-0'>Are you a social good company?</span>
                <select defaultValue='no' className='text-sm bg-transparent h-full w-full text-right outline-none appearance-none cursor-pointer text-td2'>
                  <option value='no'>No</option>
                  <option value='yes'>Yes</option>
                </select>
              </div>
              <button
                type='submit'
                className='mt-[var(--font-size-sm--line-height)] text-sm w-full bg-td1 text-labelcolor h-[var(--font-size-sm--line-height)] hover:opacity-80 transition-opacity'
              >
                Submit
              </button>
            </form>
          </div>
        </div>

        {!hasOpenProject && (
          <div className={spaceAfterMeasurement}>
            <h3 className='font-sans text-sm text-td2'> Socials</h3>

            <ul>
              <li className='group flex py-0 cursor-pointer hover:text-td2 overflow-hidden'>
                <div className='w-40 shrink-0'>
                  <p className='truncate'>Instagram</p>
                </div>
                <div className='px-2 flex-1 min-w-0'>
                  <p className='truncate'>@play-grounds.studio</p>
                </div>
              </li>
              <li className='group flex py-0 cursor-pointer hover:text-td2 overflow-hidden'>
                <div className='w-40 shrink-0'>
                  <p className='truncate'>X</p>
                </div>
                <div className='px-2 flex-1 min-w-0'>
                  <p className='truncate'>play-grounds-studio</p>
                </div>
              </li>
              <li className='group flex py-0 cursor-pointer hover:text-td2 overflow-hidden'>
                <div className='w-40 shrink-0'>
                  <p className='truncate'>Behance</p>
                </div>
                <div className='px-2 flex-1 min-w-0'>
                  <p className='truncate'>play-grounds-studio</p>
                </div>
              </li>
              <li className='group flex py-0 cursor-pointer hover:text-td2 overflow-hidden'>
                <div className='w-40 shrink-0'>
                  <p className='truncate'>Are.na</p>
                </div>
                <div className='px-2 flex-1 min-w-0'>
                  <p className='truncate'>playgroundsstudio</p>
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
