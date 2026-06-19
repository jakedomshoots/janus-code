// @vitest-environment happy-dom

import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SidebarHeader from './SidebarHeader'

const mocks = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  openModal: vi.fn(),
  openWorkspaceCreationComposerWithTourHandoff: vi.fn()
}))

vi.mock('@/store', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) => selector(mocks.state)
}))

vi.mock('@/hooks/useShortcutLabel', () => ({
  useShortcutLabel: () => 'N'
}))

vi.mock('../contextual-tours/workspace-creation-tour-handoff', () => ({
  openWorkspaceCreationComposerWithTourHandoff: mocks.openWorkspaceCreationComposerWithTourHandoff
}))

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: ReactNode }) => <div>{children}</div>
}))

vi.mock('./SidebarWorkspaceOptionsMenu', () => ({
  default: ({ onMenuOpenChange }: { onMenuOpenChange?: (open: boolean) => void }) => (
    <button type="button" aria-label="Workspace options" onClick={() => onMenuOpenChange?.(true)}>
      Workspace options
    </button>
  )
}))

function setSidebarHeaderState(repoCount: number): void {
  mocks.state = {
    groupBy: 'repo',
    repos: Array.from({ length: repoCount }, (_, index) => ({ id: `repo-${index}` })),
    openModal: mocks.openModal
  }
}

async function renderSidebarHeader(): Promise<{ container: HTMLDivElement; root: Root }> {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(<SidebarHeader onWorkspaceBoardMenuOpenChange={vi.fn()} />)
  })
  return { container, root }
}

function getButton(container: ParentNode, label: string): HTMLButtonElement {
  const button = container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)
  if (!button) {
    throw new Error(`Button not found: ${label}`)
  }
  return button
}

describe('SidebarHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setSidebarHeaderState(1)
  })

  afterEach(() => {
    document.body.replaceChildren()
  })

  it('routes Add Project and New workspace header controls to their workflows', async () => {
    const { container, root } = await renderSidebarHeader()
    const addProjectButton = getButton(container, 'Add Project')
    const newWorkspaceButton = getButton(container, 'New workspace')

    await act(async () => {
      addProjectButton.click()
    })
    await act(async () => {
      newWorkspaceButton.click()
    })

    expect(mocks.openModal).toHaveBeenCalledWith('add-repo')
    expect(mocks.openWorkspaceCreationComposerWithTourHandoff).toHaveBeenCalledTimes(1)

    await act(async () => root.unmount())
  })

  it('keeps New workspace disabled until a project exists', async () => {
    setSidebarHeaderState(0)
    const { container, root } = await renderSidebarHeader()
    const newWorkspaceButton = getButton(container, 'New workspace')

    expect(newWorkspaceButton.disabled).toBe(true)

    await act(async () => {
      newWorkspaceButton.click()
    })

    expect(mocks.openWorkspaceCreationComposerWithTourHandoff).not.toHaveBeenCalled()

    await act(async () => root.unmount())
  })
})
