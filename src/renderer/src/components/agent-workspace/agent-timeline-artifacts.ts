import { joinPath } from '@/lib/path'
import type { AgentWorkspaceDiffSummary } from './agent-workspace-types'

export type AgentTimelineMarkdownArtifact = {
  readonly id: string
  readonly fileName: string
  readonly filePath: string
  readonly absolutePath: string
}

export type AgentTimelineDiffSummary = {
  readonly fileCount: number
  readonly totalAdditions: number
  readonly totalDeletions: number
  readonly visibleDiffs: readonly AgentWorkspaceDiffSummary[]
  readonly hiddenCount: number
}

const MARKDOWN_PATH_PATTERN = /(?:^|[\s("'`])((?:[A-Za-z]:[\\/])?[\w.@~/-][^\s"'`)]*?\.md)\b/g
const TRAILING_PATH_PUNCTUATION = /[),.;:!?`'"]+$/

export function getAgentTimelineMarkdownArtifacts({
  text,
  cwd
}: {
  readonly text: string
  readonly cwd: string | null
}): AgentTimelineMarkdownArtifact[] {
  const artifacts: AgentTimelineMarkdownArtifact[] = []
  const seen = new Set<string>()

  for (const match of text.matchAll(MARKDOWN_PATH_PATTERN)) {
    const filePath = normalizeMarkdownArtifactPath(match[1] ?? '')
    if (!filePath || seen.has(filePath)) {
      continue
    }
    seen.add(filePath)
    artifacts.push({
      id: filePath,
      fileName: getFileName(filePath),
      filePath,
      absolutePath: getAbsoluteArtifactPath(cwd, filePath)
    })
  }

  return artifacts
}

export function summarizeAgentTimelineDiffs(
  diffs: readonly AgentWorkspaceDiffSummary[],
  visibleLimit = 3
): AgentTimelineDiffSummary {
  const visibleDiffs = diffs.slice(0, visibleLimit)
  return {
    fileCount: diffs.length,
    totalAdditions: diffs.reduce((total, diff) => total + diff.additions, 0),
    totalDeletions: diffs.reduce((total, diff) => total + diff.deletions, 0),
    visibleDiffs,
    hiddenCount: Math.max(0, diffs.length - visibleDiffs.length)
  }
}

function normalizeMarkdownArtifactPath(value: string): string {
  const trimmed = value.trim().replace(TRAILING_PATH_PUNCTUATION, '')
  if (trimmed.startsWith('file://')) {
    try {
      const url = new URL(trimmed)
      return decodeURIComponent(url.pathname).replace(/^\/([A-Za-z]:\/)/, '$1')
    } catch {
      return trimmed.replaceAll('\\', '/')
    }
  }
  return trimmed.replaceAll('\\', '/')
}

function getFileName(filePath: string): string {
  return filePath.split('/').filter(Boolean).at(-1) ?? filePath
}

function getAbsoluteArtifactPath(cwd: string | null, filePath: string): string {
  if (!cwd || isAbsolutePath(filePath)) {
    return filePath
  }
  return joinPath(cwd, filePath)
}

function isAbsolutePath(filePath: string): boolean {
  return filePath.startsWith('/') || /^[A-Za-z]:\//.test(filePath)
}
