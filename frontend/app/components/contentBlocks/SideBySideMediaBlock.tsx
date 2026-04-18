import {cn} from '@/app/lib/cn'
import MediaRenderer from './MediaRenderer'

type SideBySideMediaBlockProps = {
  block: any
  mode: string
  isActive?: boolean
}

export default function SideBySideMediaBlock({block, mode, isActive}: SideBySideMediaBlockProps) {
  const highlighted: 'left' | 'right' | 'neither' = block.highlighted ?? 'neither'

  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        mode === 'col' && 'md:flex-row md:justify-between px-slotmargin'
      )}
    >
      <div
        className={cn(
          'w-full',
          mode === 'col' && highlighted === 'left' && 'md:w-[65%]',
          mode === 'col' && highlighted === 'right' && 'md:w-[30%]',
          mode === 'col' && highlighted === 'neither' && 'md:w-[calc(50%-4px)]'
        )}
      >
        <MediaRenderer media={block.leftMedia} isActive={isActive} />
      </div>
      <div
        className={cn(
          'w-full',
          mode === 'col' && highlighted === 'right' && 'md:w-[65%]',
          mode === 'col' && highlighted === 'left' && 'md:w-[30%]',
          mode === 'col' && highlighted === 'neither' && 'md:w-[calc(50%-4px)]'
        )}
      >
        <MediaRenderer media={block.rightMedia} isActive={isActive} />
      </div>
    </div>
  )
}
