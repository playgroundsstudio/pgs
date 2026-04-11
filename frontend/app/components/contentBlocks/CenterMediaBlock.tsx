import MediaRenderer from './MediaRenderer'

type CenterMediaBlockProps = {
  block: any
  mode: string
  isActive?: boolean
}

export default function CenterMediaBlock({block, isActive}: CenterMediaBlockProps) {
  return (
    <div className='w-full'>
      <MediaRenderer media={block.media} isActive={isActive} />
    </div>
  )
}
