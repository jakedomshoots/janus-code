import type { RuntimeTerminalWait } from '../../../shared/runtime-types'
import {
  AGENT_STATUS_STALE_AFTER_MS,
  type AgentStatusEntry
} from '../../../shared/agent-status-types'
import { makePaneKey } from '../../../shared/stable-pane-id'
import { useAppStore } from '@/store'
import { callRuntimeRpc, getActiveRuntimeTarget } from '@/runtime/runtime-rpc-client'
import { getSettingsForWorktreeRuntimeOwner } from '@/lib/worktree-runtime-owner'
import { sendBracketedPasteToRunningAgent } from './agent-paste-draft'
import {
  findActiveRuntimeTerminal,
  getActiveTerminalNotePtyId,
  getActiveTerminalNoteTarget
} from './active-agent-note-target'
import { isExplicitAgentStatusFresh } from './agent-status'

export {
  getActiveAgentNoteTarget,
  getActiveAgentRuntimeProbeDescriptor,
  getActiveTerminalNotePtyId,
  getActiveTerminalNoteTarget,
  probeActiveAgentNoteTarget,
  useCanSendNotesToActiveTerminal,
  type ActiveTerminalNoteTarget
} from './active-agent-note-target'

const ACTIVE_AGENT_SEND_TIMEOUT_MS = 8000
const ACTIVE_AGENT_SEND_RPC_TIMEOUT_MS = 15000
const LAUNCH_BACKED_AGENT_IDLE_PROBE_TIMEOUT_MS = 750

export type ActiveAgentNotesSendStatus =
  | 'sent'
  | 'empty'
  | 'no-active-terminal'
  | 'no-agent'
  | 'not-ready'
  | 'not-writable'

export type ActiveAgentNotesSendResult = {
  status: ActiveAgentNotesSendStatus
}

export async function sendNotesToActiveAgentSession({
  worktreeId,
  prompt,
  noteTarget,
  timeoutMs = ACTIVE_AGENT_SEND_TIMEOUT_MS
}: {
  worktreeId: string
  prompt: string
  noteTarget?: { tabId: string; leafId: string } | null
  timeoutMs?: number
}): Promise<ActiveAgentNotesSendResult> {
  const trimmedPrompt = prompt.trim()
  if (!trimmedPrompt) {
    return { status: 'empty' }
  }

  const state = useAppStore.getState()
  const resolvedNoteTarget = noteTarget ?? getActiveTerminalNoteTarget(state, worktreeId)
  if (!resolvedNoteTarget) {
    return { status: 'no-active-terminal' }
  }

  // Route by the worktree's owner host so the agent terminal is found and driven
  // on the host that actually runs it, not on the focused runtime.
  const runtimeSettings = getSettingsForWorktreeRuntimeOwner(state, worktreeId)
  const runtimeTarget = getActiveRuntimeTarget(runtimeSettings)
  const activePtyId = getActiveTerminalNotePtyId(state, resolvedNoteTarget)
  if (!activePtyId) {
    return { status: 'no-active-terminal' }
  }
  const terminal = await findActiveRuntimeTerminal(
    runtimeTarget,
    worktreeId,
    resolvedNoteTarget,
    ACTIVE_AGENT_SEND_RPC_TIMEOUT_MS
  )
  if (!terminal) {
    return { status: 'no-active-terminal' }
  }

  // Why: sending notes submits with Enter, so only the runtime's agent/idle
  // checks can authorize it; tab labels and renderer state are not enough.
  const agentCheck = await callRuntimeRpc<{ isRunningAgent: boolean }>(
    runtimeTarget,
    'terminal.isRunningAgent',
    { terminal: terminal.handle },
    { timeoutMs: ACTIVE_AGENT_SEND_RPC_TIMEOUT_MS }
  )
  if (!agentCheck.isRunningAgent) {
    return { status: 'no-agent' }
  }

  const freshStatus = getFreshAgentStatusEntry(state, resolvedNoteTarget)
  if (!isCompletedAgentStatus(freshStatus)) {
    const allowLaunchBackedBestEffort =
      !freshStatus && hasLaunchBackedAgentTab(state, worktreeId, resolvedNoteTarget)
    const waitTimeoutMs = allowLaunchBackedBestEffort
      ? Math.min(timeoutMs, LAUNCH_BACKED_AGENT_IDLE_PROBE_TIMEOUT_MS)
      : timeoutMs
    try {
      const { wait } = await callRuntimeRpc<{ wait: RuntimeTerminalWait }>(
        runtimeTarget,
        'terminal.wait',
        { terminal: terminal.handle, for: 'tui-idle', timeoutMs: waitTimeoutMs },
        { timeoutMs: waitTimeoutMs + 5000 }
      )
      if (!wait.satisfied) {
        return { status: 'not-ready' }
      }
    } catch (error) {
      if (isRuntimeTerminalUnavailable(error)) {
        return { status: 'no-active-terminal' }
      }
      if (isRuntimeTimeout(error)) {
        // Why: hookless launched CLIs such as Kimi can be fully writable while
        // lacking the OSC/title transition that terminal.wait needs. The
        // bracketed-paste submit below is still verified against the live PTY.
        if (!allowLaunchBackedBestEffort) {
          return { status: 'not-ready' }
        }
      } else {
        throw error
      }
    }
  }

  const sent = await sendBracketedPasteToRunningAgent({
    ptyId: activePtyId,
    content: trimmedPrompt,
    settings: runtimeSettings
  })
  if (!sent) {
    return { status: 'not-writable' }
  }

  markSubmittedAgentPrompt({
    state: useAppStore.getState(),
    worktreeId,
    noteTarget: resolvedNoteTarget,
    prompt: trimmedPrompt
  })
  return { status: 'sent' }
}

