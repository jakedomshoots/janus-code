import {
  BrainCircuit,
  FolderGit2,
  Globe,
  GitPullRequest,
  ListChecks,
  SquareStack,
  TerminalSquare,
  TriangleAlert,
  X,
  type LucideIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'
import type {
  AgentComposerContextManifest,
  AgentComposerContextManifestItem
} from './agent-composer-context-manifest'

export function AgentComposerContextTray({
  manifest,
  onRemoveBrowserContext,
  onRemoveVerificationCommand,
  onRemoveAgentMemoryContext
}: {
  manifest: AgentComposerContextManifest
  onRemoveBrowserContext?: () => void
  onRemoveVerificationCommand?: () => void
  onRemoveAgentMemoryContext?: () => void
}): React.JSX.Element | null {
  if (manifest.items.length === 0) {
    return null
  }

  return (
    // Keep context chips to one scrollable row so compact workspaces keep composer actions visible.
    <div
      aria-label={translate(
        'auto.components.agentWorkspace.composer.promptContext',
        'Prompt context'
      )}
      className="scrollbar-sleek mb-2 flex min-w-0 items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-muted-foreground"
    >
      <span className="shrink-0 font-medium">
        {translate('auto.components.agentWorkspace.composer.context', 'Context')}
      </span>
      {manifest.items.map((item) => (
        <ContextTrayItem
          key={item.id}
          item={item}
          onRemove={getContextRemoveHandler({
            item,
            onRemoveBrowserContext,
            onRemoveVerificationCommand,
            onRemoveAgentMemoryContext
          })}
        />
      ))}
    </div>
  )
}

function getContextRemoveHandler({
  item,
  onRemoveBrowserContext,
  onRemoveVerificationCommand,
  onRemoveAgentMemoryContext
}: {
  item: AgentComposerContextManifestItem
  onRemoveBrowserContext?: () => void
  onRemoveVerificationCommand?: () => void
  onRemoveAgentMemoryContext?: () => void
}): (() => void) | undefined {
  switch (item.kind) {
    case 'workspace':
    case 'thread':
      return undefined
    case 'browser':
      return onRemoveBrowserContext
    case 'changes':
    case 'review':
      return undefined
    case 'verification':
      return onRemoveVerificationCommand
    case 'memory':
      return onRemoveAgentMemoryContext
  }
}

function ContextTrayItem({
  item,
  onRemove
}: {
  item: AgentComposerContextManifestItem
  onRemove?: () => void
}): React.JSX.Element {
  const Icon = getContextIcon(item)
  const warning = getContextWarning(item)
  const removeLabel = onRemove ? getRemoveLabel(item) : null
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1">
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="shrink-0 text-foreground">{getContextLabel(item)}</span>
      <span className="min-w-0 truncate">{getContextDetail(item)}</span>
      {warning ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground">
          <TriangleAlert className="size-3" aria-hidden="true" />
          {warning}
        </span>
      ) : null}
      {onRemove && removeLabel ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="-mr-1 size-4 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label={removeLabel}
          title={removeLabel}
          onClick={onRemove}
        >
          <X className="size-3" aria-hidden="true" />
        </Button>
      ) : null}
    </span>
  )
}

function getContextIcon(item: AgentComposerContextManifestItem): LucideIcon {
  switch (item.kind) {
    case 'workspace':
      return FolderGit2
    case 'thread':
      return TerminalSquare
    case 'browser':
      return Globe
    case 'changes':
      return SquareStack
    case 'review':
      return GitPullRequest
    case 'verification':
      return ListChecks
    case 'memory':
      return BrainCircuit
  }
}

