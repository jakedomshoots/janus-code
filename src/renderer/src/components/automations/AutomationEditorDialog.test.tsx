// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { getDefaultSettings } from '../../../../shared/constants'
import type { AutomationDraft } from './AutomationEditorDialog'
import { AutomationEditorDialog } from './AutomationEditorDialog'

function makeDraft(): AutomationDraft {
  return {
    name: '',
    prompt: '',
    agentId: 'codex',
    projectId: '',
    workspaceMode: 'existing',
    workspaceId: '',
    baseBranch: '',
    reuseSession: false,
    precheckCommand: '',
    precheckTimeoutSeconds: '30',
    preset: 'hourly',
    time: '09:00',
    dayOfWeek: '1',
    customSchedule: '',
    missedRunGraceMinutes: '15',
    scheduleWarning: null
  }
}

describe('AutomationEditorDialog', () => {
  const roots: Root[] = []

  afterEach(async () => {
    await act(async () => {
      for (const root of roots.splice(0)) {
        root.unmount()
      }
    })
    document.body.innerHTML = ''
  })

  async function renderDialog(): Promise<HTMLDivElement> {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    roots.push(root)
    await act(async () => {
      root.render(
        <TooltipProvider>
          <AutomationEditorDialog
            open
            isEditing={false}
            isEditingExternal={false}
            isSaving={false}
            canSave={false}
            createTarget="orca"
            repos={[]}
            repoMap={new Map()}
            worktrees={[]}
            settings={getDefaultSettings('/tmp')}
            draft={makeDraft()}
            onProjectChange={vi.fn()}
            onCreateTargetChange={vi.fn()}
            onOpenChange={vi.fn()}
            onDraftChange={vi.fn()}
            onApplyTemplate={vi.fn()}
            onSave={vi.fn()}
          />
        </TooltipProvider>
      )
    })
    return container
  }

  it('gates create mode before prompt entry when there are no projects', async () => {
    await renderDialog()
    const html = document.body.innerHTML

    expect(html).toContain('Add a project before creating an automation.')
    expect(html).toContain('Automations need a project or workspace target to run.')
    expect(html).not.toContain('What should Janus Code do?')
  })
})
