import type { AgentWorkspaceThread, AgentWorkspaceTimelineEntry } from './agent-workspace-types'

export type AgentReviewFindingSeverity = 'high' | 'medium' | 'low' | 'info'

export type AgentReviewFinding = {
  readonly id: string
  readonly threadId: string
  readonly severity: AgentReviewFindingSeverity
  readonly filePath: string
  readonly lineNumber: number | null
  readonly title: string
  readonly rationale: string
}

const REVIEW_FINDINGS_BLOCK_PATTERN = /```janus-review-findings\s*([\s\S]*?)```/i
const SEVERITY_ORDER: Record<AgentReviewFindingSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
  info: 3
}

export function parseAgentReviewFindingsFromText(
  text: string,
  {
    entryId,
    threadId
  }: {
    entryId: string
    threadId: string
  }
): AgentReviewFinding[] {
  const match = REVIEW_FINDINGS_BLOCK_PATTERN.exec(text)
  if (!match) {
    return []
  }

  const parsed = parseJsonArray(match[1] ?? '')
  if (!parsed) {
    return []
  }

  return parsed.flatMap((value, index) => {
    const finding = normalizeAgentReviewFinding(value)
    return finding
      ? [
          {
            id: `${entryId}:review-finding:${index}`,
            threadId,
            ...finding
          }
        ]
      : []
  })
}

export function selectAgentReviewFindingsFromTimeline({
  thread,
  timeline
}: {
  thread: AgentWorkspaceThread | null
  timeline: readonly AgentWorkspaceTimelineEntry[]
}): AgentReviewFinding[] {
  if (!thread) {
    return []
  }

  return timeline
    .filter((entry) => entry.threadId === thread.id && entry.kind === 'agent')
    .flatMap((entry) =>
      parseAgentReviewFindingsFromText(entry.text, {
        entryId: entry.id,
        threadId: thread.id
      })
    )
    .sort((left, right) => SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity])
}

function parseJsonArray(raw: string): unknown[] | null {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function normalizeAgentReviewFinding(
  value: unknown
): Omit<AgentReviewFinding, 'id' | 'threadId'> | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const record = value as Record<string, unknown>
  const severity = normalizeSeverity(record.severity)
  const filePath = normalizeString(record.filePath)
  const title = normalizeString(record.title)
  const rationale = normalizeString(record.rationale)
  if (!severity || !filePath || !title || !rationale) {
    return null
  }

  return {
    severity,
    filePath,
    lineNumber: normalizeLineNumber(record.lineNumber ?? record.line),
    title,
    rationale
  }
}

function normalizeSeverity(value: unknown): AgentReviewFindingSeverity | null {
  if (typeof value !== 'string') {
    return null
  }
  const normalized = value.trim().toLowerCase()
  if (
    normalized === 'high' ||
    normalized === 'medium' ||
    normalized === 'low' ||
    normalized === 'info'
  ) {
    return normalized
  }
  return null
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeLineNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    return null
  }
  return value
}
