import {cn} from '@/app/lib/cn'

type SlotPillProps = {
  mode: string
  isVisible: boolean
  onToggleMode: () => void
  onClose?: () => void
  label?: string
}

export default function SlotPill({mode, isVisible, onToggleMode, onClose, label}: SlotPillProps) {
  const hasClose = !!onClose

  return (
    <div
      className={cn(
        'absolute top-2 right-2 z-40 flex items-center gap-2 transition-all duration-300 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'
      )}
    >
      {label && (
        <div className='h-[36px] flex items-center px-4 py-2 rounded-full bg-pill backdrop-blur-[80px] shadow-[0_0_20px_rgba(0,0,0,0.08)] border border-border-subtle font-normal text-[11px]'>
          {label}
        </div>
      )}
      <div
        className={cn(
          'flex items-center rounded-full bg-pill backdrop-blur-[80px] shadow-[0_0_20px_rgba(0,0,0,0.08)] border border-border-subtle',
          hasClose ? 'w-[36px] h-[36px] justify-center lg:w-auto lg:h-[36px] lg:min-w-[58px] lg:gap-4 lg:px-4 lg:py-2' : 'justify-center w-[36px] h-[36px]',
        )}
      >
        <button onClick={onToggleMode} className='cursor-pointer hover:text-dark-2 hidden lg:block' aria-label={mode === 'row' ? 'Expand' : 'Minimise'}>
          {mode === 'row' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          )}
        </button>
        {hasClose && (
          <button onClick={onClose} className='cursor-pointer hover:text-dark-2' aria-label='Close'>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>
    </div>
  )
}
