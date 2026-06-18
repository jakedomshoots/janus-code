import { toast } from 'sonner'
import { useAppStore } from '@/store'
import { activateAndRevealWorktree } from '@/lib/worktree-activation'
import { launchAgentInNewTab } from '@/lib/launch-agent-in-new-tab'
import { pickQuickWorkspaceAgent } from '@/lib/quick-workspace-agent-selection'
import { upsertAddedRepoWithProjectHostSetup } from '@/components/sidebar/add-repo-store-upsert'
import { tryConnectLocalDevRuntime } from '@/web/web-dev-local-pairing'
import { translate } from '@/i18n/i18n'
import type { Repo, TuiAgent, Worktree } from '../../../shared/types'

const PLANNING_PROJECT_NAME = 'Janus Ideas'

function findPlanningRepo(repos: readonly Repo[]): Repo | null {
  return (
    repos.find((repo) => repo.kind === 'folder' && repo.displayName === PLANNING_PROJECT_NAME) ??
    null
  )
}

function resolvePlanningAgent(preferredAgent?: TuiAgent | null): TuiAgent | null {
  if (preferredAgent) {
    return preferredAgent
  }
  const settings = useAppStore.getState().settings
  return pickQuickWorkspaceAgent(settings?.defaultTuiAgent, null, settings?.disabledTuiAgents)
}

async function createPlanningRepo(): Promise<Repo | null> {
  const parentPath = await window.api.repos.getDefaultCreateProjectParent()
  const result = await window.api.repos.create({
    parentPath,
    name: PLANNING_PROJECT_NAME,
    kind: 'folder'
  })
  if ('error' in result) {
    toast.error(
      translate(
        'auto.lib.projectlessPlanningAgent.createProjectFailed',
        'Could not create Janus Ideas.'
      ),
      { description: result.error }
    )
    return null
  }
  upsertAddedRepoWithProjectHostSetup(result.repo)
  return result.repo
}

function isUnpairedWebClientError(error: unknown): boolean {
  return error instanceof Error && /Pair this web client/i.test(error.message)
}

async function getOrCreatePlanningRepo(): Promise<Repo | null> {
  const existingRepo = findPlanningRepo(useAppStore.getState().repos)
  if (existingRepo) {
    return existingRepo
  }
  return createPlanningRepo()
}

async function getRootWorktree(repo: Repo): Promise<Worktree | null> {
  await useAppStore.getState().fetchWorktrees(repo.id)
  return useAppStore.getState().worktreesByRepo[repo.id]?.[0] ?? null
}

export async function startProjectlessPlanningAgent({
  prompt = '',
  agent: preferredAgent = null
}: {
  prompt?: string
  agent?: TuiAgent | null
} = {}): Promise<boolean> {
  try {
    let repo: Repo | null
    try {
      repo = await getOrCreatePlanningRepo()
    } catch (error) {
      if (!isUnpairedWebClientError(error) || !(await tryConnectLocalDevRuntime())) {
        if (isUnpairedWebClientError(error)) {
          toast.error(
            translate(
              'auto.lib.projectlessPlanningAgent.webPairingRequired',
              'Connect Janus Code before starting a planning agent.'
            )
          )
          return false
        }
        throw error
      }
      repo = await getOrCreatePlanningRepo()
    }
    if (!repo) {
      return false
    }
    const worktree = await getRootWorktree(repo)
    if (!worktree) {
      toast.error(
        translate(
          'auto.lib.projectlessPlanningAgent.openProjectFailed',
          'Could not open Janus Ideas.'
        )
      )
      return false
    }
    const agent = resolvePlanningAgent(preferredAgent)
    const activation = activateAndRevealWorktree(worktree.id, { sidebarRevealBehavior: 'auto' })
    if (activation === false) {
      return false
    }
    if (agent) {
      // Why: projectless planning reuses the Janus Ideas folder, but each
      // composer send must create a fresh agent tab instead of refocusing an
      // old completed session in the folder's initial terminal.
      const launched = launchAgentInNewTab({
        agent,
        worktreeId: worktree.id,
        prompt,
        launchSource: 'sidebar'
      })
      if (!launched) {
        return false
      }
    }
    return true
  } catch (error) {
    console.error('Failed to start projectless planning agent:', error)
    toast.error(
      translate(
        'auto.lib.projectlessPlanningAgent.startFailed',
        'Could not start a planning agent.'
      )
    )
    return false
  }
}
