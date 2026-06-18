import { Columns2, Ellipsis, Rows2, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import { TabBarQuickCommandsButton } from '../tab-bar/TabBarQuickCommandsButton'

export type TabGroupSplitDirection = 'right' | 'down' | 'left' | 'up'

const menuButtonClassName =
  'my-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

export function TabGroupPaneActionChrome({
  worktreeId,
  groupId,
  hasSplitGroups = false,
  agentPaneMode = false,
  className,
  onSplit,
  onCloseGroup
}: {
  worktreeId: string
  groupId: string
  hasSplitGroups?: boolean
  agentPaneMode?: boolean
  className?: string
  onSplit: (direction: TabGroupSplitDirection) => void
  onCloseGroup?: () => void
}): React.JSX.Element {
  return (
    <div className={cn('flex shrink-0 items-center gap-0.5 overflow-hidden', className)}>
      <TabBarQuickCommandsButton worktreeId={worktreeId} groupId={groupId} />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={translate(
              'auto.components.tab.group.TabGroupPanel.9acaf92093',
              'Pane Actions'
            )}
            title={translate('auto.components.tab.group.TabGroupPanel.9acaf92093', 'Pane Actions')}
            onClick={(event) => {
              event.stopPropagation()
            }}
            className={menuButtonClassName}
          >
            <Ellipsis className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
          <DropdownMenuItem onSelect={() => onSplit('right')}>
            <Columns2 className="size-4" />
            {agentPaneMode
              ? translate(
                  'auto.components.agentWorkspace.threadTabs.splitPaneRight',
                  'Split pane right'
                )
              : translate('auto.components.tab.group.TabGroupPanel.ab1e2bff04', 'Split Right')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onSplit('down')}>
            <Rows2 className="size-4" />
            {agentPaneMode
              ? translate(
                  'auto.components.agentWorkspace.threadTabs.splitPaneDown',
                  'Split pane down'
                )
              : translate('auto.components.tab.group.TabGroupPanel.4df2a06d36', 'Split Down')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onSplit('left')}>
            <Columns2 className="size-4" />
            {agentPaneMode
              ? translate(
                  'auto.components.agentWorkspace.threadTabs.splitPaneLeft',
                  'Split pane left'
                )
              : translate('auto.components.tab.group.TabGroupPanel.30137df7d0', 'Split Left')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onSplit('up')}>
            <Rows2 className="size-4" />
            {agentPaneMode
              ? translate('auto.components.agentWorkspace.threadTabs.splitPaneUp', 'Split pane up')
              : translate('auto.components.tab.group.TabGroupPanel.0db2081805', 'Split Up')}
          </DropdownMenuItem>
          {hasSplitGroups && typeof onCloseGroup === 'function' ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => onCloseGroup()}>
                <X className="size-4" />
                {agentPaneMode
                  ? translate('auto.components.agentWorkspace.threadTabs.closePane', 'Close pane')
                  : translate('auto.components.tab.group.TabGroupPanel.f7d6ce445e', 'Close Group')}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
