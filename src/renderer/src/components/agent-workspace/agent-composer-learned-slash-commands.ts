import type { AgentComposerSlashCommand } from './agent-composer-slash-command-model'
import type { AgentWorkspaceTimelineEntry } from './agent-workspace-types'

const HELP_COMMAND_PATTERN = /^\/(?:help|commands)\b/i
const COMMAND_LINE_PATTERN = /^\s*(\/[a-z][\w-]*)(?:\s+(.*?))?\s*$/i

export function learnAgentComposerSlashCommandsFromTimeline(
  timeline: readonly AgentWorkspaceTimelineEntry[]
): readonly AgentComposerSlashCommand[] {
  const latestHelpResponse = getLatestHelpResponse(timeline)
  if (!latestHelpResponse) {
    return []
  }

  const commands = new Map<string, AgentComposerSlashCommand>()
  for (const line of latestHelpResponse.text.split(/\r?\n/)) {
    const match = COMMAND_LINE_PATTERN.exec(line)
    if (!match?.[1]) {
      continue
    }
    const command = match[1].toLowerCase()
    commands.set(command, {
      command,
      titleKey: 'auto.components.agentWorkspace.composer.slashCommand.learned.title',
      titleFallback: formatLearnedCommandTitle(command),
      descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.learned.description',
      descriptionFallback: cleanLearnedCommandDescription(match[2])
    })
  }

  return [...commands.values()].sort((left, right) => left.command.localeCompare(right.command))
}

function getLatestHelpResponse(
  timeline: readonly AgentWorkspaceTimelineEntry[]
): AgentWorkspaceTimelineEntry | null {
  for (let index = timeline.length - 1; index > 0; index -= 1) {
    const entry = timeline[index]
    const previous = timeline[index - 1]
    if (
      entry?.kind === 'agent' &&
      previous?.kind === 'user' &&
      HELP_COMMAND_PATTERN.test(previous.text.trim())
    ) {
      return entry
    }
  }
  return null
}

function cleanLearnedCommandDescription(value: string | undefined): string {
  const cleaned = value
    ?.replace(/^[-:–—]\s*/, '')
    .replace(/^\S*>\s*/, '')
    .trim()
  return cleaned || 'Learned from this thread help output.'
}

function formatLearnedCommandTitle(command: string): string {
  const label = command.slice(1).replaceAll('-', ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}
