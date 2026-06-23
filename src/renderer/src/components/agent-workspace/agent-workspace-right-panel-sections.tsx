import { Bot, Folder, GitBranch, Globe, Info, Laptop } from 'lucide-react'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import type { AgentWorkspaceRightPanelTab } from './agent-workspace-right-panel-state'
import { useAgentWorkspaceInstantAction } from './useAgentWorkspaceInstantAction'

const VISIBLE_ITEM_COUNT = 6
type PanelTabModel = {
  id: AgentWorkspaceRightPanelTab
  label: string
  count?: number
  available: boolean
}

export function PanelTabs({
  selectedTab,
  diffs,
  hasPlan,
  hasReview,
  onSelectedTabChange
}: {
  selectedTab: AgentWorkspaceRightPanelTab
  diffs: number
  hasPlan: boolean
  hasReview: boolean
  onSelectedTabChange: (tab: AgentWorkspaceRightPanelTab) => void
}): React.JSX.Element {
  const tabs: readonly PanelTabModel[] = [
    {
      id: 'plan',
      label: translate('auto.components.agentWorkspace.rightPanel.output', 'Output'),
      available: hasPlan
    },
    {
      id: 'diff',
      label: translate('auto.components.agentWorkspace.rightPanel.diff', 'Diff'),
      count: diffs,
      available: diffs > 0
    },
    {
      id: 'review',
      label: translate('auto.components.agentWorkspace.rightPanel.review', 'Review'),
      available: hasReview
    },
    {
      id: 'info',
      label: translate('auto.components.agentWorkspace.rightPanel.info', 'Info'),
      available: true
    },
    {
      id: 'details',
      label: translate('auto.components.agentWorkspace.rightPanel.context', 'Context'),
      available: true
    }
  ]

  return (
    <div
      className="mb-4 grid grid-cols-5 gap-1 rounded-2xl border border-border bg-background p-1"
      role="tablist"
      aria-label={translate(
        'auto.components.agentWorkspace.rightPanel.agentWorkspaceRightPanel',
        'Agent workspace right panel'
      )}
    >
      {tabs.map((tab) => (
        <PanelTabButton
          key={tab.id}
          tab={tab}
          selected={selectedTab === tab.id}
          onSelect={() => onSelectedTabChange(tab.id)}
        />
      ))}
    </div>
  )
}

function PanelTabButton({
  tab,
  selected,
  onSelect
}: {
  tab: PanelTabModel
  selected: boolean
  onSelect: () => void
}): React.JSX.Element {
  const selectAction = useAgentWorkspaceInstantAction<HTMLButtonElement>(onSelect)

  return (
    <button
      type="button"
      className={cn(
        'flex h-8 min-w-0 items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-medium transition-[background-color,color,box-shadow,transform] active:scale-[0.98]',
        selected
          ? 'bg-card text-foreground shadow-xs'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
      role="tab"
      aria-selected={selected}
      title={tab.available ? tab.label : getEmptyTabTitle(tab.label)}
      {...selectAction}
    >
      <span className="truncate">{tab.label}</span>
      {typeof tab.count === 'number' && tab.count > 0 ? (
        <span className="rounded-full bg-muted px-1 text-[10px] text-muted-foreground">
          {tab.count}
        </span>
      ) : null}
    </button>
  )
}

function getEmptyTabTitle(label: string): string {
  return translate(
    'auto.components.agentWorkspace.rightPanel.emptyTabTitle',
    '{{label}} is empty',
    {
      label
    }
  )
}

export function InfoSection({
  title,
  emptyLabel,
  children
}: {
  title: string
  emptyLabel: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <section className="min-w-0" aria-label={title}>
      <h2 className="mb-2 text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="min-w-0">{children}</div>
      <p className="hidden text-sm text-muted-foreground empty:block">{emptyLabel}</p>
    </section>
  )
}

export function EmptyPanelState({
  title,
  detail
}: {
  title: string
  detail: string
}): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-background/60 p-4 text-sm">
      <div className="font-medium text-foreground">{title}</div>
      <div className="mt-1 text-muted-foreground">{detail}</div>
    </div>
  )
}

export function ItemList({
  items,
  iconKind
}: {
  items: readonly { id: string; label: string; detail: string }[]
  iconKind: 'output' | 'subagent' | 'source'
}): React.JSX.Element {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {translate('auto.components.agentWorkspace.rightPanel.none', 'None')}
      </p>
    )
  }
  const visibleItems = items.slice(0, VISIBLE_ITEM_COUNT)
  const hiddenCount = Math.max(0, items.length - visibleItems.length)

  return (
    <div className="space-y-1">
      {visibleItems.map((item) => (
        <InfoRow key={item.id} item={item} iconKind={iconKind} />
      ))}
      {hiddenCount > 0 ? (
        <div className="px-8 pt-1 text-xs text-muted-foreground">
          {translate('auto.components.agentWorkspace.rightPanel.showMore', 'Show {{count}} more', {
            count: hiddenCount
          })}
        </div>
      ) : null}
    </div>
  )
}

function InfoRow({
  item,
  iconKind
}: {
  item: { id: string; label: string; detail: string }
  iconKind: 'output' | 'subagent' | 'source'
}): React.JSX.Element {
  return (
    <div className="flex h-10 min-w-0 items-center gap-3 rounded-xl px-1.5 text-sm text-foreground transition-colors hover:bg-background/70">
      <InfoRowIcon item={item} iconKind={iconKind} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{item.label}</div>
        <div className="truncate text-xs text-muted-foreground">{item.detail}</div>
      </div>
    </div>
  )
}

function InfoRowIcon({
  item,
  iconKind
}: {
  item: { id: string; label: string }
  iconKind: 'output' | 'subagent' | 'source'
}): React.JSX.Element {
  if (iconKind === 'subagent') {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
        <Bot className="size-4" aria-hidden="true" />
      </span>
    )
  }

  const Icon =
    iconKind === 'output'
      ? Info
      : item.id.endsWith(':branch')
        ? GitBranch
        : item.id.endsWith(':host')
          ? Laptop
          : Folder

  return (
    <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
      <Icon className="size-4" aria-hidden="true" />
    </span>
  )
}

export function SourceGlyphRow({
  sources
}: {
  sources: readonly { id: string; label: string }[]
}): React.JSX.Element | null {
  if (sources.length === 0) {
    return null
  }
  return (
    <div className="mt-3 flex items-center gap-3 px-1 text-muted-foreground" aria-hidden="true">
      {sources.map((source) => {
        const Icon = source.id.endsWith(':branch')
          ? GitBranch
          : source.id.endsWith(':host')
            ? Globe
            : Folder
        return <Icon key={source.id} className="size-4" />
      })}
    </div>
  )
}

export function SectionDivider(): React.JSX.Element {
  return <div className="my-4 h-px bg-border" />
}
