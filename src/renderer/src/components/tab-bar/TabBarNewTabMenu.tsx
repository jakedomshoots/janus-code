import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Tab, TuiAgent } from '../../../../shared/types'
import { useAppStore } from '../../store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { type AgentDetectionTarget, useDetectedAgents } from '@/hooks/useDetectedAgents'
import { launchAgentInNewTab } from '@/lib/launch-agent-in-new-tab'
import { getRuntimeEnvironmentIdForWorktree } from '@/lib/worktree-runtime-owner'
import { useShortcutLabel } from '@/hooks/useShortcutLabel'
import {
  type BuiltInWindowsTerminalShell,
  WINDOWS_GIT_BASH_SHELL
} from '../../../../shared/windows-terminal-shell'
import {
  getWindowsTerminalCapabilityOwnerKey,
  useWindowsTerminalCapabilities
} from '@/lib/windows-terminal-capabilities'
import { getActiveRuntimeTarget } from '@/runtime/runtime-rpc-client'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import TabBarCreateEntry from './TabBarCreateEntry'
import { QuickLaunchAgentMenuItems } from './QuickLaunchButton'
import { resolveWindowsShellLaunchTarget } from './windows-shell-launch'
import { buildTabAgentLaunchOptions, orderTabLaunchAgents } from './tab-agent-launch-options'
import { buildTabCreateMenuOptions, type TabCreateMenuOption } from './tab-create-menu-options'
import type { TabCreateEntryArgs } from './tab-create-entry-action'
import { useTabBarNewTabFocus } from './tab-bar-new-tab-focus'
import { TabBarStaticCreateMenuItems } from './TabBarStaticCreateMenuItems'

const isWindows = navigator.userAgent.includes('Windows')
const isMacOs = navigator.userAgent.includes('Mac')
const EMPTY_AGENT_CMD_OVERRIDES: Partial<Record<TuiAgent, string>> = {}
const EMPTY_UNIFIED_TABS: readonly Tab[] = []
const AGENT_DETECTION_LOCAL_TARGET_KEY = 'local'

export type TabBarNewTabMenuProps = {
  worktreeId: string
  groupId: string
  onNewTerminalTab: () => void
  onNewTerminalWithShell?: (shell: string) => void
  onNewBrowserTab: () => void
  onNewSimulatorTab?: () => void
  onOpenEntry?: (args: TabCreateEntryArgs) => Promise<void>
  onNewFileTab?: () => void
  onOpenFileTab?: () => void
  terminalOnly?: boolean
  showAgentLaunchItems?: boolean
  newTabMenuOrder?: 'default' | 'markdown-first'
  triggerClassName?: string
  /** GUI agent workspace routes agent picks to the composer instead of a CLI tab. */
  onLaunchAgent?: (agent: TuiAgent) => void
}