function getContextLabel(item: AgentComposerContextManifestItem): string {
  switch (item.kind) {
    case 'workspace':
      return translate('auto.components.agentWorkspace.composer.workspace', 'Workspace')
    case 'thread':
      return translate('auto.components.agentWorkspace.composer.threadContext', 'Thread')
    case 'browser':
      return translate('auto.components.agentWorkspace.composer.browserContext', 'Browser context')
    case 'changes':
      return translate('auto.components.agentWorkspace.composer.changesContext', 'Changes')
    case 'review':
      return translate('auto.components.agentWorkspace.composer.reviewContext', 'Review')
    case 'verification':
      return translate('auto.components.agentWorkspace.composer.verification', 'Verification')
    case 'memory':
      return translate('auto.components.agentWorkspace.composer.agentMemory', 'Agent memory')
  }
}

function getContextDetail(item: AgentComposerContextManifestItem): string {
  switch (item.kind) {
    case 'workspace':
      return [item.label, getWorkspaceHostLabel(item.hostKind), item.branchName, item.path]
        .filter(Boolean)
        .join(' · ')
    case 'thread':
      return [
        item.title,
        formatAgentTypeLabel(item.agentKind),
        formatAgentWorkspacePhase(item.phase)
      ].join(' · ')
    case 'browser':
      return item.annotationCount === 1
        ? translate('auto.components.agentWorkspace.composer.oneAnnotation', '1 annotation')
        : translate(
            'auto.components.agentWorkspace.composer.annotationCount',
            '{{count}} annotations',
            {
              count: item.annotationCount
            }
          )
    case 'changes':
      return [
        item.fileCount === 1
          ? translate('auto.components.agentWorkspace.composer.oneChangedFile', '1 file')
          : translate(
              'auto.components.agentWorkspace.composer.changedFileCount',
              '{{count}} files',
              { count: item.fileCount }
            ),
        `+${item.additions}`,
        `-${item.deletions}`
      ].join(' · ')
    case 'review':
      return `${item.providerLabel} #${item.number} · ${item.title}`
    case 'verification':
      return item.command
    case 'memory':
      return translate(
        'auto.components.agentWorkspace.composer.agentMemoryCommand',
        '{{command}} available',
        { command: item.command }
      )
  }
}

function getContextWarning(item: AgentComposerContextManifestItem): string | null {
  switch (item.kind) {
    case 'workspace':
    case 'thread':
      return item.stale
        ? translate(
            'auto.components.agentWorkspace.composer.contextSourceChanged',
            'Context source changed'
          )
        : null
    case 'browser':
      return item.stale
        ? translate(
            'auto.components.agentWorkspace.composer.browserContextChanged',
            'Browser context changed'
          )
        : null
    case 'changes':
    case 'review':
      return item.stale
        ? translate(
            'auto.components.agentWorkspace.composer.contextSourceChanged',
            'Context source changed'
          )
        : null
    case 'verification':
    case 'memory':
      return null
  }
}

function getRemoveLabel(item: AgentComposerContextManifestItem): string | null {
  switch (item.kind) {
    case 'workspace':
    case 'thread':
      return null
    case 'browser':
      return translate(
        'auto.components.agentWorkspace.composer.removeBrowserContext',
        'Remove browser context'
      )
    case 'changes':
    case 'review':
      return null
    case 'verification':
      return translate(
        'auto.components.agentWorkspace.composer.removeVerificationContext',
        'Remove verification context'
      )
    case 'memory':
      return translate(
        'auto.components.agentWorkspace.composer.removeAgentMemoryContext',
        'Remove agent memory context'
      )
  }
}

function getWorkspaceHostLabel(
  hostKind: Extract<AgentComposerContextManifestItem, { kind: 'workspace' }>['hostKind']
): string {
  switch (hostKind) {
    case 'local':
      return translate('auto.components.agentWorkspace.composer.workspaceHostLocal', 'Local')
    case 'ssh':
      return translate('auto.components.agentWorkspace.composer.workspaceHostSsh', 'SSH')
    case 'runtime':
      return translate('auto.components.agentWorkspace.composer.workspaceHostRuntime', 'Runtime')
  }
}
