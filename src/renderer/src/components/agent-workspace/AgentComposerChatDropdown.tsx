import { Check, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { PopoverContent } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export function ChatDropdownContent({
  children,
  align,
  side,
  sideOffset,
  className
}: {
  children: ReactNode
  align: 'start' | 'center' | 'end'
  side: 'top' | 'right' | 'bottom' | 'left'
  sideOffset: number
  className?: string
}): React.JSX.Element {
  return (
    <PopoverContent
      align={align}
      side={side}
      sideOffset={sideOffset}
      className={cn(
        'w-72 rounded-[16px] border border-border bg-card p-1.5 text-card-foreground shadow-[0_20px_44px_rgba(0,0,0,0.42)]',
        className
      )}
    >
      <div className="grid gap-1">{children}</div>
    </PopoverContent>
  )
}

export function ChatDropdownSection({
  title,
  children
}: {
  title: string
  children: ReactNode
}): React.JSX.Element {
  return (
    <div className="grid gap-1">
      <div className="px-2.5 pb-1 pt-1.5 text-sm leading-5 text-muted-foreground">{title}</div>
      {children}
    </div>
  )
}

export function ChatDropdownSeparator(): React.JSX.Element {
  return <div className="mx-2.5 my-1 h-px bg-border" aria-hidden="true" />
}

export function ChatDropdownOption({
  label,
  description,
  selected,
  disabled = false,
  leading,
  ariaLabel,
  onSelect
}: {
  label: string
  description?: string
  selected: boolean
  disabled?: boolean
  leading?: ReactNode
  ariaLabel?: string
  onSelect?: () => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(
        'flex min-h-[34px] w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm leading-5 text-foreground transition-colors',
        selected
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent hover:text-accent-foreground',
        disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-foreground'
      )}
      onClick={onSelect}
    >
      {leading ? (
        <span className="flex size-3.5 shrink-0 items-center justify-center">{leading}</span>
      ) : null}
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="truncate">{label}</span>
        {description ? (
          <span className="truncate text-xs leading-4 text-muted-foreground">{description}</span>
        ) : null}
      </span>
      {selected ? <Check className="size-3.5 shrink-0" aria-hidden="true" /> : null}
    </button>
  )
}

export function ChatDropdownBranch({
  label,
  value,
  ariaLabel,
  onOpen
}: {
  label: string
  value: string
  ariaLabel: string
  onOpen: () => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="flex h-[34px] w-full items-center gap-2 rounded-lg px-2.5 text-left text-sm leading-5 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      onClick={onOpen}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="max-w-28 truncate text-muted-foreground">{value}</span>
      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </button>
  )
}
