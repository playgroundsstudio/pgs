import {cn} from '@/app/lib/cn'
import MediaRenderer from './MediaRenderer'

type CenterMediaBlockProps = {
  block: any
  mode: string
  isActive?: boolean
}

export default function CenterMediaBlock({block, mode, isActive}: CenterMediaBlockProps) {
  return (
    <div className={cn('w-full', mode === 'col' && 'px-slotmargin')}>
      <MediaRenderer media={block.media} isActive={isActive} />
    </div>
  )
}
