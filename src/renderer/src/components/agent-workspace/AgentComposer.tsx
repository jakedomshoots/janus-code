import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useDetectedAgents } from '@/hooks/useDetectedAgents'
import { translate } from '@/i18n/i18n'
import { getAgentCatalog } from '@/lib/agent-catalog'
import { useAppStore } from '@/store'
import { filterEnabledTuiAgents, pickTuiAgent } from '../../../../shared/tui-agent-selection'
import {
  applyAgentPermissionMode,
  resolveAgentPermissionModeSummary,
  type AgentPermissionMode
} from '../../../../shared/tui-agent-permissions'
import {
  isTuiAgentThinkingMode,
  type TuiAgentThinkingMode
} from '../../../../shared/tui-agent-thinking'
import {
  getTuiAgentModelOptions,
  isTuiAgentModelSelection,
  resolveTuiAgentSelectedModel,
  TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID
} from '../../../../shared/tui-agent-models'
import type { TuiAgent } from '../../../../shared/types'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'
import { AgentComposerFooter } from './AgentComposerFooter'
import { launchSelectedAgent } from './agent-composer-launch'
import { submitAgentComposerMessage, type AgentComposerSubmitResult } from './agent-composer-submit'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import type { AgentWorkspaceProject, AgentWorkspaceThread } from './agent-workspace-types'
import {
  useAgentBrowserWorkbench,
  type AgentBrowserWorkbenchState
} from './useAgentBrowserWorkbench'

type AgentComposerFeedback = Pick<AgentComposerSubmitResult, 'message' | 'status'> & {
  reason?: string
}

const EMPTY_DISABLED_TUI_AGENTS: readonly TuiAgent[] = []

