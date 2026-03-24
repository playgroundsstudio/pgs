import React from 'react'

import SideBySideMediaBlock from './SideBySideMediaBlock'
import CenterMediaBlock from './CenterMediaBlock'
import TextCtaBlock from './TextCtaBlock'

type BlocksType = {
  [key: string]: React.FC<any>
}

const Blocks: BlocksType = {
  sideBySideMedia: SideBySideMediaBlock,
  centerMedia: CenterMediaBlock,
  textCta: TextCtaBlock,
}

type ProjectContentBlockRendererProps = {
  block: any
  mode: string
}

export default function ProjectContentBlockRenderer({
  block,
  mode,
}: ProjectContentBlockRendererProps) {
  if (typeof Blocks[block._type] !== 'undefined') {
    return React.createElement(Blocks[block._type], {
      key: block._key,
      block,
      mode,
    })
  }

  return (
    <div className='w-full bg-gray-100 text-center text-td1 p-20 rounded'>
      A &ldquo;{block._type}&rdquo; block hasn&apos;t been created
    </div>
  )
}
