import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useDetectedAgents } from '@/hooks/useDetectedAgents'
import { useAppStore } from '@/store'
import { resolveAgentPermissionModeSummary } from '../../../../shared/tui-agent-permissions'
import {
  isTuiAgentThinkingMode,
  type TuiAgentThinkingMode
} from '../../../../shared/tui-agent-thinking'
import {
  resolveTuiAgentSelectedModel,
  TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID
} from '../../../../shared/tui-agent-models'
import type { TuiAgent } from '../../../../shared/types'
import { stripInjectedBrowserGrabDump } from '../browser-pane/strip-browser-grab-dump'
import { AgentComposerForm } from './AgentComposerForm'
import type { AgentComposerProps } from './agent-composer-props'
import { resolveAgentComposerSelection } from './agent-composer-agent-selection'
import {
  decodeAgentModelSelectionsKey,
  encodeAgentModelSelections,
  getAgentComposerReadinessMessage,
  isSelectedThreadReady
} from './agent-composer-readiness'
import { createPromptDeliveredFeedback } from './agent-composer-delivery-feedback'
import { launchSelectedAgent } from './agent-composer-launch'
import { getCompletedThreadRecoveryFeedback } from './agent-composer-completed-thread-recovery'
import { useAgentComposerModelDiscovery } from './agent-composer-model-discovery'
import { handleAgentComposerPaste } from './agent-composer-paste'
import { launchProjectlessPlanningComposerAgent } from './agent-composer-projectless-launch'
import { submitAgentComposerMessage } from './agent-composer-submit'
import { notifyAgentComposerMessageSent } from './agent-composer-message-sent'
import {
  EMPTY_DISABLED_TUI_AGENTS,
  getAgentComposerDetectionTarget,
  type AgentComposerFeedback
} from './agent-composer-state'
import type { AgentWorkspaceTimelineEntry } from './agent-workspace-types'
import { useAgentBrowserWorkbench } from './useAgentBrowserWorkbench'
import { useAgentComposerBrowserContextAttachment } from './useAgentComposerBrowserContextAttachment'
import { useAgentComposerRecoverablePromptActions } from './useAgentComposerRecoverablePromptActions'
import { useAgentComposerSettingsActions } from './useAgentComposerSettingsActions'

const EMPTY_AGENT_TIMELINE: readonly AgentWorkspaceTimelineEntry[] = []

