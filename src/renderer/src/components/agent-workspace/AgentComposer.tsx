import { Loader2, SendHorizontal } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDetectedAgents } from '@/hooks/useDetectedAgents'
import { translate } from '@/i18n/i18n'
import { AgentIcon, getAgentCatalog } from '@/lib/agent-catalog'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import { launchAgentInNewTab } from '@/lib/launch-agent-in-new-tab'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'
import { filterEnabledTuiAgents, pickTuiAgent } from '../../../../shared/tui-agent-selection'
import type { TuiAgent } from '../../../../shared/types'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'
import { submitAgentComposerMessage, type AgentComposerSubmitResult } from './agent-composer-submit'
import type { AgentWorkspaceProject, AgentWorkspaceThread } from './agent-workspace-types'

type AgentComposerFeedback = Pick<AgentComposerSubmitResult, 'message' | 'status'> & {
  reason?: string
}

export function AgentComposer({
  activeWorktreeId,
  selectedThread,
  selectedProject = null
}: {
  activeWorktreeId: string | null
  selectedThread: AgentWorkspaceThread | null
  selectedProject?: AgentWorkspaceProject | null
}): React.JSX.Element {
  const [prompt, setPrompt] = useState('')
  const [submitResult, setSubmitResult] = useState<AgentComposerFeedback | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<TuiAgent | null>(null)
  const defaultTuiAgent = useAppStore((state) => state.settings?.defaultTuiAgent ?? null)
  const disabledTuiAgents = useAppStore((state) => state.settings?.disabledTuiAgents ?? [])
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
    selectedAgent
  ].join(':')
  const submitSequenceRef = useRef(0)
  const submitContextKeyRef = useRef(submitContextKey)
  const composerDisabled = submitting || readinessMessage !== null
  const canSubmit = !composerDisabled && trimmedPrompt.length > 0
  const statusMessage = submitResult?.message ?? readinessMessage
  const statusTone = submitResult?.status ?? (readinessMessage ? 'blocked' : null)
  const canSendToSelectedThread = isSelectedThreadReady(selectedThread, activeWorktreeId)

  useEffect(() => {
    setSelectedAgent((current) => {
      if (current && availableAgents.some((agent) => agent.id === current)) {
        return current
      }
      return preferredAgent ?? availableAgents[0]?.id ?? null
    })
  }, [availableAgents, preferredAgent])

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

  return (
    <form className="border-t border-border p-3" onSubmit={(event) => void handleSubmit(event)}>
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-md border border-border bg-card shadow-xs transition-colors focus-within:border-ring/45">
          <textarea
            className="block min-h-20 w-full resize-none bg-transparent px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="flex min-h-10 items-center justify-between gap-3 border-t border-border/65 px-2.5 py-2">
            <p
              id="agent-workspace-composer-status"
              className={cn(
                'min-w-0 flex-1 text-xs',
                statusTone === 'error'
                  ? 'text-destructive'
                  : statusTone === 'blocked'
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground'
              )}
              aria-live="polite"
            >
              {statusMessage ?? ''}
            </p>
            {canSendToSelectedThread ? (
              <div className="flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                {translate('auto.components.agentWorkspace.composer.sendingTo', 'Sending to')}
                <span className="font-medium text-foreground">
                  {formatAgentTypeLabel(selectedThread?.agentKind)}
                </span>
              </div>
            ) : (
              <AgentProviderSelect
                agents={availableAgents}
                value={selectedAgent}
                detecting={detectedAgents.isLoading}
                onChange={setSelectedAgent}
              />
            )}
            <Button type="submit" size="sm" disabled={!canSubmit}>
              {submitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <SendHorizontal className="size-4" aria-hidden="true" />
              )}
              {translate('auto.components.agentWorkspace.layout.send', 'Send')}
            </Button>
          </div>
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

function launchSelectedAgent({
  activeWorktreeId,
  selectedAgent,
  prompt
}: {
  activeWorktreeId: string | null
  selectedAgent: TuiAgent | null
  prompt: string
}): AgentComposerFeedback {
  if (!activeWorktreeId || !selectedAgent) {
    return {
      status: 'blocked',
      reason: 'no-launch-target',
      message: translate(
        'auto.components.agentWorkspace.composer.selectProviderBeforeLaunching',
        'Select an available agent before sending.'
      )
    }
  }
  const result = launchAgentInNewTab({
    agent: selectedAgent,
    worktreeId: activeWorktreeId,
    prompt,
    launchSource: 'sidebar'
  })
  const agentLabel = getAgentLabel(selectedAgent)
  if (!result) {
    return {
      status: 'error',
      reason: 'launch-failed',
      message: translate(
        'auto.components.agentWorkspace.composer.launchFailed',
        'Could not start {{agent}}.',
        { agent: agentLabel }
      )
    }
  }
  return {
    status: 'sent',
    message: translate(
      'auto.components.agentWorkspace.composer.agentStarted',
      'Started {{agent}}.',
      {
        agent: agentLabel
      }
    )
  }
}

function getAgentLabel(agent: TuiAgent): string {
  return getAgentCatalog().find((candidate) => candidate.id === agent)?.label ?? agent
}

function AgentProviderSelect({
  agents,
  value,
  detecting,
  onChange
}: {
  agents: readonly { id: TuiAgent; label: string }[]
  value: TuiAgent | null
  detecting: boolean
  onChange: (agent: TuiAgent | null) => void
}): React.JSX.Element {
  const disabled = detecting || agents.length === 0
  return (
    <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
      <span>{translate('auto.components.agentWorkspace.composer.provider', 'Provider')}</span>
      <select
        aria-label={translate(
          'auto.components.agentWorkspace.composer.agentProvider',
          'Agent provider'
        )}
        value={value ?? ''}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value ? (event.target.value as TuiAgent) : null)}
        className="h-8 max-w-44 rounded-md border border-input bg-background px-2 text-xs text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {disabled ? (
          <option value="">
            {detecting
              ? translate(
                  'auto.components.agentWorkspace.composer.detectingAgents',
                  'Detecting agents'
                )
              : translate(
                  'auto.components.agentWorkspace.composer.noAgentsDetected',
                  'No agents detected'
                )}
          </option>
        ) : null}
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.label}
          </option>
        ))}
      </select>
      {value ? <AgentIcon agent={value} size={14} /> : null}
    </label>
  )
}