export function AgentComposer({
  activeWorktreeId,
  selectedThread,
  selectedProject = null,
  terminalAvailable = false,
  browserWorkbench: browserWorkbenchProp,
  onOpenTerminalDrawer
}: {
  activeWorktreeId: string | null
  selectedThread: AgentWorkspaceThread | null
  selectedProject?: AgentWorkspaceProject | null
  terminalAvailable?: boolean
  browserWorkbench?: AgentBrowserWorkbenchState
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
}): React.JSX.Element {
  const [prompt, setPrompt] = useState('')
  const [submitResult, setSubmitResult] = useState<AgentComposerFeedback | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<TuiAgent | null>(null)
  const settings = useAppStore((state) => state.settings)
  const [thinkingMode, setThinkingMode] = useState<TuiAgentThinkingMode>(
    () => settings?.agentThinkingMode ?? 'standard'
  )
  const [composerModelSelections, setComposerModelSelections] = useState<
    Partial<Record<TuiAgent, string>>
  >({})
  const updateSettings = useAppStore((state) => state.updateSettings)
  const browserWorkbenchInternal = useAgentBrowserWorkbench({
    activeWorktreeId,
    onOpenTerminalDrawer
  })
  const browserWorkbench = browserWorkbenchProp ?? browserWorkbenchInternal
  const settingsModelSelectionsKey = encodeAgentModelSelections(settings?.agentModelSelections)
  const defaultTuiAgent = settings?.defaultTuiAgent ?? null
  const disabledTuiAgents = settings?.disabledTuiAgents ?? EMPTY_DISABLED_TUI_AGENTS
  const permissionMode = useMemo(
    () =>
      resolveAgentPermissionModeSummary({
        agentDefaultArgs: settings?.agentDefaultArgs,
        agentDefaultEnv: settings?.agentDefaultEnv
      }),
    [settings?.agentDefaultArgs, settings?.agentDefaultEnv]
  )
  const detectionTarget =
    selectedProject?.agentDetectionTarget ??
    (activeWorktreeId ? { kind: 'local' as const } : undefined)
  const detectedAgents = useDetectedAgents(detectionTarget)
  const availableAgents = useMemo(() => {
    if (detectedAgents.detectedIds === null) {
      return []
    }
    const enabledIds = new Set(
      filterEnabledTuiAgents(
        getAgentCatalog().map((agent) => agent.id),
        disabledTuiAgents
      )
    )
    const detectedIds = new Set(detectedAgents.detectedIds)
    return getAgentCatalog().filter(
      (agent) => enabledIds.has(agent.id) && detectedIds.has(agent.id)
    )
  }, [detectedAgents.detectedIds, disabledTuiAgents])
  const preferredAgent = useMemo(
    () =>
      detectedAgents.detectedIds === null
        ? null
        : pickTuiAgent(defaultTuiAgent, detectedAgents.detectedIds, disabledTuiAgents),
    [defaultTuiAgent, detectedAgents.detectedIds, disabledTuiAgents]
  )
  const modelOptions = useMemo(() => getTuiAgentModelOptions(selectedAgent), [selectedAgent])
  const selectedModel = useMemo(
    () =>
      selectedAgent
        ? resolveTuiAgentSelectedModel(selectedAgent, composerModelSelections)
        : TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID,
    [composerModelSelections, selectedAgent]
  )
  const trimmedPrompt = prompt.trim()
  const readinessMessage = useMemo(
    () =>
      getReadinessMessage({
        thread: selectedThread,
        activeWorktreeId,
        selectedAgent,
        detectingAgents: detectedAgents.isLoading
      }),
    [activeWorktreeId, detectedAgents.isLoading, selectedAgent, selectedThread]
  )
  const submitContextKey = [
    activeWorktreeId,
    selectedThread?.id,
    selectedThread?.worktreeId,
    selectedThread?.phase,
    selectedAgent,
    selectedModel
  ].join(':')
  const submitSequenceRef = useRef(0)
  const submitContextKeyRef = useRef(submitContextKey)
  const composerDisabled = submitting
  const canSubmit = !submitting && readinessMessage === null && trimmedPrompt.length > 0
  const statusMessage = submitResult?.message ?? readinessMessage
  const statusTone = submitResult?.status ?? (readinessMessage ? 'blocked' : null)
  const canSendToSelectedThread = isSelectedThreadReady(selectedThread, activeWorktreeId)
  const canOpenTerminalDrawer = terminalAvailable && typeof onOpenTerminalDrawer === 'function'

  useEffect(() => {
    setSelectedAgent((current) => {
      if (current && availableAgents.some((agent) => agent.id === current)) {
        return current
      }
      return preferredAgent ?? availableAgents[0]?.id ?? null
    })
  }, [availableAgents, preferredAgent])

  useEffect(() => {
    setComposerModelSelections(decodeAgentModelSelectionsKey(settingsModelSelectionsKey))
  }, [settingsModelSelectionsKey])

  useEffect(() => {
    const nextMode = settings?.agentThinkingMode
    if (nextMode && isTuiAgentThinkingMode(nextMode)) {
      setThinkingMode(nextMode)
    }
  }, [settings?.agentThinkingMode])

  function handleThinkingModeChange(mode: TuiAgentThinkingMode): void {
    setThinkingMode(mode)
    void updateSettings({ agentThinkingMode: mode })
  }

  useLayoutEffect(() => {
    submitContextKeyRef.current = submitContextKey
    submitSequenceRef.current += 1
    setSubmitResult(null)
    setSubmitting(false)
  }, [submitContextKey])

  async function handleSubmit(event?: React.FormEvent<HTMLFormElement>): Promise<void> {
    event?.preventDefault()
    if (submitting || !trimmedPrompt) {
      return
    }
    const submitSequence = submitSequenceRef.current + 1
    submitSequenceRef.current = submitSequence
    const requestContextKey = submitContextKey
    setSubmitting(true)
    const result = canSendToSelectedThread
      ? await submitAgentComposerMessage({
          activeWorktreeId,
          selectedThread,
          prompt
        })
      : launchSelectedAgent({
          activeWorktreeId,
          selectedAgent,
          selectedModel,
          thinkingMode,
          prompt: trimmedPrompt
        })
    if (
      submitSequenceRef.current !== submitSequence ||
      submitContextKeyRef.current !== requestContextKey
    ) {
      return
    }
    setSubmitResult(result)
    setSubmitting(false)
    if (result.status === 'sent') {
      setPrompt('')
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
      return
    }
    event.preventDefault()
    if (canSubmit) {
      void handleSubmit()
    }
  }

  function handleSelectedModelChange(modelId: string): void {
    if (!selectedAgent || !isTuiAgentModelSelection(selectedAgent, modelId)) {
      return
    }
    const nextSelections = { ...composerModelSelections }
    if (modelId === TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID) {
      delete nextSelections[selectedAgent]
    } else {
      nextSelections[selectedAgent] = modelId
    }
    setComposerModelSelections(nextSelections)
    void updateSettings({ agentModelSelections: nextSelections })
  }

  function handlePermissionModeChange(mode: AgentPermissionMode): void {
    if (mode === 'mixed') {
      return
    }
    void updateSettings(
      applyAgentPermissionMode({
        mode,
        agentDefaultArgs: settings?.agentDefaultArgs,
        agentDefaultEnv: settings?.agentDefaultEnv
      })
    )
  }

  function handleAttachBrowserContext(): void {
    if (!browserWorkbench.browserAnnotationMarkdown) {
      return
    }
    setPrompt((currentPrompt) => {
      const trimmedCurrent = currentPrompt.trimEnd()
      return trimmedCurrent
        ? `${trimmedCurrent}\n\n${browserWorkbench.browserAnnotationMarkdown}`
        : browserWorkbench.browserAnnotationMarkdown
    })
    setSubmitResult({
      status: 'sent',
      message: translate(
        'auto.components.agentWorkspace.composer.browserContextAttached',
        'Browser context attached.'
      )
    })
  }

  return (
    <form
      className="border-t border-border/70 bg-background/95 px-4 py-4"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-[26px] border border-border bg-card shadow-sm transition-colors focus-within:border-ring/45 focus-within:ring-2 focus-within:ring-ring/10">
          <textarea
            className="block min-h-24 w-full resize-none bg-transparent px-6 pb-3 pt-5 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/55 disabled:cursor-not-allowed disabled:opacity-60"
            value={prompt}
            placeholder={getPlaceholder(selectedThread, activeWorktreeId)}
            disabled={composerDisabled}
            aria-label={translate(
              'auto.components.agentWorkspace.composer.messageAgent',
              'Message agent'
            )}
            aria-describedby={statusMessage ? 'agent-workspace-composer-status' : undefined}
            rows={3}
            onChange={(event) => {
              setPrompt(event.target.value)
              if (submitResult?.status === 'sent' || submitResult?.reason === 'empty') {
                setSubmitResult(null)
              }
            }}
            onKeyDown={handleKeyDown}
          />
          <AgentComposerFooter
            statusMessage={statusMessage}
            statusTone={statusTone}
            permissionMode={permissionMode}
            onPermissionModeChange={handlePermissionModeChange}
            thinkingMode={thinkingMode}
            onThinkingModeChange={handleThinkingModeChange}
            canOpenTerminalDrawer={canOpenTerminalDrawer}
            onOpenTerminalDrawer={onOpenTerminalDrawer}
            canOpenBrowserWorkbench={browserWorkbench.browserAvailable}
            onOpenBrowserWorkbench={browserWorkbench.openBrowserWorkbench}
            canAttachBrowserContext={browserWorkbench.canAttachBrowserContext}
            browserAnnotationCount={browserWorkbench.browserAnnotationCount}
            onAttachBrowserContext={handleAttachBrowserContext}
            canSendToSelectedThread={canSendToSelectedThread}
            selectedThread={selectedThread}
            availableAgents={availableAgents}
            selectedAgent={selectedAgent}
            modelOptions={modelOptions}
            selectedModel={selectedModel}
            detectingAgents={detectedAgents.isLoading}
            onSelectedAgentChange={setSelectedAgent}
            onSelectedModelChange={handleSelectedModelChange}
            submitting={submitting}
            canSubmit={canSubmit}
          />
        </div>
      </div>
    </form>
  )
}

