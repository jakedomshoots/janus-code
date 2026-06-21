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
  onSelectedTabChange,
  onOpenSourceControl,
  onOpenProjectFiles,
  onOpenAgentSessions
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
  onOpenSourceControl: () => void
  onOpenProjectFiles: () => void
  onOpenAgentSessions: () => void
}): React.JSX.Element {
  const additions = diffs.reduce((total, diff) => total + diff.additions, 0)
  const deletions = diffs.reduce((total, diff) => total + diff.deletions, 0)
  const branchName = thread?.branchName ?? project?.branchName ?? null
  const hasPlan = plan !== null

  return (
    <section
      aria-label={translate('auto.components.agentWorkspace.rightPanel.environment', 'Environment')}
    >
      <div className="mb-2 flex items-center gap-2">
        <h2 className="min-w-0 flex-1 truncate text-[13px] font-medium text-muted-foreground">
          {translate('auto.components.agentWorkspace.rightPanel.environment', 'Environment')}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="shrink-0 text-muted-foreground"
          aria-label={translate(
            'auto.components.agentWorkspace.rightPanel.addSource',
            'Add source'
          )}
          onClick={onOpenProjectFiles}
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
      <div className="space-y-1">
        <ContextChannelRow
          icon={GitPullRequestArrow}
          label={translate('auto.components.agentWorkspace.rightPanel.changes', 'Changes')}
          detail={diffs.length > 0 ? `${diffs.length}` : null}
          selected={selectedTab === 'diff'}
          onClick={onOpenSourceControl}
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
          onClick={onOpenProjectFiles}
        />
        <ContextChannelRow
          icon={GitBranch}
          label={
            branchName ??
            translate('auto.components.agentWorkspace.rightPanel.noBranch', 'No branch')
          }
          detail={branchName ? null : (project?.label ?? null)}
          selected={selectedTab === 'details'}
          onClick={onOpenSourceControl}
        />
        <ContextChannelRow
          icon={GitCommit}
          label={translate(
            'auto.components.agentWorkspace.rightPanel.commitOrPush',
            'Commit or push'
          )}
          detail={diffs.some((diff) => diff.area === 'staged') ? 'Ready' : null}
          muted={diffs.length === 0}
          selected={false}
          onClick={onOpenSourceControl}
        />
        <ContextChannelRow
          icon={GitPullRequest}
          label={translate(
            'auto.components.agentWorkspace.rightPanel.createPullRequest',
            'Create pull request'
          )}
          detail={hasReview ? 'Review ready' : null}
          selected={selectedTab === 'review'}
          onClick={onOpenSourceControl}
        />
      </div>
      <ContextChannelDivider />
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
          onClick={() => {
            if (hasPlan) {
              onSelectedTabChange('plan')
              return
            }
            onOpenAgentSessions()
          }}
        />
      </div>
      <ContextChannelDivider />
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
          onClick={() => {
            if (hasDocument) {
              onSelectedTabChange('document')
              return
            }
            onOpenProjectFiles()
          }}
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
        'flex h-8 w-full min-w-0 items-center gap-2.5 rounded-md px-2 text-left text-[13px] transition-colors',
        selected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/70',
        muted ? 'text-muted-foreground' : 'text-foreground'
      )}
      onClick={onClick}
    >
      <Icon className="size-3.5 shrink-0 text-current" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {detail ? <span className="max-w-36 truncate text-muted-foreground">{detail}</span> : null}
      {trailing}
    </button>
  )
}

function ContextChannelDivider(): React.JSX.Element {
  return <div className="my-2.5 h-px bg-border" />
}
