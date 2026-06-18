import { Bot, ListChecks } from 'lucide-react'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspacePlan,
  AgentWorkspaceThread
} from './agent-workspace-types'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'

export function PanelSummary({
  thread,
  plan,
  diffs,
  sources,
  subagents
}: {
  thread: AgentWorkspaceThread | null
  plan: AgentWorkspacePlan | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  sources: number
  subagents: number
}): React.JSX.Element {
  const completeSteps = plan?.steps.filter((step) => step.status === 'completed').length ?? 0
  const totalSteps = plan?.steps.length ?? 0
  const summaryItems = [
    totalSteps > 0 ? `${completeSteps}/${totalSteps} steps` : 'No plan',
    `${diffs.length} changes`,
    `${subagents} agents`,
    `${sources} sources`
  ]

  return (
    <section className="mb-4 rounded-2xl border border-border bg-background/65 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card">
          <Bot className="size-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {thread?.title ?? 'Janus Code'}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {thread
              ? `${formatAgentTypeLabel(thread.agentKind)} · ${formatAgentWorkspacePhase(thread.phase)}`
              : 'Ready for a new session'}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {summaryItems.map((item) => (
          <div
            key={item}
            className="truncate rounded-lg border border-border/70 bg-card/70 px-2 py-1 text-[11px] text-muted-foreground"
            title={item}
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  )
}

export function PlanProgress({
  plan
}: {
  plan: AgentWorkspacePlan | null
}): React.JSX.Element | null {
  if (!plan || plan.steps.length === 0) {
    return null
  }

  const completeSteps = plan.steps.filter((step) => step.status === 'completed').length
  const activeStep = plan.steps.find((step) => step.status === 'in-progress') ?? null

  return (
    <section className="mb-4 rounded-2xl border border-border bg-background/60 p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <ListChecks className="size-3.5" aria-hidden="true" />
        Plan progress
        <span className="ml-auto text-foreground">
          {completeSteps}/{plan.steps.length}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${Math.round((completeSteps / plan.steps.length) * 100)}%` }}
        />
      </div>
      {activeStep ? (
        <div className="mt-2 truncate text-xs text-muted-foreground" title={activeStep.title}>
          Now: {activeStep.title}
        </div>
      ) : null}
    </section>
  )
}
