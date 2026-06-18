import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useDetectedAgents } from '@/hooks/useDetectedAgents'
import { translate } from '@/i18n/i18n'
import { useAppStore } from '@/store'
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
  isTuiAgentModelSelection,
  resolveTuiAgentSelectedModel,
  TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID
} from '../../../../shared/tui-agent-models'
import type { TuiAgent } from '../../../../shared/types'
import {
  containsLegacyBrowserGrabDump,
  stripInjectedBrowserGrabDump
} from '../browser-pane/strip-browser-grab-dump'
import { AgentComposerFooter } from './AgentComposerFooter'
import { AgentComposerTextarea } from './AgentComposerTextarea'
import { resolveAgentComposerSelection } from './agent-composer-agent-selection'
import {
  decodeAgentModelSelectionsKey,
  encodeAgentModelSelections,
  getAgentComposerReadinessMessage,
  isSelectedThreadReady
} from './agent-composer-readiness'
import { launchSelectedAgent } from './agent-composer-launch'
import { useAgentComposerModelDiscovery } from './agent-composer-model-discovery'
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
  draftSessionId = null,
  pendingDraftAgent = null,
  onPendingDraftAgentConsumed,
  onDraftSessionAgentChange,
  onOpenTerminalDrawer
}: {
  activeWorktreeId: string | null
  selectedThread: AgentWorkspaceThread | null
  selectedProject?: AgentWorkspaceProject | null
  draftSessionId?: string | null
  terminalAvailable?: boolean
  browserWorkbench?: AgentBrowserWorkbenchState
  pendingDraftAgent?: TuiAgent | null
  onPendingDraftAgentConsumed?: () => void
  onDraftSessionAgentChange?: (agent: TuiAgent) => void
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
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
  const { availableAgents, preferredAgent } = useMemo(
    () =>
      resolveAgentComposerSelection({
        detectedIds: detectedAgents.detectedIds,
        defaultTuiAgent,
        disabledTuiAgents
      }),
    [defaultTuiAgent, detectedAgents.detectedIds, disabledTuiAgents]
  )
  const modelDiscovery = useAgentComposerModelDiscovery(selectedAgent, selectedProject)
  const modelOptions = modelDiscovery.options
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
      getAgentComposerReadinessMessage({
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
  const onDraftSessionAgentChangeRef = useRef(onDraftSessionAgentChange)
  onDraftSessionAgentChangeRef.current = onDraftSessionAgentChange
  const composerDisabled = submitting
  const canSubmit = !submitting && readinessMessage === null && trimmedPrompt.length > 0
  const statusMessage = submitResult?.message ?? readinessMessage
  const statusTone = submitResult?.status ?? (readinessMessage ? 'blocked' : null)
  const canSendToSelectedThread = isSelectedThreadReady(selectedThread, activeWorktreeId)
  const canOpenTerminalDrawer = terminalAvailable && typeof onOpenTerminalDrawer === 'function'

  // Why: grab copy used to paste DOM dumps into the composer; HMR can also leave a
  // stale formatter loaded until the host app reloads, so scrub on every update.
  useLayoutEffect(() => {
    const strippedPrompt = stripInjectedBrowserGrabDump(prompt)
    if (strippedPrompt !== prompt) {
      setPrompt(strippedPrompt)
    }
  }, [prompt])

  useEffect(() => {
    setSelectedAgent((current) => {
      if (current && availableAgents.some((agent) => agent.id === current)) {
        return current
      }
      return preferredAgent ?? availableAgents[0]?.id ?? null
    })
  }, [availableAgents, preferredAgent])

  useEffect(() => {
    if (!pendingDraftAgent) {
      return
    }
    if (availableAgents.some((agent) => agent.id === pendingDraftAgent)) {
      setSelectedAgent(pendingDraftAgent)
    }
    onPendingDraftAgentConsumed?.()
  }, [availableAgents, onPendingDraftAgentConsumed, pendingDraftAgent])

  useEffect(() => {
    if (selectedThread || !draftSessionId || !selectedAgent) {
      return
    }
    if (pendingDraftAgent === selectedAgent) {
      return
    }
    onDraftSessionAgentChangeRef.current?.(selectedAgent)
  }, [draftSessionId, pendingDraftAgent, selectedAgent, selectedThread])

  useEffect(() => {
    setComposerModelSelections(decodeAgentModelSelectionsKey(settingsModelSelectionsKey))
  }, [settingsModelSelectionsKey])

  useEffect(() => {
    const nextMode = settings?.agentThinkingMode
    if (nextMode && isTuiAgentThinkingMode(nextMode)) {
      setThinkingMode(nextMode)
    }
  }, [settings?.agentThinkingMode])

  const handleThinkingModeChange = useCallback(
    (mode: TuiAgentThinkingMode): void => {
      setThinkingMode(mode)
      void updateSettings({ agentThinkingMode: mode })
    },
    [updateSettings]
  )

  useLayoutEffect(() => {
    submitContextKeyRef.current = submitContextKey
    submitSequenceRef.current += 1
    setSubmitResult(null)
    setSubmitting(false)
  }, [submitContextKey])

  const handleSubmit = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>): Promise<void> => {
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
    },
    [
      activeWorktreeId,
      canSendToSelectedThread,
      prompt,
      selectedAgent,
      selectedModel,
      selectedThread,
      submitContextKey,
      submitting,
      thinkingMode,
      trimmedPrompt
    ]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
        return
      }
      event.preventDefault()
      if (canSubmit) {
        void handleSubmit()
      }
    },
    [canSubmit, handleSubmit]
  )

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>): void => {
      const pastedText = event.clipboardData.getData('text/plain')
      if (!containsLegacyBrowserGrabDump(pastedText)) {
        return
      }
      event.preventDefault()
      const stripped = stripInjectedBrowserGrabDump(pastedText)
      if (!stripped) {
        return
      }
      const textarea = event.currentTarget
      const start = textarea.selectionStart ?? prompt.length
      const end = textarea.selectionEnd ?? prompt.length
      setPrompt(
        stripInjectedBrowserGrabDump(`${prompt.slice(0, start)}${stripped}${prompt.slice(end)}`)
      )
    },
    [prompt]
  )

  const handlePromptChange = useCallback(
    (value: string): void => {
      setPrompt(stripInjectedBrowserGrabDump(value))
      if (submitResult?.status === 'sent' || submitResult?.reason === 'empty') {
        setSubmitResult(null)
      }
    },
    [submitResult?.reason, submitResult?.status]
  )

  const handleSelectedModelChange = useCallback(
    (modelId: string): void => {
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
    },
    [composerModelSelections, selectedAgent, updateSettings]
  )

  const handlePermissionModeChange = useCallback(
    (mode: AgentPermissionMode): void => {
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
    },
    [settings?.agentDefaultArgs, settings?.agentDefaultEnv, updateSettings]
  )

  const handleAttachBrowserContext = useCallback((): void => {
    if (!browserWorkbench.browserAnnotationMarkdown) {
      return
    }
    setPrompt((currentPrompt) => {
      const cleanedCurrent = stripInjectedBrowserGrabDump(currentPrompt)
      const attachment = browserWorkbench.browserAnnotationMarkdown
      return cleanedCurrent ? `${cleanedCurrent}\n\n${attachment}` : attachment
    })
    setSubmitResult({
      status: 'sent',
      message: translate(
        'auto.components.agentWorkspace.composer.browserContextAttached',
        'Browser context attached.'
      )
    })
  }, [browserWorkbench.browserAnnotationMarkdown])

  const handleSelectedAgentChange = useCallback(
    (agent: TuiAgent | null): void => {
      setSelectedAgent(agent)
      if (!selectedThread && draftSessionId && agent) {
        onDraftSessionAgentChangeRef.current?.(agent)
      }
    },
    [draftSessionId, selectedThread]
  )

  return (
    <form className="bg-transparent px-6 pb-8 pt-4" onSubmit={(event) => void handleSubmit(event)}>
      <div className="mx-auto w-full max-w-[1040px]">
        <div className="agent-composer-shell rounded-none border border-border/80 bg-card/95 shadow-xs transition-colors focus-within:border-ring/45 focus-within:ring-2 focus-within:ring-ring/10">
          <AgentComposerTextarea
            value={prompt}
            activeWorktreeId={activeWorktreeId}
            selectedThread={selectedThread}
            disabled={composerDisabled}
            statusMessage={statusMessage}
            onChange={handlePromptChange}
            onPaste={handlePaste}
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
            modelDiscoveryLoading={modelDiscovery.loading}
            modelDiscoveryError={modelDiscovery.error}
            detectingAgents={detectedAgents.isLoading}
            onSelectedAgentChange={handleSelectedAgentChange}
            onSelectedModelChange={handleSelectedModelChange}
            submitting={submitting}
            canSubmit={canSubmit}
          />
        </div>
      </div>
    </form>
  )
}
