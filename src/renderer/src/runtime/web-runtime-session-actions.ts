import type { TuiAgent } from '../../../shared/types'

type CreateWebRuntimeSessionTerminal = (args: {
  worktreeId: string
  environmentId?: string | null
  afterTabId?: string
  targetGroupId?: string
  command?: string
  agent?: TuiAgent
  activate?: boolean
  selectWorktree?: boolean
}) => Promise<boolean>

type CreateWebRuntimeSessionBrowserTab = (args: {
  worktreeId: string
  environmentId?: string | null
  url?: string
  profileId?: string | null
  targetGroupId?: string
  selectWorktree?: boolean
  activate?: boolean
}) => Promise<boolean>

let terminalCreator: CreateWebRuntimeSessionTerminal | null = null
let browserTabCreator: CreateWebRuntimeSessionBrowserTab | null = null

export function setWebRuntimeSessionTerminalCreator(
  creator: CreateWebRuntimeSessionTerminal | null
): void {
  terminalCreator = creator
}

export function setWebRuntimeSessionBrowserTabCreator(
  creator: CreateWebRuntimeSessionBrowserTab | null
): void {
  browserTabCreator = creator
}

export async function createRegisteredWebRuntimeSessionTerminal(
  args: Parameters<CreateWebRuntimeSessionTerminal>[0]
): Promise<boolean> {
  if (!terminalCreator) {
    console.warn('[web-runtime-session] terminal creator is not registered')
    return false
  }
  return terminalCreator(args)
}

export async function createRegisteredWebRuntimeSessionBrowserTab(
  args: Parameters<CreateWebRuntimeSessionBrowserTab>[0]
): Promise<boolean> {
  if (!browserTabCreator) {
    console.warn('[web-runtime-session] browser tab creator is not registered')
    return false
  }
  return browserTabCreator(args)
}