export function AgentComposer({
  activeWorktreeId,
  selectedThread,
  timeline = EMPTY_AGENT_TIMELINE,
  selectedProject = null,
  terminalAvailable = false,
  browserWorkbench: browserWorkbenchProp,
  draftSessionId = null,
  pendingDraftAgent = null,
  onPendingDraftAgentConsumed,
  onDraftSessionAgentChange,
  onPendingAgentLaunch,
  onMessageSent,
  onOpenTerminalDrawer
}: AgentComposerProps): React.JSX.Element {
  const [prompt, setPrompt] = useState('')
  const [submitResult, setSubmitResult] = useState<AgentComposerFeedback | null>(null)
  const [recoverablePrompt, setRecoverablePrompt] = useState<string | null>(null)
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
  const detectionTarget = getAgentComposerDetectionTarget(selectedProject, activeWorktreeId)
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
      const launchingNewAgent = !canSendToSelectedThread && Boolean(activeWorktreeId)
      const result = canSendToSelectedThread
        ? await submitAgentComposerMessage({
            activeWorktreeId,
            selectedThread,
            prompt
          })
        : activeWorktreeId
          ? launchSelectedAgent({
              activeWorktreeId,
              selectedAgent,
              selectedModel,
              thinkingMode,
              prompt: trimmedPrompt,
              onPromptDelivered: () => {
                if (
                  submitSequenceRef.current !== submitSequence ||
                  submitContextKeyRef.current !== requestContextKey
                ) {
                  return
                }
                setSubmitResult(createPromptDeliveredFeedback(selectedAgent))
                setPrompt((currentPrompt) =>
                  currentPrompt.trim() === trimmedPrompt ? '' : currentPrompt
                )
              }
            })
          : await launchProjectlessPlanningComposerAgent({
              prompt: trimmedPrompt,
              selectedAgent
            })
      if (
        submitSequenceRef.current !== submitSequence ||
        submitContextKeyRef.current !== requestContextKey
      ) {
        return
      }
      setSubmitResult(result)
      setSubmitting(false)
      if (launchingNewAgent && result.status === 'launching') {
        onPendingAgentLaunch?.()
      }
      if (canSendToSelectedThread && result.status === 'sent') {
        notifyAgentComposerMessageSent(onMessageSent, result)
      }
      if ((canSendToSelectedThread && result.status === 'sent') || result.status === 'launching') {
        setPrompt('')
      }
      if (canSendToSelectedThread && result.status === 'sent') {
        const recoveryFeedback = getCompletedThreadRecoveryFeedback({ result, selectedThread })
        if (recoveryFeedback) {
          setRecoverablePrompt(result.prompt)
          setSubmitResult(recoveryFeedback)
        } else {
          setRecoverablePrompt(null)
        }
      }
    },
    [
      activeWorktreeId,
      canSendToSelectedThread,
      prompt,
      selectedAgent,
      selectedModel,
      selectedThread,
      onMessageSent,
      onPendingAgentLaunch,
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
      handleAgentComposerPaste({ event, prompt, setPrompt })
    },
    [prompt]
  )

  const handlePromptChange = useCallback(
    (value: string): void => {
      setPrompt(stripInjectedBrowserGrabDump(value))
      setRecoverablePrompt(null)
      if (submitResult?.status === 'sent' || submitResult?.reason === 'empty') {
        setSubmitResult(null)
      }
    },
    [submitResult?.reason, submitResult?.status]
  )

  const { restoreRecoverablePrompt, retryRecoverablePrompt } =
    useAgentComposerRecoverablePromptActions({
      activeWorktreeId,
      selectedThread,
      recoverablePrompt,
      submitting,
      canSendToSelectedThread,
      onMessageSent,
      setPrompt,
      setRecoverablePrompt,
      setSubmitResult,
      setSubmitting
    })

  const handleRetryRecoverablePrompt = useCallback((): void => {
    void retryRecoverablePrompt()
  }, [retryRecoverablePrompt])

  const { changeSelectedModel, changePermissionMode } = useAgentComposerSettingsActions({
    selectedAgent,
    composerModelSelections,
    settings,
    updateSettings,
    setComposerModelSelections
  })

  const handleAttachBrowserContext = useAgentComposerBrowserContextAttachment({
    browserAnnotationMarkdown: browserWorkbench.browserAnnotationMarkdown,
    setPrompt,
    setSubmitResult
  })

  function handleSelectedAgentChange(agent: TuiAgent | null): void {
    setSelectedAgent(agent)
  }

  return (
    <AgentComposerForm
      prompt={prompt}
      activeWorktreeId={activeWorktreeId}
      selectedProject={selectedProject}
      selectedThread={selectedThread}
      timeline={timeline}
      composerDisabled={composerDisabled}
      statusMessage={statusMessage}
      statusTone={statusTone}
      permissionMode={permissionMode}
      thinkingMode={thinkingMode}
      canOpenTerminalDrawer={canOpenTerminalDrawer}
      onOpenTerminalDrawer={onOpenTerminalDrawer}
      canOpenBrowserWorkbench={browserWorkbench.browserAvailable}
      onOpenBrowserWorkbench={browserWorkbench.openBrowserWorkbench}
      canAttachBrowserContext={browserWorkbench.canAttachBrowserContext}
      browserAnnotationCount={browserWorkbench.browserAnnotationCount}
      onAttachBrowserContext={handleAttachBrowserContext}
      canSendToSelectedThread={canSendToSelectedThread}
      availableAgents={availableAgents}
      selectedAgent={selectedAgent}
      modelOptions={modelOptions}
      selectedModel={selectedModel}
      modelDiscoveryLoading={modelDiscovery.loading}
      modelDiscoveryError={modelDiscovery.error}
      detectingAgents={detectedAgents.isLoading}
      submitting={submitting}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      onPromptChange={handlePromptChange}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      onPermissionModeChange={changePermissionMode}
      onThinkingModeChange={handleThinkingModeChange}
      onSelectedAgentChange={handleSelectedAgentChange}
      onSelectedModelChange={changeSelectedModel}
      recoverablePrompt={recoverablePrompt}
      onRestoreRecoverablePrompt={restoreRecoverablePrompt}
      onRetryRecoverablePrompt={handleRetryRecoverablePrompt}
    />
  )
}
