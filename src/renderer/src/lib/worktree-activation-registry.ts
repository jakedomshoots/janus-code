import type { EventProps } from '../../../shared/telemetry-events'
import type { TuiAgent } from '../../../shared/types'

type WorktreeStartupPayload = {
  command: string
  env?: Record<string, string>
  initialAgentStatus?: { agent: TuiAgent; prompt: string }
  telemetry?: EventProps<'agent_started'>
}

type ActivateAndRevealResult = {
  primaryTabId: string | null
}
type SidebarRevealBehavior = 'auto' | 'smooth'

type AddedFolderWorktreeActivator = (
  worktreeId: string,
  opts?: {
    startup?: WorktreeStartupPayload
    sidebarRevealBehavior?: SidebarRevealBehavior
  }
) => ActivateAndRevealResult | false

let addedFolderWorktreeActivator: AddedFolderWorktreeActivator | null = null

export function setAddedFolderWorktreeActivator(fn: AddedFolderWorktreeActivator | null): void {
  addedFolderWorktreeActivator = fn
}

export function activateAddedFolderWorktree(
  worktreeId: string,
  opts?: Parameters<AddedFolderWorktreeActivator>[1]
): ActivateAndRevealResult | false {
  if (!addedFolderWorktreeActivator) {
    console.warn('addNonGitFolder called before worktree activation was registered')
    return false
  }
  return addedFolderWorktreeActivator(worktreeId, opts)
}
