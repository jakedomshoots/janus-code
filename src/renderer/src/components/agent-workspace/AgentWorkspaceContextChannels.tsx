import {
  FileText,
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitPullRequestArrow,
  HardDrive,
  MessageCircle,
  Plus,
  type LucideIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspacePlan,
  AgentWorkspaceProject,
  AgentWorkspaceThread
} from './agent-workspace-types'
import type { AgentWorkspaceRightPanelTab } from './agent-workspace-right-panel-state'
import { SectionDivider } from './agent-workspace-right-panel-sections'

export function AgentWorkspaceContextChannels({
  thread,
  project,
  plan,
  diffs,
  sources,
  subagents,
  selectedTab,
  hasReview,
  hasDocument,
  onSelectedTabChange
}: {
  thread: AgentWorkspaceThread | null
  project: AgentWorkspaceProject | null
  plan: AgentWorkspacePlan | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  sources: number
  subagents: number
  selectedTab: AgentWorkspaceRightPanelTab
  hasReview: boolean
  hasDocument: boolean
  onSelectedTabChange: (tab: AgentWorkspaceRightPanelTab) => void
}): React.JSX.Element {
  const additions = diffs.reduce((total, diff) => total + diff.additions, 0)
  const deletions = diffs.reduce((total, diff) => total + diff.deletions, 0)
  const branchName = thread?.branchName ?? project?.branchName ?? null
  const hasPlan = plan !== null

  return (
    <section
      aria-label={translate('auto.components.agentWorkspace.rightPanel.environment', 'Environment')}
    >
      <div className="mb-3 flex items-center gap-3">
        <h2 className="min-w-0 flex-1 truncate text-sm font-medium text-muted-foreground">
          {translate('auto.components.agentWorkspace.rightPanel.environment', 'Environment')}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground"
          aria-label={translate(
            'auto.components.agentWorkspace.rightPanel.addSource',
            'Add source'
          )}
          onClick={() => onSelectedTabChange('details')}
        >
          <Plus className="size-4" aria-hidden="true" />
        </Button>
      </div>
      <div className="space-y-1">
        <ContextChannelRow
          icon={GitPullRequestArrow}
          label={translate('auto.components.agentWorkspace.rightPanel.changes', 'Changes')}
          detail={diffs.length > 0 ? `${diffs.length}` : null}
          selected={selectedTab === 'diff'}
          onClick={() => onSelectedTabChange('diff')}
          trailing={
            diffs.length > 0 ? (
              <span className="shrink-0 text-sm tabular-nums">
                <span className="text-[color:var(--git-decoration-added)]">+{additions}</span>
                <span className="ml-1 text-[color:var(--git-decoration-deleted)]">
                  -{deletions}
                </span>
              </span>
            ) : null
          }
        />
        <ContextChannelRow
          icon={HardDrive}
          label={translate('auto.components.agentWorkspace.rightPanel.worktree', 'Worktree')}
          detail={project?.label ?? thread?.cwd ?? null}
          selected={selectedTab === 'details'}
          onClick={() => onSelectedTabChange('details')}
        />
        <ContextChannelRow
          icon={GitBranch}
          label={
            branchName ??
            translate('auto.components.agentWorkspace.rightPanel.noBranch', 'No branch')
          }
          detail={branchName ? null : (project?.label ?? null)}
          selected={selectedTab === 'details'}
          onClick={() => onSelectedTabChange('details')}
        />
        <ContextChannelRow
          icon={GitCommit}
          label={translate(
            'auto.components.agentWorkspace.rightPanel.commitOrPush',
            'Commit or push'
          )}
          detail={diffs.some((diff) => diff.area === 'staged') ? 'Ready' : null}
          muted={diffs.length === 0}
          selected={selectedTab === 'diff'}
          onClick={() => onSelectedTabChange('diff')}
        />
        <ContextChannelRow
          icon={GitPullRequest}
          label={translate(
            'auto.components.agentWorkspace.rightPanel.createPullRequest',
            'Create pull request'
          )}
          detail={hasReview ? 'Review ready' : null}
          selected={selectedTab === 'review'}
          onClick={() => onSelectedTabChange(hasReview ? 'review' : 'details')}
        />
      </div>
      <SectionDivider />
      <div className="space-y-1">
        <ContextChannelRow
          icon={MessageCircle}
          label={translate('auto.components.agentWorkspace.rightPanel.sideChat', 'Side chat')}
          detail={
            subagents > 0
              ? translate(
                  'auto.components.agentWorkspace.rightPanel.agentCount',
                  '{{count}} agents',
                  {
                    count: subagents
                  }
                )
              : null
          }
          selected={selectedTab === 'plan'}
          onClick={() => onSelectedTabChange(hasPlan ? 'plan' : 'details')}
        />
      </div>
      <SectionDivider />
      <div className="space-y-1">
        <ContextChannelRow
          icon={FileText}
          label={translate('auto.components.agentWorkspace.rightPanel.sources', 'Sources')}
          detail={
            hasDocument
              ? translate('auto.components.agentWorkspace.rightPanel.document', 'Document')
              : translate(
                  'auto.components.agentWorkspace.rightPanel.sourceCount',
                  '{{count}} sources',
                  {
                    count: sources
                  }
                )
          }
          selected={selectedTab === 'document' || selectedTab === 'details'}
          onClick={() => onSelectedTabChange(hasDocument ? 'document' : 'details')}
        />
      </div>
    </section>
  )
}

function ContextChannelRow({
  icon: Icon,
  label,
  detail,
  selected,
  muted = false,
  trailing = null,
  onClick
}: {
  icon: LucideIcon
  label: string
  detail?: string | null
  selected: boolean
  muted?: boolean
  trailing?: React.ReactNode
  onClick: () => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      className={cn(
        'flex h-9 w-full min-w-0 items-center gap-3 rounded-lg px-1.5 text-left text-sm transition-colors',
        selected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/70',
        muted ? 'text-muted-foreground' : 'text-foreground'
      )}
      onClick={onClick}
    >
      <Icon className="size-4 shrink-0 text-current" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {detail ? <span className="max-w-36 truncate text-muted-foreground">{detail}</span> : null}
      {trailing}
    </button>
  )
}
