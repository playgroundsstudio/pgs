import MediaRenderer from './MediaRenderer'

type CenterMediaBlockProps = {
  block: any
  mode: string
}

export default function CenterMediaBlock({block}: CenterMediaBlockProps) {
  return (
    <div className='w-full'>
      <MediaRenderer media={block.media} />
    </div>
  )
}