function getFreshAgentStatusEntry(
  state: ReturnType<typeof useAppStore.getState>,
  noteTarget: { tabId: string; leafId: string }
): AgentStatusEntry | null {
  const entry = state.agentStatusByPaneKey?.[makePaneKey(noteTarget.tabId, noteTarget.leafId)]
  if (!entry) {
    return null
  }
  if (!isExplicitAgentStatusFresh(entry, Date.now(), AGENT_STATUS_STALE_AFTER_MS)) {
    return null
  }
  return entry
}

function isCompletedAgentStatus(entry: AgentStatusEntry | null): boolean {
  return entry?.state === 'done' && !entry.failure
}

function hasLaunchBackedAgentTab(
  state: ReturnType<typeof useAppStore.getState>,
  worktreeId: string,
  noteTarget: { tabId: string }
): boolean {
  return Boolean(
    (state.tabsByWorktree[worktreeId] ?? []).find((tab) => tab.id === noteTarget.tabId)?.launchAgent
  )
}

function markSubmittedAgentPrompt({
  state,
  worktreeId,
  noteTarget,
  prompt
}: {
  state: ReturnType<typeof useAppStore.getState>
  worktreeId: string
  noteTarget: { tabId: string; leafId: string }
  prompt: string
}): void {
  const paneKey = makePaneKey(noteTarget.tabId, noteTarget.leafId)
  const existing = state.agentStatusByPaneKey?.[paneKey]
  const tab = (state.tabsByWorktree[worktreeId] ?? []).find(
    (entry) => entry.id === noteTarget.tabId
  )
  const agentType = existing?.agentType ?? tab?.launchAgent ?? 'unknown'
  // Why: hookless agents can accept the paste before any hook/title event lands.
  // Seed the same status row the workspace timeline reads so terminal output can
  // attach to the submitted prompt instead of staying terminal-only.
  state.setAgentStatus(paneKey, {
    state: 'working',
    prompt,
    agentType
  })
}

export function activeAgentNotesSendFailureMessage(status: ActiveAgentNotesSendStatus): string {
  switch (status) {
    case 'empty':
      return 'No notes to send.'
    case 'no-active-terminal':
      return 'Open the agent terminal in this worktree, then send the notes again.'
    case 'no-agent':
      return 'The active terminal is not a recognized agent session.'
    case 'not-ready':
      return 'The active agent was not ready for input yet.'
    case 'not-writable':
      return 'The active terminal did not accept the notes.'
    case 'sent':
      return ''
  }
}

function isRuntimeTimeout(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return message.includes('timeout')
}

function isRuntimeTerminalUnavailable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return (
    message.includes('terminal_handle_stale') ||
    message.includes('terminal_exited') ||
    message.includes('terminal_gone') ||
    message.includes('no_active_terminal')
  )
}
