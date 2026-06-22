import type { TabContentType, TuiAgent } from '../../../../shared/types'
import { Copy, FileText, Globe, Plus, Smartphone, X } from 'lucide-react'
import { memo } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { translate } from '@/i18n/i18n'
import { AgentIcon } from '@/lib/agent-catalog'
import { agentTypeToIconAgent, formatAgentTypeLabel } from '@/lib/agent-status'
import { cn } from '@/lib/utils'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import type { AgentWorkspaceDraftSession } from './agent-workspace-draft-sessions'

type WorkbenchTabPillProps = {
  label: string
  contentType: TabContentType
  selected: boolean
  onSelect: () => void
  onClose: () => void
}

export const WorkbenchTabPill = memo(function WorkbenchTabPill({
  label,
  contentType,
  selected,
  onSelect,
  onClose
}: WorkbenchTabPillProps): React.JSX.Element {
  const Icon =
    contentType === 'simulator' ? Smartphone : contentType === 'browser' ? Globe : FileText

  return (
    <div role="tab" aria-selected={selected} className={getTabPillClassName(selected)}>
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-1.5 text-left outline-none"
        onClick={onSelect}
        title={label}
      >
        <Icon className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
        <span className="truncate font-medium">{label}</span>
      </button>
      <CloseTabButton
        label={translate(
          'auto.components.agentWorkspace.threadTabs.closeWorkbenchTab',
          'Close workbench tab'
        )}
        onClose={onClose}
      />
    </div>
  )
})

type BrowserTabPillProps = {
  label: string
  selected: boolean
  onSelect: () => void
  onClose: () => void
  onDuplicate: () => void
}

export const BrowserTabPill = memo(function BrowserTabPill({
  label,
  selected,
  onSelect,
  onClose,
  onDuplicate
}: BrowserTabPillProps): React.JSX.Element {
  return (
    <div role="tab" aria-selected={selected} className={getTabPillClassName(selected)}>
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-1.5 text-left outline-none"
        onClick={onSelect}
        title={label}
      >
        <Globe className="size-3.5 shrink-0 text-blue-500" aria-hidden="true" />
        <span className="truncate font-medium">{label}</span>
      </button>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="agent-workspace-browser-tab-actions shrink-0 opacity-0 transition-opacity group-hover:opacity-70 hover:opacity-100 focus-visible:opacity-100"
            aria-label={translate(
              'auto.components.agentWorkspace.threadTabs.browserTabActions',
              'Browser tab actions'
            )}
            title={translate(
              'auto.components.agentWorkspace.threadTabs.browserTabActions',
              'Browser tab actions'
            )}
            onClick={(event) => {
              event.stopPropagation()
            }}
          >
            <span className="agent-workspace-browser-tab-actions-label text-[10px] font-semibold">
              ...
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="bottom" sideOffset={4}>
          <DropdownMenuItem
            onSelect={() => {
              onDuplicate()
            }}
          >
            <Copy className="size-4" />
            {translate(
              'auto.components.agentWorkspace.threadTabs.duplicateBrowserTab',
              'Duplicate tab'
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CloseTabButton
        label={translate(
          'auto.components.agentWorkspace.threadTabs.closeBrowserTab',
          'Close browser tab'
        )}
        onClose={onClose}
      />
    </div>
  )
})

type DraftSessionTabProps = {
  draftSession: AgentWorkspaceDraftSession
  selected: boolean
  onSelect: () => void
  onClose: () => void
}

export const DraftSessionTab = memo(function DraftSessionTab({
  draftSession,
  selected,
  onSelect,
  onClose
}: DraftSessionTabProps): React.JSX.Element {
  const label = draftSession.preferredAgent
    ? formatAgentTypeLabel(draftSession.preferredAgent)
    : translate('auto.components.agentWorkspace.threadTabs.newSession', 'New session')

  return (
    <div role="tab" aria-selected={selected} className={getTabPillClassName(selected)}>
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2 text-left outline-none"
        onClick={onSelect}
        title={label}
      >
        <DraftSessionIcon agent={draftSession.preferredAgent} />
        <span className="truncate font-medium">{label}</span>
      </button>
      <CloseTabButton
        label={translate(
          'auto.components.agentWorkspace.threadTabs.closeDraftSession',
          'Close draft session'
        )}
        onClose={onClose}
      />
    </div>
  )
})

type ThreadTabProps = {
  thread: AgentWorkspaceThread
  selected: boolean
  onSelect: () => void
  onClose: () => void
}

export const ThreadTab = memo(function ThreadTab({
  thread,
  selected,
  onSelect,
  onClose
}: ThreadTabProps): React.JSX.Element {
  return (
    <div role="tab" aria-selected={selected} className={getTabPillClassName(selected)}>
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2 text-left outline-none"
        onClick={onSelect}
        title={thread.title}
      >
        <AgentIcon agent={agentTypeToIconAgent(thread.agentKind)} size={14} />
        <span className="truncate font-medium">{thread.title}</span>
        <span className="hidden shrink-0 text-muted-foreground/80 sm:inline">
          {formatAgentTypeLabel(thread.agentKind)}
        </span>
        <span className="hidden shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground group-hover:text-foreground md:inline">
          {formatAgentWorkspacePhase(thread.phase)}
        </span>
      </button>
      <CloseTabButton
        label={translate('auto.components.agentWorkspace.threadTabs.closeThread', 'Close thread')}
        onClose={onClose}
      />
    </div>
  )
})

function DraftSessionIcon({ agent }: { agent: TuiAgent | null }): React.JSX.Element {
  return agent ? (
    <AgentIcon agent={agentTypeToIconAgent(agent)} size={14} />
  ) : (
    <Plus className="size-3.5 shrink-0" aria-hidden="true" />
  )
}

function CloseTabButton({
  label,
  onClose
}: {
  label: string
  onClose: () => void
}): React.JSX.Element {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className="shrink-0 opacity-0 transition-[background-color,color,opacity] group-hover:opacity-70 hover:opacity-100 focus-visible:opacity-100"
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation()
        onClose()
      }}
    >
      <X className="size-3" aria-hidden="true" />
    </Button>
  )
}

function getTabPillClassName(selected: boolean): string {
  return cn(
    'group relative flex h-9 max-w-72 shrink-0 items-center gap-1 overflow-hidden rounded-xl border pl-3 pr-1.5 text-xs transition-[background-color,border-color,color,box-shadow,transform] focus-within:ring-1 focus-within:ring-ring/60 active:scale-[0.99]',
    'before:absolute before:inset-y-2 before:left-1 before:w-0.5 before:rounded-full before:bg-primary before:opacity-0 before:transition-opacity',
    selected
      ? 'border-border bg-card text-foreground shadow-xs before:opacity-100'
      : 'border-transparent bg-card/45 text-muted-foreground hover:bg-accent hover:text-foreground'
  )
}
