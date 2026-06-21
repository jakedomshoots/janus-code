import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useDetectedAgents } from '@/hooks/useDetectedAgents'
import { useAppStore } from '@/store'
import { resolveAgentPermissionModeSummary } from '../../../../shared/tui-agent-permissions'
import type { TuiAgentThinkingMode } from '../../../../shared/tui-agent-thinking'
import {
  resolveTuiAgentSelectedModel,
  TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID
} from '../../../../shared/tui-agent-models'
import type { TuiAgent } from '../../../../shared/types'
import { agentKindToTuiAgent } from '../../../../shared/agent-kind'
import type { AgentKind } from '../../../../shared/telemetry-events'
import { stripInjectedBrowserGrabDump } from '../browser-pane/strip-browser-grab-dump'
import { AgentComposerForm } from './AgentComposerForm'
import type { AgentComposerProps } from './agent-composer-props'
import { resolveAgentComposerSelection } from './agent-composer-agent-selection'
import {
  encodeAgentModelSelections,
  getAgentComposerReadinessMessage,
  isSelectedThreadReady
} from './agent-composer-readiness'
import { useAgentComposerModelDiscovery } from './agent-composer-model-discovery'
import type { AgentComposerBrowserContextSnapshot } from './agent-composer-context-manifest'
import {
  buildAgentComposerVerificationExecutionContext,
  resolveAgentWorkspaceProjectLaunchPlatform
} from './agent-composer-verification-execution'
import {
  EMPTY_DISABLED_TUI_AGENTS,
  getAgentComposerDetectionTarget,
  type AgentComposerFeedback
} from './agent-composer-state'
import {
  isAgentComposerThreadBusy,
  isQueuedFollowUpTarget,
  type AgentComposerQueuedFollowUp
} from './agent-composer-queued-follow-up'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'
import { useAgentBrowserWorkbench } from './useAgentBrowserWorkbench'
import { useAgentComposerBrowserContextAttachment } from './useAgentComposerBrowserContextAttachment'
import { useAgentComposerContextManifest } from './useAgentComposerContextManifest'
import { useAgentComposerRecoverablePromptActions } from './useAgentComposerRecoverablePromptActions'
import { useAgentComposerSettingsActions } from './useAgentComposerSettingsActions'
import { useAgentComposerStateSync } from './useAgentComposerStateSync'
import { useAgentComposerSubmit } from './useAgentComposerSubmit'
import { useAgentComposerTextInput } from './useAgentComposerTextInput'
import { useAgentComposerVoicePrompt } from './useAgentComposerVoicePrompt'
import { useCompletedThreadRecoveryCleanup } from './useCompletedThreadRecoveryCleanup'

const EMPTY_AGENT_TIMELINE: readonly AgentWorkspaceTimelineEntry[] = []
const EMPTY_AGENT_DIFFS: readonly AgentWorkspaceDiffSummary[] = []

