import { useMemo, useState } from 'react'
import {
  Check,
  Clipboard,
  ExternalLink,
  FileCheck2,
  GitBranch,
  PanelBottom,
  ShieldAlert
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import type {
  AgentWorkspaceApproval,
  AgentWorkspaceDiffSummary,
  AgentWorkspacePlan,
  AgentWorkspaceProject,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'
import {
  buildAgentWorkspaceCandidates,
  type AgentWorkspaceCandidate
} from './agent-workspace-candidates'
import { buildAgentWorkspaceEvidence } from './agent-workspace-evidence'
import { resolveAgentWorkspaceLifecycle } from './agent-workspace-lifecycle'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'

export function AgentWorkspaceEvidenceRail({
  project,
  thread,
  threads,
  plan,
  approval,
  diffs,
  allDiffs,
  review,
  reviews,
  timeline,
  terminalAvailable,
  browserAvailable,
  onSelectThread,
  onOpenBrowserWorkbench,
  onOpenTerminalDrawer,
  onReviewDiffs
}: {
  project: AgentWorkspaceProject | null
  thread: AgentWorkspaceThread | null
  threads: readonly AgentWorkspaceThread[]
  plan: AgentWorkspacePlan | null
  approval: AgentWorkspaceApproval | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  allDiffs: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
  reviews: readonly AgentWorkspaceReviewSummary[]
  timeline: readonly AgentWorkspaceTimelineEntry[]
  terminalAvailable: boolean
  browserAvailable: boolean
  onSelectThread?: (threadId: string) => void
  onOpenBrowserWorkbench?: () => void
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
  onReviewDiffs?: () => void
}): React.JSX.Element {
  const [copied, setCopied] = useState(false)
  const lifecycle = resolveAgentWorkspaceLifecycle({ thread, diffs, review })
  const evidence = buildAgentWorkspaceEvidence({
    thread,
    plan,
    approval,
    diffs,
    review,
    timeline,
    terminalAvailable,
    browserAvailable
  })
  const candidates = useMemo(
    () =>
      buildAgentWorkspaceCandidates({
        threads,
        selectedThreadId: thread?.id ?? null,
        diffs: allDiffs,
        reviews
      }),
    [allDiffs, reviews, thread?.id, threads]
  )

  function handleCopyRecoveryContext(): void {
    const text = buildRecoveryContextText({
      project,
      thread,
      lifecycleLabel: lifecycle.currentLabel
    })
    const writeText =
      window.api?.ui?.writeClipboardText ?? navigator.clipboard?.writeText.bind(navigator.clipboard)
    if (!writeText) {
      return
    }
    void writeText(text).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    })
  }

  return (
    <div className="mb-4 space-y-4" data-agent-evidence-rail="true">
      <section
        aria-label={translate('auto.components.agentWorkspace.evidence.lifecycle', 'Lifecycle')}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            {translate('auto.components.agentWorkspace.evidence.lifecycle', 'Lifecycle')}
          </h2>
          <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground">
            {lifecycle.currentLabel}
          </span>
        </div>
        <ol className="space-y-1">
          {lifecycle.steps.map((step) => (
            <li
              key={step.id}
              className={cn(
                'flex min-h-7 items-center gap-2 rounded-lg px-2 text-xs transition-colors',
                step.state === 'current'
                  ? 'bg-accent text-accent-foreground'
                  : step.state === 'complete'
                    ? 'text-foreground'
                    : 'text-muted-foreground'
              )}
            >
              <span
                className={cn(
                  'flex size-4 shrink-0 items-center justify-center rounded-full border',
                  step.state === 'complete'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background'
                )}
                aria-hidden="true"
              >
                {step.state === 'complete' ? <Check className="size-3" /> : null}
              </span>
              <span className="truncate">{step.label}</span>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-muted-foreground">{lifecycle.detail}</p>
      </section>

      <CandidateSection
        candidates={candidates.candidates}
        recommendation={candidates.recommendation}
        recommendedCandidateId={candidates.recommendedCandidateId}
        onSelectThread={onSelectThread}
      />

      <section
        aria-label={translate('auto.components.agentWorkspace.evidence.evidence', 'Evidence')}
      >
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">
          {translate('auto.components.agentWorkspace.evidence.evidence', 'Evidence')}
        </h2>
        <div className="space-y-1">
          {evidence.items.map((item) => (
            <div
              key={item.id}
              className="flex min-w-0 items-start gap-2 rounded-lg border border-border/70 bg-background/60 p-2"
            >
              <EvidenceDot tone={item.tone} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-foreground">{item.label}</div>
                <div className="truncate text-[11px] text-muted-foreground">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="rounded-xl border border-border bg-background/60 p-3"
        aria-label={translate(
          'auto.components.agentWorkspace.evidence.previewHealth',
          'Preview health'
        )}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <ShieldAlert className="size-4 text-muted-foreground" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.evidence.previewHealth', 'Preview health')}
          <span className="ml-auto rounded-md border border-border bg-card px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {evidence.preview.label}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{evidence.preview.detail}</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
          {evidence.preview.recoverySteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          {browserAvailable && onOpenBrowserWorkbench ? (
            <Button type="button" variant="outline" size="xs" onClick={onOpenBrowserWorkbench}>
              <ExternalLink className="size-3" aria-hidden="true" />
              {translate('auto.components.agentWorkspace.evidence.openPreview', 'Open preview')}
            </Button>
          ) : null}
          {terminalAvailable && onOpenTerminalDrawer ? (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onOpenTerminalDrawer('debug-button')}
            >
              <PanelBottom className="size-3" aria-hidden="true" />
              {translate('auto.components.agentWorkspace.evidence.openTerminal', 'Open terminal')}
            </Button>
          ) : null}
          {diffs.length > 0 && onReviewDiffs ? (
            <Button type="button" variant="outline" size="xs" onClick={onReviewDiffs}>
              <FileCheck2 className="size-3" aria-hidden="true" />
              {translate('auto.components.agentWorkspace.evidence.reviewChanges', 'Review changes')}
            </Button>
          ) : null}
          <Button type="button" variant="ghost" size="xs" onClick={handleCopyRecoveryContext}>
            {copied ? (
              <Check className="size-3" aria-hidden="true" />
            ) : (
              <Clipboard className="size-3" aria-hidden="true" />
            )}
            {copied
              ? translate('auto.components.agentWorkspace.evidence.copied', 'Copied')
              : translate('auto.components.agentWorkspace.evidence.copyContext', 'Copy context')}
          </Button>
        </div>
      </section>
    </div>
  )
}

function CandidateSection({
  candidates,
  recommendation,
  recommendedCandidateId,
  onSelectThread
}: {
  candidates: readonly AgentWorkspaceCandidate[]
  recommendation: string
  recommendedCandidateId: string | null
  onSelectThread?: (threadId: string) => void
}): React.JSX.Element | null {
  if (candidates.length === 0) {
    return null
  }
  return (
    <section
      aria-label={translate(
        'auto.components.agentWorkspace.candidates.implementations',
        'Implementation candidates'
      )}
    >
      <h2 className="mb-2 text-sm font-medium text-muted-foreground">
        {translate(
          'auto.components.agentWorkspace.candidates.implementations',
          'Implementation candidates'
        )}
      </h2>
      <div className="space-y-1">
        {candidates.map((candidate) => (
          <button
            key={candidate.threadId}
            type="button"
            className={cn(
              'flex w-full min-w-0 items-center gap-2 rounded-lg border p-2 text-left text-xs transition-[background-color,border-color,transform] active:scale-[0.99]',
              candidate.selected
                ? 'border-ring bg-accent text-accent-foreground'
                : 'border-border bg-background/60 hover:bg-accent/60'
            )}
            aria-current={candidate.selected ? 'true' : undefined}
            onClick={() => onSelectThread?.(candidate.threadId)}
          >
            <GitBranch className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="font-medium text-foreground">{candidate.label}</span>
                {recommendedCandidateId === candidate.threadId ? (
                  <span className="rounded-md bg-muted px-1 text-[10px] text-muted-foreground">
                    {translate('auto.components.agentWorkspace.candidates.suggested', 'Suggested')}
                  </span>
                ) : null}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {translate(
                  'auto.components.agentWorkspace.candidates.metadata',
                  '{{agentLabel}} · {{phaseLabel}} · {{diffCount}} files · {{changedLines}} lines',
                  {
                    agentLabel: candidate.agentLabel,
                    changedLines: candidate.changedLines,
                    diffCount: candidate.diffCount,
                    phaseLabel: candidate.phaseLabel
                  }
                )}
              </span>
            </span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{recommendation}</p>
    </section>
  )
}

function EvidenceDot({
  tone
}: {
  tone: 'neutral' | 'good' | 'warning' | 'danger'
}): React.JSX.Element {
  return (
    <span
      className={cn(
        'mt-1 size-2 shrink-0 rounded-full',
        tone === 'good'
          ? 'bg-status-success'
          : tone === 'warning'
            ? 'bg-[color:var(--git-decoration-modified)]'
            : tone === 'danger'
              ? 'bg-destructive'
              : 'bg-muted-foreground/55'
      )}
      aria-hidden="true"
    />
  )
}

function buildRecoveryContextText({
  project,
  thread,
  lifecycleLabel
}: {
  project: AgentWorkspaceProject | null
  thread: AgentWorkspaceThread | null
  lifecycleLabel: string
}): string {
  return [
    `Project: ${project?.label ?? 'unknown'}`,
    `Path: ${project?.path ?? thread?.cwd ?? 'unknown'}`,
    `Thread: ${thread?.title ?? 'none selected'}`,
    `Lifecycle: ${lifecycleLabel}`,
    `Branch: ${thread?.branchName ?? project?.branchName ?? 'none'}`
  ].join('\n')
}
