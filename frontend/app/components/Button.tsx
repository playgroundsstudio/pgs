import {cn} from '@/app/lib/cn'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({className, children, ...props}: ButtonProps) {
  return (
    <button
      className={cn(
        'text-sm w-full bg-td1 text-labelcolor h-[calc(var(--font-size-sm--line-height)*2)] hover:opacity-80 transition-opacity disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