export function AgentComposer({
  activeWorktreeId,
  selectedThread,
  timeline = EMPTY_AGENT_TIMELINE,
  diffs = EMPTY_AGENT_DIFFS,
  review = null,
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
  const [verificationCommand, setVerificationCommand] = useState('')
  const [queuedFollowUp, setQueuedFollowUp] = useState<AgentComposerQueuedFollowUp | null>(null)
  const [agentMemoryContextEnabled, setAgentMemoryContextEnabled] = useState(true)
  // Why: live browser annotations can change after attach; removals must target
  // the exact markdown that was inserted into the draft.
  const [attachedBrowserContext, setAttachedBrowserContext] =
    useState<AgentComposerBrowserContextSnapshot | null>(null)
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
  const rateLimits = useAppStore((state) => state.rateLimits)
  const browserWorkbenchInternal = useAgentBrowserWorkbench({
    activeWorktreeId,
    onOpenTerminalDrawer
  })
  const browserWorkbench = browserWorkbenchProp ?? browserWorkbenchInternal
  const settingsModelSelectionsKey = encodeAgentModelSelections(settings?.agentModelSelections)
  const defaultTuiAgent = settings?.defaultTuiAgent ?? null
  const disabledTuiAgents = settings?.disabledTuiAgents ?? EMPTY_DISABLED_TUI_AGENTS
  const taskFitHintsEnabled = settings?.agentTaskFitHintsEnabled !== false
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
  const trimmedVerificationCommand = verificationCommand.trim()
  const agentLaunchPlatform = useMemo(
    () => resolveAgentWorkspaceProjectLaunchPlatform(selectedProject),
    [selectedProject]
  )
  const verificationExecutionContext = useMemo(
    () =>
      trimmedVerificationCommand
        ? buildAgentComposerVerificationExecutionContext(selectedProject)
        : undefined,
    [selectedProject, trimmedVerificationCommand]
  )
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
  const queuedFollowUpAutoSendAttemptRef = useRef<string | null>(null)
  const submittingRef = useRef(submitting)
  const composerTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const composerDisabled = submitting
  const voiceEnabled = settings?.voice?.enabled === true
  const voiceModelId = settings?.voice?.sttModel ?? ''
  const { voicePromptVisible, voicePromptState, voicePromptDisabled, handleToggleVoicePrompt } =
    useAgentComposerVoicePrompt({
      composerDisabled,
      textareaRef: composerTextareaRef,
      voiceEnabled,
      voiceModelId
    })
  const canSubmit = !submitting && readinessMessage === null && trimmedPrompt.length > 0
  const statusMessage = submitResult?.message ?? readinessMessage
  const statusTone = submitResult?.status ?? (readinessMessage ? 'blocked' : null)
  const canSendToSelectedThread = isSelectedThreadReady(selectedThread, activeWorktreeId)
  const contextHintAgent = canSendToSelectedThread
    ? agentKindToTuiAgent(selectedThread?.agentKind as AgentKind | null)
    : selectedAgent
  const selectedThreadBusy = isAgentComposerThreadBusy({ thread: selectedThread, timeline })
  const visibleQueuedFollowUp = isQueuedFollowUpTarget({
    queuedFollowUp,
    activeWorktreeId,
    selectedThread
  })
    ? queuedFollowUp
    : null
  const canOpenTerminalDrawer = terminalAvailable && typeof onOpenTerminalDrawer === 'function'
  const {
    promptContextManifest,
    handleRemoveBrowserContext,
    handleRemoveVerificationCommand,
    handleRemoveAgentMemoryContext
  } = useAgentComposerContextManifest({
    prompt,
    selectedProject,
    selectedThread,
    diffs,
    review,
    browserAnnotationMarkdown: browserWorkbench.browserAnnotationMarkdown,
    browserAnnotationCount: browserWorkbench.browserAnnotationCount,
    browserContextSourceId: browserWorkbench.browserContextSourceId ?? null,
    attachedBrowserContext,
    verificationCommand,
    agentMemoryContextEnabled,
    contextHintAgent,
    canSendToSelectedThread,
    setPrompt,
    setAttachedBrowserContext,
    setSubmitResult,
    setVerificationCommand,
    setAgentMemoryContextEnabled
  })

  useLayoutEffect(() => {
    const strippedPrompt = stripInjectedBrowserGrabDump(prompt)
    if (strippedPrompt !== prompt) {
      setPrompt(strippedPrompt)
    }
  }, [prompt])

  useAgentComposerStateSync({
    availableAgents,
    preferredAgent,
    pendingDraftAgent,
    selectedAgent,
    selectedThread,
    draftSessionId,
    settingsModelSelectionsKey,
    settingsThinkingMode: settings?.agentThinkingMode,
    onPendingDraftAgentConsumed,
    onDraftSessionAgentChange,
    setSelectedAgent,
    setComposerModelSelections,
    setThinkingMode
  })

  const handleThinkingModeChange = useCallback(
    (mode: TuiAgentThinkingMode): void => {
      setThinkingMode(mode)
      void updateSettings({ agentThinkingMode: mode })
    },
    [updateSettings]
  )

  if (submitContextKeyRef.current !== submitContextKey) {
    submitContextKeyRef.current = submitContextKey
    submitSequenceRef.current += 1
    if (submitResult !== null) {
      setSubmitResult(null)
    }
    if (submitting) {
      setSubmitting(false)
    }
    if (!agentMemoryContextEnabled) {
      setAgentMemoryContextEnabled(true)
    }
  }

  useEffect(() => {
    submittingRef.current = submitting
  }, [submitting])

  const { handleSubmit, handleQueuedFollowUpChange, handleDeleteQueuedFollowUp } =
    useAgentComposerSubmit({
      activeWorktreeId,
      selectedThread,
      selectedThreadBusy,
      canSendToSelectedThread,
      selectedAgent,
      selectedModel,
      thinkingMode,
      prompt,
      trimmedPrompt,
      trimmedVerificationCommand,
      verificationExecutionContext,
      promptContextManifest,
      agentLaunchPlatform,
      composerModelSelections,
      submitContextKey,
      submitting,
      queuedFollowUp,
      submitSequenceRef,
      submitContextKeyRef,
      queuedFollowUpAutoSendAttemptRef,
      submittingRef,
      onMessageSent,
      onPendingAgentLaunch,
      setPrompt,
      setVerificationCommand,
      setQueuedFollowUp,
      setSubmitResult,
      setSubmitting,
      setRecoverablePrompt,
      setAgentMemoryContextEnabled
    })

  const { handleKeyDown, handlePaste, handlePromptChange } = useAgentComposerTextInput({
    prompt,
    canSubmit,
    submitResult,
    handleSubmit,
    setPrompt,
    setRecoverablePrompt,
    setSubmitResult
  })

  useCompletedThreadRecoveryCleanup({
    recoverablePrompt,
    timeline,
    setRecoverablePrompt,
    setSubmitResult
  })

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
    browserAnnotationCount: browserWorkbench.browserAnnotationCount,
    browserContextSourceId: browserWorkbench.browserContextSourceId ?? null,
    onBrowserContextAttached: setAttachedBrowserContext,
    setPrompt,
    setSubmitResult
  })

  function handleSelectedAgentChange(agent: TuiAgent | null): void {
    setSelectedAgent(agent)
  }

  return (
    <AgentComposerForm
      prompt={prompt}
      textareaRef={composerTextareaRef}
      activeWorktreeId={activeWorktreeId}
      selectedProject={selectedProject}
      selectedThread={selectedThread}
      timeline={timeline}
      composerDisabled={composerDisabled}
      statusMessage={statusMessage}
      statusTone={statusTone}
      voicePromptVisible={voicePromptVisible}
      voicePromptState={voicePromptState}
      voicePromptDisabled={voicePromptDisabled}
      onToggleVoicePrompt={handleToggleVoicePrompt}
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
      taskFitHintsEnabled={taskFitHintsEnabled}
      providerRateLimits={rateLimits}
      modelOptions={modelOptions}
      selectedModel={selectedModel}
      modelDiscoveryLoading={modelDiscovery.loading}
      modelDiscoveryError={modelDiscovery.error}
      detectingAgents={detectedAgents.isLoading}
      submitting={submitting}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      onPromptChange={handlePromptChange}
      promptContextManifest={promptContextManifest}
      onRemoveBrowserContext={handleRemoveBrowserContext}
      onRemoveVerificationCommand={handleRemoveVerificationCommand}
      onRemoveAgentMemoryContext={handleRemoveAgentMemoryContext}
      queuedFollowUp={visibleQueuedFollowUp}
      onQueuedFollowUpChange={handleQueuedFollowUpChange}
      onDeleteQueuedFollowUp={handleDeleteQueuedFollowUp}
      verificationCommand={verificationCommand}
      onVerificationCommandChange={setVerificationCommand}
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
