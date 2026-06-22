import type { TuiAgent } from '../../../../shared/types'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TabBarNewTabMenu } from '@/components/tab-bar/TabBarNewTabMenu'
import { TabGroupPaneActionChrome } from '@/components/tab-group/TabGroupPaneActionChrome'
import { useTabGroupWorkspaceModel } from '@/components/tab-group/useTabGroupWorkspaceModel'
import type { TabGroupSplitDirection } from '@/components/tab-group/TabGroupPaneActionChrome'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import type { AgentWorkspaceDraftSession } from './agent-workspace-draft-sessions'
import {
  BrowserTabPill,
  DraftSessionTab,
  ThreadTab,
  WorkbenchTabPill
} from './AgentWorkspaceThreadTabPills'
import { openMarkdownFileInActiveWorkspace } from './open-markdown-file-in-workspace'
import { useAgentWorkspaceBrowserTabStrip } from './useAgentWorkspaceBrowserTabStrip'
import { useAgentWorkspaceWorkbenchTabStrip } from './useAgentWorkspaceWorkbenchTabStrip'

export function AgentWorkspaceThreadTabs({
  activeWorktreeId,
  paneLabel,
  threads,
  selectedThreadId,
  draftSessions,
  selectedDraftSessionId,
  hasSplitPanes,
  onFocusPane,
  onSelectThread,
  onCloseThread,
  onSelectDraftSession,
  onCloseDraftSession,
  browserAvailable,
  browserWorkbenchActive,
  tabGroupWorkbenchActive,
  onOpenBrowserWorkbench,
  onDismissWorkbenchSurface,
  onBeginDraftAgentSession,
  onOpenTerminalDrawer,
  onSplitPane,
  onClosePane
}: {
  activeWorktreeId: string | null
  paneLabel: string
  threads: readonly AgentWorkspaceThread[]
  selectedThreadId: string | null
  draftSessions: readonly AgentWorkspaceDraftSession[]
  selectedDraftSessionId: string | null
  hasSplitPanes: boolean
  onFocusPane: () => void
  onSelectThread: (threadId: string) => void
  onCloseThread: (threadId: string) => void
  onSelectDraftSession: (draftSessionId: string) => void
  onCloseDraftSession: (draftSessionId: string) => void
  browserAvailable: boolean
  browserWorkbenchActive: boolean
  tabGroupWorkbenchActive: boolean
  onOpenBrowserWorkbench: (options?: {
    createNewTab?: boolean
    browserTabId?: string
    keepAgentSessionVisible?: boolean
  }) => void
  onDismissWorkbenchSurface: () => void
  onBeginDraftAgentSession: (agent: TuiAgent) => void
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
  onSplitPane: (direction: TabGroupSplitDirection) => void
  onClosePane: () => void
}): React.JSX.Element {
  const workbenchSurfaceActive = browserWorkbenchActive || tabGroupWorkbenchActive
  const draftSessionActive = selectedThreadId === null && selectedDraftSessionId !== null
  const focusedGroupId = useAppStore((state) =>
    activeWorktreeId
      ? (state.activeGroupIdByWorktree[activeWorktreeId] ??
        state.groupsByWorktree[activeWorktreeId]?.[0]?.id ??
        null)
      : null
  )
  const tabGroupModel = useTabGroupWorkspaceModel({
    worktreeId: activeWorktreeId ?? '',
    groupId: focusedGroupId ?? ''
  })
  const browserTabStrip = useAgentWorkspaceBrowserTabStrip({
    worktreeId: activeWorktreeId,
    groupId: focusedGroupId,
    browserWorkbenchActive,
    onOpenBrowserWorkbench,
    onDismissWorkbenchSurface
  })
  const workbenchTabStrip = useAgentWorkspaceWorkbenchTabStrip({
    worktreeId: activeWorktreeId,
    groupId: focusedGroupId,
    tabGroupWorkbenchActive,
    onDismissWorkbench: onDismissWorkbenchSurface
  })
  // Why: the floating Environment card sits over the upper-right chat area, so
  // the thread-tab command rail needs the same desktop safe gutter as messages.
  const overlayGutterClass = selectedThreadId ? 'min-[800px]:pr-[clamp(18rem,27vw,21rem)]' : null

  function openWorkbenchSurface(): void {
    onOpenTerminalDrawer?.('workbench')
  }

  return (
    <div className="h-12 shrink-0 border-b border-border/70 bg-background">
      <div
        className={cn(
          'agent-workspace-thread-tabs-rail flex h-full min-w-0 items-stretch',
          overlayGutterClass
        )}
      >
        <div
          className="scrollbar-sleek flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-4"
          role="tablist"
          aria-label={translate(
            'auto.components.agentWorkspace.threadTabs.workspaceTabs',
            'Workspace tabs'
          )}
        >
          {threads.map((thread) => (
            <ThreadTab
              key={thread.id}
              thread={thread}
              selected={!browserWorkbenchActive && thread.id === selectedThreadId}
              onSelect={() => {
                onFocusPane()
                onSelectThread(thread.id)
              }}
              onClose={() => {
                onFocusPane()
                onCloseThread(thread.id)
              }}
            />
          ))}
          {draftSessions.map((draftSession) => (
            <DraftSessionTab
              key={draftSession.id}
              draftSession={draftSession}
              selected={
                draftSessionActive &&
                !workbenchSurfaceActive &&
                draftSession.id === selectedDraftSessionId
              }
              onSelect={() => {
                onFocusPane()
                if (workbenchSurfaceActive) {
                  onDismissWorkbenchSurface()
                }
                onSelectDraftSession(draftSession.id)
              }}
              onClose={() => {
                onFocusPane()
                onCloseDraftSession(draftSession.id)
              }}
            />
          ))}
          {browserAvailable
            ? browserTabStrip.browserTabs.map((browserTab) => (
                <BrowserTabPill
                  key={browserTab.id}
                  label={browserTab.label}
                  selected={
                    browserWorkbenchActive && browserTab.id === browserTabStrip.activeBrowserTabId
                  }
                  onSelect={() => {
                    onFocusPane()
                    browserTabStrip.selectBrowserTab(browserTab.id)
                  }}
                  onClose={() => {
                    onFocusPane()
                    browserTabStrip.closeBrowserTab(browserTab.id)
                  }}
                  onDuplicate={() => {
                    onFocusPane()
                    tabGroupModel.commands.duplicateBrowserTab(browserTab.id)
                  }}
                />
              ))
            : null}
          {tabGroupWorkbenchActive
            ? workbenchTabStrip.workbenchTabs.map((workbenchTab) => (
                <WorkbenchTabPill
                  key={workbenchTab.id}
                  label={workbenchTab.label}
                  contentType={workbenchTab.contentType}
                  selected={workbenchTab.id === workbenchTabStrip.activeWorkbenchTabId}
                  onSelect={() => {
                    onFocusPane()
                    workbenchTabStrip.selectWorkbenchTab(workbenchTab.id)
                  }}
                  onClose={() => {
                    onFocusPane()
                    workbenchTabStrip.closeWorkbenchTab(workbenchTab.id)
                  }}
                />
              ))
            : null}
          {activeWorktreeId && focusedGroupId ? (
            <div
              className="shrink-0"
              onPointerDown={() => {
                onFocusPane()
              }}
            >
              <TabBarNewTabMenu
                worktreeId={activeWorktreeId}
                groupId={focusedGroupId}
                triggerClassName="my-0 h-9 w-9 rounded-xl border border-transparent bg-card/60 hover:bg-accent hover:text-foreground"
                onLaunchAgent={(agent) => {
                  onBeginDraftAgentSession(agent)
                }}
                onNewTerminalTab={() => {
                  tabGroupModel.commands.newTerminalTab()
                  onOpenTerminalDrawer?.('debug-button')
                }}
                onNewTerminalWithShell={(shell) => {
                  tabGroupModel.commands.newTerminalWithShell(shell)
                  onOpenTerminalDrawer?.('debug-button')
                }}
                onNewBrowserTab={() => {
                  onOpenBrowserWorkbench({
                    createNewTab: true,
                    keepAgentSessionVisible: false
                  })
                }}
                onNewFileTab={() => {
                  openWorkbenchSurface()
                  void tabGroupModel.commands.newFileTab()
                }}
                onOpenFileTab={() => {
                  openWorkbenchSurface()
                  void openMarkdownFileInActiveWorkspace(focusedGroupId)
                }}
                onNewSimulatorTab={() => {
                  openWorkbenchSurface()
                  tabGroupModel.commands.newSimulatorTab?.()
                }}
                onOpenEntry={tabGroupModel.commands.openEntry}
              />
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1 px-3">
          {hasSplitPanes ? (
            <span className="hidden text-[11px] text-muted-foreground lg:inline">{paneLabel}</span>
          ) : null}
          {workbenchSurfaceActive ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="hidden h-7 shrink-0 sm:inline-flex"
              onClick={() => {
                onFocusPane()
                onDismissWorkbenchSurface()
              }}
            >
              <MessageSquare className="size-3.5" aria-hidden="true" />
              {translate('auto.components.agentWorkspace.threadTabs.backToChat', 'Back to chat')}
            </Button>
          ) : null}
          {activeWorktreeId && focusedGroupId ? (
            <TabGroupPaneActionChrome
              worktreeId={activeWorktreeId}
              groupId={focusedGroupId}
              hasSplitGroups={hasSplitPanes}
              agentPaneMode={true}
              onSplit={onSplitPane}
              onCloseGroup={onClosePane}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
