import { Loader2, SendHorizontal } from 'lucide-react'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'
import { submitAgentComposerMessage, type AgentComposerSubmitResult } from './agent-composer-submit'
import type { AgentWorkspaceThread } from './agent-workspace-types'

export function AgentComposer({
  activeWorktreeId,
  selectedThread
}: {
  activeWorktreeId: string | null
  selectedThread: AgentWorkspaceThread | null
}): React.JSX.Element {
  const [prompt, setPrompt] = useState('')
  const [submitResult, setSubmitResult] = useState<AgentComposerSubmitResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const trimmedPrompt = prompt.trim()
  const readinessMessage = useMemo(
    () => getReadinessMessage(selectedThread, activeWorktreeId),
    [activeWorktreeId, selectedThread]
  )
  const submitContextKey = [
    activeWorktreeId,
    selectedThread?.id,
    selectedThread?.worktreeId,
    selectedThread?.phase
  ].join(':')
  const submitSequenceRef = useRef(0)
  const submitContextKeyRef = useRef(submitContextKey)
  const composerDisabled = submitting || readinessMessage !== null
  const canSubmit = !composerDisabled && trimmedPrompt.length > 0
  const statusMessage = submitResult?.message ?? readinessMessage
  const statusTone = submitResult?.status ?? (readinessMessage ? 'blocked' : null)

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
    const result = await submitAgentComposerMessage({
      activeWorktreeId,
      selectedThread,
      prompt
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

function getReadinessMessage(
  thread: AgentWorkspaceThread | null,
  activeWorktreeId: string | null
): string | null {
  if (!thread) {
    return translate(
      'auto.components.agentWorkspace.composer.selectRunningThread',
      'Select a running thread before sending a message.'
    )
  }
  if (thread.phase !== 'running') {
    return translate(
      'auto.components.agentWorkspace.composer.threadNotRunning',
      'This thread is {{phase}} and cannot receive messages yet.',
      { phase: formatAgentWorkspacePhase(thread.phase) }
    )
  }
  if (activeWorktreeId !== thread.worktreeId) {
    return translate(
      'auto.components.agentWorkspace.composer.threadNotActiveWorktree',
      'Switch to this worktree before sending a message.'
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
      'auto.components.agentWorkspace.composer.selectThreadPlaceholder',
      'Select a running thread'
    )
  }
  if (thread.phase !== 'running') {
    return translate(
      'auto.components.agentWorkspace.composer.threadNotReadyPlaceholder',
      'Thread is {{phase}}',
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
