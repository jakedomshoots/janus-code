import { FileText, ListChecks, Terminal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { translate } from '@/i18n/i18n'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceProject,
  AgentWorkspaceSnapshot,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'
import { AgentComposer } from './AgentComposer'
import { AgentWorkspaceChrome } from './AgentWorkspaceChrome'
import { AgentWorkspaceHeader } from './AgentWorkspaceHeader'
import { AgentWorkspaceSidebar } from './AgentWorkspaceSidebar'
import { AgentTimeline } from './AgentTimeline'
import { formatAgentWorkspaceDiffStatus, formatAgentWorkspacePhase } from './agent-workspace-labels'

function getSelectedProject(snapshot: AgentWorkspaceSnapshot): AgentWorkspaceProject | null {
  return (
    snapshot.projects.find((project) => project.id === snapshot.activeWorktreeId) ??
    snapshot.projects[0] ??
    null
  )
}

function getSelectedThread(
  snapshot: AgentWorkspaceSnapshot,
  project: AgentWorkspaceProject | null,
  selectedThreadId?: string | null
): AgentWorkspaceThread | null {
  const projectThreads = project
    ? snapshot.threads.filter((thread) => thread.worktreeId === project.id)
    : snapshot.threads
  return (
    (selectedThreadId ? projectThreads.find((thread) => thread.id === selectedThreadId) : null) ??
    projectThreads[0] ??
    null
  )
}

function getThreadTimeline(
  snapshot: AgentWorkspaceSnapshot,
  thread: AgentWorkspaceThread | null
): readonly AgentWorkspaceTimelineEntry[] {
  return thread ? snapshot.timeline.filter((entry) => entry.threadId === thread.id) : []
}

function getThreadDiffs(
  snapshot: AgentWorkspaceSnapshot,
  thread: AgentWorkspaceThread | null
): readonly AgentWorkspaceDiffSummary[] {
  return thread ? snapshot.diffs.filter((diff) => diff.threadId === thread.id) : []
}

function TerminalDrawerAffordance({
  terminalAvailable
}: {
  terminalAvailable: boolean
}): React.JSX.Element {
  return (
    <div className="border-t border-border bg-muted/20 px-3 py-1.5">
      <div className="mx-auto flex h-8 w-full max-w-3xl items-center justify-between gap-3 rounded-md border border-border bg-background px-2.5 text-xs text-muted-foreground">
        <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
          <Terminal className="size-3.5 shrink-0" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.layout.terminal', 'Terminal')}
        </span>
        <span className="min-w-0 truncate">
          {terminalAvailable
            ? translate(
                'auto.components.agentWorkspace.layout.terminalSessionAvailable',
                'Terminal session is available as a debug panel.'
              )
            : translate(
                'auto.components.agentWorkspace.layout.noTerminalSessionAttached',
                'No terminal session is attached to this workspace.'
              )}
        </span>
      </div>
    </div>
  )
}

function AgentWorkspaceCenter({
  activeWorktreeId,
  thread,
  timeline,
  terminalAvailable
}: {
  activeWorktreeId: string | null
  thread: AgentWorkspaceThread | null
  timeline: readonly AgentWorkspaceTimelineEntry[]
  terminalAvailable: boolean
}): React.JSX.Element {
  return (
    <main className="flex min-w-0 flex-1 flex-col bg-background">
      <AgentTimeline thread={thread} timeline={timeline} />
      <TerminalDrawerAffordance terminalAvailable={terminalAvailable} />
      <AgentComposer activeWorktreeId={activeWorktreeId} selectedThread={thread} />
    </main>
  )
}

function RightPanel({
  thread,
  diffs,
  terminalAvailable
}: {
  thread: AgentWorkspaceThread | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  terminalAvailable: boolean
}): React.JSX.Element {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-muted/20 p-3">
      <Tabs defaultValue="plan" className="min-h-0 flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plan">
            {translate('auto.components.agentWorkspace.layout.plan', 'Plan')}
          </TabsTrigger>
          <TabsTrigger value="diff">
            {translate('auto.components.agentWorkspace.layout.diff', 'Diff')}
          </TabsTrigger>
          <TabsTrigger value="terminal">
            {translate('auto.components.agentWorkspace.layout.terminal', 'Terminal')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="plan" className="mt-3 min-h-0">
          <div className="rounded-md border border-border bg-background p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ListChecks className="size-4" aria-hidden="true" />
              {translate('auto.components.agentWorkspace.layout.plan', 'Plan')}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {thread
                ? translate(
                    'auto.components.agentWorkspace.layout.agentIsPhaseOnThread',
                    '{{agentKind}} is {{phase}} on {{title}}.',
                    {
                      agentKind: thread.agentKind,
                      phase: formatAgentWorkspacePhase(thread.phase),
                      title: thread.title
                    }
                  )
                : translate(
                    'auto.components.agentWorkspace.layout.selectThreadPlan',
                    'Select a thread to inspect its plan.'
                  )}
            </p>
          </div>
        </TabsContent>
        <TabsContent value="diff" className="mt-3 min-h-0" forceMount>
          <div className="space-y-2">
            {diffs.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-background p-3 text-sm text-muted-foreground">
                {translate(
                  'auto.components.agentWorkspace.layout.noDiffSummaryYet',
                  'No diff summary yet.'
                )}
              </div>
            ) : (
              diffs.map((diff) => (
                <div key={diff.id} className="rounded-md border border-border bg-background p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="size-4" aria-hidden="true" />
                    <span className="min-w-0 truncate">{diff.filePath}</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    +{diff.additions} / -{diff.deletions} ·{' '}
                    {formatAgentWorkspaceDiffStatus(diff.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="terminal" className="mt-3 min-h-0" forceMount>
          <div className="rounded-md border border-border bg-background p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Terminal className="size-4" aria-hidden="true" />
              {translate('auto.components.agentWorkspace.layout.terminal', 'Terminal')}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {terminalAvailable
                ? translate(
                    'auto.components.agentWorkspace.layout.terminalSessionAvailable',
                    'Terminal session is available as a debug panel.'
                  )
                : translate(
                    'auto.components.agentWorkspace.layout.noTerminalSessionAttached',
                    'No terminal session is attached to this workspace.'
                  )}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  )
}

export function AgentWorkspaceLayout({
  snapshot
}: {
  snapshot: AgentWorkspaceSnapshot
}): React.JSX.Element {
  const defaultProject = getSelectedProject(snapshot)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    () => defaultProject?.id ?? null
  )
  const selectedProjectFromState =
    snapshot.projects.find((project) => project.id === selectedProjectId) ?? null
  const selectedProject = selectedProjectFromState ?? defaultProject
  const defaultThread = getSelectedThread(snapshot, selectedProject)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    () => defaultThread?.id ?? null
  )
  const selectedThread = getSelectedThread(snapshot, selectedProject, selectedThreadId)
  const previousActiveWorktreeIdRef = useRef(snapshot.activeWorktreeId)
  const timeline = getThreadTimeline(snapshot, selectedThread)
  const diffs = getThreadDiffs(snapshot, selectedThread)

  useEffect(() => {
    if (previousActiveWorktreeIdRef.current !== snapshot.activeWorktreeId) {
      previousActiveWorktreeIdRef.current = snapshot.activeWorktreeId
      const nextProject = getSelectedProject(snapshot)
      setSelectedProjectId(nextProject?.id ?? null)
      setSelectedThreadId(getSelectedThread(snapshot, nextProject)?.id ?? null)
      return
    }

    if (selectedProjectId !== (selectedProject?.id ?? null)) {
      setSelectedProjectId(selectedProject?.id ?? null)
    }
  }, [selectedProject, selectedProjectId, snapshot])

  useEffect(() => {
    if (selectedThreadId !== (selectedThread?.id ?? null)) {
      setSelectedThreadId(selectedThread?.id ?? null)
    }
  }, [selectedThread, selectedThreadId])

  return (
    <AgentWorkspaceChrome
      sidebar={
        <AgentWorkspaceSidebar
          projects={snapshot.projects}
          threads={snapshot.threads}
          selectedProjectId={selectedProject?.id ?? null}
          selectedThreadId={selectedThread?.id ?? null}
          activeWorktreeId={snapshot.activeWorktreeId}
          onSelectProject={(projectId) => {
            setSelectedProjectId(projectId)
            const nextProject =
              snapshot.projects.find((project) => project.id === projectId) ?? null
            setSelectedThreadId(getSelectedThread(snapshot, nextProject)?.id ?? null)
          }}
          onSelectThread={(projectId, threadId) => {
            setSelectedProjectId(projectId)
            setSelectedThreadId(threadId)
          }}
        />
      }
      header={<AgentWorkspaceHeader project={selectedProject} thread={selectedThread} />}
      rightPanel={
        <RightPanel
          thread={selectedThread}
          diffs={diffs}
          terminalAvailable={snapshot.terminalAvailable}
        />
      }
    >
      <AgentWorkspaceCenter
        activeWorktreeId={snapshot.activeWorktreeId}
        thread={selectedThread}
        timeline={timeline}
        terminalAvailable={snapshot.terminalAvailable}
      />
    </AgentWorkspaceChrome>
  )
}
