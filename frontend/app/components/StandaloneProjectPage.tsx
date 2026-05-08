'use client'
import {useState} from 'react'
import ProjectContent from '@/app/components/ProjectContent'
import type {AllProjectsQueryResult} from '@/sanity.types'

export default function StandaloneProjectPage({project}: {project: AllProjectsQueryResult[number]}) {
  const [mode, setMode] = useState('col')

  return (
    <div className='h-screen w-full bg-surface'>
      <ProjectContent
        mode={mode}
        setMode={setMode}
        setActive={() => {}}
        openProjectIds={[]}
        setOpenProjectIds={() => {}}
        project={project}
        index={0}
        isActive
        standalone
      />
    </div>
  )
}
