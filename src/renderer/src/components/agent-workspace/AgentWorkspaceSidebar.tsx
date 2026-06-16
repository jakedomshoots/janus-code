import { FolderOpen, GitBranch, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import type { AgentWorkspaceProject, AgentWorkspaceThread } from './agent-workspace-types'
import { AgentThreadList } from './AgentThreadList'

function formatHostKind(hostKind: AgentWorkspaceProject['hostKind']): string {
  return hostKind === 'ssh' ? 'SSH' : hostKind
}

function getThreadsForProject(
  threads: readonly AgentWorkspaceThread[],
  projectId: string
): readonly AgentWorkspaceThread[] {
  return threads.filter((thread) => thread.worktreeId === projectId)
}

function ProjectActions({
  project,
  onCreateProjectWorktree,
  onDeleteProject
}: {
  project: AgentWorkspaceProject
  onCreateProjectWorktree?: (project: AgentWorkspaceProject) => void
  onDeleteProject?: (project: AgentWorkspaceProject) => void
}): React.JSX.Element | null {
  const canCreate = project.canCreateWorktree === true && onCreateProjectWorktree !== undefined
  const canDelete = project.canDeleteWorktree === true && onDeleteProject !== undefined
  if (!canCreate && !canDelete) {
    return null
  }

  return (
    <div className="mt-1 flex items-center gap-1 px-1">
      {canCreate ? (
        <button
          type="button"
          aria-label={translate(
            'auto.components.agentWorkspace.sidebar.createWorktree',
            'Create worktree'
          )}
          title={translate(
            'auto.components.agentWorkspace.sidebar.createWorktree',
            'Create worktree'
          )}
          onClick={() => onCreateProjectWorktree?.(project)}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-worktree-sidebar-accent hover:text-worktree-sidebar-accent-foreground focus-visible:ring-1 focus-visible:ring-worktree-sidebar-ring"
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
      {canDelete ? (
        <button
          type="button"
          aria-label={translate(
            'auto.components.agentWorkspace.sidebar.deleteWorktree',
            'Delete worktree'
          )}
          title={translate(
            'auto.components.agentWorkspace.sidebar.deleteWorktree',
            'Delete worktree'
          )}
          onClick={() => onDeleteProject?.(project)}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-destructive/10 hover:text-destructive focus-visible:ring-1 focus-visible:ring-worktree-sidebar-ring"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

export function AgentWorkspaceSidebar({
  projects,
  threads,
  selectedProjectId,
  selectedThreadId,
  activeWorktreeId,
  onSelectProject,
  onSelectThread,
  onCreateProjectWorktree,
  onDeleteProject
}: {
  projects: readonly AgentWorkspaceProject[]
  threads: readonly AgentWorkspaceThread[]
  selectedProjectId: string | null
  selectedThreadId: string | null
  activeWorktreeId: string | null
  onSelectProject: (projectId: string) => void
  onSelectThread: (projectId: string, threadId: string) => void
  onCreateProjectWorktree?: (project: AgentWorkspaceProject) => void
  onDeleteProject?: (project: AgentWorkspaceProject) => void
}): React.JSX.Element {
  return (
    <aside className="scrollbar-sleek-parent flex w-64 shrink-0 flex-col border-r border-worktree-sidebar-border bg-worktree-sidebar text-worktree-sidebar-foreground">
      <div className="flex h-11 shrink-0 items-center border-b border-worktree-sidebar-border px-3">
        <div className="flex min-w-0 items-center gap-2 text-[11px] font-semibold uppercase text-muted-foreground">
          <FolderOpen className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {translate('auto.components.agentWorkspace.layout.projects', 'Projects')}
          </span>
        </div>
      </div>
      <div className="worktree-sidebar-scrollbar min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">
          {projects.map((project) => {
            const selected = project.id === selectedProjectId
            const active = project.id === activeWorktreeId
            const projectThreads = getThreadsForProject(threads, project.id)
            return (
              <section key={project.id} className="min-w-0">
                <button
                  type="button"
                  aria-current={selected ? 'true' : undefined}
                  data-current={selected ? 'true' : undefined}
                  onClick={() => onSelectProject(project.id)}
                  className={cn(
                    'flex w-full min-w-0 flex-col gap-1 rounded-md px-2 py-2 text-left outline-none transition-colors',
                    'hover:bg-worktree-sidebar-accent hover:text-worktree-sidebar-accent-foreground focus-visible:ring-1 focus-visible:ring-worktree-sidebar-ring',
                    selected
                      ? 'bg-worktree-sidebar-accent text-worktree-sidebar-accent-foreground'
                      : 'text-worktree-sidebar-foreground'
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {project.label}
                    </span>
                    <Badge
                      variant="outline"
                      className="h-5 rounded-md border-worktree-sidebar-border px-1.5 text-[10px] uppercase"
                    >
                      {formatHostKind(project.hostKind)}
                    </Badge>
                  </div>
                  <div className="truncate font-mono text-[11px] text-muted-foreground">
                    {project.path}
                  </div>
                  {project.branchName ? (
                    <div className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
                      <GitBranch className="size-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{project.branchName}</span>
                    </div>
                  ) : null}
                  {active ? (
                    <Badge
                      variant="outline"
                      className="h-5 rounded-md border-primary/20 bg-primary/5 px-1.5 text-[10px] text-foreground"
                    >
                      {translate(
                        'auto.components.agentWorkspace.layout.activeWorktree',
                        'Active worktree'
                      )}
                    </Badge>
                  ) : null}
                </button>
                {selected ? (
                  <>
                    <ProjectActions
                      project={project}
                      onCreateProjectWorktree={onCreateProjectWorktree}
                      onDeleteProject={onDeleteProject}
                    />
                    <div className="mt-1 pl-2">
                      <AgentThreadList
                        projectId={project.id}
                        threads={projectThreads}
                        selectedThreadId={selectedThreadId}
                        onSelectThread={onSelectThread}
                      />
                    </div>
                  </>
                ) : null}
              </section>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
