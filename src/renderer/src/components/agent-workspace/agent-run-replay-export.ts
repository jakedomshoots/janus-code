import type {
  AgentWorkspaceApproval,
  AgentWorkspaceDiffSummary,
  AgentWorkspaceProject,
  AgentWorkspaceRunEvent,
  AgentWorkspaceRunReplayContext,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'
import type { AgentComposerContextManifestItem } from './agent-composer-context-manifest'

const REDACTED = '[REDACTED]'
const SECRET_ASSIGNMENT_PATTERN =
  /\b(api[_-]?key|token|secret|password|passwd|pwd)\s*[:=]\s*("[^"]+"|'[^']+'|[^\s`'"&,)]+)/gi
const BEARER_TOKEN_PATTERN = /\b(Bearer\s+)[A-Za-z0-9._~+/-]{12,}={0,2}\b/g
const TOKEN_SHAPED_PATTERN =
  /\b(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,})\b/g
const URL_SECRET_PARAM_PATTERN =
  /([?&](?:api[_-]?key|access_token|auth|key|secret|token)=)[^&\s)]+/gi

export type AgentRunReplayExportInput = {
  readonly project: AgentWorkspaceProject | null
  readonly thread: AgentWorkspaceThread | null
  readonly timeline: readonly AgentWorkspaceTimelineEntry[]
  readonly runEvents: readonly AgentWorkspaceRunEvent[]
  readonly diffs: readonly AgentWorkspaceDiffSummary[]
  readonly approvals: readonly AgentWorkspaceApproval[]
  readonly replayContext?: AgentWorkspaceRunReplayContext | null
  readonly sensitiveValues?: readonly string[]
  readonly exportedAt?: string
}

export function buildAgentRunReplayMarkdown(input: AgentRunReplayExportInput): string {
  const redactionValues = input.sensitiveValues ?? []
  const markdown = [
    `# Agent Run Replay: ${input.thread?.title ?? 'No selected run'}`,
    '',
    ...buildSummarySection(input),
    '',
    ...buildPromptSection(input),
    '',
    ...buildContextManifestSection(input.replayContext),
    '',
    ...buildRunLedgerSection(input.runEvents),
    '',
    ...buildFileChangesSection(input.diffs),
    '',
    ...buildApprovalsSection(input.approvals, input.thread),
    '',
    ...buildVerificationSection(input.runEvents),
    '',
    ...buildTimelineSection(input.timeline)
  ].join('\n')
  return redactRunReplayMarkdown(markdown, redactionValues)
}

export function redactRunReplayMarkdown(
  markdown: string,
  sensitiveValues: readonly string[] = []
): string {
  let redacted = markdown
  for (const value of getSortedSensitiveValues(sensitiveValues)) {
    redacted = redacted.replace(new RegExp(escapeRegExp(value), 'g'), REDACTED)
  }
  return redacted
    .replace(URL_SECRET_PARAM_PATTERN, `$1${REDACTED}`)
    .replace(BEARER_TOKEN_PATTERN, `$1${REDACTED}`)
    .replace(TOKEN_SHAPED_PATTERN, REDACTED)
    .replace(SECRET_ASSIGNMENT_PATTERN, (_match, key: string) => `${key}=${REDACTED}`)
}

function buildSummarySection(input: AgentRunReplayExportInput): readonly string[] {
  return [
    '## Summary',
    `- Project: ${input.project?.label ?? 'Not captured'}`,
    `- Worktree: ${input.thread?.worktreeId ?? input.project?.id ?? 'Not captured'}`,
    `- Agent: ${input.thread?.agentKind ?? 'Not captured'}`,
    `- Branch: ${input.thread?.branchName ?? input.project?.branchName ?? 'Not captured'}`,
    `- CWD: ${input.thread?.cwd ?? input.project?.path ?? 'Not captured'}`,
    `- Final state: ${input.thread?.phase ?? 'Not captured'}`,
    `- Updated: ${input.thread?.updatedAt ?? 'Not captured'}`,
    `- Exported: ${input.exportedAt ?? 'Not captured'}`
  ]
}

function buildPromptSection(input: AgentRunReplayExportInput): readonly string[] {
  const prompts = [
    input.replayContext?.prompt ?? null,
    ...sortTimeline(input.timeline)
      .filter((entry) => entry.kind === 'user')
      .map((entry) => entry.text)
  ].filter(isNonEmpty)
  const uniquePrompts = [...new Set(prompts)]
  if (uniquePrompts.length === 0) {
    return ['## Prompt', 'Not captured.']
  }
  return ['## Prompt', ...uniquePrompts.map((prompt) => `- ${normalizeWhitespace(prompt)}`)]
}

function buildContextManifestSection(
  replayContext: AgentWorkspaceRunReplayContext | null | undefined
): readonly string[] {
  const items = replayContext?.promptContextManifest?.items ?? []
  if (items.length === 0) {
    return ['## Context Manifest', 'Not captured in run telemetry.']
  }
  return ['## Context Manifest', ...items.map((item) => `- ${formatContextManifestItem(item)}`)]
}

function buildRunLedgerSection(runEvents: readonly AgentWorkspaceRunEvent[]): readonly string[] {
  const events = sortRunEvents(runEvents)
  if (events.length === 0) {
    return ['## Run Ledger', 'No run events captured.']
  }
  return [
    '## Run Ledger',
    ...events.map(
      (event) =>
        `- ${event.createdAt ?? 'unknown time'} | ${event.kind} | ${event.status} | ${event.title}: ${normalizeWhitespace(event.detail)}${formatRunEventEvidence(event)}`
    )
  ]
}

