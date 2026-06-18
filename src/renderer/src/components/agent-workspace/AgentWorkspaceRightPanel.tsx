import { Bot, Check, Folder, GitBranch, Globe, Info, Laptop, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type {
  AgentWorkspaceApproval,
  AgentWorkspaceDiffSummary,
  AgentWorkspacePlan,
  AgentWorkspaceProject,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread
} from './agent-workspace-types'
import type { AgentWorkspaceRightPanelTab } from './agent-workspace-right-panel-state'
import { buildAgentWorkspaceRightCardModel } from './agent-workspace-right-card-model'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import { useAgentWorkspaceApprovalResponse } from './useAgentWorkspaceApprovalResponse'
import { AgentWorkspaceRightPanelChanges } from './AgentWorkspaceRightPanelChanges'

const VISIBLE_ITEM_COUNT = 6

export function AgentWorkspaceRightPanel({
  project,
  thread,
  threads,
  plan,
  approval,
  diffs,
  review,
  sourceControlBusy,
  sourceControlError,
  terminalAvailable,
  onStageDiff,
  onUnstageDiff,
  onDiscardDiff,
  onCommitStaged,
  onOpenTerminalDrawer
}: {
  project: AgentWorkspaceProject | null
  thread: AgentWorkspaceThread | null
  threads: readonly AgentWorkspaceThread[]
  plan: AgentWorkspacePlan | null
  approval: AgentWorkspaceApproval | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
  sourceControlBusy?: boolean
  sourceControlError?: string | null
  terminalAvailable: boolean
  selectedTab: AgentWorkspaceRightPanelTab
  onSelectedTabChange: (tab: AgentWorkspaceRightPanelTab) => void
  onOpenDiff?: (diff: AgentWorkspaceDiffSummary) => void
  onStageDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
  onUnstageDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
  onDiscardDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
  onCommitStaged?: (message: string) => boolean | void | Promise<boolean | void>
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
}): React.JSX.Element {
  const { approvalFeedback, approvalBusy, canRespondInTerminal, handleApprovalDecision } =
    useAgentWorkspaceApprovalResponse({
      thread,
      terminalAvailable,
      onOpenTerminalDrawer
    })
  const model = buildAgentWorkspaceRightCardModel({
    project,
    thread,
    threads,
    plan,
    approval,
    diffs,
    review
  })

  return (
    <aside className="pointer-events-none relative z-10 w-[24rem] shrink-0">
      <div className="pointer-events-auto sticky top-4 mx-4 mt-4 max-h-[calc(100vh-7rem)] overflow-hidden rounded-[26px] border border-border bg-card/95 p-5 text-card-foreground shadow-xs">
        <InfoSection title="Outputs" emptyLabel="No outputs yet">
          <ItemList items={model.outputs} iconKind="output" />
        </InfoSection>
        {diffs.length > 0 ? (
          <>
            <SectionDivider />
            <AgentWorkspaceRightPanelChanges
              diffs={diffs}
              sourceControlBusy={sourceControlBusy}
              sourceControlError={sourceControlError}
              onStageDiff={onStageDiff}
              onUnstageDiff={onUnstageDiff}
              onDiscardDiff={onDiscardDiff}
              onCommitStaged={onCommitStaged}
            />
          </>
        ) : null}
        <SectionDivider />
        <InfoSection title="Subagents" emptyLabel="No active subagents">
          <ItemList items={model.subagents} iconKind="subagent" />
        </InfoSection>
        <SectionDivider />
        <InfoSection title="Sources" emptyLabel="No sources attached">
          <ItemList items={model.sources} iconKind="source" />
          <SourceGlyphRow sources={model.sources} />
        </InfoSection>
        <ApprovalActions
          approval={approval}
          canRespondInTerminal={canRespondInTerminal}
          approvalBusy={approvalBusy}
          approvalFeedback={approvalFeedback}
          onDecision={handleApprovalDecision}
        />
      </div>
    </aside>
  )
}

function InfoSection({
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

function ItemList({
  items,
  iconKind
}: {
  items: readonly { id: string; label: string; detail: string }[]
  iconKind: 'output' | 'subagent' | 'source'
}): React.JSX.Element {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">None</p>
  }
  const visibleItems = items.slice(0, VISIBLE_ITEM_COUNT)
  const hiddenCount = Math.max(0, items.length - visibleItems.length)

  return (
    <div className="space-y-1">
      {visibleItems.map((item) => (
        <InfoRow key={item.id} item={item} iconKind={iconKind} />
      ))}
      {hiddenCount > 0 ? (
        <div className="px-8 pt-1 text-xs text-muted-foreground">Show {hiddenCount} more</div>
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
    <div className="flex h-10 min-w-0 items-center gap-3 rounded-xl px-1.5 text-sm text-foreground">
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
      : item.label === 'Branch'
        ? GitBranch
        : item.label === 'Environment'
          ? Laptop
          : Folder

  return (
    <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
      <Icon className="size-4" aria-hidden="true" />
    </span>
  )
}

function SourceGlyphRow({
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
        const Icon =
          source.label === 'Branch' ? GitBranch : source.label === 'Environment' ? Globe : Folder
        return <Icon key={source.id} className="size-4" />
      })}
    </div>
  )
}

function ApprovalActions({
  approval,
  canRespondInTerminal,
  approvalBusy,
  approvalFeedback,
  onDecision
}: {
  approval: AgentWorkspaceApproval | null
  canRespondInTerminal: boolean
  approvalBusy: boolean
  approvalFeedback: string | null
  onDecision: (decision: 'approve' | 'deny') => void | Promise<void>
}): React.JSX.Element | null {
  if (approval?.status !== 'requested') {
    return null
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-background/60 p-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="default"
          size="sm"
          className="flex-1"
          disabled={!canRespondInTerminal || approvalBusy}
          onClick={() => void onDecision('approve')}
        >
          <Check className="size-3.5" aria-hidden="true" />
          Approve
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={!canRespondInTerminal || approvalBusy}
          onClick={() => void onDecision('deny')}
        >
          <X className="size-3.5" aria-hidden="true" />
          Deny
        </Button>
      </div>
      {approvalFeedback ? (
        <p className="mt-2 text-xs text-muted-foreground">{approvalFeedback}</p>
      ) : null}
    </div>
  )
}

function SectionDivider(): React.JSX.Element {
  return <div className="my-4 h-px bg-border" />
}
