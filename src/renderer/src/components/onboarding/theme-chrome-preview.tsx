import { cn } from '@/lib/utils'
import type { GlobalSettings } from '../../../../shared/types'

export function ChromePreview({ variant }: { variant: GlobalSettings['theme'] }) {
  if (variant === 'retro95') {
    return <Retro95ChromeMock />
  }
  if (variant === 'system') {
    return (
      <div className="relative size-full">
        <div
          className="absolute inset-0"
          style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
        >
          <ChromeMock dark />
        </div>
        <div
          className="absolute inset-0"
          style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }}
        >
          <ChromeMock dark={false} />
        </div>
        <div
          aria-hidden
          className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border/70"
        />
      </div>
    )
  }
  return <ChromeMock dark={variant === 'dark'} />
}

function Retro95ChromeMock() {
  return (
    <div className="flex size-full flex-col bg-[#c0c0c0] text-[#000]">
      <div className="flex h-3 items-center justify-between bg-[#000080] px-1 text-[5px] font-bold text-white">
        <span>Janus Code</span>
        <span className="flex gap-0.5">
          <span className="grid size-2 place-items-center bg-[#c0c0c0] text-[#000]">_</span>
          <span className="grid size-2 place-items-center bg-[#c0c0c0] text-[#000]">x</span>
        </span>
      </div>
      <div className="flex min-h-0 flex-1 gap-1 p-1">
        <div className="w-[34%] bg-white shadow-[inset_1px_1px_0_#000,inset_-1px_-1px_0_#fff]">
          <div className="m-1 h-1 bg-[#000080]" />
          <div className="mx-1 mt-1 h-1 bg-[#808080]" />
          <div className="mx-1 mt-1 h-1 bg-[#808080]" />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex gap-0.5">
            <div className="h-2 w-8 bg-[#c0c0c0] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#000]" />
            <div className="h-2 w-4 bg-[#c0c0c0] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#000]" />
          </div>
          <div className="flex-1 bg-white shadow-[inset_1px_1px_0_#000,inset_-1px_-1px_0_#fff]" />
          <div className="h-3 bg-white shadow-[inset_1px_1px_0_#000,inset_-1px_-1px_0_#fff]" />
        </div>
      </div>
    </div>
  )
}

function ChromeMock({ dark }: { dark: boolean }) {
  // Tiny Orca chrome: sidebar with two rows + a content area with a tab and
  // a composer line. Pure Tailwind so it stays lightweight inside the tile.
  const bg = dark ? 'bg-[#0f1115]' : 'bg-[#f7f8fa]'
  const sidebar = dark ? 'bg-[#16181d]' : 'bg-[#eceef2]'
  const sidebarBorder = dark ? 'border-white/5' : 'border-black/5'
  const row = dark ? 'bg-white/10' : 'bg-black/10'
  const rowDim = dark ? 'bg-white/5' : 'bg-black/5'
  const tab = dark ? 'bg-[#1d2026] border-white/5' : 'bg-white border-black/5'
  const accent = 'bg-violet-500/80'
  return (
    <div className={cn('flex size-full', bg)}>
      <div className={cn('flex w-[34%] flex-col gap-1 border-r p-1.5', sidebar, sidebarBorder)}>
        <div className={cn('h-1 w-7 rounded-sm', rowDim)} />
        <div className="mt-0.5 flex items-center gap-1">
          <span className={cn('size-1 rounded-full', accent)} />
          <span className={cn('h-1 flex-1 rounded-sm', row)} />
        </div>
        <div className="flex items-center gap-1">
          <span className={cn('size-1 rounded-full', rowDim)} />
          <span className={cn('h-1 flex-1 rounded-sm', rowDim)} />
        </div>
        <div className="flex items-center gap-1">
          <span className={cn('size-1 rounded-full', rowDim)} />
          <span className={cn('h-1 w-3/4 rounded-sm', rowDim)} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-1.5">
        <div className="flex gap-1">
          <div className={cn('h-2 w-8 rounded-sm border', tab)} />
          <div className={cn('h-2 w-5 rounded-sm', rowDim)} />
        </div>
        <div className="mt-1.5 flex-1 space-y-1">
          <div className={cn('h-1 w-full rounded-sm', rowDim)} />
          <div className={cn('h-1 w-5/6 rounded-sm', rowDim)} />
          <div className={cn('h-1 w-2/3 rounded-sm', rowDim)} />
        </div>
        <div className={cn('mt-1 flex h-2.5 items-center gap-1 rounded-sm border px-1', tab)}>
          <span className={cn('size-1 rounded-full', accent)} />
          <span className={cn('h-0.5 flex-1 rounded-sm', rowDim)} />
        </div>
      </div>
    </div>
  )
}