function buildFileChangesSection(diffs: readonly AgentWorkspaceDiffSummary[]): readonly string[] {
  const sortedDiffs = [...diffs].sort((a, b) => {
    const pathDiff = a.filePath.localeCompare(b.filePath)
    return pathDiff === 0 ? a.id.localeCompare(b.id) : pathDiff
  })
  if (sortedDiffs.length === 0) {
    return ['## File Changes', 'No file changes captured.']
  }
  return [
    '## File Changes',
    ...sortedDiffs.map(
      (diff) => `- ${diff.status}: ${diff.filePath} (+${diff.additions} / -${diff.deletions})`
    )
  ]
}

function buildApprovalsSection(
  approvals: readonly AgentWorkspaceApproval[],
  thread: AgentWorkspaceThread | null
): readonly string[] {
  const sortedApprovals = approvals
    .filter((approval) => !thread || approval.threadId === thread.id)
    .sort((a, b) => compareNullableIso(a.updatedAt, b.updatedAt) || a.id.localeCompare(b.id))
  if (sortedApprovals.length === 0) {
    return ['## Approvals', 'No approvals captured.']
  }
  return [
    '## Approvals',
    ...sortedApprovals.map(
      (approval) =>
        `- ${approval.updatedAt ?? 'unknown time'} | ${approval.status} | ${approval.toolName ?? 'tool'}: ${normalizeWhitespace(approval.toolInput ?? approval.description ?? approval.fallbackText)}${formatApprovalEvidence(approval)}`
    )
  ]
}

function buildVerificationSection(runEvents: readonly AgentWorkspaceRunEvent[]): readonly string[] {
  const verificationEvents = sortRunEvents(runEvents).filter(
    (event) => event.kind === 'verification'
  )
  if (verificationEvents.length === 0) {
    return ['## Verification', 'No verification captured.']
  }
  return [
    '## Verification',
    ...verificationEvents.map(
      (event) =>
        `- ${event.createdAt ?? 'unknown time'} | ${event.status} | ${normalizeWhitespace(event.detail)}`
    )
  ]
}

function buildTimelineSection(timeline: readonly AgentWorkspaceTimelineEntry[]): readonly string[] {
  const entries = sortTimeline(timeline)
  if (entries.length === 0) {
    return ['## Timeline', 'No timeline entries captured.']
  }
  return [
    '## Timeline',
    ...entries.map(
      (entry) =>
        `- ${entry.createdAt ?? 'unknown time'} | ${entry.kind}${entry.status ? ` | ${entry.status}` : ''}: ${normalizeWhitespace(entry.text)}`
    )
  ]
}

function formatContextManifestItem(item: AgentComposerContextManifestItem): string {
  switch (item.kind) {
    case 'workspace':
      return `workspace ${item.label} (${item.hostKind}) ${item.path}${item.branchName ? ` @ ${item.branchName}` : ''}${item.stale ? ' [stale]' : ''}`
    case 'thread':
      return `thread ${item.title} (${item.agentKind}, ${item.phase})${item.stale ? ' [stale]' : ''}`
    case 'browser':
      return `browser annotations: ${item.annotationCount}${item.stale ? ' [stale]' : ''}`
    case 'changes':
      return `changes: ${item.fileCount} files (+${item.additions} / -${item.deletions})${item.stale ? ' [stale]' : ''}`
    case 'review':
      return `review: ${item.providerLabel} #${item.number} ${item.title}${item.stale ? ' [stale]' : ''}`
    case 'verification':
      return `verification: ${item.command}`
    case 'memory':
      return `memory: ${item.command}`
  }
}

function formatRunEventEvidence(event: AgentWorkspaceRunEvent): string {
  const evidence = [
    event.risk ? `risk=${event.risk.level}:${event.risk.category}` : null,
    ...(event.protectedResourcePolicyMatches ?? []).map((match) => `protected=${match.label}`)
  ].filter(isNonEmpty)
  return evidence.length > 0 ? ` (${evidence.join('; ')})` : ''
}

function formatApprovalEvidence(approval: AgentWorkspaceApproval): string {
  const evidence = [
    approval.risk ? `risk=${approval.risk.level}:${approval.risk.category}` : null,
    ...(approval.protectedResourcePolicyMatches ?? []).map((match) => `protected=${match.label}`)
  ].filter(isNonEmpty)
  return evidence.length > 0 ? ` (${evidence.join('; ')})` : ''
}

function sortRunEvents(
  runEvents: readonly AgentWorkspaceRunEvent[]
): readonly AgentWorkspaceRunEvent[] {
  return [...runEvents].sort(
    (a, b) => compareNullableIso(a.createdAt, b.createdAt) || a.id.localeCompare(b.id)
  )
}

function sortTimeline(
  timeline: readonly AgentWorkspaceTimelineEntry[]
): readonly AgentWorkspaceTimelineEntry[] {
  return [...timeline].sort(
    (a, b) => compareNullableIso(a.createdAt, b.createdAt) || a.id.localeCompare(b.id)
  )
}

function compareNullableIso(a: string | null, b: string | null): number {
  return getTimestamp(a) - getTimestamp(b)
}

function getTimestamp(value: string | null): number {
  return value ? Date.parse(value) : Number.POSITIVE_INFINITY
}

function getSortedSensitiveValues(values: readonly string[]): readonly string[] {
  return [
    ...new Set(values.map((value) => value.trim()).filter((value) => value.length >= 3))
  ].sort((a, b) => b.length - a.length || a.localeCompare(b))
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function isNonEmpty(value: string | null | undefined): value is string {
  return Boolean(value?.trim())
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
