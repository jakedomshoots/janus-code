import { AlertTriangle, BrainCircuit, Database } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { translate } from '@/i18n/i18n'
import type { MemorySnapshot, WorktreeMemory } from '../../../../shared/types'
import type { AgentWorkspaceProject } from './agent-workspace-types'

export function AgentWorkspaceMemoryInspector({
  project,
  snapshot,
  error
}: {
  project: AgentWorkspaceProject | null
  snapshot: MemorySnapshot | null
  error: string | null
}): React.JSX.Element {
  const worktreeMemory = project
    ? (snapshot?.worktrees.find((worktree) => worktree.worktreeId === project.id) ?? null)
    : null

  return (
    <section
      className="min-w-0"
      aria-label={translate(
        'auto.components.agentWorkspace.memoryInspector.title',
        'Memory inspector'
      )}
    >
      <h2 className="mb-2 text-sm font-medium text-muted-foreground">
        {translate('auto.components.agentWorkspace.memoryInspector.title', 'Memory inspector')}
      </h2>
      <p className="mb-2 rounded-lg border border-border bg-muted/30 px-2.5 py-2 text-xs leading-5 text-muted-foreground">
        {translate(
          'auto.components.agentWorkspace.memoryInspector.privacyWarning',
          'Agent-internal memory and rule files may contain sensitive context.'
        )}
      </p>
      <div className="space-y-1.5">
        {error ? <MemoryInspectorError error={error} /> : null}
        {snapshot ? (
          <>
            <MemorySourceRow
              icon="snapshot"
              title={translate(
                'auto.components.agentWorkspace.memoryInspector.janusSnapshot',
                'Janus resource snapshot'
              )}
              detail={translate(
                'auto.components.agentWorkspace.memoryInspector.janusSnapshotDetail',
                'App, host, and tracked worktree resource memory.'
              )}
              meta={new Date(snapshot.collectedAt).toISOString()}
            />
            {worktreeMemory ? (
              <MemorySourceRow
                icon="workspace"
                title={translate(
                  'auto.components.agentWorkspace.memoryInspector.workspaceSessions',
                  'Workspace sessions'
                )}
                detail={formatWorktreeMemoryDetail(worktreeMemory)}
                meta={project?.label ?? worktreeMemory.worktreeName}
              />
            ) : null}
          </>
        ) : null}
        {!snapshot && !error ? <UnsupportedMemoryState /> : null}
        <MemorySourceRow
          icon="opaque"
          title={translate(
            'auto.components.agentWorkspace.memoryInspector.agentMemoryNotObserved',
            'Agent memory not observed'
          )}
          detail={translate(
            'auto.components.agentWorkspace.memoryInspector.agentMemoryNotObservedDetail',
            'Provider-owned memory and project rule files are opaque unless the runtime exposes them.'
          )}
          meta={translate(
            'auto.components.agentWorkspace.memoryInspector.unsupported',
            'Unsupported'
          )}
        />
      </div>
    </section>
  )
}

function MemoryInspectorError({ error }: { error: string }): React.JSX.Element {
  return (
    <div className="rounded-lg border border-border bg-background/70 px-2.5 py-2 text-xs">
      <div className="flex min-w-0 items-center gap-2 font-medium text-foreground">
        <AlertTriangle className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        {translate(
          'auto.components.agentWorkspace.memoryInspector.snapshotUnavailable',
          'Memory snapshot unavailable'
        )}
      </div>
      <p className="mt-1 truncate text-muted-foreground" title={error}>
        {error}
      </p>
    </div>
  )
}

function UnsupportedMemoryState(): React.JSX.Element {
  return (
    <MemorySourceRow
      icon="opaque"
      title={translate(
        'auto.components.agentWorkspace.memoryInspector.noSnapshot',
        'No Janus memory snapshot'
      )}
      detail={translate(
        'auto.components.agentWorkspace.memoryInspector.noSnapshotDetail',
        'Refresh resource telemetry to inspect Janus-observable memory state.'
      )}
      meta={translate('auto.components.agentWorkspace.memoryInspector.empty', 'Empty')}
    />
  )
}

function MemorySourceRow({
  icon,
  title,
  detail,
  meta
}: {
  icon: 'snapshot' | 'workspace' | 'opaque'
  title: string
  detail: string
  meta: string
}): React.JSX.Element {
  const Icon = icon === 'snapshot' ? Database : BrainCircuit
  return (
    <div className="rounded-lg border border-border bg-background/70 px-2.5 py-2 text-xs">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate font-medium text-foreground">{title}</span>
        <Badge variant="outline" className="h-5 rounded-md px-1.5 text-[10px]">
          {meta}
        </Badge>
      </div>
      <p className="mt-1 text-muted-foreground">{detail}</p>
    </div>
  )
}

function formatWorktreeMemoryDetail(worktreeMemory: WorktreeMemory): string {
  const sessionCount = worktreeMemory.sessions.length
  const sessions =
    sessionCount === 1
      ? translate('auto.components.agentWorkspace.memoryInspector.oneSession', '1 session')
      : translate(
          'auto.components.agentWorkspace.memoryInspector.sessionCount',
          '{{count}} sessions',
          { count: sessionCount }
        )
  return `${sessions} - ${formatBytes(worktreeMemory.memory)}`
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B'
  }
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}
