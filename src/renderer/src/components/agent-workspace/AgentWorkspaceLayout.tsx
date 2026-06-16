import {
  Bot,
  Clock3,
  FileText,
  FolderOpen,
  GitBranch,
  ListChecks,
  MessageSquareText,
  Terminal
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceProject,
  AgentWorkspaceSnapshot,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'
import { AgentWorkspaceHeader } from './AgentWorkspaceHeader'
import {
  formatAgentWorkspaceDiffStatus,
  formatAgentWorkspacePhase,
  formatAgentWorkspaceTimelineKind,
  formatAgentWorkspaceTimelineStatus
} from './agent-workspace-labels'

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

function formatHostKind(hostKind: AgentWorkspaceProject['hostKind']): string {
  return hostKind === 'ssh' ? 'SSH' : hostKind
}

function LeftRail({
  snapshot,
  selectedProject,
  selectedThread,
  onSelectProject,
  onSelectThread
}: {
  snapshot: AgentWorkspaceSnapshot
  selectedProject: AgentWorkspaceProject | null
  selectedThread: AgentWorkspaceThread | null
  onSelectProject: (projectId: string) => void
  onSelectThread: (projectId: string, threadId: string) => void
}): React.JSX.Element {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-muted/20">
      <div className="border-b border-border px-3 py-3">
        <div className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
          <FolderOpen className="size-3.5" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.layout.projects', 'Projects')}
        </div>
      </div>
      <div className="scrollbar-sleek min-h-0 flex-1 overflow-auto p-2">
        {snapshot.projects.map((project) => {
          const projectThreads = snapshot.threads.filter(
            (thread) => thread.worktreeId === project.id
          )
          const selected = project.id === selectedProject?.id
          return (
            <section
              key={project.id}
              className={cn(
                'mb-2 rounded-md border px-3 py-2',
                selected ? 'border-primary/35 bg-background' : 'border-border bg-background/60'
              )}
            >
              <button
                type="button"
                className="flex w-full min-w-0 items-center justify-between gap-2 text-left"
                aria-current={selected ? 'true' : undefined}
                onClick={() => onSelectProject(project.id)}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">
                    {project.label}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{project.path}</div>
                </div>
                <Badge variant="outline" className="uppercase">
                  {formatHostKind(project.hostKind)}
                </Badge>
              </button>
              <div className="mt-3 space-y-1">
                {projectThreads.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border px-2 py-2 text-xs text-muted-foreground">
                    {translate('auto.components.agentWorkspace.layout.noThreads', 'No threads')}
                  </div>
                ) : (
                  projectThreads.map((thread) => (
                    <button
                      key={thread.id}
                      type="button"
                      aria-pressed={thread.id === selectedThread?.id}
                      onClick={() => onSelectThread(project.id, thread.id)}
                      className={cn(
                        'w-full rounded-md px-2 py-2 text-left text-xs',
                        thread.id === selectedThread?.id ? 'bg-primary/10' : 'bg-muted/50'
                      )}
                    >
                      <div className="truncate font-medium text-foreground">{thread.title}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                        <Bot className="size-3" aria-hidden="true" />
                        <span className="truncate">{thread.agentKind}</span>
                        <span>{formatAgentWorkspacePhase(thread.phase)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>
          )
        })}
      </div>
    </aside>
  )
}

function Timeline({
  thread,
  timeline
}: {
  thread: AgentWorkspaceThread | null
  timeline: readonly AgentWorkspaceTimelineEntry[]
}): React.JSX.Element {
  return (
    <main className="flex min-w-0 flex-1 flex-col bg-background">
      <div className="scrollbar-sleek flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-4">
        {thread ? (
          <>
            <div className="rounded-md border border-border bg-muted/20 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MessageSquareText className="size-4" aria-hidden="true" />
                {thread.title}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GitBranch className="size-3" aria-hidden="true" />
                  {thread.branchName ??
                    translate('auto.components.agentWorkspace.layout.noBranch', 'No branch')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock3 className="size-3" aria-hidden="true" />
                  {thread.updatedAt ??
                    translate(
                      'auto.components.agentWorkspace.layout.noUpdatesYet',
                      'No updates yet'
                    )}
                </span>
              </div>
            </div>
            {timeline.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                {translate(
                  'auto.components.agentWorkspace.layout.timelineEventsWillAppear',
                  'Timeline events will appear here as the agent works.'
                )}
              </div>
            ) : (
              timeline.map((entry) => (
                <article key={entry.id} className="rounded-md border border-border p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Badge variant="outline">{formatAgentWorkspaceTimelineKind(entry.kind)}</Badge>
                    {entry.status ? (
                      <span className="text-xs text-muted-foreground">
                        {formatAgentWorkspaceTimelineStatus(entry.status)}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-foreground">{entry.text}</p>
                </article>
              ))
            )}
          </>
        ) : (
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            {translate(
              'auto.components.agentWorkspace.layout.selectThreadTimeline',
              'Select a thread to view its timeline.'
            )}
          </div>
        )}
      </div>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-3 py-2">
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-muted-foreground outline-none"
            disabled
            value=""
            placeholder={translate(
              'auto.components.agentWorkspace.layout.composerComingNext',
              'Composer coming next'
            )}
            readOnly
          />
          <Button type="button" size="sm" disabled>
            {translate('auto.components.agentWorkspace.layout.send', 'Send')}
          </Button>
        </div>
      </div>
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
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <AgentWorkspaceHeader project={selectedProject} thread={selectedThread} />
      <div className="flex min-h-0 flex-1">
        <LeftRail
          snapshot={snapshot}
          selectedProject={selectedProject}
          selectedThread={selectedThread}
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
        <Timeline thread={selectedThread} timeline={timeline} />
        <RightPanel
          thread={selectedThread}
          diffs={diffs}
          terminalAvailable={snapshot.terminalAvailable}
        />
      </div>
    </div>
  )
}
