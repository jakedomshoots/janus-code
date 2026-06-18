// @vitest-environment happy-dom

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TerminalViewSwitch } from './terminal-view-switch'

describe('Terminal GUI agent workspace flag boundary', () => {
  it('renders the terminal workspace branch when the GUI agent workspace flag is off', () => {
    const markup = renderToStaticMarkup(
      <TerminalViewSwitch
        guiAgentWorkspaceEnabled={false}
        agentWorkspace={<span>GUI agent workspace</span>}
        terminalWorkspace={<span>Terminal workspace</span>}
      />
    )

    expect(markup).toContain('Terminal workspace')
    expect(markup).not.toContain('GUI agent workspace')
  })

  it('renders the GUI branch while preserving the terminal workspace when the GUI flag is on', () => {
    const markup = renderToStaticMarkup(
      <TerminalViewSwitch
        guiAgentWorkspaceEnabled
        agentWorkspace={<span>GUI agent workspace</span>}
        terminalWorkspace={<span>Terminal workspace</span>}
      />
    )

    expect(markup).toContain('GUI agent workspace')
    expect(markup).toContain('Terminal workspace')
    expect(markup).toContain('data-terminal-view="gui-agent-workspace"')
    expect(markup).toContain('data-terminal-view="preserved-terminal-workspace"')
  })
})