function isSelectedThreadReady(
  thread: AgentWorkspaceThread | null,
  activeWorktreeId: string | null
): boolean {
  return Boolean(thread && thread.phase === 'running' && activeWorktreeId === thread.worktreeId)
}

function getReadinessMessage({
  thread,
  activeWorktreeId,
  selectedAgent,
  detectingAgents
}: {
  thread: AgentWorkspaceThread | null
  activeWorktreeId: string | null
  selectedAgent: TuiAgent | null
  detectingAgents: boolean
}): string | null {
  if (thread && activeWorktreeId !== thread.worktreeId) {
    return translate(
      'auto.components.agentWorkspace.composer.threadNotActiveWorktree',
      'Switch to this worktree before sending a message.'
    )
  }
  if (isSelectedThreadReady(thread, activeWorktreeId)) {
    return null
  }
  if (!activeWorktreeId) {
    return translate(
      'auto.components.agentWorkspace.composer.selectWorkspaceBeforeLaunching',
      'Select a workspace before starting an agent.'
    )
  }
  if (detectingAgents) {
    return translate(
      'auto.components.agentWorkspace.composer.detectingProviders',
      'Detecting available agents for this workspace...'
    )
  }
  if (!selectedAgent) {
    return translate(
      'auto.components.agentWorkspace.composer.noDetectedProviders',
      'No detected agents are available for this workspace.'
    )
  }
  return null
}

function getPlaceholder(
  thread: AgentWorkspaceThread | null,
  activeWorktreeId: string | null
): string {
  if (!thread) {
    return translate(
      'auto.components.agentWorkspace.composer.startNewAgentPlaceholder',
      'Start a new agent session'
    )
  }
  if (thread.phase !== 'running') {
    return translate(
      'auto.components.agentWorkspace.composer.startAfterThreadPlaceholder',
      'Start a new agent; selected thread is {{phase}}',
      { phase: formatAgentWorkspacePhase(thread.phase) }
    )
  }
  if (activeWorktreeId !== thread.worktreeId) {
    return translate(
      'auto.components.agentWorkspace.composer.switchWorktreePlaceholder',
      'Switch to this worktree'
    )
  }
  return translate(
    'auto.components.agentWorkspace.composer.messageSelectedAgent',
    'Message the selected agent...'
  )
}

function encodeAgentModelSelections(
  selections: Partial<Record<TuiAgent, string>> | null | undefined
): string {
  return JSON.stringify(
    Object.entries(selections ?? {}).sort(([left], [right]) => left.localeCompare(right))
  )
}

function decodeAgentModelSelectionsKey(key: string): Partial<Record<TuiAgent, string>> {
  try {
    return Object.fromEntries(JSON.parse(key) as [TuiAgent, string][])
  } catch {
    return {}
  }
}
