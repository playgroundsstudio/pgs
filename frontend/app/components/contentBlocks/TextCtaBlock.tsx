import {cn} from '@/app/lib/cn'
import CustomPortableText from '@/app/components/PortableText'
import ResolvedLink from '@/app/components/ResolvedLink'

type TextCtaBlockProps = {
  block: any
  mode: string
}

export default function TextCtaBlock({block, mode}: TextCtaBlockProps) {
  return (
    <div
      className={cn(
        'grid gap-2 grid-cols-1',
        mode === 'col' && 'md:grid-cols-2'
      )}
    >
      <div className='flex flex-col gap-2'>
        {block.heading && (
          <h3 className='text-sm font-medium font-sans'>{block.heading}</h3>
        )}
        {block.body && (
          <CustomPortableText value={block.body} className='text-sm' />
        )}
      </div>
      {block.button?.buttonText && (
        <div className='flex items-start'>
          <ResolvedLink
            link={block.button.link}
            className='text-sm bg-td1 text-labelcolor px-4 h-[var(--font-size-sm--line-height)] flex items-center hover:opacity-80 transition-opacity'
          >
            {block.button.buttonText}
          </ResolvedLink>
        </div>
      )}
    </div>
  )
}
