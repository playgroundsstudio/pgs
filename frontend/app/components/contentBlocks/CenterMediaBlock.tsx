import {cn} from '@/app/lib/cn'
import MediaRenderer from './MediaRenderer'

type CenterMediaBlockProps = {
  block: any
  mode: string
  isActive?: boolean
}

export default function CenterMediaBlock({block, mode, isActive}: CenterMediaBlockProps) {
  const width = block.width ?? '100'

  return (
    <div className={cn('w-full', mode === 'col' && 'px-slotmargin flex justify-center')}>
      <div className={cn(
        'w-full',
        mode === 'col' && width === '75' && 'md:w-[75%]',
        mode === 'col' && width === '50' && 'md:w-[50%]',
      )}>
        <MediaRenderer media={block.media} isActive={isActive} />
      </div>
    </div>
  )
}
