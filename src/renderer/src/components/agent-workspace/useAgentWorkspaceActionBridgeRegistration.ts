import { useCallback, useEffect } from 'react'
import type { TuiAgent } from '../../../../shared/types'
import { useAppStore } from '@/store'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import { registerAgentWorkspaceActionBridge } from './agent-workspace-action-bridge'
import { openMarkdownFileInActiveWorkspace } from './open-markdown-file-in-workspace'
import type { AgentBrowserWorkbenchState } from './useAgentBrowserWorkbench'

type TabGroupCommands = {
  readonly newTerminalTab: () => void
  readonly newFileTab: () => void | Promise<void>
  readonly newSimulatorTab?: () => void
}

export function useAgentWorkspaceActionBridgeRegistration({
  activePaneId,
  activeWorktreeId,
  browserWorkbench,
  focusedGroupId,
  guiAgentWorkspaceEnabled,
  onBeginDraftAgentSession,
  onOpenTerminalDrawer,
  tabGroupCommands,
  terminalDrawerReason
}: {
  activePaneId: string
  activeWorktreeId: string | null
  browserWorkbench: AgentBrowserWorkbenchState
  focusedGroupId: string | null
  guiAgentWorkspaceEnabled: boolean
  onBeginDraftAgentSession: (agent: TuiAgent, paneId: string) => void
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
  tabGroupCommands: TabGroupCommands
  terminalDrawerReason: AgentTerminalRevealReason | null
}): void {
  const openWorkbenchSurface = useCallback(() => {
    onOpenTerminalDrawer?.('workbench')
  }, [onOpenTerminalDrawer])

  useEffect(() => {
    if (!guiAgentWorkspaceEnabled || !activeWorktreeId || !focusedGroupId) {
      registerAgentWorkspaceActionBridge(null)
      return () => {
        registerAgentWorkspaceActionBridge(null)
      }
    }

    const groupId = focusedGroupId
    registerAgentWorkspaceActionBridge({
      isActive: () => useAppStore.getState().settings?.guiAgentWorkspaceEnabled === true,
      getBrowserWorkbenchActive: () => terminalDrawerReason === 'browser',
      openBrowserWorkbench: (options) => browserWorkbench.openBrowserWorkbench(options),
      beginDraftAgentSession: (agent) => {
        onBeginDraftAgentSession(agent, activePaneId)
      },
      newTerminalTab: () => {
        tabGroupCommands.newTerminalTab()
        onOpenTerminalDrawer?.('debug-button')
      },
      newBrowserTab: () => {
        browserWorkbench.openBrowserWorkbench({
          createNewTab: true,
          keepAgentSessionVisible: false
        })
      },
      newFileTab: () => {
        openWorkbenchSurface()
        void tabGroupCommands.newFileTab()
      },
      openFileTab: () => {
        openWorkbenchSurface()
        void openMarkdownFileInActiveWorkspace(groupId)
      },
      newSimulatorTab: () => {
        openWorkbenchSurface()
        tabGroupCommands.newSimulatorTab?.()
      },
      openTerminalDrawer: (reason) => {
        onOpenTerminalDrawer?.(reason)
      },
      openWorkbenchSurface
    })

    return () => {
      registerAgentWorkspaceActionBridge(null)
    }
  }, [
    activePaneId,
    activeWorktreeId,
    browserWorkbench,
    focusedGroupId,
    guiAgentWorkspaceEnabled,
    onBeginDraftAgentSession,
    onOpenTerminalDrawer,
    openWorkbenchSurface,
    tabGroupCommands,
    terminalDrawerReason
  ])
}
