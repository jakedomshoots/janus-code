import { FilePlus, FileText, Globe, Smartphone, TerminalSquare } from 'lucide-react'
import { DropdownMenuItem, DropdownMenuShortcut } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { WindowsTerminalCapabilities } from '@/lib/windows-terminal-capabilities'
import type { BuiltInWindowsTerminalShell } from '../../../../shared/windows-terminal-shell'
import { translate } from '@/i18n/i18n'
import { ShellIcon } from './shell-icons'
import { resolveWindowsShellLaunchTarget } from './windows-shell-launch'

type WindowsShellEntry = {
  label: string
  shell: BuiltInWindowsTerminalShell
}

type TabBarStaticCreateMenuItemsProps = {
  terminalOnly: boolean
  newTabMenuOrder: 'default' | 'markdown-first'
  windowsShellEntries?: WindowsShellEntry[]
  onNewTerminalTab: () => void
  onNewTerminalWithShell?: (shell: string) => void
  onNewBrowserTab: () => void
  onNewSimulatorTab?: () => void
  onNewFileTab?: () => void
  onOpenFileTab?: () => void
  mobileEmulatorEnabled: boolean
  workspaceHasSimulatorTab: boolean
  defaultWindowsPowerShellImplementation: 'auto' | 'powershell.exe' | 'pwsh.exe'
  windowsTerminalCapabilities: WindowsTerminalCapabilities
  shortcuts: {
    newTerminal: string
    newBrowser: string
    newSimulator: string
    newFile: string
  }
  queueNewActiveTerminalFocusAfterNewTabMenuClose: () => void
}

export function TabBarStaticCreateMenuItems({
  terminalOnly,
  newTabMenuOrder,
  windowsShellEntries,
  onNewTerminalTab,
  onNewTerminalWithShell,
  onNewBrowserTab,
  onNewSimulatorTab,
  onNewFileTab,
  onOpenFileTab,
  mobileEmulatorEnabled,
  workspaceHasSimulatorTab,
  defaultWindowsPowerShellImplementation,
  windowsTerminalCapabilities,
  shortcuts,
  queueNewActiveTerminalFocusAfterNewTabMenuClose
}: TabBarStaticCreateMenuItemsProps): React.JSX.Element {
  const defaultTerminalMenuItems =
    windowsShellEntries && onNewTerminalWithShell ? (
      windowsShellEntries.map((entry, idx) => {
        const isDefault = idx === 0
        return (
          <DropdownMenuItem
            key={entry.shell}
            onSelect={() => {
              queueNewActiveTerminalFocusAfterNewTabMenuClose()
              onNewTerminalWithShell(
                resolveWindowsShellLaunchTarget(
                  entry.shell,
                  defaultWindowsPowerShellImplementation,
                  windowsTerminalCapabilities.pwshAvailable
                )
              )
            }}
            className="gap-2 rounded-[7px] px-2 py-1.5 text-[12px] leading-5 font-medium"
          >
            <ShellIcon shell={entry.shell} size={14} />
            <span className="flex-1">
              {translate('auto.components.tab.bar.TabBar.7c1313d237', 'New Terminal:')}{' '}
              {entry.label}
            </span>
            {isDefault ? (
              <DropdownMenuShortcut>{shortcuts.newTerminal}</DropdownMenuShortcut>
            ) : null}
          </DropdownMenuItem>
        )
      })
    ) : (
      <DropdownMenuItem
        onSelect={() => {
          queueNewActiveTerminalFocusAfterNewTabMenuClose()
          onNewTerminalTab()
        }}
        className="gap-2 rounded-[7px] px-2 py-1.5 text-[12px] leading-5 font-medium"
      >
        <TerminalSquare className="size-4 text-muted-foreground" />
        {translate('auto.components.tab.bar.TabBar.d364f3c8d4', 'New Terminal')}
        <DropdownMenuShortcut>{shortcuts.newTerminal}</DropdownMenuShortcut>
      </DropdownMenuItem>
    )

  const newBrowserMenuItem = !terminalOnly ? (
    <DropdownMenuItem
      onSelect={onNewBrowserTab}
      className="gap-2 rounded-[7px] px-2 py-1.5 text-[12px] leading-5 font-medium"
    >
      <Globe className="size-4 text-muted-foreground" />
      {translate('auto.components.tab.bar.TabBar.4833fb2cbe', 'New Browser Tab')}
      <DropdownMenuShortcut>{shortcuts.newBrowser}</DropdownMenuShortcut>
    </DropdownMenuItem>
  ) : null

  const newSimulatorMenuItem =
    !terminalOnly && mobileEmulatorEnabled && onNewSimulatorTab ? (
      workspaceHasSimulatorTab ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuItem
              onSelect={onNewSimulatorTab}
              className="gap-2 rounded-[7px] px-2 py-1.5 text-[12px] leading-5 font-medium"
            >
              <Smartphone className="size-4 text-muted-foreground" />
              {translate('auto.components.tab.bar.TabBar.b426bb2615', 'Go to Mobile Emulator')}
              <DropdownMenuShortcut>{shortcuts.newSimulator}</DropdownMenuShortcut>
            </DropdownMenuItem>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="z-[80]">
            {translate(
              'auto.components.tab.bar.TabBar.aea43b5748',
              'Open the existing emulator tab.'
            )}
          </TooltipContent>
        </Tooltip>
      ) : (
        <DropdownMenuItem
          onSelect={onNewSimulatorTab}
          className="gap-2 rounded-[7px] px-2 py-1.5 text-[12px] leading-5 font-medium"
        >
          <Smartphone className="size-4 text-muted-foreground" />
          {translate('auto.components.tab.bar.TabBar.fd2b42aaa3', 'New Mobile Emulator')}
          <DropdownMenuShortcut>{shortcuts.newSimulator}</DropdownMenuShortcut>
        </DropdownMenuItem>
      )
    ) : null

  const newMarkdownMenuItem =
    !terminalOnly && onNewFileTab ? (
      <DropdownMenuItem
        onSelect={onNewFileTab}
        className="gap-2 rounded-[7px] px-2 py-1.5 text-[12px] leading-5 font-medium"
      >
        <FilePlus className="size-4 text-muted-foreground" />
        {translate('auto.components.tab.bar.TabBar.3d5d6c960d', 'New Markdown')}
        <DropdownMenuShortcut>{shortcuts.newFile}</DropdownMenuShortcut>
      </DropdownMenuItem>
    ) : null

  const openMarkdownMenuItem =
    !terminalOnly && onOpenFileTab ? (
      <DropdownMenuItem
        onSelect={onOpenFileTab}
        className="gap-2 rounded-[7px] px-2 py-1.5 text-[12px] leading-5 font-medium"
      >
        <FileText className="size-4 text-muted-foreground" />
        {translate('auto.components.tab.bar.TabBar.4f327c8b3d', 'Open Markdown...')}
      </DropdownMenuItem>
    ) : null

  return newTabMenuOrder === 'markdown-first' ? (
    <>
      {newMarkdownMenuItem}
      {openMarkdownMenuItem}
      {defaultTerminalMenuItems}
      {newBrowserMenuItem}
      {newSimulatorMenuItem}
    </>
  ) : (
    <>
      {defaultTerminalMenuItems}
      {newBrowserMenuItem}
      {newMarkdownMenuItem}
      {openMarkdownMenuItem}
      {newSimulatorMenuItem}
    </>
  )
}