export function TabBarNewTabMenu({
  worktreeId,
  groupId,
  onNewTerminalTab,
  onNewTerminalWithShell,
  onNewBrowserTab,
  onNewSimulatorTab,
  onOpenEntry,
  onNewFileTab,
  onOpenFileTab,
  terminalOnly = false,
  showAgentLaunchItems = true,
  newTabMenuOrder = 'default',
  triggerClassName,
  onLaunchAgent
}: TabBarNewTabMenuProps): React.JSX.Element {
  const newTerminalShortcut = useShortcutLabel('tab.newTerminal')
  const newBrowserShortcut = useShortcutLabel('tab.newBrowser')
  const newSimulatorShortcut = useShortcutLabel('tab.newSimulator')
  const newFileShortcut = useShortcutLabel('tab.newMarkdown')
  const mobileEmulatorEnabled = useAppStore((s) => s.settings?.mobileEmulatorEnabled !== false)
  const unifiedTabs = useAppStore((s) => s.unifiedTabsByWorktree[worktreeId] ?? EMPTY_UNIFIED_TABS)
  const defaultWindowsShell = useAppStore(
    (s) => s.settings?.terminalWindowsShell ?? 'powershell.exe'
  )
  const defaultWindowsPowerShellImplementation = useAppStore(
    (s) => s.settings?.terminalWindowsPowerShellImplementation ?? 'auto'
  )
  const defaultAgent = useAppStore((s) => s.settings?.defaultTuiAgent)
  const agentCmdOverrides = useAppStore(
    (s) => s.settings?.agentCmdOverrides ?? EMPTY_AGENT_CMD_OVERRIDES
  )
  const activeRuntimeEnvironmentId = useAppStore(
    (s) => getRuntimeEnvironmentIdForWorktree(s, worktreeId)?.trim() || null
  )
  const worktreeHasRemoteConnection = useAppStore((s) => {
    const worktree = Object.values(s.worktreesByRepo ?? {})
      .flat()
      .find((entry) => entry.id === worktreeId)
    const repo = worktree ? s.repos?.find((entry) => entry.id === worktree.repoId) : null
    return Boolean(repo?.connectionId)
  })
  const agentDetectionTargetKey = useAppStore((s): string | undefined => {
    const allWorktrees = Object.values(s.worktreesByRepo ?? {}).flat()
    const worktree = allWorktrees.find((w) => w.id === worktreeId)
    if (!worktree) {
      return undefined
    }
    const repo = s.repos?.find((r) => r.id === worktree.repoId)
    const repoConnectionId = repo?.connectionId?.trim()
    if (repoConnectionId) {
      return `ssh:${repoConnectionId}`
    }
    const runtimeEnvironmentId = getRuntimeEnvironmentIdForWorktree(s, worktreeId)?.trim()
    if (runtimeEnvironmentId) {
      return `runtime:${runtimeEnvironmentId}`
    }
    return AGENT_DETECTION_LOCAL_TARGET_KEY
  })
  const agentDetectionTarget = useMemo<AgentDetectionTarget | undefined>(() => {
    if (agentDetectionTargetKey === undefined) {
      return undefined
    }
    if (agentDetectionTargetKey === AGENT_DETECTION_LOCAL_TARGET_KEY) {
      return { kind: 'local' }
    }
    if (agentDetectionTargetKey.startsWith('ssh:')) {
      return { kind: 'ssh', connectionId: agentDetectionTargetKey.slice('ssh:'.length) }
    }
    if (agentDetectionTargetKey.startsWith('runtime:')) {
      return { kind: 'runtime', environmentId: agentDetectionTargetKey.slice('runtime:'.length) }
    }
    return { kind: 'local' }
  }, [agentDetectionTargetKey])
  const { detectedIds } = useDetectedAgents(agentDetectionTarget)
  const agentLaunchOptions = useMemo(
    () =>
      buildTabAgentLaunchOptions(
        orderTabLaunchAgents(defaultAgent, detectedIds ?? []),
        agentCmdOverrides
      ),
    [agentCmdOverrides, defaultAgent, detectedIds]
  )
  const isWebClient = (globalThis as { __ORCA_WEB_CLIENT__?: boolean }).__ORCA_WEB_CLIENT__ === true
  const windowsTerminalCapabilityOwnerKey = getWindowsTerminalCapabilityOwnerKey(
    activeRuntimeEnvironmentId
  )
  const runtimeTarget = useMemo(
    () => getActiveRuntimeTarget({ activeRuntimeEnvironmentId }),
    [activeRuntimeEnvironmentId]
  )
  const shouldProbeWindowsShellCapabilities =
    (isWindows || Boolean(activeRuntimeEnvironmentId?.trim()) || isWebClient) &&
    !worktreeHasRemoteConnection
  const windowsTerminalCapabilities = useWindowsTerminalCapabilities(
    shouldProbeWindowsShellCapabilities,
    false,
    windowsTerminalCapabilityOwnerKey,
    runtimeTarget
  )
  const shouldShowWindowsShellMenu =
    (isWindows || windowsTerminalCapabilities.hostPlatform === 'win32') &&
    !worktreeHasRemoteConnection
  const workspaceHasSimulatorTab = useMemo(
    () => unifiedTabs.some((tab) => tab.contentType === 'simulator'),
    [unifiedTabs]
  )

  const [newTabMenuOpen, setNewTabMenuOpen] = useState(false)
  const [createMenuQuery, setCreateMenuQuery] = useState('')
  const {
    queueNewActiveTerminalFocusAfterNewTabMenuClose,
    queueTerminalTabFocusAfterNewTabMenuClose,
    runPendingNewTabMenuFocusAfterClose
  } = useTabBarNewTabFocus()

  const windowsShellEntries = useMemo(() => {
    if (!shouldShowWindowsShellMenu || !onNewTerminalWithShell) {
      return undefined
    }
    const allShells: { label: string; shell: BuiltInWindowsTerminalShell }[] = [
      {
        label: translate('auto.components.tab.bar.TabBar.2148f65e04', 'PowerShell'),
        shell: 'powershell.exe'
      },
      {
        label: translate('auto.components.tab.bar.TabBar.1a8af49530', 'CMD Prompt'),
        shell: 'cmd.exe'
      },
      ...(windowsTerminalCapabilities.gitBashAvailable
        ? ([
            {
              label: translate('auto.components.tab.bar.TabBar.efb33546ff', 'Git Bash'),
              shell: WINDOWS_GIT_BASH_SHELL
            }
          ] as const)
        : []),
      ...(windowsTerminalCapabilities.wslAvailable
        ? ([
            {
              label: translate('auto.components.tab.bar.TabBar.d1afac112b', 'WSL'),
              shell: 'wsl.exe'
            }
          ] as const)
        : [])
    ]
    const defaultEntry =
      allShells.find((shell) => shell.shell === defaultWindowsShell) ?? allShells[0]
    return [defaultEntry, ...allShells.filter((shell) => shell.shell !== defaultEntry.shell)].map(
      (entry) => ({ label: entry.label, shell: entry.shell })
    )
  }, [
    defaultWindowsShell,
    onNewTerminalWithShell,
    shouldShowWindowsShellMenu,
    windowsTerminalCapabilities.gitBashAvailable,
    windowsTerminalCapabilities.wslAvailable
  ])

  const createMenuOptions = useMemo(
    () =>
      buildTabCreateMenuOptions({
        terminalOnly,
        windowsShellEntries,
        hasNewBrowser: !terminalOnly,
        hasNewMarkdown: !terminalOnly && Boolean(onNewFileTab),
        hasOpenMarkdown: !terminalOnly && Boolean(onOpenFileTab),
        hasSimulator:
          !terminalOnly && isMacOs && mobileEmulatorEnabled && Boolean(onNewSimulatorTab),
        simulatorIsGoTo: workspaceHasSimulatorTab
      }),
    [
      mobileEmulatorEnabled,
      onNewFileTab,
      onNewSimulatorTab,
      onOpenFileTab,
      terminalOnly,
      windowsShellEntries,
      workspaceHasSimulatorTab
    ]
  )

  const handleSelectCreateMenuOption = (option: TabCreateMenuOption): void => {
    switch (option.kind) {
      case 'new-terminal':
        queueNewActiveTerminalFocusAfterNewTabMenuClose()
        onNewTerminalTab()
        break
      case 'new-terminal-shell':
        if (!onNewTerminalWithShell || !option.shell) {
          break
        }
        queueNewActiveTerminalFocusAfterNewTabMenuClose()
        onNewTerminalWithShell(
          resolveWindowsShellLaunchTarget(
            option.shell,
            defaultWindowsPowerShellImplementation,
            windowsTerminalCapabilities.pwshAvailable
          )
        )
        break
      case 'new-browser':
        onNewBrowserTab()
        break
      case 'new-markdown':
        onNewFileTab?.()
        break
      case 'open-markdown':
        onOpenFileTab?.()
        break
      case 'new-simulator':
      case 'go-to-simulator':
        onNewSimulatorTab?.()
        break
    }
  }

  const launchAgentFromNewTabEntry = (agent: TuiAgent): void => {
    if (onLaunchAgent) {
      onLaunchAgent(agent)
      return
    }
    const option = agentLaunchOptions.find((candidate) => candidate.agent === agent)
    const result = launchAgentInNewTab({
      agent,
      worktreeId,
      groupId,
      launchSource: 'tab_bar_quick_launch'
    })
    if (!result) {
      toast.error(
        translate(
          'auto.components.tab.bar.TabBar.ab589350e5',
          'Could not build launch command for {{value0}}.',
          { value0: option?.label ?? agent }
        )
      )
      return
    }
    if (result.tabId) {
      queueTerminalTabFocusAfterNewTabMenuClose(result.tabId)
      return
    }
    queueNewActiveTerminalFocusAfterNewTabMenuClose()
  }

  useEffect(() => {
    if (!newTabMenuOpen) {
      return
    }
    const dismiss = (): void => setNewTabMenuOpen(false)
    window.addEventListener('blur', dismiss)
    return () => window.removeEventListener('blur', dismiss)
  }, [newTabMenuOpen])

  useEffect(() => {
    if (!newTabMenuOpen) {
      setCreateMenuQuery('')
    }
  }, [newTabMenuOpen])

  const showStaticCreateMenuItems = createMenuQuery.trim().length === 0

  return (
    <DropdownMenu open={newTabMenuOpen} onOpenChange={setNewTabMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'my-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            triggerClassName
          )}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          title={translate('auto.components.tab.bar.TabBar.b1a132357f', 'New tab')}
          aria-label={translate('auto.components.tab.bar.TabBar.b1a132357f', 'New tab')}
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-72 max-w-[calc(100vw-1rem)] rounded-[11px] border-border/80 p-1 shadow-[0_16px_36px_rgba(0,0,0,0.24)]"
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          runPendingNewTabMenuFocusAfterClose()
        }}
      >
        {!terminalOnly && onOpenEntry ? (
          <>
            <TabBarCreateEntry
              worktreeId={worktreeId}
              groupId={groupId}
              menuOpen={newTabMenuOpen}
              menuOptions={createMenuOptions}
              agentOptions={agentLaunchOptions}
              onLaunchAgent={launchAgentFromNewTabEntry}
              onOpenDefaultTerminal={() => {
                queueNewActiveTerminalFocusAfterNewTabMenuClose()
                onNewTerminalTab()
              }}
              onOpenEntry={onOpenEntry}
              onQueryChange={setCreateMenuQuery}
              onSelectMenuOption={handleSelectCreateMenuOption}
              onDidOpenEntry={() => setNewTabMenuOpen(false)}
            />
            {showStaticCreateMenuItems ? <DropdownMenuSeparator /> : null}
          </>
        ) : null}
        {showStaticCreateMenuItems ? (
          <TabBarStaticCreateMenuItems
            terminalOnly={terminalOnly}
            newTabMenuOrder={newTabMenuOrder}
            windowsShellEntries={windowsShellEntries}
            onNewTerminalTab={onNewTerminalTab}
            onNewTerminalWithShell={onNewTerminalWithShell}
            onNewBrowserTab={onNewBrowserTab}
            onNewSimulatorTab={onNewSimulatorTab}
            onNewFileTab={onNewFileTab}
            onOpenFileTab={onOpenFileTab}
            mobileEmulatorEnabled={isMacOs && mobileEmulatorEnabled}
            workspaceHasSimulatorTab={workspaceHasSimulatorTab}
            defaultWindowsPowerShellImplementation={defaultWindowsPowerShellImplementation}
            windowsTerminalCapabilities={windowsTerminalCapabilities}
            shortcuts={{
              newTerminal: newTerminalShortcut,
              newBrowser: newBrowserShortcut,
              newSimulator: newSimulatorShortcut,
              newFile: newFileShortcut
            }}
            queueNewActiveTerminalFocusAfterNewTabMenuClose={
              queueNewActiveTerminalFocusAfterNewTabMenuClose
            }
          />
        ) : null}
        {showStaticCreateMenuItems && showAgentLaunchItems ? (
          <>
            <DropdownMenuSeparator />
            <QuickLaunchAgentMenuItems
              worktreeId={worktreeId}
              groupId={groupId}
              onLaunchAgent={onLaunchAgent}
              onFocusTerminal={queueTerminalTabFocusAfterNewTabMenuClose}
            />
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
