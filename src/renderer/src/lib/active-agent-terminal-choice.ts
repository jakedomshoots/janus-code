import type { RuntimeTerminalRead, RuntimeTerminalWait } from '../../../shared/runtime-types'
import { makePaneKey, parsePaneKey } from '../../../shared/stable-pane-id'
import { useAppStore } from '@/store'
import { translate } from '@/i18n/i18n'
import { callRuntimeRpc, getActiveRuntimeTarget } from '@/runtime/runtime-rpc-client'
import { getSettingsForWorktreeRuntimeOwner } from '@/lib/worktree-runtime-owner'
import { findActiveRuntimeTerminal } from './active-agent-note-target'
import type { ActiveAgentNotesSendResult } from './active-agent-note-send'
import { extractTerminalPromptText, parseNumberedTerminalChoices } from './terminal-prompt-choices'

const ACTIVE_AGENT_SEND_RPC_TIMEOUT_MS = 15_000
const SLASH_COMMAND_INTERACTIVE_PROBE_TIMEOUT_MS = 1_500

export function isSlashCommandPrompt(prompt: string): boolean {
  return /^\/[a-z][\w-]*(?:\s|$)/i.test(prompt)
}

export async function projectSlashCommandInteractivePrompt({
  runtimeTarget,
  terminalHandle,
  worktreeId,
  noteTarget,
  prompt
}: {
  runtimeTarget: ReturnType<typeof getActiveRuntimeTarget>
  terminalHandle: string
  worktreeId: string
  noteTarget: { tabId: string; leafId: string }
  prompt: string
}): Promise<void> {
  const currentTerminal = await findActiveRuntimeTerminal(
    runtimeTarget,
    worktreeId,
    noteTarget,
    ACTIVE_AGENT_SEND_RPC_TIMEOUT_MS
  )
  const resolvedTerminalHandle = currentTerminal?.handle ?? terminalHandle
  await projectTerminalChoiceState({
    runtimeTarget,
    terminalHandle: resolvedTerminalHandle,
    worktreeId,
    noteTarget,
    prompt
  })
}

async function projectTerminalChoiceState({
  runtimeTarget,
  terminalHandle,
  worktreeId,
  noteTarget,
  prompt
}: {
  runtimeTarget: ReturnType<typeof getActiveRuntimeTarget>
  terminalHandle: string
  worktreeId: string
  noteTarget: { tabId: string; leafId: string }
  prompt: string
}): Promise<void> {
  let wait: RuntimeTerminalWait
  try {
    const result = await callRuntimeRpc<{ wait: RuntimeTerminalWait }>(
      runtimeTarget,
      'terminal.wait',
      {
        terminal: terminalHandle,
        for: 'tui-idle',
        timeoutMs: SLASH_COMMAND_INTERACTIVE_PROBE_TIMEOUT_MS
      },
      { timeoutMs: SLASH_COMMAND_INTERACTIVE_PROBE_TIMEOUT_MS + 5_000 }
    )
    wait = result.wait
  } catch {
    return
  }

  let terminalRead: RuntimeTerminalRead
  try {
    const result = await callRuntimeRpc<{ terminal: RuntimeTerminalRead }>(
      runtimeTarget,
      'terminal.read',
      { terminal: terminalHandle, limit: 80 },
      { timeoutMs: ACTIVE_AGENT_SEND_RPC_TIMEOUT_MS }
    )
    terminalRead = result.terminal
  } catch {
    return
  }

  const promptText = extractTerminalPromptText(terminalRead.tail)
  if (!promptText) {
    return
  }
  const choices = parseNumberedTerminalChoices(promptText)
  if (wait.satisfied && choices.length === 0) {
    markSlashCommandComplete({ worktreeId, noteTarget, prompt })
    return
  }
  if (!wait.satisfied && !wait.blockedReason && choices.length === 0) {
    return
  }
  const paneKey = makePaneKey(noteTarget.tabId, noteTarget.leafId)
  const existing = useAppStore.getState().agentStatusByPaneKey[paneKey]
  const agentType =
    existing?.agentType ?? findTabLaunchAgent(worktreeId, noteTarget.tabId) ?? 'unknown'
  useAppStore.getState().setAgentStatus(paneKey, {
    state: 'waiting',
    prompt,
    agentType,
    approval: {
      id: `${paneKey}:terminal-choice:${Date.now()}`,
      status: 'requested',
      title: translate('auto.lib.activeAgentTerminalChoice.selectOption', 'Select an option'),
      description: translate(
        'auto.lib.activeAgentTerminalChoice.chooseFromPrompt',
        'Choose from the terminal prompt to continue.'
      ),
      fallbackText: promptText,
      ...(choices.length > 0 ? { choices } : {})
    }
  })
}

function markSlashCommandComplete({
  worktreeId,
  noteTarget,
  prompt
}: {
  worktreeId: string
  noteTarget: { tabId: string; leafId: string }
  prompt: string
}): void {
  const paneKey = makePaneKey(noteTarget.tabId, noteTarget.leafId)
  const existing = useAppStore.getState().agentStatusByPaneKey[paneKey]
  useAppStore.getState().setAgentStatus(paneKey, {
    state: 'done',
    prompt,
    agentType: existing?.agentType ?? findTabLaunchAgent(worktreeId, noteTarget.tabId) ?? 'unknown',
    approval: null
  })
}

export async function sendAgentTerminalChoice({
  worktreeId,
  threadId,
  input
}: {
  worktreeId: string
  threadId: string
  input: string
}): Promise<ActiveAgentNotesSendResult> {
  const noteTarget = parsePaneKey(threadId)
  if (!noteTarget) {
    return { status: 'no-active-terminal' }
  }
  const state = useAppStore.getState()
  const runtimeSettings = getSettingsForWorktreeRuntimeOwner(state, worktreeId)
  const runtimeTarget = getActiveRuntimeTarget(runtimeSettings)
  const terminal = await findActiveRuntimeTerminal(
    runtimeTarget,
    worktreeId,
    noteTarget,
    ACTIVE_AGENT_SEND_RPC_TIMEOUT_MS
  )
  if (!terminal) {
    return { status: 'no-active-terminal' }
  }
  const result = await callRuntimeRpc<{ send: { accepted: boolean } }>(
    runtimeTarget,
    'terminal.send',
    { terminal: terminal.handle, text: input, enter: true },
    { timeoutMs: ACTIVE_AGENT_SEND_RPC_TIMEOUT_MS }
  )
  if (!result.send.accepted) {
    return { status: 'not-writable' }
  }

  const paneKey = makePaneKey(noteTarget.tabId, noteTarget.leafId)
  const existing = useAppStore.getState().agentStatusByPaneKey[paneKey]
  useAppStore.getState().setAgentStatus(paneKey, {
    state: 'working',
    prompt: existing?.prompt ?? '',
    agentType: existing?.agentType ?? 'unknown',
    approval: null
  })
  await projectTerminalChoiceState({
    runtimeTarget,
    terminalHandle: terminal.handle,
    worktreeId,
    noteTarget,
    prompt: existing?.prompt ?? ''
  })
  return { status: 'sent' }
}

function findTabLaunchAgent(worktreeId: string, tabId: string): string | undefined {
  return useAppStore.getState().tabsByWorktree[worktreeId]?.find((entry) => entry.id === tabId)
    ?.launchAgent
}
