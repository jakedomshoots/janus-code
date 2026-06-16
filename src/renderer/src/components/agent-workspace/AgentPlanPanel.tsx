import { Check, ChevronDown, ChevronRight, Circle, Loader2, ListChecks } from 'lucide-react'
import { useState } from 'react'
import { translate } from '@/i18n/i18n'
import type {
  AgentWorkspacePlan,
  AgentWorkspacePlanStepStatus,
  AgentWorkspaceThread
} from './agent-workspace-types'
import {
  getAgentWorkspacePlanTitle,
  stripDisplayedAgentWorkspacePlanMarkdown
} from './orca-agent-plan-selectors'
import CommentMarkdown from '../sidebar/CommentMarkdown'

function formatPlanStepStatus(status: AgentWorkspacePlanStepStatus): string {
  switch (status) {
    case 'completed':
      return translate('auto.components.agentWorkspace.layout.planStepCompleted', 'completed')
    case 'in-progress':
      return translate('auto.components.agentWorkspace.layout.planStepInProgress', 'in progress')
    case 'pending':
      return translate('auto.components.agentWorkspace.layout.planStepPending', 'pending')
  }
}

function formatPlanTimestamp(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
}

function StepStatusIcon({ status }: { status: AgentWorkspacePlanStepStatus }): React.JSX.Element {
  switch (status) {
    case 'completed':
      return (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Check className="size-3" aria-hidden="true" />
        </span>
      )
    case 'in-progress':
      return (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
        </span>
      )
    case 'pending':
      return (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-muted/30 text-muted-foreground">
          <Circle className="size-2 fill-current" aria-hidden="true" />
        </span>
      )
  }
}

export function AgentPlanPanel({
  thread,
  plan
}: {
  thread: AgentWorkspaceThread | null
  plan: AgentWorkspacePlan | null
}): React.JSX.Element {
  const [markdownExpanded, setMarkdownExpanded] = useState(false)
  const planTitle = plan ? getAgentWorkspacePlanTitle(plan) : null
  const displayedMarkdown = plan?.markdown
    ? stripDisplayedAgentWorkspacePlanMarkdown(plan.markdown)
    : null

  if (!thread) {
    return (
      <div className="rounded-md border border-border bg-background p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ListChecks className="size-4" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.layout.plan', 'Plan')}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {translate(
            'auto.components.agentWorkspace.layout.selectThreadPlan',
            'Select a thread to inspect its plan.'
          )}
        </p>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="rounded-md border border-dashed border-border bg-background p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ListChecks className="size-4" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.layout.plan', 'Plan')}
        </div>
        <p className="mt-2 text-sm font-medium">
          {translate(
            'auto.components.agentWorkspace.layout.noStructuredPlanAvailable',
            'No structured plan available.'
          )}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {translate(
            'auto.components.agentWorkspace.layout.structuredPlanUnavailableDescription',
            'This provider has not reported a structured plan. Use the Terminal tab for raw session output.'
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-background p-3">
        <div className="flex items-start gap-2">
          <ListChecks className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">
              {planTitle ??
                translate('auto.components.agentWorkspace.layout.currentPlan', 'Current plan')}
            </div>
            {plan.updatedAt ? (
              <div className="mt-0.5 truncate text-xs text-muted-foreground">
                {translate('auto.components.agentWorkspace.layout.updated', 'Updated')}{' '}
                {formatPlanTimestamp(plan.updatedAt)}
              </div>
            ) : null}
          </div>
        </div>
        {plan.explanation ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{plan.explanation}</p>
        ) : null}
      </div>

      {plan.steps.length > 0 ? (
        <div className="rounded-md border border-border bg-background p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase text-muted-foreground">
            {translate('auto.components.agentWorkspace.layout.steps', 'Steps')}
          </p>
          <div className="space-y-1">
            {plan.steps.map((step) => (
              <div
                key={step.id}
                className="flex min-w-0 items-start gap-2 rounded-md px-1.5 py-1.5"
              >
                <StepStatusIcon status={step.status} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">{step.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatPlanStepStatus(step.status)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {displayedMarkdown ? (
        <div className="rounded-md border border-border bg-background p-3">
          <button
            type="button"
            className="flex w-full items-center gap-1.5 text-left text-[10px] font-semibold uppercase text-muted-foreground hover:text-foreground"
            onClick={() => setMarkdownExpanded((expanded) => !expanded)}
          >
            {markdownExpanded ? (
              <ChevronDown className="size-3 shrink-0" aria-hidden="true" />
            ) : (
              <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
            )}
            {planTitle ?? translate('auto.components.agentWorkspace.layout.fullPlan', 'Full plan')}
          </button>
          {markdownExpanded ? (
            <CommentMarkdown
              variant="document"
              content={displayedMarkdown}
              className="markdown-preview-body mt-3 text-sm"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
